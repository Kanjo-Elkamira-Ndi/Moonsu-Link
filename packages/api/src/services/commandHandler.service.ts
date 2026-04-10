import { t } from '../config/templates';
import type { Lang } from '../config/templates';
import { listingsService } from './listings.service';
import { pricesService } from './prices.service';
import { usersService } from './users.service';
import { parseIntent } from './ai/openai.service';
import { sessionService } from './session.service';

// ─── Command patterns (EN + FR) 

async function handleMenuSelection(choice: string, userId: string, lang: Lang): Promise<string> {
  switch (choice) {
    case '1': // PRICE
      await sessionService.set(userId, 'price', 'awaiting_crop', {});
      return lang === 'fr'
        ? 'Quelle culture? (ex: maïs, tomate, manioc)'
        : 'Which crop? (e.g. maize, tomato, cassava)';

    case '2': // SELL — start guided flow
      await sessionService.set(userId, 'sell', 'awaiting_crop', {});
      return lang === 'fr'
        ? '🌱 Quelle culture vendez-vous?\n(ex: maïs, tomate, manioc, haricot)'
        : '🌱 What crop are you selling?\n(e.g. maize, tomato, cassava, beans)';

    case '3': // FIND
      await sessionService.set(userId, 'find', 'awaiting_crop', {});
      return lang === 'fr'
        ? '🔍 Quelle culture cherchez-vous?'
        : '🔍 What crop are you looking for?';

    case '4': // ALERT
      await sessionService.set(userId, 'alert', 'awaiting_crop', {});
      return lang === 'fr'
        ? '🔔 Pour quelle culture voulez-vous une alerte?'
        : '🔔 Which crop do you want alerts for?';

    case '5': // MY LISTINGS
      return listingsService.myListings({ userId, lang });

    default:
      return showMenu(lang);
  }
}

async function handleFlowStep(
  input: string,
  userId: string,
  lang: Lang,
  session: { flow: string; step: string; data: Record<string, any> }
): Promise<string> {
  const { flow, step, data } = session;

  // User can always abort
  if (/^(cancel|annuler|stop|menu|0)$/i.test(input)) {
    await sessionService.clear(userId);
    return showMenu(lang);
  }

  if (flow === 'sell') {
    switch (step) {
      case 'awaiting_crop':
        await sessionService.set(userId, 'sell', 'awaiting_qty', { crop: input.toLowerCase() });
        return lang === 'fr'
          ? `Combien de kg de ${input} avez-vous?`
          : `How many kg of ${input} do you have?`;

      case 'awaiting_qty':
        const qty = Number(input.replace(/kg/i, '').trim());
        if (isNaN(qty) || qty <= 0) {
          return lang === 'fr' ? 'Entrez un nombre valide. Ex: 80' : 'Enter a valid number. e.g. 80';
        }
        await sessionService.set(userId, 'sell', 'awaiting_town', { ...data, qty });
        return lang === 'fr' ? 'Dans quelle ville êtes-vous?' : 'What town are you in?';

      case 'awaiting_town':
        await sessionService.set(userId, 'sell', 'awaiting_price', { ...data, town: input });
        return lang === 'fr'
          ? 'Quel est votre prix par kg en FCFA?'
          : 'What is your price per kg in FCFA?';

      case 'awaiting_price':
        const price = Number(input.replace(/fcfa/i, '').trim());
        if (isNaN(price) || price <= 0) {
          return lang === 'fr' ? 'Entrez un prix valide. Ex: 250' : 'Enter a valid price. e.g. 250';
        }
        await sessionService.clear(userId);
        return listingsService.create({
          userId,
          crop: data.crop,
          quantityKg: data.qty,
          town: data.town,
          priceFcfa: price,
          lang,
        });
    }
  }

  if (flow === 'price') {
    switch (step) {
      case 'awaiting_crop':
        await sessionService.clear(userId);
        return pricesService.lookup({ crop: input.toLowerCase(), lang });
    }
  }

  if (flow === 'find') {
    switch (step) {
      case 'awaiting_crop':
        await sessionService.set(userId, 'find', 'awaiting_town', { crop: input.toLowerCase() });
        return lang === 'fr'
          ? `Dans quelle ville cherchez-vous du ${input}? (ou envoyez "tout" pour toutes les villes)`
          : `Which town? (or send "all" for all towns)`;

      case 'awaiting_town':
        await sessionService.clear(userId);
        const town = /^(all|tout)$/i.test(input) ? undefined : input;
        return listingsService.search({ crop: data.crop, town, lang });
    }
  }

  if (flow === 'alert') {
    switch (step) {
      case 'awaiting_crop':
        await sessionService.set(userId, 'alert', 'awaiting_region', { crop: input.toLowerCase() });
        return lang === 'fr'
          ? 'Quelle région? (ex: Centre, Ouest, Littoral)'
          : 'Which region? (e.g. Centre, West, Littoral)';

      case 'awaiting_region':
        await sessionService.clear(userId);
        return usersService.setAlert({ userId, crop: data.crop, region: input, lang });
    }
  }

  // Fallback — clear broken session
  await sessionService.clear(userId);
  return showMenu(lang);
}

function showMenu(lang: Lang): string {
  return lang === 'fr'
    ? `🌙 *MoonsuLink*\n\nQue voulez-vous faire?\n\n1 - Prix du marché\n2 - Publier une annonce\n3 - Chercher des produits\n4 - Créer une alerte\n5 - Mes annonces\n\nRépondez avec un chiffre.`
    : `🌙 *MoonsuLink*\n\nWhat would you like to do?\n\n1 - Check market prices\n2 - Post a harvest listing\n3 - Find produce\n4 - Set a price alert\n5 - My listings\n\nReply with a number.`;
}

const PATTERNS = {
  // SELL maize 80kg Bafia 250  |  VENDRE maïs 80kg Bafia 250
  sell: /^(sell|vendre)\s+(\S+)\s+(\d+)\s*kg\s+(.+?)\s+(\d+)$/i,
  // FIND maize Bafia  |  CHERCHER maïs Bafia
  find: /^(find|chercher)\s+(\S+)(?:\s+(.+))?$/i,
  // PRICE maize  |  PRIX maïs
  price: /^(price|prix)\s+(\S+)$/i,
  // ALERT tomato West  |  ALERTE tomate Ouest
  alert: /^(alert|alerte)\s+(\S+)\s+(.+)$/i,
  // INTERESTED abc12345  |  INTERESSE abc12345
  interested: /^(interested|interesse)\s+(\S+)$/i,
  // MY LISTINGS  |  MESLISTES
  myListings: /^(my listings|meslistes)$/i,
  // CANCEL abc12345  |  ANNULER abc12345
  cancel: /^(cancel|annuler)\s+(\S+)$/i,
  // HELP  |  AIDE
  help: /^(help|aide)$/i,
};

/**
 * Parse a raw text message and dispatch to the correct service.
 * Falls back to OpenAI NLU if no pattern matches.
 */
export async function commandHandler(
  text: string,
  userId: string,
  lang: Lang,
): Promise<string> {
  const input = text.trim();
  const session = await sessionService.get(userId);

  // Handle active menu / flow session first
  if (session?.flow) {
    return handleFlowStep(input, userId, lang, session as { flow: string; step: string; data: Record<string, any> });
  }

  if (/^(menu|0)$/i.test(input) || /^[1-5]$/.test(input)) {
    return handleMenuSelection(input, userId, lang);
  }

  if (/^(hi|hello|hey|bonjour|salut|allo|coucou)$/i.test(input)) {
    return showMenu(lang);
  }

  // HELP
  if (PATTERNS.help.test(input)) {
    return t.help[lang];
  }

  // SELL
  const sellMatch = input.match(PATTERNS.sell);
  if (sellMatch) {
    const [, , crop, qty, town, price] = sellMatch;
    return listingsService.create({
      userId,
      crop: crop.toLowerCase(),
      quantityKg: Number(qty),
      town,
      priceFcfa: Number(price),
      lang,
    });
  }

  // FIND
  const findMatch = input.match(PATTERNS.find);
  if (findMatch) {
    const [, , crop, town] = findMatch;
    return listingsService.search({ crop: crop.toLowerCase(), town, lang });
  }

  // PRICE
  const priceMatch = input.match(PATTERNS.price);
  if (priceMatch) {
    const [, , crop] = priceMatch;
    return pricesService.lookup({ crop: crop.toLowerCase(), lang });
  }

  // ALERT
  const alertMatch = input.match(PATTERNS.alert);
  if (alertMatch) {
    const [, , crop, region] = alertMatch;
    return usersService.setAlert({ userId, crop: crop.toLowerCase(), region, lang });
  }

  // INTERESTED
  const interestedMatch = input.match(PATTERNS.interested);
  if (interestedMatch) {
    const [, , listingId] = interestedMatch;
    return listingsService.connect({ buyerId: userId, listingId, lang });
  }

  // MY LISTINGS
  if (PATTERNS.myListings.test(input)) {
    return listingsService.myListings({ userId, lang });
  }

  // CANCEL
  const cancelMatch = input.match(PATTERNS.cancel);
  if (cancelMatch) {
    const [, , listingId] = cancelMatch;
    return listingsService.cancel({ userId, listingId, lang });
  }

  // ── AI fallback 
  const parsed = await parseIntent(input, lang);

  switch (parsed.intent) {
    case 'SELL':
      return listingsService.create({
        userId,
        crop: parsed.crop.toLowerCase(),
        quantityKg: parsed.quantity,
        town: parsed.town,
        priceFcfa: parsed.price,
        lang,
      });
    case 'FIND':
      return listingsService.search({ crop: parsed.crop.toLowerCase(), town: parsed.town, lang });
    case 'PRICE':
      return pricesService.lookup({ crop: parsed.crop.toLowerCase(), lang });
    case 'ALERT':
      return usersService.setAlert({ userId, crop: parsed.crop.toLowerCase(), region: parsed.region, lang });
    case 'HELP':
      return t.help[lang];
    default:
      return t.unknownCommand[lang];
  }
}
