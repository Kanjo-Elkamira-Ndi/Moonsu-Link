import { PlatformUser } from "../types/shared";


export function generateVerficationStatus(user: PlatformUser): 'verified' | 'pending' | 'unverified'{
    if(user.verified){
        return "verified"
    }
    // else if(!user.verified && user.idUrl && user.idAndSelfieUrl && user.selfieUrl){
      else if(!user.verified && user.pic_folder){
        return "pending"
    }
    else {
        return "unverified"
    }
}

export function generateVerificationBadge(status: string, lang: string): string{
   
  switch(status) {

    case 'unverified':
      return lang === 'fr'
        ? '\n\n⚠️ _Compte non vérifié — certaines actions sont limitées_ (Verifie le dans votre profil)'
        : '\n\n⚠️ _Account not verified — some actions are restricted_ (Verify it in your profile)';

    case 'pending':
      return lang === 'fr'
        ? '\n\n⏳ _Vérification en cours — votre compte est en revue_'
        : '\n\n⏳ _Verification in progress — your account is under review_';

    case 'unverified':
      return lang === 'fr'
        ? '\n\n✅ _Compte vérifié_'
        : '\n\n✅ _Verified account_';

    default:
      return '';
  }

}