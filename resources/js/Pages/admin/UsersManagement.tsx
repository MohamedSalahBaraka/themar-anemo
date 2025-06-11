// src/pages/admin/UsersManagement.tsx
import React from "react";
import {
    Table,
    Card,
    Typography,
    Button,
    Space,
    Tag,
    Popconfirm,
    message,
    Input,
    Select,
    Form,
    Modal,
    Divider,
    Avatar,
    Row,
    Col,
    Badge,
    Descriptions,
    Radio,
    Tabs,
    Upload,
    Image,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    UserOutlined,
    PlusOutlined,
    SyncOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { usePage, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Package,
    Subscription,
    User,
    UserRole,
    UserStatus,
} from "@/types/user";
import AdminLayout from "@/Layouts/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

interface pagedata extends PageProps {
    users: (User & {
        subscription?: Subscription;
    })[];
    packages: Package[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
    filters: {
        role?: UserRole;
        status?: UserStatus;
        search?: string;
        subscription_status?: string;
    };
}

const { Title, Text } = Typography;
const { Option } = Select;
const { Column } = Table;
const { TabPane } = Tabs;

const UsersManagement: React.FC = () => (
    <AdminLayout>
        <Page />
    </AdminLayout>
);

const Page: React.FC = () => {
    const { props } = usePage<pagedata>();
    const { t } = useLanguage();
    const [messageApi, contextHolder] = message.useMessage();
    const { users, packages, pagination, filters: initialFilters } = props;
    const [filters, setFilters] = React.useState(initialFilters);
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [subscriptionModalVisible, setSubscriptionModalVisible] =
        React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [form] = Form.useForm();
    const [subscriptionForm] = Form.useForm();
    const user = usePage().props.auth.user;
    const [profileModalVisible, setProfileModalVisible] = React.useState(false);
    const [activeProfileTab, setActiveProfileTab] = React.useState("1");

    const handleProfilePreview = (user: User) => {
        setCurrentUser(user);
        if (user.profile) {
            form.setFieldsValue({
                profile: {
                    company_name: user.profile.company_name,
                    bio: user.profile.bio,
                    address: user.profile.address,
                    national_id: user.profile.national_id,
                    tax_id: user.profile.tax_id,
                },
            });
        }
        setProfileModalVisible(true);
    };

    const handleTableChange = (newPagination: any, newFilters: any) => {
        router.get(
            route("admin.users.index"),
            {
                page: newPagination.current,
                limit: newPagination.pageSize,
                ...filters,
                ...newFilters,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleStatusChange = async (userId: number, status: UserStatus) => {
        router.put(
            route("admin.users.update-status", userId),
            {
                status,
            },
            {
                onSuccess: () => {
                    messageApi.success(
                        t("user_status_updated", { status: t(status) })
                    );
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("user_status_update_failed"));
                },
            }
        );
    };

    const handleDelete = async (userId: number) => {
        router.delete(route("admin.users.destroy", userId), {
            onSuccess: () => {
                messageApi.success(t("user_deleted_success"));
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error(t("user_delete_failed"));
            },
        });
    };

    const handleEdit = (user: User) => {
        setCurrentUser(user);
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            ...(user.profile
                ? {
                      profile: {
                          company_name: user.profile.company_name,
                          bio: user.profile.bio,
                      },
                  }
                : {}),
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!currentUser) return;
            setIsLoading(true);

            router.put(route("admin.users.update", currentUser.id), values, {
                onSuccess: () => {
                    messageApi.success(t("user_updated_success"));
                    setProfileModalVisible(false);
                    setEditModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("user_update_failed"));
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            });
        } catch (error) {
            messageApi.error(t("user_update_failed"));
        }
    };

    const handleSearch = (value: string) => {
        const newFilters = { ...filters, search: value };
        setFilters(newFilters);
        router.get(
            route("admin.users.index"),
            {
                ...newFilters,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleFilterChange = (name: string, value: string) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        router.get(
            route("admin.users.index"),
            {
                ...newFilters,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleManageSubscription = (user: User) => {
        setCurrentUser(user);
        if (user.subscription) {
            subscriptionForm.setFieldsValue({
                package_id: user.subscription.package_id,
                billing_frequency: user.subscription.billing_frequency,
                status: user.subscription.status,
            });
        } else {
            subscriptionForm.resetFields();
        }
        setSubscriptionModalVisible(true);
    };

    const handleSubscriptionSubmit = async () => {
        try {
            const values = await subscriptionForm.validateFields();
            if (!currentUser) return;
            setIsLoading(true);

            const routeName = currentUser.subscription
                ? "admin.users.subscriptions.update"
                : "admin.users.subscriptions.create";

            router.post(route(routeName, currentUser.id), values, {
                onSuccess: () => {
                    messageApi.success(
                        currentUser.subscription
                            ? t("subscription_updated_success")
                            : t("subscription_created_success")
                    );
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(
                        currentUser.subscription
                            ? t("subscription_update_failed")
                            : t("subscription_create_failed")
                    );
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            });
        } catch (error) {
            messageApi.error(
                currentUser?.subscription
                    ? t("subscription_update_failed")
                    : t("subscription_create_failed")
            );
        }
    };

    const handleApproveSubscription = async () => {
        if (!currentUser?.subscription) return;
        setIsLoading(true);

        router.get(
            route("admin.users.subscriptions.approve", [
                currentUser.id,
                currentUser.subscription.id,
            ]),
            {},
            {
                onSuccess: () => {
                    messageApi.success(t("subscription_approved_success"));
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("subscription_approval_failed"));
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const handleApproveUsers = async (id: number) => {
        setIsLoading(true);

        router.get(
            route("admin.users.approve", [id]),
            {},
            {
                onSuccess: () => {
                    messageApi.success(t("user_approved_success"));
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("user_approval_failed"));
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const handleCancelSubscription = async () => {
        if (!currentUser?.subscription) return;
        setIsLoading(true);

        router.delete(
            route("admin.users.subscriptions.destroy", [
                currentUser.id,
                currentUser.subscription.id,
            ]),
            {
                onSuccess: () => {
                    messageApi.success(t("subscription_canceled_success"));
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("subscription_cancel_failed"));
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const getStatusTag = (status: UserStatus) => {
        const statusMap = {
            active: { color: "green", text: t("active") },
            inactive: { color: "red", text: t("inactive") },
            pending: { color: "orange", text: t("pending") },
        };
        return (
            <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
        );
    };

    const getRoleTag = (role: UserRole) => {
        const roleMap = {
            buyer: { color: "blue", text: t("buyer") },
            owner: { color: "purple", text: t("owner") },
            agent: { color: "cyan", text: t("agent") },
            company: { color: "geekblue", text: t("company") },
            admin: { color: "gold", text: t("admin") },
        };
        return <Tag color={roleMap[role].color}>{roleMap[role].text}</Tag>;
    };

    const getSubscriptionTag = (subscription?: Subscription) => {
        if (!subscription) {
            return <Tag color="default">{t("not_subscribed")}</Tag>;
        }

        const statusMap = {
            active: { color: "green", icon: <CheckOutlined /> },
            expired: { color: "red", icon: <CloseOutlined /> },
            canceled: { color: "orange", icon: <ClockCircleOutlined /> },
            pending: { color: "yellow", icon: <ClockCircleOutlined /> },
        };

        return (
            <Tag
                color={statusMap[subscription.status]?.color}
                icon={statusMap[subscription.status]?.icon}
            >
                {subscription.package_name} (
                {subscription.billing_frequency === "monthly"
                    ? t("monthly")
                    : t("yearly")}
                )
            </Tag>
        );
    };

    return (
        <div className="users-management" style={{ padding: "24px" }}>
            <Title level={2}>{t("users_management")}</Title>
            {contextHolder}

            <Card style={{ marginBottom: "24px" }}>
                <Row gutter={[16, 16]} justify="space-between">
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            style={{ background: "transparent" }}
                            placeholder={t("search_users_placeholder")}
                            prefix={<SearchOutlined />}
                            allowClear
                            defaultValue={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder={t("filter_by_role")}
                            style={{ width: "100%" }}
                            allowClear
                            value={filters.role}
                            onChange={(value) =>
                                handleFilterChange("role", value)
                            }
                        >
                            <Option value="buyer">{t("buyer")}</Option>
                            <Option value="owner">{t("owner")}</Option>
                            <Option value="agent">{t("agent")}</Option>
                            <Option value="company">{t("company")}</Option>
                            <Option value="admin">{t("admin")}</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder={t("filter_by_status")}
                            style={{ width: "100%" }}
                            allowClear
                            value={filters.status}
                            onChange={(value) =>
                                handleFilterChange("status", value)
                            }
                        >
                            <Option value="active">{t("active")}</Option>
                            <Option value="inactive">{t("inactive")}</Option>
                            <Option value="pending">{t("pending")}</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder={t("filter_by_subscription")}
                            style={{ width: "100%" }}
                            allowClear
                            value={filters.subscription_status}
                            onChange={(value) =>
                                handleFilterChange("subscription_status", value)
                            }
                        >
                            <Option value="active">
                                {t("active_subscription")}
                            </Option>
                            <Option value="expired">
                                {t("expired_subscription")}
                            </Option>
                            <Option value="canceled">
                                {t("canceled_subscription")}
                            </Option>
                            <Option value="pending">
                                {t("pending_subscription")}
                            </Option>
                            <Option value="none">{t("no_subscription")}</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Table
                dataSource={users}
                rowKey="id"
                loading={!users}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: true }}
            >
                <Column
                    title={t("user")}
                    dataIndex="name"
                    key="name"
                    render={(text, record: User) => (
                        <Space>
                            <Avatar
                                src={record.profile?.profile_image}
                                icon={<UserOutlined />}
                            />
                            <div>
                                <Text strong>{text}</Text>
                                <br />
                                <Text type="secondary">{record.email}</Text>
                            </div>
                        </Space>
                    )}
                />
                <Column
                    title={t("phone")}
                    dataIndex="phone"
                    key="phone"
                    render={(phone) => phone || "-"}
                />
                <Column
                    title={t("role")}
                    dataIndex="role"
                    key="role"
                    render={(role) => getRoleTag(role)}
                    filters={[
                        { text: t("buyer"), value: "buyer" },
                        { text: t("owner"), value: "owner" },
                        { text: t("agent"), value: "agent" },
                        { text: t("company"), value: "company" },
                        { text: t("admin"), value: "admin" },
                    ]}
                />
                <Column
                    title={t("status")}
                    dataIndex="status"
                    key="status"
                    render={(status, record: User) => getStatusTag(status)}
                    filters={[
                        { text: t("active"), value: "active" },
                        { text: t("inactive"), value: "inactive" },
                        { text: t("pending"), value: "pending" },
                    ]}
                />
                <Column
                    title={t("subscription")}
                    dataIndex="subscription"
                    key="subscription"
                    render={(subscription) => getSubscriptionTag(subscription)}
                />
                <Column
                    title={t("join_date")}
                    dataIndex="created_at"
                    key="created_at"
                    render={(date) => new Date(date).toLocaleDateString()}
                />
                <Column
                    title={t("actions")}
                    key="actions"
                    fixed="right"
                    render={(_, record: User) => (
                        <Space size="middle">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                            />

                            <Button
                                type="text"
                                icon={<SyncOutlined />}
                                onClick={() => handleManageSubscription(record)}
                            />
                            <Button
                                type="text"
                                icon={<UserOutlined />}
                                onClick={() => handleProfilePreview(record)}
                            />
                            {record.status === "active" ? (
                                <Popconfirm
                                    title={t("confirm_disable_user")}
                                    onConfirm={() =>
                                        handleStatusChange(
                                            record.id,
                                            "inactive"
                                        )
                                    }
                                    okText={t("yes")}
                                    cancelText={t("no")}
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<CloseOutlined />}
                                        disabled={
                                            record.role === "admin" &&
                                            record.id === user?.id
                                        }
                                    />
                                </Popconfirm>
                            ) : (
                                <Button
                                    type="text"
                                    icon={<CheckOutlined />}
                                    onClick={() =>
                                        handleStatusChange(record.id, "active")
                                    }
                                />
                            )}

                            <Popconfirm
                                title={t("confirm_delete_user")}
                                onConfirm={() => handleDelete(record.id)}
                                okText={t("yes")}
                                cancelText={t("no")}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={
                                        record.role === "admin" &&
                                        record.id === user?.id
                                    }
                                />
                            </Popconfirm>
                            {record.status == "pending" && (
                                <Popconfirm
                                    title={t("confirm_approve_user")}
                                    onConfirm={() =>
                                        handleApproveUsers(record.id)
                                    }
                                    okText={t("yes")}
                                    cancelText={t("no")}
                                >
                                    <Button
                                        type="text"
                                        variant="solid"
                                        icon={<CheckOutlined />}
                                        disabled={
                                            record.role === "admin" &&
                                            record.id === user?.id
                                        }
                                    />
                                </Popconfirm>
                            )}
                        </Space>
                    )}
                />
            </Table>

            {/* Profile Modal */}
            <Modal
                title={`${t("user_profile")} ${currentUser?.name}`}
                open={profileModalVisible}
                onCancel={() => setProfileModalVisible(false)}
                width={800}
                footer={[
                    <Button
                        key="back"
                        onClick={() => setProfileModalVisible(false)}
                    >
                        {t("close")}
                    </Button>,
                    activeProfileTab === "2" && (
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleEditSubmit}
                            loading={isLoading}
                        >
                            {t("save_changes")}
                        </Button>
                    ),
                ]}
            >
                <Tabs
                    activeKey={activeProfileTab}
                    onChange={(key) => setActiveProfileTab(key)}
                >
                    <TabPane tab={t("preview")} key="1">
                        {currentUser?.profile ? (
                            <div>
                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={8}>
                                        <div style={{ textAlign: "center" }}>
                                            <Image
                                                className="aspect-[1/1]"
                                                width={200}
                                                src={`${window.location.origin}/storage/${currentUser.profile.profile_image}`}
                                                fallback="https://via.placeholder.com/200"
                                                alt={t("profile_image")}
                                                style={{ borderRadius: "50%" }}
                                            />
                                            <Title
                                                level={4}
                                                style={{ marginTop: 8 }}
                                            >
                                                {currentUser.name}
                                            </Title>
                                        </div>
                                    </Col>
                                    <Col span={16}>
                                        <Descriptions bordered column={1}>
                                            <Descriptions.Item
                                                label={t("company_name")}
                                            >
                                                {currentUser.profile
                                                    .company_name ||
                                                    t("not_available")}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={t("email")}
                                            >
                                                {currentUser.email}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={t("phone")}
                                            >
                                                {currentUser.phone ||
                                                    t("not_available")}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={t("address")}
                                            >
                                                {currentUser.profile.address ||
                                                    t("not_available")}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={t("national_id")}
                                            >
                                                {currentUser.profile
                                                    .national_id ||
                                                    t("not_available")}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={t("tax_id")}
                                            >
                                                {currentUser.profile.tax_id ||
                                                    t("not_available")}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Col>
                                </Row>
                                <Card title={t("bio")}>
                                    <p>
                                        {currentUser.profile.bio ||
                                            t("no_bio_available")}
                                    </p>
                                </Card>
                                {currentUser.profile.id_photo && (
                                    <Card
                                        title={t("id_photo")}
                                        style={{ marginTop: 16 }}
                                    >
                                        <Image
                                            className="aspect-[1/1]"
                                            width={200}
                                            src={`${window.location.origin}/storage/${currentUser.profile.id_photo}`}
                                            alt={t("id_photo")}
                                        />
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <p>{t("no_profile_available")}</p>
                        )}
                    </TabPane>
                    <TabPane tab={t("edit")} key="2">
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={["profile", "company_name"]}
                                        label={t("company_name")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("company_name")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={["profile", "tax_id"]}
                                        label={t("tax_id")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("tax_id")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={["profile", "national_id"]}
                                        label={t("national_id")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("national_id")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={["profile", "address"]}
                                        label={t("address")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("address")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                name={["profile", "bio"]}
                                label={t("bio")}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder={t("bio")}
                                />
                            </Form.Item>
                            <Form.Item label={t("profile_image")}>
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    action={route(
                                        "admin.users.profile.upload",
                                        {
                                            user: currentUser?.id || "",
                                            type: "profile_image",
                                        }
                                    )}
                                    headers={{
                                        "X-CSRF-TOKEN":
                                            document
                                                .querySelector(
                                                    'meta[name="csrf-token"]'
                                                )
                                                ?.getAttribute("content") || "",
                                    }}
                                    onChange={(info) => {
                                        if (info.file.status === "done") {
                                            messageApi.success(
                                                t("image_upload_success")
                                            );
                                            router.reload({ only: ["users"] });
                                            setCurrentUser((us) => {
                                                if (!us) return null;
                                                return {
                                                    ...us,
                                                    profile: {
                                                        ...us.profile,
                                                        profile_image:
                                                            info.file.response
                                                                ?.path,
                                                    },
                                                };
                                            });
                                        } else if (
                                            info.file.status === "error"
                                        ) {
                                            messageApi.error(
                                                t("image_upload_failed")
                                            );
                                        }
                                    }}
                                >
                                    {currentUser?.profile?.profile_image ? (
                                        <Image
                                            className="aspect-[1/1]"
                                            src={`${window.location.origin}/storage/${currentUser.profile.profile_image}`}
                                            alt={t("profile_image")}
                                            width="100%"
                                            preview={false}
                                        />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>
                                                {t("upload_image")}
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                            <Form.Item label={t("id_photo")}>
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    action={route(
                                        "admin.users.profile.upload",
                                        {
                                            user: currentUser?.id || "",
                                            type: "id_photo",
                                        }
                                    )}
                                    headers={{
                                        "X-CSRF-TOKEN":
                                            document
                                                .querySelector(
                                                    'meta[name="csrf-token"]'
                                                )
                                                ?.getAttribute("content") || "",
                                    }}
                                    onChange={(info) => {
                                        if (info.file.status === "done") {
                                            messageApi.success(
                                                t("image_upload_success")
                                            );
                                            router.reload({ only: ["users"] });
                                            setCurrentUser((us) => {
                                                if (!us) return null;
                                                return {
                                                    ...us,
                                                    profile: {
                                                        ...us.profile,
                                                        id_photo:
                                                            info.file.response
                                                                ?.path,
                                                    },
                                                };
                                            });
                                        } else if (
                                            info.file.status === "error"
                                        ) {
                                            messageApi.error(
                                                t("image_upload_failed")
                                            );
                                        }
                                    }}
                                >
                                    {currentUser?.profile?.id_photo ? (
                                        <Image
                                            className="aspect-[1/1]"
                                            src={`${window.location.origin}/storage/${currentUser.profile.id_photo}`}
                                            alt={t("id_photo")}
                                            width="100%"
                                            preview={false}
                                        />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>
                                                {t("upload_image")}
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                title={t("edit_user")}
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleEditSubmit}
                confirmLoading={isLoading}
                width={700}
                okText={t("save")}
                cancelText={t("cancel")}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label={t("name")}
                                rules={[
                                    {
                                        required: true,
                                        message: t("name_required"),
                                    },
                                ]}
                            >
                                <Input
                                    style={{ background: "transparent" }}
                                    placeholder={t("name")}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="email"
                                label={t("email")}
                                rules={[
                                    {
                                        required: true,
                                        message: t("email_required"),
                                    },
                                    {
                                        type: "email",
                                        message: t("valid_email_required"),
                                    },
                                ]}
                            >
                                <Input
                                    style={{ background: "transparent" }}
                                    placeholder={t("email")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="phone" label={t("phone")}>
                                <Input
                                    style={{ background: "transparent" }}
                                    placeholder={t("phone")}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="role"
                                label={t("role")}
                                rules={[
                                    {
                                        required: true,
                                        message: t("role_required"),
                                    },
                                ]}
                            >
                                <Select placeholder={t("select_role")}>
                                    <Option value="buyer">{t("buyer")}</Option>
                                    <Option value="owner">{t("owner")}</Option>
                                    <Option value="agent">{t("agent")}</Option>
                                    <Option value="company">
                                        {t("company")}
                                    </Option>
                                    {currentUser?.role === "admin" && (
                                        <Option value="admin">
                                            {t("admin")}
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="status"
                        label={t("status")}
                        rules={[
                            {
                                required: true,
                                message: t("status_required"),
                            },
                        ]}
                    >
                        <Select placeholder={t("select_status")}>
                            <Option value="active">{t("active")}</Option>
                            <Option value="inactive">{t("inactive")}</Option>
                            <Option value="pending">{t("pending")}</Option>
                        </Select>
                    </Form.Item>

                    {currentUser?.profile && (
                        <>
                            <Divider orientation="left">
                                {t("profile_info")}
                            </Divider>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name={["profile", "company_name"]}
                                        label={t("company_name")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("company_name")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                name={["profile", "bio"]}
                                label={t("bio")}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder={t("bio")}
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>

            {/* Manage Subscription Modal */}
            <Modal
                title={`${t("manage_subscription")} ${currentUser?.name}`}
                open={subscriptionModalVisible}
                onCancel={() => setSubscriptionModalVisible(false)}
                onOk={handleSubscriptionSubmit}
                confirmLoading={isLoading}
                width={700}
                okText={currentUser?.subscription ? t("update") : t("create")}
                cancelText={t("cancel")}
                footer={[
                    currentUser?.subscription && (
                        <>
                            {currentUser.subscription.status == "pending" && (
                                <Button
                                    key="approve-subscription"
                                    onClick={handleApproveSubscription}
                                    loading={isLoading}
                                >
                                    {t("approve_subscription")}
                                </Button>
                            )}
                            <Button
                                key="cancel-subscription"
                                danger
                                onClick={handleCancelSubscription}
                                loading={isLoading}
                            >
                                {t("cancel_subscription")}
                            </Button>
                        </>
                    ),
                    <Button
                        key="back"
                        onClick={() => setSubscriptionModalVisible(false)}
                    >
                        {t("cancel")}
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleSubscriptionSubmit}
                        loading={isLoading}
                    >
                        {currentUser?.subscription ? t("update") : t("create")}
                    </Button>,
                ]}
            >
                {currentUser?.subscription && (
                    <Descriptions
                        bordered
                        column={1}
                        style={{ marginBottom: 24 }}
                    >
                        <Descriptions.Item label={t("current_package")}>
                            {currentUser.subscription.package_name}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("subscription_status")}>
                            {getSubscriptionTag(currentUser.subscription)}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("start_date")}>
                            {new Date(
                                currentUser.subscription.starts_at
                            ).toLocaleDateString()}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("end_date")}>
                            {new Date(
                                currentUser.subscription.expires_at
                            ).toLocaleDateString()}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("subscription_price")}>
                            ${currentUser.subscription.price}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("billing_cycle")}>
                            {currentUser.subscription.billing_frequency ===
                            "monthly"
                                ? t("monthly")
                                : t("yearly")}
                        </Descriptions.Item>
                    </Descriptions>
                )}

                <Form form={subscriptionForm} layout="vertical">
                    <Form.Item
                        name="package_id"
                        label={t("package")}
                        rules={[
                            {
                                required: true,
                                message: t("package_required"),
                            },
                        ]}
                    >
                        <Select placeholder={t("select_package")}>
                            {packages
                                .filter((pkg) => {
                                    if (currentUser?.role === "owner")
                                        return pkg.user_type === "owner";
                                    if (currentUser?.role === "agent")
                                        return pkg.user_type === "agent";
                                    if (currentUser?.role === "company")
                                        return pkg.user_type === "company";
                                    return false;
                                })
                                .map((pkg) => (
                                    <Option key={pkg.id} value={pkg.id}>
                                        {pkg.name} (${pkg.price}/{t("monthly")}{" "}
                                        - ${pkg.yearly_price}/{t("yearly")})
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="billing_frequency"
                        label={t("billing_cycle")}
                        rules={[
                            {
                                required: true,
                                message: t("billing_cycle_required"),
                            },
                        ]}
                    >
                        <Radio.Group>
                            <Radio value="monthly">{t("monthly")}</Radio>
                            <Radio value="yearly">{t("yearly")}</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {currentUser?.subscription && (
                        <Form.Item name="status" label={t("status")}>
                            <Select placeholder={t("select_status")}>
                                <Option value="active">{t("active")}</Option>
                                <Option value="expired">{t("expired")}</Option>
                                <Option value="canceled">
                                    {t("canceled")}
                                </Option>
                                <Option value="pending">{t("pending")}</Option>
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default UsersManagement;
