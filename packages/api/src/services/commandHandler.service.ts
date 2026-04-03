import { t } from '../config/templates';
import type { Lang } from '../config/templates';
import { listingsService } from './listings.service';
import { pricesService } from './prices.service';
import { usersService } from './users.service';
import { parseIntent } from './ai/openai.service';

// ─── Command patterns (EN + FR) ───────────────────────────────────────────────

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

  // ── AI fallback ───────────────────────────────────────────────────────
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
