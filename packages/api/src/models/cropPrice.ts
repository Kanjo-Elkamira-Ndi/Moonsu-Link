export interface CropPrice{
    id: number;
    crop_name?: string; // not found in the database but useful for the frontend
    crop_id?: number; // the compination of crop_name and region should be unique
    region: 'Adamaoua' | 'Centre' | 'Est' | 'Extrême-Nord' | 'Littoral' | 'Nord' | 'Nord-Ouest' | 'Ouest' | 'Sud' | 'Sud-Ouest' | 'General';
    min_price: number;
    max_price: number;
    avg_price: number;
    createdAt?: Date;
    updatedAt?: Date;
}