export interface Alert {
    id: number;
    user_id: string;
    notice: string;
    advice?: string;
    createdAt?: Date;
    updatedAt?: Date;
    verified?: boolean;
}