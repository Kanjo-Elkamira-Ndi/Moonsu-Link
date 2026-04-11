export interface CropPrice{
    id: number;
    crop_name?: string; // not found in the database but useful for the frontend
    crop_id?: number; // the compination of crop_name and region should be unique
    region: | 'Adamawa' | 'Centre' | 'East' | 'Far North' | 'Littoral' | 'North' | 'North West' | 'West' | 'South' | 'South West' | 'General';
    min_price: number;
    max_price: number;
    avg_price: number;
    createdAt?: Date;
    updatedAt?: Date;
}