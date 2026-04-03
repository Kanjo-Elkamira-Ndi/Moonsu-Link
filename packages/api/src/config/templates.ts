export type Lang = 'en' | 'fr';

export const t = {
  // ── Help ──────────────────────────────────────────────────────────────
  help: {
    en: [
      'MoonsuLink commands:',
      'SELL [crop] [qty]kg [town] [price] - Post listing',
      'FIND [crop] [town] - Search produce',
      'PRICE [crop] - Market prices',
      'ALERT [crop] [region] - Price alerts',
      'INTERESTED [id] - Contact farmer',
      'MY LISTINGS - View your listings',
      'CANCEL [id] - Cancel listing',
      'HELP - Show this menu',
    ].join('\n'),
    fr: [
      'Commandes MoonsuLink:',
      'VENDRE [culture] [qte]kg [ville] [prix] - Publier annonce',
      'CHERCHER [culture] [ville] - Chercher produits',
      'PRIX [culture] - Prix du marche',
      'ALERTE [culture] [region] - Alertes prix',
      'INTERESSE [id] - Contacter agriculteur',
      'MESLISTES - Mes annonces',
      'ANNULER [id] - Annuler annonce',
      'AIDE - Afficher ce menu',
    ].join('\n'),
  },

  // ── Listings ──────────────────────────────────────────────────────────
  listingCreated: {
    en: (id: string, crop: string, qty: number, town: string, price: number) =>
      `Listed! ID: ${id}\n${crop} ${qty}kg in ${town} at ${price} FCFA/kg\nExpires in 7 days.`,
    fr: (id: string, crop: string, qty: number, town: string, price: number) =>
      `Publie! ID: ${id}\n${crop} ${qty}kg a ${town} a ${price} FCFA/kg\nExpire dans 7 jours.`,
  },
  listingNotFound: {
    en: 'No listings found for that search.',
    fr: 'Aucune annonce trouvee pour cette recherche.',
  },
  listingResult: {
    en: (id: string, crop: string, qty: number, town: string, price: number, phone: string) =>
      `ID:${id} ${crop} ${qty}kg ${town} ${price}FCFA/kg Reply: INTERESTED ${id}`,
    fr: (id: string, crop: string, qty: number, town: string, price: number, phone: string) =>
      `ID:${id} ${crop} ${qty}kg ${town} ${price}FCFA/kg Repondre: INTERESSE ${id}`,
  },
  listingCancelled: {
    en: (id: string) => `Listing ${id} cancelled.`,
    fr: (id: string) => `Annonce ${id} annulee.`,
  },
  myListings: {
    en: (count: number) => `Your active listings (${count}):`,
    fr: (count: number) => `Vos annonces actives (${count}):`,
  },
  maxListings: {
    en: 'Max 5 active listings. Cancel one first.',
    fr: 'Maximum 5 annonces actives. Annulez-en une d\'abord.',
  },

  // ── Prices ────────────────────────────────────────────────────────────
  priceResult: {
    en: (crop: string, rows: Array<{ market: string; min: number; max: number }>) =>
      [`${crop.toUpperCase()} prices today:`, ...rows.map((r) => `${r.market}: ${r.min}-${r.max} FCFA/kg`)].join('\n'),
    fr: (crop: string, rows: Array<{ market: string; min: number; max: number }>) =>
      [`Prix ${crop.toUpperCase()} aujourd'hui:`, ...rows.map((r) => `${r.market}: ${r.min}-${r.max} FCFA/kg`)].join('\n'),
  },
  priceNotFound: {
    en: (crop: string) => `No price data for ${crop}. Try: maize, tomato, cassava, beans, plantain`,
    fr: (crop: string) => `Pas de prix pour ${crop}. Essayez: mais, tomate, manioc, haricot, plantain`,
  },

  // ── Alerts ────────────────────────────────────────────────────────────
  alertSet: {
    en: (crop: string, region: string) => `Alert set! You'll be notified when ${crop} listings appear in ${region}.`,
    fr: (crop: string, region: string) => `Alerte definie! Vous serez notifie quand ${crop} apparait dans ${region}.`,
  },

  // ── Connections ───────────────────────────────────────────────────────
  connectionSent: {
    en: (id: string) => `Request sent to farmer for listing ${id}. They'll contact you shortly.`,
    fr: (id: string) => `Demande envoyee a l'agriculteur pour l'annonce ${id}. Il vous contactera bientot.`,
  },
  connectionNotification: {
    en: (crop: string, buyerPhone: string) =>
      `A buyer is interested in your ${crop}! Contact: ${buyerPhone}`,
    fr: (crop: string, buyerPhone: string) =>
      `Un acheteur interesse par votre ${crop}! Contact: ${buyerPhone}`,
  },

  // ── Errors ────────────────────────────────────────────────────────────
  unknownCommand: {
    en: 'Unknown command. Send HELP to see all commands.',
    fr: 'Commande inconnue. Envoyez AIDE pour voir toutes les commandes.',
  },
  error: {
    en: 'Something went wrong. Please try again.',
    fr: 'Une erreur est survenue. Veuillez reessayer.',
  },
  invalidFormat: {
    en: 'Invalid format. Example: SELL maize 80kg Bafia 250',
    fr: 'Format invalide. Exemple: VENDRE mais 80kg Bafia 250',
  },

  // ── Registration ──────────────────────────────────────────────────────
  welcome: {
    en: (name: string) =>
      `Welcome to MoonsuLink, ${name}! Send HELP to see what you can do.`,
    fr: (name: string) =>
      `Bienvenue sur MoonsuLink, ${name}! Envoyez AIDE pour voir les commandes.`,
  },
} as const;

/**
 * Helper to resolve a template value for a given language,
 * falling back to English if the key is missing in French.
 */
export function msg(key: keyof typeof t, lang: Lang): (typeof t)[typeof key][Lang] {
  return (t[key] as any)[lang] ?? (t[key] as any)['en'];
}
