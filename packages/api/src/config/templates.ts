import type { Language } from '../services/users.service';
import type { Listing } from '../services/listings.service';
import type { MarketPrice } from '../services/prices.service';

type TemplateData = Record<string, unknown>;

const templates: Record<string, Record<Language, (data: TemplateData) => string>> = {

  HELP: {
    en: () =>
      `📋 Moonsu-Link Commands:\n` +
      `SELL crop qty location price — Post harvest\n` +
      `FIND crop region — Find produce\n` +
      `PRICE crop — Market prices\n` +
      `ALERT crop region — Get notified of new stock\n` +
      `INTERESTED [id] — Contact a farmer\n` +
      `MY LISTINGS — Your active posts\n` +
      `CANCEL [id] — Remove a listing`,

    fr: () =>
      `📋 Commandes Moonsu-Link:\n` +
      `VENDRE culture qté lieu prix — Publier récolte\n` +
      `CHERCHER culture région — Chercher produits\n` +
      `PRIX culture — Prix du marché\n` +
      `ALERTE culture région — Alertes nouveaux stocks\n` +
      `INTERESSE [id] — Contacter un agriculteur\n` +
      `MESLISTES — Vos annonces actives\n` +
      `ANNULER [id] — Supprimer une annonce`,
  },

  UNKNOWN_COMMAND: {
    en: () => `❓ Command not recognized. Type HELP to see available commands.`,
    fr: () => `❓ Commande non reconnue. Tapez AIDE pour voir les commandes disponibles.`,
  },

  SELL_USAGE: {
    en: () => `📝 Usage: SELL [crop] [qty]kg [location] [price/kg]\nExample: SELL maize 80kg Bafia 250`,
    fr: () => `📝 Usage: VENDRE [culture] [qté]kg [lieu] [prix/kg]\nExemple: VENDRE maïs 80kg Bafia 250`,
  },

  SELL_INVALID_NUMBERS: {
    en: () => `❌ Invalid quantity or price. Both must be positive numbers.\nExample: SELL maize 80kg Bafia 250`,
    fr: () => `❌ Quantité ou prix invalide. Les deux doivent être des nombres positifs.\nExemple: VENDRE maïs 80kg Bafia 250`,
  },

  SELL_LIMIT_REACHED: {
    en: (d) => `⚠️ You already have ${d.max} active listings (maximum). Cancel one before adding a new one.`,
    fr: (d) => `⚠️ Vous avez déjà ${d.max} annonces actives (maximum). Annulez-en une avant d'en ajouter une nouvelle.`,
  },

  SELL_SUCCESS: {
    en: (d) => `✅ Listing posted!\n🌽 ${d.crop} | ${d.quantity}kg | ${d.price} FCFA/kg | ${d.location}\nID: ${d.id}\nExpires in 7 days. Type MY LISTINGS to view all.`,
    fr: (d) => `✅ Annonce publiée!\n🌽 ${d.crop} | ${d.quantity}kg | ${d.price} FCFA/kg | ${d.location}\nID: ${d.id}\nExpire dans 7 jours. Tapez MESLISTES pour voir tout.`,
  },

  FIND_USAGE: {
    en: () => `📝 Usage: FIND [crop] [region]\nExample: FIND maize Bafia`,
    fr: () => `📝 Usage: CHERCHER [culture] [région]\nExemple: CHERCHER maïs Bafia`,
  },

  FIND_NO_RESULTS: {
    en: (d) => `😔 No ${d.crop} listings found near ${d.region}.\nTry ALERT ${d.crop} ${d.region} to be notified when stock arrives.`,
    fr: (d) => `😔 Aucune annonce de ${d.crop} trouvée près de ${d.region}.\nEssayez ALERTE ${d.crop} ${d.region} pour être notifié à l'arrivée de stock.`,
  },

  FIND_RESULTS: {
    en: (d) => {
      const listings = d.listings as Listing[];
      const lines = listings.map((l, i) =>
        `${i + 1}. ${l.crop} ${l.quantity_kg}kg @${l.price_per_kg}FCFA/kg\n   ${l.location} | ID:${l.id.slice(0, 8)}`
      );
      return `🔍 ${listings.length} listing(s) for ${d.crop} near ${d.region}:\n\n${lines.join('\n\n')}\n\nType INTERESTED [id] to contact a farmer.`;
    },
    fr: (d) => {
      const listings = d.listings as Listing[];
      const lines = listings.map((l, i) =>
        `${i + 1}. ${l.crop} ${l.quantity_kg}kg @${l.price_per_kg}FCFA/kg\n   ${l.location} | ID:${l.id.slice(0, 8)}`
      );
      return `🔍 ${listings.length} annonce(s) pour ${d.crop} près de ${d.region}:\n\n${lines.join('\n\n')}\n\nTapez INTERESSE [id] pour contacter un agriculteur.`;
    },
  },

  PRICE_USAGE: {
    en: () => `📝 Usage: PRICE [crop]\nExample: PRICE maize`,
    fr: () => `📝 Usage: PRIX [culture]\nExemple: PRIX maïs`,
  },

  PRICE_NOT_FOUND: {
    en: (d) => `😔 No price data found for "${d.crop}". Available crops: maize, tomato, plantain, cassava, groundnut, cocoa, coffee`,
    fr: (d) => `😔 Aucun prix trouvé pour "${d.crop}". Cultures disponibles: maïs, tomate, plantain, manioc, arachide, cacao, café`,
  },

  PRICE_RESULTS: {
    en: (d) => {
      const prices = d.prices as MarketPrice[];
      const lines = prices.map(p => `• ${p.market}: ${p.min_price}–${p.max_price} FCFA/kg`);
      return `📊 ${(d.crop as string).toUpperCase()} prices today:\n${lines.join('\n')}`;
    },
    fr: (d) => {
      const prices = d.prices as MarketPrice[];
      const lines = prices.map(p => `• ${p.market}: ${p.min_price}–${p.max_price} FCFA/kg`);
      return `📊 Prix ${d.crop} aujourd'hui:\n${lines.join('\n')}`;
    },
  },

  ALERT_USAGE: {
    en: () => `📝 Usage: ALERT [crop] [region]\nExample: ALERT tomato West`,
    fr: () => `📝 Usage: ALERTE [culture] [région]\nExemple: ALERTE tomate Ouest`,
  },

  ALERT_SUBSCRIBED: {
    en: (d) => `🔔 Alert set! You'll be notified when ${d.crop}${d.region ? ` in ${d.region}` : ''} becomes available.`,
    fr: (d) => `🔔 Alerte activée! Vous serez notifié quand ${d.crop}${d.region ? ` à ${d.region}` : ''} sera disponible.`,
  },

  ALERT_NEW_LISTING: {
    en: (d) => `🔔 New ${d.crop} available!\n${d.quantity}kg @${d.price}FCFA/kg near ${d.location}\nFrom: ${d.farmer}\nType INTERESTED ${d.listingId} to connect.`,
    fr: (d) => `🔔 Nouveau ${d.crop} disponible!\n${d.quantity}kg @${d.price}FCFA/kg près de ${d.location}\nDe: ${d.farmer}\nTapez INTERESSE ${d.listingId} pour contacter.`,
  },

  INTERESTED_USAGE: {
    en: () => `📝 Usage: INTERESTED [listing-id]\nExample: INTERESTED abc12345`,
    fr: () => `📝 Usage: INTERESSE [id-annonce]\nExemple: INTERESSE abc12345`,
  },

  INTERESTED_NOT_FOUND: {
    en: (d) => `❌ Listing "${d.id}" not found or expired. Try FIND to search again.`,
    fr: (d) => `❌ Annonce "${d.id}" introuvable ou expirée. Essayez CHERCHER pour relancer.`,
  },

  INTERESTED_SENT: {
    en: (d) => `✅ Request sent! The farmer selling ${d.crop} has been notified with your contact details.`,
    fr: (d) => `✅ Demande envoyée! L'agriculteur vendant ${d.crop} a été notifié avec vos coordonnées.`,
  },

  BUYER_INTERESTED: {
    en: (d) => `📬 A buyer is interested in your ${d.crop} (${d.quantity}kg)!\nBuyer: ${d.buyer}\nContact: ${d.buyerPhone}`,
    fr: (d) => `📬 Un acheteur est intéressé par votre ${d.crop} (${d.quantity}kg)!\nAcheteur: ${d.buyer}\nContact: ${d.buyerPhone}`,
  },

  MY_LISTINGS_EMPTY: {
    en: () => `📋 You have no active listings. Type SELL to post your first one.`,
    fr: () => `📋 Vous n'avez aucune annonce active. Tapez VENDRE pour publier la première.`,
  },

  MY_LISTINGS_RESULTS: {
    en: (d) => {
      const listings = d.listings as Listing[];
      const lines = listings.map((l, i) =>
        `${i + 1}. ${l.crop} ${l.quantity_kg}kg @${l.price_per_kg}FCFA/kg | ${l.location} [${l.id.slice(0, 8)}]`
      );
      return `📋 Your active listings (${listings.length}):\n${lines.join('\n')}\n\nType CANCEL [id] to remove one.`;
    },
    fr: (d) => {
      const listings = d.listings as Listing[];
      const lines = listings.map((l, i) =>
        `${i + 1}. ${l.crop} ${l.quantity_kg}kg @${l.price_per_kg}FCFA/kg | ${l.location} [${l.id.slice(0, 8)}]`
      );
      return `📋 Vos annonces actives (${listings.length}):\n${lines.join('\n')}\n\nTapez ANNULER [id] pour en supprimer une.`;
    },
  },

  CANCEL_USAGE: {
    en: () => `📝 Usage: CANCEL [listing-id]\nType MY LISTINGS to see your IDs.`,
    fr: () => `📝 Usage: ANNULER [id-annonce]\nTapez MESLISTES pour voir vos IDs.`,
  },

  CANCEL_NOT_FOUND: {
    en: () => `❌ Listing not found. Type MY LISTINGS to see your active listings.`,
    fr: () => `❌ Annonce introuvable. Tapez MESLISTES pour voir vos annonces actives.`,
  },

  CANCEL_SUCCESS: {
    en: (d) => `✅ Your ${d.crop} listing has been cancelled.`,
    fr: (d) => `✅ Votre annonce de ${d.crop} a été annulée.`,
  },
};

export function renderTemplate(key: string, lang: Language, data: TemplateData = {}): string {
  const template = templates[key];
  if (!template) return lang === 'fr' ? `Erreur: modèle "${key}" introuvable.` : `Error: template "${key}" not found.`;
  const renderer = template[lang] ?? template['fr'];
  return renderer(data);
}
