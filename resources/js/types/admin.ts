import { PageProps } from ".";

export interface AdminDashboardProps extends PageProps {
    stats: {
        users_count: number;
        properties_count: number;
        active_listings: number;
        revenue_30days: number;
    };
    revenueData: {
        date: string;
        total: number;
    }[];
}
