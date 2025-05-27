export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}
