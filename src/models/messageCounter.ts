export interface messageeCounter {
    id: number;
    user_id: string;
    counter: number; // default 0
    response: number; // default 0
    createdAt?: Date;
    updatedAt?: Date;
}