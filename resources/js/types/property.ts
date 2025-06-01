import { User } from "./user";

export interface Property {
    id: number;
    user_id: number;
    title: string;
    description: string;
    type: PropertyType;
    status: PropertyStatus;
    purpose: "sale" | "rent";
    price: number;
    area?: number;
    user: User;
    bedrooms?: number;
    bathrooms?: number;
    floor?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    published_at?: string | null;
    primaryImage?: string | null;
    image_url?: string | null;
    expires_at?: string | null;
    rejection_reason?: string | null;
    approved: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    // For frontend display (you might add these separately)
    imageUrl?: string;
    images?: { image_url: string }[];
}
export type PropertyType = "apartment" | "villa" | "land" | "office";
export type PropertyStatus =
    | "sold"
    | "rented"
    | "available"
    | "reserved"
    | "pending"
    | "rejected";
export type PropertyPurpose = "sale" | "rent";
export interface InquiryData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}
export interface PropertyApprovalRequest {
    approved: boolean;
    rejection_reason?: string;
}
export interface ReservationData {
    user_id: number;
    start_date?: string; // For rental properties
    end_date?: string; // For rental properties
    special_requests?: string;
}

export interface PropertyFilter {
    location?: string; // Will search address
    type?: "apartment" | "villa" | "land" | "office";
    minPrice?: number;
    maxPrice?: number;
    purpose?: "sale" | "rent";
    bedrooms?: number;
    bathrooms?: number;
    status?: "available" | "sold" | "rented" | "reserved";
    is_featured?: boolean;
    page?: number;
    per_page?: number;
    // Add more filter options as needed
}
