export interface ListingInterest {
    id: number;
    listing_id: number;
    user_id: string;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}