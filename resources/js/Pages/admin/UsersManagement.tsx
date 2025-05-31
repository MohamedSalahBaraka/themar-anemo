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
const UsersManagement: React.FC = () => {
    const { props } = usePage<pagedata>();
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
                    messageApi.success(`تم تحديث حالة المستخدم إلى ${status}`);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("فشل تحديث حالة المستخدم");
                },
            }
        );
    };

    const handleDelete = async (userId: number) => {
        router.delete(route("admin.users.destroy", userId), {
            onSuccess: () => {
                messageApi.success("تم حذف المستخدم بنجاح");
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error("فشل حذف المستخدم");
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
            console.log(values);

            router.put(route("admin.users.update", currentUser.id), values, {
                onSuccess: () => {
                    messageApi.success("تم تحديث المستخدم بنجاح");
                    setProfileModalVisible(false);
                    setEditModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("فشل تحديث المستخدم");
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            });
        } catch (error) {
            message.error("فشل تحديث المستخدم");
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
                            ? "تم تحديث الاشتراك بنجاح"
                            : "تم إنشاء الاشتراك بنجاح"
                    );
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(
                        currentUser.subscription
                            ? "فشل تحديث الاشتراك"
                            : "فشل إنشاء الاشتراك"
                    );
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            });
        } catch (error) {
            console.log(error);

            message.error(
                currentUser?.subscription
                    ? "فشل تحديث الاشتراك"
                    : "فشل إنشاء الاشتراك"
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
                    messageApi.success("تم الموافقة على الاشتراك");
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("فشل موافقة الاشتراك");
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
                    messageApi.success("تم الموافقة على الاشتراك");
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("فشل موافقة الاشتراك");
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
                    messageApi.success("تم إلغاء الاشتراك بنجاح");
                    setSubscriptionModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("فشل إلغاء الاشتراك");
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const getStatusTag = (status: UserStatus) => {
        const statusMap = {
            active: { color: "green", text: "نشط" },
            inactive: { color: "red", text: "غير نشط" },
            pending: { color: "orange", text: "قيد الانتظار" },
        };
        return (
            <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
        );
    };

    const getRoleTag = (role: UserRole) => {
        const roleMap = {
            buyer: { color: "blue", text: "مشتري" },
            owner: { color: "purple", text: "مالك" },
            agent: { color: "cyan", text: "وسيط" },
            company: { color: "geekblue", text: "شركة" },
            admin: { color: "gold", text: "مدير" },
        };
        return <Tag color={roleMap[role].color}>{roleMap[role].text}</Tag>;
    };

    const getSubscriptionTag = (subscription?: Subscription) => {
        if (!subscription) {
            return <Tag color="default">غير مشترك</Tag>;
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
                {subscription.billing_frequency === "monthly" ? "شهري" : "سنوي"}
                )
            </Tag>
        );
    };

    return (
        <AdminLayout>
            <div className="users-management" style={{ padding: "24px" }}>
                <Title level={2}>إدارة المستخدمين</Title>
                {contextHolder}

                <Card style={{ marginBottom: "24px" }}>
                    <Row gutter={[16, 16]} justify="space-between">
                        <Col xs={24} sm={12} md={6}>
                            <Input
                                style={{
                                    background: "transparent",
                                }}
                                placeholder="ابحث عن مستخدمين..."
                                prefix={<SearchOutlined />}
                                allowClear
                                defaultValue={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="تصفية حسب الدور"
                                style={{ width: "100%" }}
                                allowClear
                                value={filters.role}
                                onChange={(value) =>
                                    handleFilterChange("role", value)
                                }
                            >
                                <Option value="buyer">مشتري</Option>
                                <Option value="owner">مالك</Option>
                                <Option value="agent">وسيط</Option>
                                <Option value="company">شركة</Option>
                                <Option value="admin">مدير</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="تصفية حسب الحالة"
                                style={{ width: "100%" }}
                                allowClear
                                value={filters.status}
                                onChange={(value) =>
                                    handleFilterChange("status", value)
                                }
                            >
                                <Option value="active">نشط</Option>
                                <Option value="inactive">غير نشط</Option>
                                <Option value="pending">قيد الانتظار</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="تصفية حسب الاشتراك"
                                style={{ width: "100%" }}
                                allowClear
                                value={filters.subscription_status}
                                onChange={(value) =>
                                    handleFilterChange(
                                        "subscription_status",
                                        value
                                    )
                                }
                            >
                                <Option value="active">مشترك نشط</Option>
                                <Option value="expired">اشتراك منتهي</Option>
                                <Option value="canceled">اشتراك ملغي</Option>
                                <Option value="pending">قيد الانتظار</Option>
                                <Option value="none">غير مشترك</Option>
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
                        title="المستخدم"
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
                        title="الهاتف"
                        dataIndex="phone"
                        key="phone"
                        render={(phone) => phone || "-"}
                    />
                    <Column
                        title="الدور"
                        dataIndex="role"
                        key="role"
                        render={(role) => getRoleTag(role)}
                        filters={[
                            { text: "مشتري", value: "buyer" },
                            { text: "مالك", value: "owner" },
                            { text: "وسيط", value: "agent" },
                            { text: "شركة", value: "company" },
                            { text: "مدير", value: "admin" },
                        ]}
                    />
                    <Column
                        title="الحالة"
                        dataIndex="status"
                        key="status"
                        render={(status, record: User) => getStatusTag(status)}
                        filters={[
                            { text: "نشط", value: "active" },
                            { text: "غير نشط", value: "inactive" },
                            { text: "قيد الانتظار", value: "pending" },
                        ]}
                    />
                    <Column
                        title="الاشتراك"
                        dataIndex="subscription"
                        key="subscription"
                        render={(subscription) =>
                            getSubscriptionTag(subscription)
                        }
                    />
                    <Column
                        title="تاريخ الانضمام"
                        dataIndex="created_at"
                        key="created_at"
                        render={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Column
                        title="الإجراءات"
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
                                    onClick={() =>
                                        handleManageSubscription(record)
                                    }
                                />
                                <Button
                                    type="text"
                                    icon={<UserOutlined />}
                                    onClick={() => handleProfilePreview(record)}
                                />
                                {record.status === "active" ? (
                                    <Popconfirm
                                        title="هل أنت متأكد من تعطيل هذا المستخدم؟"
                                        onConfirm={() =>
                                            handleStatusChange(
                                                record.id,
                                                "inactive"
                                            )
                                        }
                                        okText="نعم"
                                        cancelText="لا"
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
                                            handleStatusChange(
                                                record.id,
                                                "active"
                                            )
                                        }
                                    />
                                )}

                                <Popconfirm
                                    title="هل أنت متأكد من حذف هذا المستخدم؟"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="نعم"
                                    cancelText="لا"
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
                                        title="هل أنت متأكد من الموافقة على المشترك؟"
                                        onConfirm={() =>
                                            handleApproveUsers(record.id)
                                        }
                                        okText="نعم"
                                        cancelText="لا"
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
                <Modal
                    title={`ملف ${currentUser?.name} الشخصي`}
                    open={profileModalVisible}
                    onCancel={() => setProfileModalVisible(false)}
                    width={800}
                    footer={[
                        <Button
                            key="back"
                            onClick={() => setProfileModalVisible(false)}
                        >
                            إغلاق
                        </Button>,
                        activeProfileTab === "2" && (
                            <Button
                                key="submit"
                                type="primary"
                                onClick={handleEditSubmit}
                                loading={isLoading}
                            >
                                حفظ التغييرات
                            </Button>
                        ),
                    ]}
                >
                    <Tabs
                        activeKey={activeProfileTab}
                        onChange={(key) => setActiveProfileTab(key)}
                    >
                        <TabPane tab="معاينة" key="1">
                            {currentUser?.profile ? (
                                <div>
                                    <Row
                                        gutter={16}
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Col span={8}>
                                            <div
                                                style={{ textAlign: "center" }}
                                            >
                                                <Image
                                                    className="aspect-[1/1]"
                                                    width={200}
                                                    src={`${window.location.origin}/storage/${currentUser.profile.profile_image}`}
                                                    fallback="https://via.placeholder.com/200"
                                                    alt="صورة الملف الشخصي"
                                                    style={{
                                                        borderRadius: "50%",
                                                    }}
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
                                                <Descriptions.Item label="اسم الشركة">
                                                    {currentUser.profile
                                                        .company_name ||
                                                        "غير متوفر"}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="البريد الإلكتروني">
                                                    {currentUser.email}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="الهاتف">
                                                    {currentUser.phone ||
                                                        "غير متوفر"}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="العنوان">
                                                    {currentUser.profile
                                                        .address || "غير متوفر"}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="رقم الهوية">
                                                    {currentUser.profile
                                                        .national_id ||
                                                        "غير متوفر"}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="رقم الضريبة">
                                                    {currentUser.profile
                                                        .tax_id || "غير متوفر"}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Col>
                                    </Row>
                                    <Card title="السيرة الذاتية">
                                        <p>
                                            {currentUser.profile.bio ||
                                                "لا توجد سيرة ذاتية"}
                                        </p>
                                    </Card>
                                    {currentUser.profile.id_photo && (
                                        <Card
                                            title="صورة الهوية"
                                            style={{ marginTop: 16 }}
                                        >
                                            <Image
                                                className="aspect-[1/1]"
                                                width={200}
                                                src={`${window.location.origin}/storage/${currentUser.profile.id_photo}`}
                                                alt="صورة الهوية"
                                            />
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <p>لا يوجد ملف شخصي لهذا المستخدم</p>
                            )}
                        </TabPane>
                        <TabPane tab="تعديل" key="2">
                            <Form form={form} layout="vertical">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name={["profile", "company_name"]}
                                            label="اسم الشركة"
                                        >
                                            <Input
                                                style={{
                                                    background: "transparent",
                                                }}
                                                placeholder="اسم الشركة"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={["profile", "tax_id"]}
                                            label="رقم الضريبة"
                                        >
                                            <Input
                                                style={{
                                                    background: "transparent",
                                                }}
                                                placeholder="رقم الضريبة"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name={["profile", "national_id"]}
                                            label="رقم الهوية"
                                        >
                                            <Input
                                                style={{
                                                    background: "transparent",
                                                }}
                                                placeholder="رقم الهوية"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={["profile", "address"]}
                                            label="العنوان"
                                        >
                                            <Input
                                                style={{
                                                    background: "transparent",
                                                }}
                                                placeholder="العنوان"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    name={["profile", "bio"]}
                                    label="السيرة الذاتية"
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="السيرة الذاتية"
                                    />
                                </Form.Item>
                                <Form.Item label="صورة الملف الشخصي">
                                    <Upload
                                        listType="picture-card"
                                        showUploadList={false}
                                        action={route(
                                            "admin.users.profile.upload",
                                            {
                                                user: currentUser?.id || "", // ✅ correct param name
                                                type: "profile_image",
                                            }
                                        )}
                                        headers={{
                                            "X-CSRF-TOKEN":
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]'
                                                    )
                                                    ?.getAttribute("content") ||
                                                "",
                                        }}
                                        onChange={(info) => {
                                            if (info.file.status === "done") {
                                                message.success(
                                                    "تم رفع الصورة بنجاح"
                                                );
                                                // Refresh user data or update the profile image in the UI

                                                router.reload({
                                                    only: ["users"],
                                                }); // Only reload specific props if needed
                                                setCurrentUser((us) => {
                                                    if (!us) return null;
                                                    return {
                                                        ...us,
                                                        profile: {
                                                            ...us.profile,
                                                            profile_image:
                                                                info.file
                                                                    .response
                                                                    ?.path,
                                                        },
                                                    };
                                                });
                                            } else if (
                                                info.file.status === "error"
                                            ) {
                                                message.error("فشل رفع الصورة");
                                            }
                                        }}
                                    >
                                        {currentUser?.profile?.profile_image ? (
                                            <Image
                                                className="aspect-[1/1]"
                                                src={`${window.location.origin}/storage/${currentUser.profile.profile_image}`}
                                                alt="صورة الملف الشخصي"
                                                width="100%"
                                                preview={false}
                                            />
                                        ) : (
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>
                                                    رفع صورة
                                                </div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                                <Form.Item label="صورة الهوية">
                                    <Upload
                                        listType="picture-card"
                                        showUploadList={false}
                                        action={route(
                                            "admin.users.profile.upload",
                                            {
                                                user: currentUser?.id || "", // ✅ correct param name
                                                type: "id_photo",
                                            }
                                        )}
                                        headers={{
                                            "X-CSRF-TOKEN":
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]'
                                                    )
                                                    ?.getAttribute("content") ||
                                                "",
                                        }}
                                        onChange={(info) => {
                                            if (info.file.status === "done") {
                                                message.success(
                                                    "تم رفع الصورة بنجاح"
                                                );
                                                // Refresh user data or update the profile image in the UI

                                                router.reload({
                                                    only: ["users"],
                                                }); // Only reload specific props if needed
                                                setCurrentUser((us) => {
                                                    if (!us) return null;
                                                    return {
                                                        ...us,
                                                        profile: {
                                                            ...us.profile,
                                                            id_photo:
                                                                info.file
                                                                    .response
                                                                    ?.path,
                                                        },
                                                    };
                                                });
                                            } else if (
                                                info.file.status === "error"
                                            ) {
                                                message.error("فشل رفع الصورة");
                                            }
                                        }}
                                    >
                                        {currentUser?.profile?.id_photo ? (
                                            <Image
                                                className="aspect-[1/1]"
                                                src={`${window.location.origin}/storage/${currentUser.profile.id_photo}`}
                                                alt="صورة الملف الشخصي"
                                                width="100%"
                                                preview={false}
                                            />
                                        ) : (
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>
                                                    رفع صورة
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
                    title="تعديل المستخدم"
                    open={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onOk={handleEditSubmit}
                    confirmLoading={isLoading}
                    width={700}
                    okText="حفظ"
                    cancelText="إلغاء"
                >
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name"
                                    label="الاسم"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "الرجاء إدخال اسم المستخدم!",
                                        },
                                    ]}
                                >
                                    <Input
                                        style={{
                                            background: "transparent",
                                        }}
                                        placeholder="الاسم"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="email"
                                    label="البريد الإلكتروني"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "الرجاء إدخال البريد الإلكتروني!",
                                        },
                                        {
                                            type: "email",
                                            message:
                                                "الرجاء إدخال بريد إلكتروني صحيح!",
                                        },
                                    ]}
                                >
                                    <Input
                                        style={{
                                            background: "transparent",
                                        }}
                                        placeholder="البريد الإلكتروني"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="phone" label="الهاتف">
                                    <Input
                                        style={{
                                            background: "transparent",
                                        }}
                                        placeholder="الهاتف"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="role"
                                    label="الدور"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "الرجاء تحديد دور المستخدم!",
                                        },
                                    ]}
                                >
                                    <Select placeholder="اختر الدور">
                                        <Option value="buyer">مشتري</Option>
                                        <Option value="owner">مالك</Option>
                                        <Option value="agent">وسيط</Option>
                                        <Option value="company">شركة</Option>
                                        {currentUser?.role === "admin" && (
                                            <Option value="admin">مدير</Option>
                                        )}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="status"
                            label="الحالة"
                            rules={[
                                {
                                    required: true,
                                    message: "الرجاء تحديد حالة المستخدم!",
                                },
                            ]}
                        >
                            <Select placeholder="اختر الحالة">
                                <Option value="active">نشط</Option>
                                <Option value="inactive">غير نشط</Option>
                                <Option value="pending">قيد الانتظار</Option>
                            </Select>
                        </Form.Item>

                        {currentUser?.profile && (
                            <>
                                <Divider orientation="left">
                                    معلومات الملف الشخصي
                                </Divider>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name={["profile", "company_name"]}
                                            label="اسم الشركة"
                                        >
                                            <Input
                                                style={{
                                                    background: "transparent",
                                                }}
                                                placeholder="اسم الشركة"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    name={["profile", "bio"]}
                                    label="السيرة الذاتية"
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="السيرة الذاتية"
                                    />
                                </Form.Item>
                            </>
                        )}
                    </Form>
                </Modal>

                {/* Manage Subscription Modal */}
                <Modal
                    title={`إدارة اشتراك ${currentUser?.name}`}
                    open={subscriptionModalVisible}
                    onCancel={() => setSubscriptionModalVisible(false)}
                    onOk={handleSubscriptionSubmit}
                    confirmLoading={isLoading}
                    width={700}
                    okText={currentUser?.subscription ? "تحديث" : "إنشاء"}
                    cancelText="إلغاء"
                    footer={[
                        currentUser?.subscription && (
                            <>
                                {currentUser.subscription.status ==
                                    "pending" && (
                                    <Button
                                        key="approve-subscription"
                                        onClick={handleApproveSubscription}
                                        loading={isLoading}
                                    >
                                        موافقة على الاشتراك
                                    </Button>
                                )}
                                <Button
                                    key="cancel-subscription"
                                    danger
                                    onClick={handleCancelSubscription}
                                    loading={isLoading}
                                >
                                    إلغاء الاشتراك
                                </Button>
                            </>
                        ),
                        <Button
                            key="back"
                            onClick={() => setSubscriptionModalVisible(false)}
                        >
                            إلغاء
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleSubscriptionSubmit}
                            loading={isLoading}
                        >
                            {currentUser?.subscription ? "تحديث" : "إنشاء"}
                        </Button>,
                    ]}
                >
                    {currentUser?.subscription && (
                        <Descriptions
                            bordered
                            column={1}
                            style={{ marginBottom: 24 }}
                        >
                            <Descriptions.Item label="الباقة الحالية">
                                {currentUser.subscription.package_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="حالة الاشتراك">
                                {getSubscriptionTag(currentUser.subscription)}
                            </Descriptions.Item>
                            <Descriptions.Item label="تاريخ البدء">
                                {new Date(
                                    currentUser.subscription.starts_at
                                ).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="تاريخ الانتهاء">
                                {new Date(
                                    currentUser.subscription.expires_at
                                ).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="سعر الاشتراك">
                                ${currentUser.subscription.price}
                            </Descriptions.Item>
                            <Descriptions.Item label="دورة الفوترة">
                                {currentUser.subscription.billing_frequency ===
                                "monthly"
                                    ? "شهري"
                                    : "سنوي"}
                            </Descriptions.Item>
                        </Descriptions>
                    )}

                    <Form form={subscriptionForm} layout="vertical">
                        <Form.Item
                            name="package_id"
                            label="الباقة"
                            rules={[
                                {
                                    required: true,
                                    message: "الرجاء اختيار الباقة!",
                                },
                            ]}
                        >
                            <Select placeholder="اختر الباقة">
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
                                            {pkg.name} (${pkg.price}
                                            /شهري - ${pkg.yearly_price}/سنوي)
                                        </Option>
                                    ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="billing_frequency"
                            label="دورة الفوترة"
                            rules={[
                                {
                                    required: true,
                                    message: "الرجاء اختيار دورة الفوترة!",
                                },
                            ]}
                        >
                            <Radio.Group>
                                <Radio value="monthly">شهري</Radio>
                                <Radio value="yearly">سنوي</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {currentUser?.subscription && (
                            <Form.Item name="status" label="حالة الاشتراك">
                                <Select placeholder="اختر الحالة">
                                    <Option value="active">نشط</Option>
                                    <Option value="expired">منتهي</Option>
                                    <Option value="canceled">ملغي</Option>
                                    <Option value="pending">
                                        قيد الانتظار
                                    </Option>
                                </Select>
                            </Form.Item>
                        )}
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default UsersManagement;
