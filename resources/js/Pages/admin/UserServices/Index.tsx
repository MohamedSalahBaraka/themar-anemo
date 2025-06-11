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
    const { t } = useLanguage();
    const [rating, setRating] = useState<number>(initialRating);
    const [review, setReview] = useState<string>(initialReview);
    const [isPublic, setIsPublic] = useState<boolean>(initialIsPublic);

    return (
        <Modal
            title={t("service_rating")}
            open={visible}
            onCancel={onCancel}
            onOk={() => onOk(rating, review, isPublic)}
            confirmLoading={loading}
            width={600}
        >
            <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 8 }}>{t("rating")}</div>
                <Rate
                    value={rating}
                    onChange={setRating}
                    style={{ fontSize: 24 }}
                />
                {rating > 0 && (
                    <span style={{ marginLeft: 10 }}>
                        {t(`rating_levels.${rating - 1}`)}
                    </span>
                )}
            </div>

            <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 8 }}>
                    {t("review")} ({t("optional")})
                </div>
                <TextArea
                    rows={4}
                    placeholder={t("share_experience")}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />
            </div>

            <div>
                <Switch
                    checked={isPublic}
                    onChange={setIsPublic}
                    checkedChildren={t("public")}
                    unCheckedChildren={t("private")}
                />
                <span style={{ marginLeft: 8 }}>
                    {isPublic
                        ? t("visible_to_others")
                        : t("visible_to_admins_only")}
                </span>
            </div>
        </Modal>
    );
};

const UserServicesIndex: React.FC<UserServicesIndexProps> = ({
    services,
    filters,
    allServices,
    allStatuses,
    allUsers,
}) => (
    <AdminLayout>
        <Page
            allServices={allServices}
            allStatuses={allStatuses}
            allUsers={allUsers}
            filters={filters}
            services={services}
        />
    </AdminLayout>
);

const Page = ({
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
    const { t } = useLanguage();

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
                        t(
                            ratingModal.isEditing
                                ? "review_updated_success"
                                : "review_submitted_success"
                        )
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
                        t(
                            ratingModal.isEditing
                                ? "review_update_failed"
                                : "review_submit_failed"
                        )
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
                    message.success(t("review_deleted_success"));
                },
                onError: (e) => {
                    console.log(e);
                    message.error(t("review_delete_failed"));
                },
            }
        );
    };

    const columns: ColumnsType<UserService> = [
        {
            title: t("id"),
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: t("user"),
            dataIndex: "user",
            key: "user",
            render: (user: User) => user?.name,
        },
        {
            title: t("service"),
            dataIndex: "service",
            key: "service",
            render: (service: Service) => service?.name,
        },
        {
            title: t("status"),
            dataIndex: "status",
            render: (status: string) => (
                <Tag color={statusColors[status as StatusKey] || "gray"}>
                    {t(`statuses.${status}`)}
                </Tag>
            ),
        },
        {
            title: t("current_step"),
            dataIndex: "current_step",
            key: "current_step",
            render: (step: Step) => step?.title,
        },
        {
            title: t("rating_review"),
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
                                            ? t("public")
                                            : t("private")}
                                    </Tag>
                                </div>
                            )}
                            <div style={{ marginTop: 8 }}>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setRatingModal({
                                            visible: true,
                                            userServiceId: record.id,
                                            isEditing: true,
                                        });
                                    }}
                                >
                                    {t("edit")}
                                </Button>
                                <Button
                                    size="small"
                                    danger
                                    style={{ marginLeft: 8 }}
                                    onClick={() =>
                                        handleDeleteReview(record.id)
                                    }
                                >
                                    {t("delete")}
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
                            {t("add_review")}
                        </Button>
                    );
                }
                return null;
            },
        },
        {
            title: t("created_at"),
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: t("actions"),
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
                        {t("view_details")}
                    </Button>
                    <Button
                        type="link"
                        onClick={() =>
                            router.visit(
                                route("admin.user-services.form", record.id)
                            )
                        }
                    >
                        {t("view_form")}
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
        <div>
            <h1>{t("service_requests")}</h1>

            <div
                style={{
                    background: "#fafafa",
                    padding: 20,
                    marginBottom: 20,
                    borderRadius: 4,
                }}
            >
                <h3>{t("filters")}</h3>
                <Space size={20} style={{ marginBottom: 16 }}>
                    <div>
                        <div style={{ marginBottom: 8 }}>{t("status")}</div>
                        <Select
                            value={filters.status}
                            onChange={(value) =>
                                setFilters({ ...filters, status: value })
                            }
                            style={{ width: 200 }}
                            placeholder={t("select_status")}
                            allowClear
                        >
                            {allStatuses.map((status) => (
                                <Select.Option key={status} value={status}>
                                    {t(`statuses.${status}`)}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <div style={{ marginBottom: 8 }}>{t("services")}</div>
                        <Select
                            value={filters.service_id}
                            onChange={(value) =>
                                setFilters({
                                    ...filters,
                                    service_id: value,
                                })
                            }
                            style={{ width: 200 }}
                            placeholder={t("select_service")}
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
                        <div style={{ marginBottom: 8 }}>{t("user")}</div>
                        <Select
                            value={filters.user_id}
                            onChange={(value) =>
                                setFilters({ ...filters, user_id: value })
                            }
                            style={{ width: 200 }}
                            placeholder={t("select_user")}
                            allowClear
                        >
                            {allUsers.map((user) => (
                                <Select.Option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </Space>

                <Space size={20} style={{ marginBottom: 16 }}>
                    <div>
                        <div style={{ marginBottom: 8 }}>{t("date_from")}</div>
                        <DatePicker
                            value={filters.date_from}
                            onChange={(date) =>
                                setFilters({ ...filters, date_from: date })
                            }
                            style={{ width: 200 }}
                            placeholder={t("start_date")}
                        />
                    </div>

                    <div>
                        <div style={{ marginBottom: 8 }}>{t("date_to")}</div>
                        <DatePicker
                            value={filters.date_to}
                            onChange={(date) =>
                                setFilters({ ...filters, date_to: date })
                            }
                            style={{ width: 200 }}
                            placeholder={t("end_date")}
                        />
                    </div>
                </Space>

                <Space>
                    <Button type="primary" onClick={applyFilters}>
                        {t("apply_filters")}
                    </Button>
                    <Button onClick={resetFilters}>{t("reset_filters")}</Button>
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
    );
};

export default UserServicesIndex;
