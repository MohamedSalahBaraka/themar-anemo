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
    Switch,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import AdminLayout from "@/Layouts/AdminLayout";

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

interface Review {
    rating: number;
    review: string;
    is_public: boolean;
}

interface UserService {
    id: number;
    user: User;
    service: Service;
    status: string;
    current_step: Step;
    created_at: string;
    review?: Review;
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
    initialRating = 0,
    initialReview = "",
    initialIsPublic = true,
}: {
    visible: boolean;
    onCancel: () => void;
    onOk: (rating: number, review: string, isPublic: boolean) => void;
    loading: boolean;
    initialRating?: number;
    initialReview?: string;
    initialIsPublic?: boolean;
}) => {
    const [rating, setRating] = useState<number>(initialRating);
    const [review, setReview] = useState<string>(initialReview);
    const [isPublic, setIsPublic] = useState<boolean>(initialIsPublic);

    return (
        <Modal
            title="Service Rating"
            open={visible}
            onCancel={onCancel}
            onOk={() => onOk(rating, review, isPublic)}
            confirmLoading={loading}
            width={600}
        >
            <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 8 }}>Rating</div>
                <Rate
                    value={rating}
                    onChange={setRating}
                    style={{ fontSize: 24 }}
                />
                {rating > 0 && (
                    <span style={{ marginLeft: 10 }}>
                        {
                            [
                                "Terrible",
                                "Poor",
                                "Average",
                                "Good",
                                "Excellent",
                            ][rating - 1]
                        }
                    </span>
                )}
            </div>

            <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 8 }}>Review (optional)</div>
                <TextArea
                    rows={4}
                    placeholder="Share your experience..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />
            </div>

            <div>
                <Switch
                    checked={isPublic}
                    onChange={setIsPublic}
                    checkedChildren="Public"
                    unCheckedChildren="Private"
                />
                <span style={{ marginLeft: 8 }}>
                    {isPublic ? "Visible to others" : "Only visible to admins"}
                </span>
            </div>
        </Modal>
    );
};

const UserServicesIndex = ({
    services,
    filters: initialFilters,
    allServices,
    allStatuses,
    allUsers,
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
        user_id: initialFilters.user_id || null,
        date_from: initialFilters.date_from || null,
        date_to: initialFilters.date_to || null,
    });

    const [ratingModal, setRatingModal] = useState<{
        visible: boolean;
        userServiceId: number | null;
        isEditing: boolean;
    }>({
        visible: false,
        userServiceId: null,
        isEditing: false,
    });

    const [submitting, setSubmitting] = useState(false);

    const handleRatingSubmit = async (
        rating: number,
        review: string,
        isPublic: boolean
    ) => {
        if (!ratingModal.userServiceId) return;

        setSubmitting(true);
        const url = ratingModal.isEditing
            ? route(
                  "admin.user-services.review.update",
                  ratingModal.userServiceId
              )
            : route(
                  "admin.user-services.review.store",
                  ratingModal.userServiceId
              );

        const method = ratingModal.isEditing ? "put" : "post";

        router[method](
            url,
            {
                rating,
                review,
                is_public: isPublic,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success(
                        `Review ${
                            ratingModal.isEditing ? "updated" : "submitted"
                        } successfully!`
                    );
                    setRatingModal({
                        visible: false,
                        userServiceId: null,
                        isEditing: false,
                    });
                },
                onError: (e) => {
                    console.log(e);
                    message.error(
                        `Failed to ${
                            ratingModal.isEditing ? "update" : "submit"
                        } review`
                    );
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const handleDeleteReview = async (userServiceId: number) => {
        router.delete(
            route("admin.user-services.review.destroy", userServiceId),
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success("Review deleted successfully!");
                },
                onError: (e) => {
                    console.log(e);

                    message.error("Failed to delete review");
                },
                onFinish: () => {},
            }
        );
    };

    const columns: ColumnsType<UserService> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "User",
            dataIndex: "user",
            key: "user",
            render: (user: User) => user?.name,
        },
        {
            title: "Service",
            dataIndex: "service",
            key: "service",
            render: (service: Service) => service?.name,
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
                <Tag color={statusColors[status as StatusKey] || "gray"}>
                    {status.replace("_", " ").toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Current Step",
            dataIndex: "current_step",
            key: "current_step",
            render: (step: Step) => step?.title,
        },
        {
            title: "Rating & Review",
            key: "review",
            render: (_, record: UserService) => {
                if (record.review) {
                    return (
                        <div>
                            <Rate
                                disabled
                                value={record.review.rating}
                                style={{ fontSize: 14 }}
                            />
                            {record.review.review && (
                                <div style={{ marginTop: 4 }}>
                                    "{record.review.review}"
                                    <Tag
                                        color={
                                            record.review.is_public
                                                ? "green"
                                                : "orange"
                                        }
                                        style={{ marginLeft: 8 }}
                                    >
                                        {record.review.is_public
                                            ? "Public"
                                            : "Private"}
                                    </Tag>
                                </div>
                            )}
                            <div style={{ marginTop: 8 }}>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        console.log(
                                            {
                                                visible: true,
                                                userServiceId: record.id,
                                                isEditing: true,
                                            },
                                            services.data.find(
                                                (s) => s.id === record.id
                                            )
                                        );

                                        setRatingModal({
                                            visible: true,
                                            userServiceId: record.id,
                                            isEditing: true,
                                        });
                                    }}
                                >
                                    تعديل
                                </Button>
                                <Button
                                    size="small"
                                    danger
                                    style={{ marginLeft: 8 }}
                                    onClick={() =>
                                        handleDeleteReview(record.id)
                                    }
                                >
                                    حذف
                                </Button>
                            </div>
                        </div>
                    );
                } else if (record.can_rate) {
                    return (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() =>
                                setRatingModal({
                                    visible: true,
                                    userServiceId: record.id,
                                    isEditing: false,
                                })
                            }
                        >
                            اضف مراجعة
                        </Button>
                    );
                }
                return null;
            },
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: UserService) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() =>
                            router.visit(
                                route("admin.user-services.show", record.id)
                            )
                        }
                    >
                        عرض التفاصيل
                    </Button>
                    <Button
                        type="link"
                        onClick={() =>
                            router.visit(
                                route("admin.user-services.form", record.id)
                            )
                        }
                    >
                        عرض الاستمارة
                    </Button>
                </Space>
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
            user_id: null,
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
        <AdminLayout>
            <div>
                <h1>طلبات الخدمات</h1>

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
                            <div style={{ marginBottom: 8 }}>الحالة</div>
                            <Select
                                value={filters.status}
                                onChange={(value) =>
                                    setFilters({ ...filters, status: value })
                                }
                                style={{ width: 200 }}
                                placeholder="Select status"
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
                            <div style={{ marginBottom: 8 }}>الخدمات</div>
                            <Select
                                value={filters.service_id}
                                onChange={(value) =>
                                    setFilters({
                                        ...filters,
                                        service_id: value,
                                    })
                                }
                                style={{ width: 200 }}
                                placeholder="Select service"
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

                        <div>
                            <div style={{ marginBottom: 8 }}>المستخدم</div>
                            <Select
                                value={filters.user_id}
                                onChange={(value) =>
                                    setFilters({ ...filters, user_id: value })
                                }
                                style={{ width: 200 }}
                                placeholder="Select user"
                                allowClear
                            >
                                {allUsers.map((user) => (
                                    <Select.Option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name} ({user.email})
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </Space>

                    <Space size={20} style={{ marginBottom: 16 }}>
                        <div>
                            <div style={{ marginBottom: 8 }}>التاريخ من</div>
                            <DatePicker
                                value={filters.date_from}
                                onChange={(date) =>
                                    setFilters({ ...filters, date_from: date })
                                }
                                style={{ width: 200 }}
                                placeholder="Start date"
                            />
                        </div>

                        <div>
                            <div style={{ marginBottom: 8 }}>التاريخ الي</div>
                            <DatePicker
                                value={filters.date_to}
                                onChange={(date) =>
                                    setFilters({ ...filters, date_to: date })
                                }
                                style={{ width: 200 }}
                                placeholder="End date"
                            />
                        </div>
                    </Space>

                    <Space>
                        <Button type="primary" onClick={applyFilters}>
                            Apply Filters
                        </Button>
                        <Button onClick={resetFilters}>
                            اعد تعيين الفلاتر
                        </Button>
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
                    visible={ratingModal.visible}
                    onCancel={() =>
                        setRatingModal({
                            visible: false,
                            userServiceId: null,
                            isEditing: false,
                        })
                    }
                    onOk={handleRatingSubmit}
                    loading={submitting}
                    initialRating={
                        ratingModal.isEditing
                            ? services.data.find(
                                  (s) => s.id === ratingModal.userServiceId
                              )?.review?.rating || 0
                            : 0
                    }
                    initialReview={
                        ratingModal.isEditing
                            ? services.data.find(
                                  (s) => s.id === ratingModal.userServiceId
                              )?.review?.review || ""
                            : ""
                    }
                    initialIsPublic={
                        ratingModal.isEditing
                            ? services.data.find(
                                  (s) => s.id === ratingModal.userServiceId
                              )?.review?.is_public || true
                            : true
                    }
                />
            </div>
        </AdminLayout>
    );
};

export default UserServicesIndex;
