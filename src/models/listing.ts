export interface Listing {
    id: number;
    user_id?: string;
    user_name?: string;
    crop_id: number;
    crop_name?: string;
    quantity_kg: number; // in kg
    price: number; // in FCFA per kg
    town: string;
    region: | 'Adamawa' | 'Centre' | 'East' | 'Far North' | 'Littoral' | 'North' | 'North West' | 'West' | 'South' | 'South West' | 'General';
    image_url?: string;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}