import { User } from "./user";

// Base type with common fields
interface BaseModel {
    id: number;
    created_at: string | Date;
    updated_at: string | Date;
}

// 1. Service Categories
export interface ServiceCategory extends BaseModel {
    name: string;
    icon: string | null;
    icon_url: string;
}

// 2. Services
export interface Service extends BaseModel {
    category_id: number | null;
    name: string;
    photo: string;
    description: string | null;
    tags: string[] | null;
    price: number | null;
    is_active: boolean;
    created_by: number;
    category: ServiceCategory;
    fields: ServiceField[];
    steps: ServiceStep[];
}

export interface ServicesFilterParams {
    search?: string;
    category?: number;
    tags?: string[];
}
// 3. Service Steps
export interface ServiceStep extends BaseModel {
    service_id: number;
    title: string;
    description: string | null;
    order: number;
    deadline_days: number | null;
    fields: ServiceField[];
}

// 4. Service Fields
export interface ServiceField extends BaseModel {
    service_id: number;
    step_id: number | null;
    label: string;
    field_type: string;
    required: boolean;
    show_on_creation: boolean;
    options: string[];
    order: number;
    dependency: {
        field_id: number;
        value: any;
    } | null;
}

// 5. User Services
export interface UserService extends BaseModel {
    user_id: number;
    service_id: number;
    status: "pending" | "in_progress" | "completed" | "cancelled" | string;
    current_step_id: number | null;
    steps: UserServiceStep[];
    current_step: ServiceStep;
    service: Service;
    user: User;
    activity_logs: ServiceActivityLog[];
    field_values: UserServiceFieldValue[];
    attachments: UserServiceAttachment[];
}

// 6. User Service Field Values
export interface UserServiceFieldValue extends BaseModel {
    user_service_id: number;
    service_field_id: number;
    value: string | null;
}

// 7. User Service Steps
export interface UserServiceStep extends BaseModel {
    user_service_id: number;
    service_step_id: number;
    status: "pending" | "completed" | "rejected" | string;
    admin_note: string | null;
    completed_at: string | Date | null;
    serviceStep: ServiceStep;
}

// 8. User Service Attachments
export interface UserServiceAttachment extends BaseModel {
    user_service_id: number;
    step_id: number | null;
    uploaded_by: number;
    file_path: string;
    type: string | null;
    note: string | null;
}

// 9. Service Activity Logs
export interface ServiceActivityLog extends BaseModel {
    user_service_id: number;
    user_id: number;
    action: string;
    meta: Record<string, any> | null;
    user: User;
}

// 10. User Service Reviews
export interface UserServiceReview extends BaseModel {
    user_service_id: number;
    rating: number; // Assuming 1-5 scale
    review: string | null;
    is_public: boolean;
}
