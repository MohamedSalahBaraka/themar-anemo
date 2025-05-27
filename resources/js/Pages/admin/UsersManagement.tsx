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
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    UserOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { usePage, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import { User, UserRole, UserStatus } from "@/types/user";
import AdminLayout from "@/Layouts/AdminLayout";

interface pagedata extends PageProps {
    users: User[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
    filters: {
        role?: UserRole;
        status?: UserStatus;
        search?: string;
    };
}

const { Title, Text } = Typography;
const { Option } = Select;
const { Column } = Table;

const UsersManagement: React.FC = () => {
    const { props } = usePage<pagedata>();
    const [messageApi, contextHolder] = message.useMessage();
    const { users, pagination, filters: initialFilters } = props;
    const [filters, setFilters] = React.useState(initialFilters);
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [isLoading, setisLoading] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [form] = Form.useForm();
    const user = usePage().props.auth.user;

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
                    // Optionally, you can refresh the page or filter
                    messageApi.success(`User status updated to ${status}`);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("Failed to update user status");
                },
            }
        );
    };

    const handleDelete = async (userId: number) => {
        router.delete(route("admin.users.destroy", userId), {
            onSuccess: () => {
                // Optionally, you can refresh the page or filter
                messageApi.success("User deleted successfully");
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error("Failed to delete User");
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
            setisLoading(true);
            console.log(values);

            router.put(route("admin.users.update", currentUser.id), values, {
                onSuccess: () => {
                    messageApi.success("User updated successfully");
                    // router.visit(route("user.properties.index"));
                    setEditModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("Failed to update User");
                },
                onFinish: () => {
                    setisLoading(false);
                },
            });
        } catch (error) {
            message.error("Failed to update user");
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

    const getStatusTag = (status: UserStatus) => {
        const statusMap = {
            active: { color: "green", text: "Active" },
            inactive: { color: "red", text: "Inactive" },
            pending: { color: "orange", text: "Pending" },
        };
        return (
            <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
        );
    };

    const getRoleTag = (role: UserRole) => {
        const roleMap = {
            buyer: { color: "blue", text: "Buyer" },
            owner: { color: "purple", text: "Owner" },
            agent: { color: "cyan", text: "Agent" },
            company: { color: "geekblue", text: "Company" },
            admin: { color: "gold", text: "Admin" },
        };
        return <Tag color={roleMap[role].color}>{roleMap[role].text}</Tag>;
    };

    return (
        <AdminLayout>
            <div className="users-management" style={{ padding: "24px" }}>
                <Title level={2}>Users Management</Title>
                {contextHolder}

                <Card style={{ marginBottom: "24px" }}>
                    <Row gutter={[16, 16]} justify="space-between">
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                placeholder="Search users..."
                                prefix={<SearchOutlined />}
                                allowClear
                                defaultValue={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Filter by role"
                                style={{ width: "100%" }}
                                allowClear
                                value={filters.role}
                                onChange={(value) =>
                                    handleFilterChange("role", value)
                                }
                            >
                                <Option value="buyer">Buyer</Option>
                                <Option value="owner">Owner</Option>
                                <Option value="agent">Agent</Option>
                                <Option value="company">Company</Option>
                                <Option value="admin">Admin</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Filter by status"
                                style={{ width: "100%" }}
                                allowClear
                                value={filters.status}
                                onChange={(value) =>
                                    handleFilterChange("status", value)
                                }
                            >
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                                <Option value="pending">Pending</Option>
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
                        title="User"
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
                        title="Phone"
                        dataIndex="phone"
                        key="phone"
                        render={(phone) => phone || "-"}
                    />
                    <Column
                        title="Role"
                        dataIndex="role"
                        key="role"
                        render={(role) => getRoleTag(role)}
                        filters={[
                            { text: "Buyer", value: "buyer" },
                            { text: "Owner", value: "owner" },
                            { text: "Agent", value: "agent" },
                            { text: "Company", value: "company" },
                            { text: "Admin", value: "admin" },
                        ]}
                    />
                    <Column
                        title="Status"
                        dataIndex="status"
                        key="status"
                        render={(status, record: User) => getStatusTag(status)}
                        filters={[
                            { text: "Active", value: "active" },
                            { text: "Inactive", value: "inactive" },
                            { text: "Pending", value: "pending" },
                        ]}
                    />
                    <Column
                        title="Joined"
                        dataIndex="created_at"
                        key="created_at"
                        render={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Column
                        title="Actions"
                        key="actions"
                        fixed="right"
                        render={(_, record: User) => (
                            <Space size="middle">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(record)}
                                />

                                {record.status === "active" ? (
                                    <Popconfirm
                                        title="Are you sure to deactivate this user?"
                                        onConfirm={() =>
                                            handleStatusChange(
                                                record.id,
                                                "inactive"
                                            )
                                        }
                                        okText="Yes"
                                        cancelText="No"
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
                                    title="Are you sure to delete this user?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Yes"
                                    cancelText="No"
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
                            </Space>
                        )}
                    />
                </Table>

                {/* Edit User Modal */}
                <Modal
                    title="Edit User"
                    visible={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onOk={handleEditSubmit}
                    confirmLoading={isLoading}
                    width={700}
                >
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name"
                                    label="Name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input user name!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input user email!",
                                        },
                                        {
                                            type: "email",
                                            message:
                                                "Please enter a valid email!",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Email" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="phone" label="Phone">
                                    <Input placeholder="Phone" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="role"
                                    label="Role"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select user role!",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Select role">
                                        <Option value="buyer">Buyer</Option>
                                        <Option value="owner">Owner</Option>
                                        <Option value="agent">Agent</Option>
                                        <Option value="company">Company</Option>
                                        {currentUser?.role === "admin" && (
                                            <Option value="admin">Admin</Option>
                                        )}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select user status!",
                                },
                            ]}
                        >
                            <Select placeholder="Select status">
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                                <Option value="pending">Pending</Option>
                            </Select>
                        </Form.Item>

                        {currentUser?.profile && (
                            <>
                                <Divider orientation="left">
                                    Profile Information
                                </Divider>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name={["profile", "company_name"]}
                                            label="Company Name"
                                        >
                                            <Input placeholder="Company Name" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    name={["profile", "bio"]}
                                    label="Bio"
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="Bio"
                                    />
                                </Form.Item>
                            </>
                        )}
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default UsersManagement;
