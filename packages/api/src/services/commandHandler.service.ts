import { UsersService, User } from './users.service';
import { ListingsService } from './listings.service';
import { PricesService } from './prices.service';
import { NotificationService } from './notification.service';
import type { IncomingMessage } from './messageRouter.service';
import type { Channel, Language } from './users.service';

const MAX_LISTINGS_PER_FARMER = 5;

export const CommandHandler = {
  // ── Onboarding ─────────────────────────────────────────────────────────────
  async handleOnboarding(msg: IncomingMessage, _existingUser: null) {
    // Step 1: Create a minimal user and ask for language
    const telegramId = msg.channel === 'telegram' ? parseInt(msg.from) : undefined;
    const user = await UsersService.create({
      phone: msg.phone,
      name: msg.displayName,
      channel: msg.channel as Channel,
      telegram_id: telegramId,
      language: 'fr', // default; will be updated
    });

    await NotificationService.sendRaw(msg, user.language,
      `🌱 Bienvenue sur Moonsu-Link! / Welcome to Moonsu-Link!\n\n` +
      `Choisissez votre langue / Choose your language:\n` +
      `Tapez / Type: FR  ou/or  EN`
    );
  },

  // ── Command dispatcher ─────────────────────────────────────────────────────
  async dispatch(command: string, args: string[], user: User, msg: IncomingMessage) {
    // Handle language setup first if not set yet
    const rawText = msg.text.trim().toUpperCase();
    if (rawText === 'FR' || rawText === 'EN') {
      await this.handleLanguageSetup(rawText.toLowerCase() as Language, user, msg);
      return;
    }

    switch (command) {
      case 'SELL':        return this.handleSell(args, user, msg);
      case 'FIND':        return this.handleFind(args, user, msg);
      case 'PRICE':       return this.handlePrice(args, user, msg);
      case 'ALERT':       return this.handleAlert(args, user, msg);
      case 'INTERESTED':  return this.handleInterested(args, user, msg);
      case 'MY_LISTINGS': return this.handleMyListings(user, msg);
      case 'CANCEL':      return this.handleCancel(args, user, msg);
      case 'HELP':        return this.handleHelp(user, msg);
      default:
        await NotificationService.send(user, 'UNKNOWN_COMMAND', {}, msg);
    }
  },

  async handleLanguageSetup(lang: Language, user: User, msg: IncomingMessage) {
    await UsersService.update(user.id, { language: lang });
    const updated = { ...user, language: lang };

    const greeting = lang === 'fr'
      ? `✅ Langue définie: Français\n\nTapez AIDE pour voir les commandes disponibles.`
      : `✅ Language set: English\n\nType HELP to see available commands.`;

    await NotificationService.sendRaw(msg, lang, greeting);
    await NotificationService.send(updated, 'HELP', {}, msg);
  },

  // ── SELL / VENDRE ──────────────────────────────────────────────────────────
  // Usage: SELL maize 80kg Bafia 250
  // Args:  [crop, quantity, location, price_per_kg]
  async handleSell(args: string[], user: User, msg: IncomingMessage) {
    if (args.length < 4) {
      await NotificationService.send(user, 'SELL_USAGE', {}, msg);
      return;
    }

    const crop = args[0].toLowerCase();
    const quantityStr = args[1].toLowerCase().replace('kg', '');
    const location = args[2];
    const priceStr = args[3];

    const quantity_kg = parseFloat(quantityStr);
    const price_per_kg = parseInt(priceStr, 10);

    if (isNaN(quantity_kg) || isNaN(price_per_kg) || quantity_kg <= 0 || price_per_kg <= 0) {
      await NotificationService.send(user, 'SELL_INVALID_NUMBERS', {}, msg);
      return;
    }

    // Enforce listing cap
    const activeCount = await ListingsService.countActiveByFarmer(user.id);
    if (activeCount >= MAX_LISTINGS_PER_FARMER) {
      await NotificationService.send(user, 'SELL_LIMIT_REACHED', { max: MAX_LISTINGS_PER_FARMER }, msg);
      return;
    }

    const listing = await ListingsService.create({
      farmer_id: user.id,
      crop,
      quantity_kg,
      price_per_kg,
      location,
      region: location,
    });

    await NotificationService.send(user, 'SELL_SUCCESS', {
      crop,
      quantity: quantity_kg,
      price: price_per_kg,
      location,
      id: listing.id.slice(0, 8),
    }, msg);

    // Notify subscribed buyers
    const subscribers = await UsersService.getAlertSubscribers(crop, location);
    for (const buyer of subscribers) {
      await NotificationService.send(buyer, 'ALERT_NEW_LISTING', {
        crop,
        quantity: quantity_kg,
        price: price_per_kg,
        location,
        farmer: user.name || user.phone,
        listingId: listing.id.slice(0, 8),
      });
    }
  },

  // ── FIND / CHERCHER ────────────────────────────────────────────────────────
  // Usage: FIND maize Bafia
  async handleFind(args: string[], user: User, msg: IncomingMessage) {
    if (args.length < 2) {
      await NotificationService.send(user, 'FIND_USAGE', {}, msg);
      return;
    }

    const crop = args[0].toLowerCase();
    const region = args.slice(1).join(' ');

    const listings = await ListingsService.findByCropAndRegion(crop, region);

    if (listings.length === 0) {
      await NotificationService.send(user, 'FIND_NO_RESULTS', { crop, region }, msg);
      return;
    }

    await NotificationService.send(user, 'FIND_RESULTS', { listings, crop, region }, msg);
  },

  // ── PRICE / PRIX ───────────────────────────────────────────────────────────
  // Usage: PRICE maize
  async handlePrice(args: string[], user: User, msg: IncomingMessage) {
    if (args.length < 1) {
      await NotificationService.send(user, 'PRICE_USAGE', {}, msg);
      return;
    }

    const crop = args[0].toLowerCase();
    const prices = await PricesService.getLatestForCrop(crop);

    if (prices.length === 0) {
      await NotificationService.send(user, 'PRICE_NOT_FOUND', { crop }, msg);
      return;
    }

    await NotificationService.send(user, 'PRICE_RESULTS', { crop, prices }, msg);
  },

  // ── ALERT / ALERTE ─────────────────────────────────────────────────────────
  // Usage: ALERT maize Adamawa
  async handleAlert(args: string[], user: User, msg: IncomingMessage) {
    if (args.length < 1) {
      await NotificationService.send(user, 'ALERT_USAGE', {}, msg);
      return;
    }

    const crop = args[0].toLowerCase();
    const region = args.slice(1).join(' ') || undefined;

    await UsersService.subscribeToCropAlert(user.id, crop, region);
    await NotificationService.send(user, 'ALERT_SUBSCRIBED', { crop, region }, msg);
  },

  // ── INTERESTED / INTERESSE ─────────────────────────────────────────────────
  // Usage: INTERESTED abc12345
  async handleInterested(args: string[], user: User, msg: IncomingMessage) {
    if (args.length < 1) {
      await NotificationService.send(user, 'INTERESTED_USAGE', {}, msg);
      return;
    }

    const listingIdPrefix = args[0].toLowerCase();

    // Find listing by short ID prefix
    const { listings } = await ListingsService.getAll(1, 100);
    const listing = listings.find((l: { id: string }) => l.id.startsWith(listingIdPrefix));

    if (!listing) {
      await NotificationService.send(user, 'INTERESTED_NOT_FOUND', { id: listingIdPrefix }, msg);
      return;
    }

    // Notify the farmer
    const farmer = await UsersService.findByPhone(listing.farmer_phone);
    if (farmer) {
      await NotificationService.send(farmer, 'BUYER_INTERESTED', {
        buyer: user.name || user.phone,
        buyerPhone: user.phone,
        crop: listing.crop,
        quantity: listing.quantity_kg,
      });
    }

    await NotificationService.send(user, 'INTERESTED_SENT', { crop: listing.crop }, msg);
  },

  // ── MY LISTINGS / MES LISTES ───────────────────────────────────────────────
  async handleMyListings(user: User, msg: IncomingMessage) {
    const listings = await ListingsService.findByFarmer(user.id);

    if (listings.length === 0) {
      await NotificationService.send(user, 'MY_LISTINGS_EMPTY', {}, msg);
      return;
    }

    await NotificationService.send(user, 'MY_LISTINGS_RESULTS', { listings }, msg);
  },

  // ── CANCEL / ANNULER ───────────────────────────────────────────────────────
  // Usage: CANCEL abc12345
  async handleCancel(args: string[], user: User, msg: IncomingMessage) {
    if (args.length < 1) {
      await NotificationService.send(user, 'CANCEL_USAGE', {}, msg);
      return;
    }

    const listingIdPrefix = args[0].toLowerCase();
    const myListings = await ListingsService.findByFarmer(user.id);
    const listing = myListings.find(l => l.id.startsWith(listingIdPrefix));

    if (!listing) {
      await NotificationService.send(user, 'CANCEL_NOT_FOUND', {}, msg);
      return;
    }

    await ListingsService.cancel(listing.id, user.id);
    await NotificationService.send(user, 'CANCEL_SUCCESS', { crop: listing.crop }, msg);
  },

  // ── HELP / AIDE ────────────────────────────────────────────────────────────
  async handleHelp(user: User, msg: IncomingMessage) {
    await NotificationService.send(user, 'HELP', {}, msg);
  },
};
