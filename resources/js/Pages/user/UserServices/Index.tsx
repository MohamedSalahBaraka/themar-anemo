import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Table,
    Tag,
    Select,
    DatePicker,
    Button,
    Space,
    Rate,
    Modal,
    Input,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import AdminLayout from "@/Layouts/AdminLayout";
import AppLayout from "@/Layouts/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

const { TextArea } = Input;

interface User {
    id: number;
    name: string;
    email: string;
}

interface Service {
    id: number;
    name: string;
}

interface Step {
    title: string;
}

interface UserService {
    id: number;
    user: User;
    service: Service;
    status: string;
    current_step: Step;
    created_at: string;
    rating?: number | null;
    review?: string | null;
    can_rate?: boolean;
}

interface PaginationLinks {
    [key: number]: { url: string };
}

interface ServicesData {
    data: UserService[];
    current_page: number;
    total: number;
    per_page: number;
    links: PaginationLinks;
}

interface Filters {
    status: string | null;
    service_id: number | null;
    user_id: number | null;
    date_from: any;
    date_to: any;
}

interface UserServicesIndexProps {
    services: ServicesData;
    filters: Filters;
    allServices: Service[];
    allStatuses: string[];
    allUsers: User[];
}

const RatingModal = ({
    visible,
    onCancel,
    onOk,
    loading,
}: {
    visible: boolean;
    onCancel: () => void;
    onOk: (rating: number, review: string) => void;
    loading: boolean;
}) => {
    const [rating, setRating] = useState<number>(0);
    const [review, setReview] = useState<string>("");
    const { t } = useLanguage();

    return (
        <Modal
            title={t("Rate This Service")}
            open={visible}
            onCancel={onCancel}
            onOk={() => onOk(rating, review)}
            confirmLoading={loading}
        >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <Rate
                    value={rating}
                    onChange={setRating}
                    style={{ fontSize: 32 }}
                />
                {rating > 0 && (
                    <span style={{ marginLeft: 10 }}>
                        {
                            ["Terrible", "Bad", "Normal", "Good", "Excellent"][
                                rating - 1
                            ]
                        }
                    </span>
                )}
            </div>
            <TextArea
                rows={4}
                placeholder={t("Share your experience (optional)")}
                value={review}
                onChange={(e) => setReview(e.target.value)}
            />
        </Modal>
    );
};
const UserServicesIndex: React.FC<UserServicesIndexProps> = ({
    services,
    filters: initialFilters,
    allServices,
    allStatuses,
    allUsers,
}) => (
    <AppLayout>
        <Page
            allServices={allServices}
            allStatuses={allStatuses}
            allUsers={allUsers}
            filters={initialFilters}
            services={services}
        />
    </AppLayout>
);
const Page = ({
    services,
    filters: initialFilters,
    allServices,
    allStatuses,
}: UserServicesIndexProps) => {
    type StatusKey =
        | "pending"
        | "in_progress"
        | "completed"
        | "rejected"
        | "cancelled";
    const statusColors: Record<StatusKey, string> = {
        pending: "orange",
        in_progress: "blue",
        completed: "green",
        rejected: "red",
        cancelled: "gray",
    };

    const [filters, setFilters] = useState({
        status: initialFilters.status || null,
        service_id: initialFilters.service_id || null,
        date_from: initialFilters.date_from || null,
        date_to: initialFilters.date_to || null,
    });

    const { t } = useLanguage();
    const [ratingModalVisible, setRatingModalVisible] = useState<number | null>(
        null
    );
    const [submittingRating, setSubmittingRating] = useState(false);

    const handleRatingSubmit = async (rating: number, review: string) => {
        if (!ratingModalVisible) return;

        setSubmittingRating(true);
        router.post(
            route("user.user-services.submit-rating", ratingModalVisible),
            {
                rating,
                review,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRatingModalVisible(null);
                    message.success(t("Rating submitted successfully!"));
                },
                onError: (e) => {
                    console.log(e);
                    message.error(t("Failed to submit rating"));
                },
                onFinish: () => {
                    setSubmittingRating(false);
                },
            }
        );
    };

    const columns: ColumnsType<UserService> = [
        {
            title: t("ID"),
            dataIndex: "id",
            key: "id",
        },
        {
            title: t("Service"),
            dataIndex: "service",
            key: "service",
            render: (service: Service) => service?.name,
        },
        {
            title: t("Status"),
            dataIndex: "status",
            render: (status: string) => (
                <Tag color={statusColors[status as StatusKey] || "gray"}>
                    {status.replace("_", " ").toUpperCase()}
                </Tag>
            ),
        },
        {
            title: t("Current Step"),
            dataIndex: "current_step",
            key: "current_step",
            render: (step: Step) => step?.title,
        },
        {
            title: t("Rating"),
            dataIndex: "rating",
            key: "rating",
            render: (rating: number | null, record: UserService) => {
                if (rating === null || rating === undefined) {
                    return record.can_rate ? (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => setRatingModalVisible(record.id)}
                        >
                            {t("Rate Service")}
                        </Button>
                    ) : null;
                }
                return (
                    <div>
                        <Rate disabled defaultValue={rating} />
                        {record.review && (
                            <div style={{ marginTop: 4, fontStyle: "italic" }}>
                                "{record.review}"
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: t("Created At"),
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: t("Actions"),
            key: "actions",
            render: (_: any, record: UserService) => (
                <Button
                    type="link"
                    onClick={() =>
                        router.visit(
                            route("user.user-services.show", record.id)
                        )
                    }
                >
                    {t("View Details")}
                </Button>
            ),
        },
    ];

    const applyFilters = () => {
        router.get(route("user-services.index"), filters, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setFilters({
            status: null,
            service_id: null,
            date_from: null,
            date_to: null,
        });
        applyFilters();
    };

    interface TablePaginationConfig {
        current?: number;
        pageSize?: number;
        total?: number;
    }

    const handleTableChange = (pagination: TablePaginationConfig) => {
        if (pagination.current && services.links[pagination.current]) {
            router.get(
                services.links[pagination.current].url,
                {},
                {
                    preserveState: true,
                }
            );
        }
    };

    return (
        <div>
            <h1>{t("Service Requests")}</h1>

            <div
                style={{
                    background: "#fafafa",
                    padding: 20,
                    marginBottom: 20,
                    borderRadius: 4,
                }}
            >
                <h3>Filters</h3>
                <Space size={20} style={{ marginBottom: 16 }}>
                    <div>
                        <div style={{ marginBottom: 8 }}>{t("Status")}</div>
                        <Select
                            value={filters.status}
                            onChange={(value) =>
                                setFilters({ ...filters, status: value })
                            }
                            style={{ width: 200 }}
                            placeholder={t("Select status")}
                            allowClear
                        >
                            {allStatuses.map((status) => (
                                <Select.Option key={status} value={status}>
                                    {status.replace("_", " ").toUpperCase()}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <div style={{ marginBottom: 8 }}>{t("Service")}</div>
                        <Select
                            value={filters.service_id}
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    service_id: value,
                                })
                            }
                            style={{ width: 200 }}
                            placeholder={t("Select service")}
                            allowClear
                        >
                            {allServices.map((service) => (
                                <Select.Option
                                    key={service.id}
                                    value={service.id}
                                >
                                    {service.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </Space>

                <Space size={20} style={{ marginBottom: 16 }}>
                    <div>
                        <div style={{ marginBottom: 8 }}>{t("Date From")}</div>
                        <DatePicker
                            value={filters.date_from}
                            onChange={(date) =>
                                setFilters({ ...filters, date_from: date })
                            }
                            style={{ width: 200 }}
                            placeholder={t("Start date")}
                        />
                    </div>

                    <div>
                        <div style={{ marginBottom: 8 }}>{t("Date To")}</div>
                        <DatePicker
                            value={filters.date_to}
                            onChange={(date) =>
                                setFilters({ ...filters, date_to: date })
                            }
                            style={{ width: 200 }}
                            placeholder={t("End date")}
                        />
                    </div>
                </Space>

                <Space>
                    <Button type="primary" onClick={applyFilters}>
                        {t("Apply Filters")}
                    </Button>
                    <Button onClick={resetFilters}>{t("Reset Filters")}</Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={services.data}
                rowKey="id"
                pagination={{
                    current: services.current_page,
                    total: services.total,
                    pageSize: services.per_page,
                    showSizeChanger: false,
                }}
                onChange={handleTableChange}
            />
            <RatingModal
                visible={!!ratingModalVisible}
                onCancel={() => setRatingModalVisible(null)}
                onOk={handleRatingSubmit}
                loading={submittingRating}
            />
        </div>
    );
};

export default UserServicesIndex;
