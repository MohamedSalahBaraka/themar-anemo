// resources/js/Pages/Admin/Reviews/Index.jsx

import { Table, Space, Switch, Tag, Button, message, Popconfirm } from "antd";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, usePage, router } from "@inertiajs/react";
import { RouteParams } from "../../../../../vendor/tightenco/ziggy/src/js";
import {
    GenericRouteParamsObject,
    GenericRouteParamsArray,
} from "../../../../../vendor/tightenco/ziggy/src/js";
import { PageProps } from "@/types";

interface ReviewRecord {
    id: number;
    rating: number;
    review: string;
    is_public: boolean;
    user_service: {
        user?: { name?: string };
        service?: { name?: string };
    };
    // Add other fields as needed
}

interface ReviewsPagination extends PageProps {
    reviews: {
        data: ReviewRecord[];
        current_page: number;
        total: number;
        per_page: number;
        links: { url: string | null }[];
    };
}

const ReviewIndex = () => {
    const { reviews } = usePage<ReviewsPagination>().props;

    const handleToggleVisibility = (review: { id: number }) => {
        router.post(
            route("admin.reviews.toggle-visibility", review.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => message.success("Visibility updated"),
            }
        );
    };

    const columns: import("antd").TableColumnsType<ReviewRecord> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating: number) => <Tag color="gold">{`${rating}/5`}</Tag>,
        },
        {
            title: "Review",
            dataIndex: "review",
            key: "review",
            ellipsis: true,
        },
        {
            title: "User",
            key: "user",
            render: (_: any, record: ReviewRecord) =>
                record.user_service?.user?.name || "N/A",
        },
        {
            title: "Service",
            key: "service",
            render: (_: any, record: ReviewRecord) =>
                record.user_service?.service?.name || "N/A",
        },
        {
            title: "Public",
            dataIndex: "is_public",
            key: "is_public",
            render: (isPublic: boolean, record: ReviewRecord) => (
                <Switch
                    checked={isPublic}
                    onChange={() => handleToggleVisibility(record)}
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: ReviewRecord) => (
                <Space size="middle">
                    <Link href={route("admin.reviews.edit", record.id)}>
                        <Button type="primary">Edit</Button>
                    </Link>
                    <Popconfirm
                        title="Are you sure to delete this review?"
                        onConfirm={() =>
                            router.delete(
                                route("admin.reviews.destroy", record.id)
                            )
                        }
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <h1>Service Reviews Management</h1>
            </div>
            <Table
                columns={columns}
                dataSource={reviews.data}
                rowKey="id"
                pagination={{
                    current: reviews.current_page,
                    total: reviews.total,
                    pageSize: reviews.per_page,
                    onChange: (page) => {
                        const url = reviews.links[page].url;
                        if (url) {
                            router.get(url);
                        }
                    },
                }}
            />
        </div>
    );
};

export default ReviewIndex;
