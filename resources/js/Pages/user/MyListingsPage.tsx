// src/pages/user/MyListingsPage.tsx
import React from "react";
import { usePage, router } from "@inertiajs/react";
import {
    Table,
    Card,
    Typography,
    Button,
    Space,
    Tag,
    Popconfirm,
    Dropdown,
    Row,
    Col,
    Input,
    Select,
    Divider,
    Badge,
    Modal,
    Radio,
    Menu,
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    EllipsisOutlined,
    PlusOutlined,
    EyeOutlined,
    SyncOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { PageProps } from "@/types";
import PropertyCard from "@/Components/PropertyCard";
import PropertyForm from "@/Components/PropertyForm";
import AppLayout from "@/Layouts/Layout";
import { Property } from "@/types/property";

const { Title, Text } = Typography;
const { Option } = Select;

interface MyListingsPageProps extends PageProps {
    properties: any[];
    filters: {
        status: string;
        search: string;
    };
}

const MyListingsPage: React.FC = () => {
    const [messageApi, contexHolder] = message.useMessage();
    const { props } = usePage<MyListingsPageProps>();
    const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
    const [searchText, setSearchText] = React.useState<string>(
        props.filters.search || ""
    );
    const [statusFilter, setStatusFilter] = React.useState<string>(
        props.filters.status || "all"
    );
    const [editModalVisible, setEditModalVisible] =
        React.useState<boolean>(false);
    const [currentProperty, setCurrentProperty] = React.useState<any>(null);
    const [createModalVisible, setCreateModalVisible] =
        React.useState<boolean>(false);
    // Add this function
    const handleCreateSubmit = async (values: any) => {
        const formData = new FormData();

        Object.entries(values).forEach(([key, val]) => {
            if (key === "images" && Array.isArray(val)) {
                val.forEach((fileWrapper: any) => {
                    if (fileWrapper.originFileObj instanceof File) {
                        formData.append("images[]", fileWrapper.originFileObj);
                    }
                });
            } else if (val !== null && val !== undefined) {
                // @ts-ignore
                formData.append(key, val);
            }
        });

        router.post(route("user.properties.store"), formData, {
            forceFormData: true,
            onSuccess: () => {
                messageApi.success("Property created successfully");
                setCreateModalVisible(false);
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error("Failed to create property");
            },
        });
    };

    const filterProperties = () => {
        router.get(
            route("user.properties.index"),
            {
                status: statusFilter,
                search: searchText,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = async (id: number) => {
        router.delete(route("user.properties.destroy", id), {
            onSuccess: () => {
                // Optionally, you can refresh the page or filter
                messageApi.success("Property deleted successfully");
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error("Failed to delete property");
            },
        });
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        router.put(
            route("user.properties.update.status", id),
            {
                status: newStatus,
            },
            {
                onSuccess: () => {
                    // Optionally, you can refresh the page or filter
                    messageApi.success("Status updated successfully");
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("Failed to update property status");
                },
            }
        );
    };

    const handleEdit = (property: any) => {
        console.log("Editing property:", property);

        const fileList =
            property.images?.map((img: any, index: number) => ({
                uid: img.id,
                name: img.image_url.split("/").pop(), // just the filename
                status: "done",
                url: `${window.location.origin}/storage/${img.image_url}`, // actual preview URL
            })) || [];

        setCurrentProperty({
            ...property,
            images: fileList,
        });

        setEditModalVisible(true);
    };

    const handleEditSubmit = async (values: any) => {
        if (!currentProperty) return;

        const formData = new FormData();

        // Append regular fields
        Object.entries(values).forEach(([key, val]) => {
            if (key === "images" && Array.isArray(val)) {
                val.forEach((fileWrapper: any) => {
                    if (fileWrapper.originFileObj instanceof File) {
                        formData.append("images[]", fileWrapper.originFileObj);
                    }
                });
            } else if (key === "deletedImages" && Array.isArray(val)) {
                val.forEach((id: number) => {
                    formData.append("deleted_images[]", id.toString());
                });
            } else if (val !== null && val !== undefined) {
                // @ts-ignore
                formData.append(key, val);
            }
        });
        formData.append("_method", "PUT");

        router.post(
            route("user.properties.update", currentProperty.id),
            formData,
            {
                forceFormData: true,
                onSuccess: () => {
                    messageApi.success("Property updated successfully");
                    setEditModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("Failed to update property");
                },
            }
        );
    };

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            available: { color: "green", text: "Available" },
            sold: { color: "red", text: "Sold" },
            rented: { color: "blue", text: "Rented" },
            reserved: { color: "orange", text: "Reserved" },
        };
        return (
            <Tag color={statusMap[status]?.color || "default"}>
                {statusMap[status]?.text || status}
            </Tag>
        );
    };

    const statusMenu = (id: number, currentStatus: string) => (
        <Menu>
            <Menu.Item
                key="available"
                disabled={currentStatus === "available"}
                onClick={() => handleStatusChange(id, "available")}
            >
                Mark as Available
            </Menu.Item>
            <Menu.Item
                key="sold"
                disabled={currentStatus === "sold"}
                onClick={() => handleStatusChange(id, "sold")}
            >
                Mark as Sold
            </Menu.Item>
            <Menu.Item
                key="rented"
                disabled={currentStatus === "rented"}
                onClick={() => handleStatusChange(id, "rented")}
            >
                Mark as Rented
            </Menu.Item>
            <Menu.Item
                key="reserved"
                disabled={currentStatus === "reserved"}
                onClick={() => handleStatusChange(id, "reserved")}
            >
                Mark as Reserved
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text: string, record: any) => (
                <Button type="link" href={route("properties.show", record.id)}>
                    {text}
                </Button>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (text: string) =>
                text.charAt(0).toUpperCase() + text.slice(1),
        },
        {
            title: "Purpose",
            dataIndex: "purpose",
            key: "purpose",
            render: (text: string) =>
                text === "sale" ? "For Sale" : "For Rent",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price: number) => `$${price.toLocaleString()}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => getStatusTag(status),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />

                    <Dropdown overlay={statusMenu(record.id, record.status)}>
                        <Button icon={<SyncOutlined />} />
                    </Dropdown>

                    <Button
                        icon={<EyeOutlined />}
                        href={route("properties.show", record.id)}
                    />

                    <Popconfirm
                        title="Are you sure to delete this property?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    const actions = (property: Property) => {
        if (property.status == "rejected") {
            return [<Text type="danger">{property.rejection_reason}</Text>];
        }
        const actions = [
            <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(property)}
            />,
            property.approved ? (
                <Dropdown overlay={statusMenu(property.id, property.status)}>
                    <Button icon={<SyncOutlined />} />
                </Dropdown>
            ) : null,
            <Button
                icon={<EyeOutlined />}
                href={route("properties.show", property.id)}
            />,
            <Popconfirm
                title="Are you sure to delete this property?"
                onConfirm={() => handleDelete(property.id)}
                okText="Yes"
                cancelText="No"
            >
                <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>,
        ];
        return actions.filter((action) => action !== null);
    };
    return (
        <AppLayout>
            <div className="my-listings-page" style={{ padding: "24px" }}>
                {contexHolder}
                <Title level={2}>My Listings</Title>
                <Text type="secondary">Manage your property listings</Text>

                <Divider />

                {/* Filters and Actions */}
                <Card style={{ marginBottom: "24px" }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Input
                                placeholder="Search properties..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onPressEnter={filterProperties}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                style={{ width: "100%" }}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value)}
                                onSelect={filterProperties}
                            >
                                <Option value="all">All Statuses</Option>
                                <Option value="available">Available</Option>
                                <Option value="sold">Sold</Option>
                                <Option value="rented">Rented</Option>
                                <Option value="reserved">Reserved</Option>
                                <Option value="pending">Pending</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Radio.Group
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                buttonStyle="solid"
                            >
                                <Radio.Button value="table">
                                    Table View
                                </Radio.Button>
                                <Radio.Button value="grid">
                                    Grid View
                                </Radio.Button>
                            </Radio.Group>
                        </Col>
                        <Col
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            style={{ textAlign: "right" }}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setCreateModalVisible(true)}
                            >
                                Add New Property
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Properties List */}
                {viewMode === "table" ? (
                    <Table
                        columns={columns}
                        dataSource={props.properties}
                        rowKey="id"
                        loading={!props.properties}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: true }}
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {props.properties.map((property) => (
                            <Col
                                xs={24}
                                sm={12}
                                md={12}
                                lg={8}
                                xl={6}
                                key={property.id}
                            >
                                <PropertyCard
                                    property={property}
                                    actions={actions(property)}
                                />
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Empty State */}
                {props.properties.length === 0 && (
                    <Card style={{ textAlign: "center", padding: "40px" }}>
                        <Title level={4} type="secondary">
                            No properties found
                        </Title>
                        <Text type="secondary">
                            {props.properties.length === 0
                                ? "You haven't listed any properties yet"
                                : "No properties match your filters"}
                        </Text>
                        <br />
                        <Button
                            type="primary"
                            style={{ marginTop: "16px" }}
                            onClick={() => setCreateModalVisible(true)}
                        >
                            List Your First Property
                        </Button>
                    </Card>
                )}
                {/* Create Property Modal */}
                <Modal
                    title="Create New Property"
                    visible={createModalVisible}
                    onCancel={() => setCreateModalVisible(false)}
                    footer={null}
                    width={800}
                    destroyOnClose
                >
                    <PropertyForm
                        onSubmit={handleCreateSubmit}
                        onCancel={() => setCreateModalVisible(false)}
                    />
                </Modal>
                {/* Edit Modal */}
                <Modal
                    title="Edit Property"
                    visible={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    footer={null}
                    width={800}
                    destroyOnClose
                >
                    {currentProperty && (
                        <PropertyForm
                            initialValues={currentProperty}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditModalVisible(false)}
                        />
                    )}
                </Modal>
            </div>
        </AppLayout>
    );
};

export default MyListingsPage;
