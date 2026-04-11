// packages/bot/src/types/backend.types.ts

export interface PlatformUserBackend {
  platformUserId: string;
  name:           string;
  role:           'farmer' | 'buyer';
  region:         string;
  language:       'en' | 'fr';
  verified:       boolean;
  phone?:         string;
  telegramId?:    number;
}

export interface Listing {
  id:              string;
  crop:            string;
  quantityKg:      number;
  priceFcfa:       number;
  location:        string;
  region:          string;
  farmerName:      string;
  farmerId:        string;
  farmerTelegramId?: number;
  farmScore:       number;
  photoFileId?:    string;
  status:          'active' | 'sold'  ;
  views:           number;
  interestedCount: number;
  expiresAt:       string;
  createdAt:       string;
}

export interface MarketPrice {
  market:   string;
  minPrice: number;
  maxPrice: number;
}

export interface InterestResult {
  success:         boolean;
  farmerTelegramId?: number;
  farmerName:      string;
}

export interface FarmScore {
  score:         number;
  level:         string;
  completedDeals: number;
  breakdown: {
    deals:    number;
    ratings:  number;
    activity: number;
    njangi:   number;
  };
}

export interface Outbreak {
  id:          string;
  pestName:    string;
  crop:        string;
  region:      string;
  description: string;
  reportedAt:  string;
  lat?:        number;
  lng?:        number;
}

// Backend API function parameter types
export interface RegisterUserParams {
  telegramId: number;
  name:       string;
  role:       'farmer' | 'buyer';
  region:     string;
  language:   'en' | 'fr';
  phone?:     string;
}

export interface CreateListingParams {
  platformUserId: string;
  crop:           string;
  quantityKg:     number;
  priceFcfa:      number;
  location:       string;
  region:         string;
  photoFileId?:   string;
}

export interface SearchListingsQuery {
  crop?:   string;
  region?: string;
  limit?:  number;
}

export interface UpdateListingStatusParams {
  listingId: string;
  status:    'sold' | 'active';
}

export interface ExpressInterestParams {
  listingId:            string;
  buyerPlatformUserId:  string;
}

export interface SubscribeParams {
  platformUserId: string;
  crop:           string;
  region:         string;
}

export interface UnsubscribeParams {
  platformUserId: string;
  crop:           string;
  region:         string;
}

export interface GetSubscriptionsParams {
  platformUserId: string;
}

export interface ReportOutbreakParams {
  platformUserId: string;
  pestName:       string;
  crop:           string;
  region:         string;
  description:    string;
  lat?:           number;
  lng?:           number;
}

export interface GetOutbreaksParams {
  region?: string;
  crop?:   string;
}

export interface GetFarmScoreParams {
  platformUserId: string;
}

export interface GetUserParams {
  telegramId?: number;
  phone?:      string;
}

export interface LinkTelegramAccountParams {
  platformUserId: string;
  telegramId:     number;
}