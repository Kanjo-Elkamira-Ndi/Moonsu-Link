export interface Alert {
    id: number;
    user_id?: string;
    title: string;
    message: string;
    advice?: string;
    severity: 'info' | 'warning' | 'critical';
    region?: string;
    status: 'pending' | 'published' | 'dismissed';
    submitted_by?: string;
    published_at?: Date;
    created_at?: Date;
    updated_at?: Date;
}