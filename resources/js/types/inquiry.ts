export interface Inquiry {
    id: string;
    property_id: string;
    property_title: string;
    property_image?: string;
    sender_id: string;
    sender_name: string;
    sender_email: string;
    sender_phone?: string;
    sender_avatar?: string;
    message: string;
    status: "unread" | "read" | "replied";
    created_at: string;
}
