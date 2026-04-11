// packages/bot/src/utils/i18n.utils.ts

type Language = 'en' | 'fr';
type MessageKey = string;

interface MessageCatalog {
  [key: string]: {
    [lang in Language]?: string;
  };
}

// This is a simplified example. In a real application, this would likely be loaded
// from JSON files or a more robust i18n library.
const messages: MessageCatalog = {
  welcome_message: {
    en: `Hello {firstName}! 👋\n\nWelcome to *Moonsu Link* 🌾\nWe connect farmers and buyers across Cameroon.\n\nWhat would you like to do?`,
    fr: `Bonjour {firstName}! 👋\n\nBienvenue sur *Moonsu Link* 🌾\nNous connectons les agriculteurs et les acheteurs au Cameroun.\n\nQue souhaitez-vous faire?`,
  },
  welcome_back_message: {
    en: `Welcome back, {firstName}! 🌾`,
    fr: `Bon retour, {firstName}! 🌾`,
  },
  menu_product: {
    en: '🔍 Search Product',
    fr: '🔍 Chercher Produits',
  },
  menu_buyer_ai: {
    en: '❓ Ask a Question',
    fr: '❓ Poser une Question',
  },
  menu_farmer_ai: {
    en: '🤖 Farming Assistant',
    fr: '🤖 Assistant Agricole',
  },
  menu_profile: {
    en: '👤 My Profile',
    fr: '👤 Mon Profil',
  },
  menu_my_product: {
    en: '🌽 My Products',
    fr: '🌽 Mes Produits',
  },
  menu_support: {
    en: '🌱 Farm Support',
    fr: '🌱 Soutien Agricole',
  },
  menu_subscriptions: {
    en: '🔔 Manage Subscriptions',
    fr: '🔔 Gérer Abonnements',
  },
  menu_prices: {
    en: '📊 Market Prices',
    fr: '📊 Prix du Marché',
  },
  menu_alerts: {
    en: '🚨 Crop Alerts',
    fr: '🚨 Alertes sur les Cultures',
  },
  menu_outbreak: {
    en: '🚨 Report Outbreak',
    fr: '🚨 Signaler Outbreak',
  },
  create_account_button: {
    en: '🆕 Create an account',
    fr: '🆕 Créer un compte',
  },
  link_account_button: {
    en: '🔗 Link an existing account',
    fr: '🔗 Lier un compte existant',
  },
  which_region_question: {
    en: '📍 Which region are you located in?',
    fr: '📍 Dans quelle région êtes-vous situé ?',
  },
  account_created_farmer: {
    en: `⚠️ *Account created!* Your farmer account is pending verification. We'll contact you shortly. In the meantime, you can explore the bot.`,
    fr: `⚠️ *Compte créé!* Votre compte agriculteur est en attente de vérification. Nous vous contacterons sous peu. En attendant, vous pouvez explorer le bot.`,
  },
  account_created_buyer: {
    en: `✅ *Account created!* Welcome to Moonsu Link. You can now start searching for produce.`,
    fr: `✅ *Compte créé!* Bienvenue sur Moonsu Link. Vous pouvez maintenant commencer à chercher des produits.`,
  },
  ask_phone_number: {
    en: `📱 Please enter the phone number you use for WhatsApp or SMS in international format (e.g., +237...):`,
    fr: `📱 Veuillez entrer votre numéro de téléphone (WhatsApp ou SMS) au format international (ex: +237...):`,
  },
 

  invalid_onboarding_choice: {
    en: 'Please choose a valid option (Create or Link account).',
    fr: 'Veuillez choisir une option valide (Créer ou Lier un compte).',
  },
  invalid_role_selection: {
    en: 'Please select a valid role (Farmer or Buyer).',
    fr: 'Veuillez sélectionner un rôle valide (Agriculteur ou Acheteur).',
  },
  invalid_region_selection: {
    en: 'Please select a valid region.',
    fr: 'Veuillez sélectionner une région valide.',
  },
  registration_failed: {
    en: 'Account registration failed. Please try again later.',
    fr: 'L\'enregistrement du compte a échoué. Veuillez réessayer plus tard.',
  },
  invalid_phone_format: {
    en: '❌ Invalid number. Try: +237600000000',
    fr: '❌ Numéro invalide. Essayez: +237600000000',
  },
  please_provide_phone: {
    en: 'Please provide your phone number to proceed.',
    fr: 'Veuillez fournir votre numéro de téléphone pour continuer.',
  },
  account_linked_success: {
    en: '✅ Account linked successfully! Welcome back, {name}!',
    fr: '✅ Compte lié avec succès! Bienvenue {name}!',
  },
  no_account_found_phone: {
    en: 'No account found with that number.\nWould you like to create a new account?',
    fr: 'Aucun compte trouvé avec ce numéro.\nVoulez-vous créer un nouveau compte?',
  },
  linking_failed: {
    en: 'Account linking failed. Please try again later.',
    fr: 'La liaison du compte a échoué. Veuillez réessayer plus tard.',
  },
  unhandled_flow_error: {
    en: 'An unexpected error occurred in the flow. Please try /start again.',
    fr: 'Une erreur inattendue est survenue dans le flux. Veuillez réessayer /start.',
  },
  role_farmer_button: {
    en: '🌾 Farmer',
    fr: '🌾 Agriculteur',
  },
  role_buyer_button: {
    en: '🛒 Buyer',
    fr: '🛒 Acheteur',
  },
  choose_your_role: {
    en: 'What is your role?',
    fr: 'Quel est votre rôle?',
  },
  share_phone_button: {
    en: 'Share my phone number',
    fr: 'Partager mon numéro de téléphone',
  },
  unverified_action: {
    en: '🔒 This action requires a verified account.\nOur team will verify your account shortly. You will receive a notification.',
    fr: '🔒 Cette action nécessite un compte vérifié.\nNotre équipe vérifiera votre compte sous peu. Vous recevrez une notification.',
  },
  unknown_command: {
    en: 'I don\'t understand that command. Type /help for assistance.',
    fr: 'Je ne comprends pas cette commande. Tapez /help pour obtenir de l\'aide.',
  },
  please_start: {
    en: 'Please type /start to begin or resume your session.',
    fr: 'Veuillez taper /start pour commencer ou reprendre votre session.',
  },
  help_guide: {
    en: `ℹ️ *Moonsu Link Guide* 🌾\n\n*How to use the bot:*\n1. Create or link your account via /start.\n2. Navigate the main menu using the buttons.\n3. You can type messages to ask questions.\n\n*For Farmers:*\n- 🌽 My Products: List your harvest available for sale.\n- 📊 Market Prices: Check current market prices for crops.\n- 🚨 Crop Alerts: Receive notifications on diseases, outbreaks, or anomalies.\n- 🌱 Farm Support: Manage your *farm score*, Njangi contributions, agricultural loans, and get personalized farming advice.\n- 🤖 Farming Assistant: Ask questions about crops, diseases, prices, or anything agricultural.\n- 👤 My Profile: Check your role, verification status, and ID.\n\n*For Buyers:*\n- 🔍 Search Produce: Browse the marketplace to find available products.\n- 🔔 Manage Subscriptions: Get alerts for crops you follow.\n- ❓ Ask a Question: Request information about crops, prices, or agricultural advice.\n- 👤 My Profile: Check your role, verification status, and ID.\n\n📌 *Quick Commands:*\n- /start : Start or restore your session\n- /help : View this guide\n`,
    fr: `ℹ️ *Guide Moonsu Link* 🌾\n\n*Comment utiliser le bot:*\n1. Créez ou liez un compte via /start.\n2. Naviguez dans le menu principal avec les boutons.\n3. Vous pouvez taper des messages pour poser vos questions.\n\n*Pour les agriculteurs:*\n- 🌽 Mes Produits : Lister vos récoltes disponibles pour la vente.\n- 📊 Prix du Marché : Voir les prix actuels sur différents marchés.\n- 🚨 Alertes sur les Cultures : Recevoir des notifications sur maladies, épidémies ou anomalies.\n- 🌱 Soutien Agricole : Gérer votre *farm score*, Njangi, prêts agricoles, et obtenir conseils personnalisés.\n- 🤖 Assistant Agricole : Posez vos questions sur l'agriculture, maladies, prix ou tout autre sujet.\n- 👤 Mon Profil : Vérifiez votre rôle, votre statut de vérification et votre ID.\n\n*Pour les acheteurs:*\n- 🔍 Chercher Produits : Parcourir le marché et trouver des produits disponibles.\n- 🔔 Gérer Abonnements : Recevoir des alertes sur les produits que vous suivez.\n- ❓ Poser une Question : Demandez des informations sur les cultures, prix, ou conseils agricoles.\n- 👤 Mon Profil : Vérifiez votre rôle, statut et ID.\n📌 *Commandes rapides:*\n- /start : Commencer ou restaurer votre session\n- /help : Voir cette aide\n`,
  },
  open_dashboard: {
    en: '📦 Here is your dashboard to manage your crops and harvest listings:',
    fr: '📦 Voici votre tableau de bord pour gérer vos cultures et annonces:',
  },
  open_alert: {
    en: '🚨 Tap the button below to view current crop alerts in your region:',
    fr: '🚨 Appuyez sur le bouton ci-dessous pour voir les alertes de cultures locales:',
  },
  open_subscription: {
    en: '🔔 Manage your crop alerts and notifications here:',
    fr: '🔔 Gérez vos alertes de culture et vos notifications ici:',
  },
  open_product: {
    en: '📦 Here is your dashboard to manage your products:',
    fr: '📦 Voici votre tableau de bord pour gérer vos produits:',
  },
  open_price: {
    en: '📊 Check the latest market prices for your location:',
    fr: '📊 Vérifiez les derniers prix du marché pour votre région:',
  },
  open_profile: {
    en: '👤 Manage your verify status and profile below:',
    fr: '👤 Gérez votre statut de vérification et compte ci-dessous:',
  },
  open_marketplace: {
    en: '🛒 Tap below to safely browse, discover, and negotiate fresh produce:',
    fr: '🛒 Appuyez ci-dessous pour parcourir et négocier des produits frais de qualité:',
  },
  open_subscriptions: {
    en: '🔔 Manage your crop alerts and notifications here:',
    fr: '🔔 Gérez vos alertes de culture et vos notifications ici:',
  },
  open_crop_alerts: {
    en: '🚨 Tap below to view community outbreak reports and warning alerts:',
    fr: '🚨 Appuyez ci-dessous pour voir les rapports communautaires et alertes agricoles:',
  },
  open_farm_support: {
    en: '🌱 Access expert advice, Njangi contributions, and loan support below:',
    fr: '🌱 Accédez aux conseils d\'experts, contributions Njangi et soutien de prêt:',
  },
  button_dashboard: {
    en: '📦 Open Dashboard',
    fr: '📦 Ouvrir Tableau de Bord',
  },
  button_alert: {
    en: '🚨 View Alerts',
    fr: '🚨 Voir les Alertes',
  },
  button_subscription: {
    en: '🔔 Manage Subscriptions',
    fr: '🔔 Gérer Abonnements',
  },
  button_product: {
    en: '📦 Open Dashboard',
    fr: '📦 Ouvrir Tableau de Bord',
  },
  button_price: {
    en: '📊 View Prices',
    fr: '📊 Voir les Prix',
  },
  button_profile: {
    en: '👤 My Profile',
    fr: '👤 Mon Profil',
  },
  button_verify_account: {
    en: '🔐 Verify account',
    fr: '🔐 Vérifier le compte',
  },
  button_marketplace: {
    en: '🛒 Open Marketplace',
    fr: '🛒 Ouvrir le Marché',
  },
  button_subscriptions: {
    en: '🔔 Manage Subscriptions',
    fr: '🔔 Gérer Abonnements',
  },
  button_crop_alerts: {
    en: '🚨 View Crop Alerts',
    fr: '🚨 Voir les alertes de culture',
  },
  button_farm_support: {
    en: '🌱 Farm Support',
    fr: '🌱 Soutien Agricole',
  },
  searching_account: {
    en: '🔍 Searching for your account...',
    fr: '🔍 Recherche de votre compte...',
  },
  invalid_number: {
    en: 'Invalid phone number format. Please provide a valid phone number.',
    fr: 'Format de numéro de téléphone invalide. Veuillez fournir un numéro de téléphone valide.',
  },
  want_create_account: {
    en: 'Would you like to create a new account?',
    fr: 'Voulez-vous créer un nouveau compte?',
  },
  voice_processing: {
    en: '🎙️ Processing your voice note...',
    fr: '🎙️ Traitement de votre message vocal...',
  },
  voice_transcript: {
    en: '📝 "{transcript}"\n\nGot it! Processing...',
    fr: '📝 "{transcript}"\n\nCompris! Je traite...',
  },
  voice_could_not_process: {
    en: '❌ Could not process voice note. Please try again or type your message.',
    fr: '❌ Impossible de traiter le message vocal. Réessayez ou tapez votre message.',
  },
  voice_did_not_understand: {
    en: 'I didn\'t understand. Please tap a menu button.',
    fr: 'Je n\'ai pas compris. Appuyez sur un bouton du menu.',
  },
  photo_not_listing_flow: {
    en: '📸 Nice photo! To attach a photo to a listing, start from 🌾 My Produce.',
    fr: '📸 Belle photo! Pour lier une photo à un listing, commencez par 🌾 Mes Produits.',
  },
  listing_summary: {
    en: `Listing summary:\n\n🌱 Crop: {crop}\n⚖️ Quantity: {quantityKg}kg\n💵 Price: {priceFcfa} FCFA/kg\n📍 Location: {location}\n\nPublish this listing?`,
    fr: `Résumé de votre listing:\n\n🌱 Produit: {crop}\n⚖️ Quantité: {quantityKg}kg\n💵 Prix: {priceFcfa} FCFA/kg\n📍 Lieu: {location}\n\nPublier ce listing?`,
  },
  yes_publish: {
    en: '✅ Yes, Publish!',
    fr: '✅ Oui, Publier!',
  },
  ask_ai: {
    fr: '🌿 Posez votre question sur l\'agriculture, les maladies, les prix... Envoyez sur /start pour quitter le mode IA.',
    en: '🌿 Ask anything about farming, crop diseases, prices... Send /start to exit AI mode',
  },

  product_unverified: {
    fr: "\n\n⚠️ Compte non vérifié , vous pouvez seulement voir les annonces.",
    en: "\n\n⚠️ Account not verified ,you can only view listings."
  },
  unverified: {
    fr: '🔒 Cette action nécessite un compte vérifié.\nNotre équipe vérifiera votre compte sous peu. Vous recevrez une notification.',
    en: '🔒 This action requires a verified account.\nOur team will verify your account shortly. You will receive a notification.'
  },
  start_over: {
    en: '✏️ Start over',
    fr: '✏️ Recommencer',
  },
  interest_sent: {
    en: `✅ *Interest Sent!*\n\nYou expressed interest in:\n🌱 *{crop}* — {quantity}kg @ {price} FCFA/kg\n📍 {location}\n👨‍🌾 Farmer: {farmer}\n\nThey have been notified and will contact you soon.`,
    fr: `✅ *Intérêt envoyé!*\n\nVous avez exprimé un intérêt pour:\n🌱 *{crop}* — {quantity}kg @ {price} FCFA/kg\n📍 {location}\n👨‍🌾 Agriculteur: {farmer}\n\nIls ont été notifiés et vous contacteront bientôt.`,
  },
  listing_published: {
    en: `🎉 *Listing Published!*\n\nYour listing is now live:\n🌱 *{crop}*\n⚖️ {quantityKg}kg\n💵 {priceFcfa} FCFA/kg\n📍 {location}, {region}\n🆔 ID: \`{listingId}\`\n\nBuyers in your region can now find your produce!`,
    fr: `🎉 *Listing publié!*\n\nVotre listing est maintenant en direct:\n🌱 *{crop}*\n⚖️ {quantityKg}kg\n💵 {priceFcfa} FCFA/kg\n📍 {location}, {region}\n🆔 ID: \`{listingId}\`\n\nLes acheteurs de votre région peuvent maintenant trouver vos produits!`,
  },
  listing_sold: {
    en: `✅ *Listing Marked as Sold!*\n\n🌱 *{crop}* — {quantityKg}kg\n📍 {location}\n🆔 #{listingId}\n\nGreat job! Your farm score has been updated. 🌟`,
    fr: `✅ *Listing marqué comme vendu!*\n\n🌱 *{crop}* — {quantityKg}kg\n📍 {location}\n🆔 #{listingId}\n\nExcellent travail! Votre farm score a été mis à jour. 🌟`,
  },
  listing_renewed: {
    en: `🔄 *Listing Renewed!*\n\n🌱 *{crop}* — {quantityKg}kg\n📍 {location}\n🆔 #{listingId}\n\nYour listing is active for another 7 days. ⏰`,
    fr: `🔄 *Listing renouvelé!*\n\n🌱 *{crop}* — {quantityKg}kg\n📍 {location}\n🆔 #{listingId}\n\nVotre listing est actif pour encore 7 jours. ⏰`,
  },
  listing_removed: {
    en: `🗑️ *Listing Removed*\n\nYour *{crop}* listing (#{listingId}) has been removed.\n\nTap *📦 My Produce* to manage your other listings.`,
    fr: `🗑️ *Listing Supprimé*\n\nVotre listing *{crop}* (#{listingId}) a été supprimé.\n\nAppuyez sur *📦 Mes Produits* pour gérer vos autres listings.`,
  },
  alert_activated: {
    en: `🔔 *Alert Activated!*\n\nYou will be notified when *{crop}* is available in *{regions}*.`,
    fr: `🔔 *Alerte activée!*\n\nVous serez notifié lorsque *{crop}* sera disponible à *{regions}*.`,
  },
  alert_unsubscribed: {
    en: `🔕 *Unsubscribed*\n\nYou will no longer receive notifications for *{crop}* in *{regions}*.\n\nYou can subscribe again anytime.`,
    fr: `🔕 *Abonnement annulé*\n\nVous ne recevrez plus de notifications pour *{crop}* dans *{regions}*.\n\nVous pouvez vous réabonner à tout moment.`,
  },
  outbreak_reported: {
    en: `🚨 *Report received!*\n\nThank you for reporting a *{crop}* outbreak in *{region}*.\n\nFarmers in your area will be notified so they can take preventive action. 🌱`,
    fr: `🚨 *Signalement reçu!*\n\nMerci d'avoir signalé une infestation de *{crop}* dans la région *{region}*.\n\nLes autres agriculteurs de votre zone seront informés afin qu'ils puissent prendre des précautions. 🌱`,
  },
  report_received: {
    en: `🚩 *Listing Reported*\n\nListing #{listingId} has been flagged.\nOur team will review it shortly. Thank you!`,
    fr: `🚩 *Listing Signalé*\n\nLe listing #{listingId} a été signalé.\nNotre équipe l'examinera sous peu. Merci!`,
  },
  new_interest_notification: {
    en: `🔔 *New Interest in Your Listing!*\n\n{firstName} is interested in your *{crop}*.\n📞 Contact: @{username}\n\nListing #{listingId}`,
    fr: `🔔 *Nouvel intérêt pour votre listing!*\n\n{firstName} est intéressé par votre *{crop}*.\n📞 Contact: @{username}\n\nListing #{listingId}`,
  },
  profile_text: {
    en: `👤 *Your Profile*\n\nRole: {role}\nStatus: {verified}\nPhone: {phone}`,
    fr: `👤 *Votre Profil*\n\nRôle: {role}\nStatut: {verified}\nTéléphone: {phone}`,
  },
  ai_prompt: {
    en: '🌿 Ask anything about farming, crop diseases, prices...',
    fr: '🌿 Posez votre question sur l\'agriculture, les maladies, les prix...',
  },
  ai_fallback: {
    en: '🌿 Ask anything about farming, crop diseases, prices...',
    fr: '🌿 Posez votre question sur l\'agriculture, les maladies, les prix...',
  },
  unverified_notice: {
    en: '\n\n⚠️ _Account unverified — some actions are restricted_',
    fr: '\n\n⚠️ _Compte non vérifié — certaines actions sont limitées_',
  },
  account_created: {
    en: `⚠️ *Account created!* Your account is pending verification.\nSome features (listing produce, payments) will be available after verification.`,
    fr: `⚠️ *Compte créé!* Votre compte est en attente de vérification.\nCertaines fonctionnalités (lister des produits, paiements) seront disponibles après vérification.`,
  },
  dashboard_welcome: {
    en: 'Open your dashboard:',
    fr: 'Ouvrir votre tableau de bord:',
  },
  browse_marketplace: {
    en: 'Browse the marketplace:',
    fr: 'Parcourir le marché:',
  },
  manage_subscriptions: {
    en: 'Manage your subscriptions:',
    fr: 'Gérer vos abonnements:',
  },
  which_crop_affected: {
    en: 'Which crop is affected?',
    fr: 'Quelle culture est affectée?',
  },
  ask_anything: {
    en: '🌿 Ask anything about farming, crop diseases, prices...',
    fr: '🌿 Posez votre question sur l\'agriculture, les maladies, les prix...',
  },
  view_prices: {
    en: 'View market prices:',
    fr: 'Voir les prix du marché:',
  },
  view_alerts: {
    en: 'View crop alerts:',
    fr: 'Voir les alertes de culture:',
  },
  farmer_registration_welcome: {
    en: 'Welcome {firstName}! 🎉 Here is your dashboard:',
    fr: 'Bienvenue {firstName}! 🎉 Voici votre tableau de bord:',
  },
  buyer_registration_welcome: {
    en: 'Welcome {firstName}! 🎉 Here is your dashboard:',
    fr: 'Bienvenue {firstName}! 🎉 Voici votre tableau de bord:',
  },
};


/**
 * Retrieves a localized message by key and language, with optional parameter substitution.
 * @param key The key of the message to retrieve.
 * @param lang The desired language ('en' or 'fr').
 * @param params Optional parameters to substitute into the message (e.g., {firstName: 'John'}).
 * @returns The localized message string, or a fallback if not found.
 */
export function getMessage(key: MessageKey, lang: Language, params?: Record<string, any>): string {
  const messageTemplate = messages[key]?.[lang] || messages[key]?.['en'] || `[Missing message for ${key} in ${lang}]`;

  if (!params) {
    return messageTemplate;
  }

  // Simple parameter substitution
  return Object.keys(params).reduce((acc, paramKey) => {
    const regex = new RegExp(`{${paramKey}}`, 'g');
    return acc.replace(regex, String(params[paramKey]));
  }, messageTemplate);
}