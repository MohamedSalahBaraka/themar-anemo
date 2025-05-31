export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    profile: {
        bio?: string;
        profile_image?: string | null;
        id_photo?: string | null;
        company_name?: string | null;
        address?: string | null;
        national_id?: string | null;
        tax_id?: string | null;
    };
    created_at: string;
    updated_at: string;
    subscription: Subscription;
}

export interface Stats {
    active_listings: number;
    total_views: number;
    total_inquiries: number;
    monthly_views: number;
    monthly_inquiries: number;
}
export interface LoginResponse {
    user: User;
    token: string;
}
export interface Subscription {
    id: number;
    user_id: number;
    price: number;
    package_id: string;
    billing_frequency: string;
    package_name: string;
    plan_name: string;
    plan_id: string;
    status: "active" | "expired" | "canceled" | "pending";
    starts_at: string;
    expires_at: string;
    features: string[];
    created_at: string;
    updated_at: string;
}
export type UserRole = "buyer" | "owner" | "agent" | "company" | "admin";
export type UserStatus = "active" | "inactive" | "pending";
export interface UsersResponse {
    data: User[];
    total: number;
    page: number;
    limit: number;
}
export interface Package {
    id: number;
    name: string;
    user_type: string;
    price: number;
    yearly_price: number;
    duration: number; // in days
    max_listings: number;
    features: string[] | null;
    created_at: string;
    updated_at: string;
}
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    role: UserRole;
    package_id?: string;
}

export interface LoginData {
    email: string;
    password: string;
}
