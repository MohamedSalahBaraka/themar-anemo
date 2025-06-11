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
import { useLanguage } from "@/contexts/LanguageContext";

const { Title, Text } = Typography;
const { Option } = Select;

interface MyListingsPageProps extends PageProps {
    properties: any[];
    filters: {
        status: string;
        search: string;
    };
}
const MyListingsPage: React.FC = () => (
    <AppLayout>
        <Page />
    </AppLayout>
);
const Page: React.FC = () => {
    const { t } = useLanguage();
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

    const handleCreateSubmit = async (values: any) => {
        const formData = new FormData();

        Object.entries(values).forEach(([key, val]) => {
            if (key === "images" && Array.isArray(val)) {
                val.forEach((fileWrapper: any) => {
                    if (fileWrapper.originFileObj instanceof File) {
                        formData.append("images[]", fileWrapper.originFileObj);
                    }
                });
            } else if (key === "features" && Array.isArray(val)) {
                val.forEach((data: string) => {
                    formData.append("features[]", data);
                });
            } else if (val !== null && val !== undefined) {
                // @ts-ignore
                formData.append(key, val);
            }
        });

        router.post(route("user.properties.store"), formData, {
            forceFormData: true,
            onSuccess: () => {
                messageApi.success(t("Property created successfully"));
                setCreateModalVisible(false);
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error(t("Failed to create property"));
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
                messageApi.success(t("Property deleted successfully"));
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error(t("Failed to delete property"));
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
                    messageApi.success(t("Status updated successfully"));
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("Failed to update property status"));
                },
            }
        );
    };
    const UpdateFeatured = async (id: number) => {
        router.put(
            route("user.properties.update.featured", id),
            {},
            {
                onSuccess: () => {
                    messageApi.success(t("status_updated"));
                },
                onError: (errors: any) => {
                    const errorMsg =
                        errors?.error || t("failed_to_update_property_status");
                    messageApi.error(t(errorMsg));
                },
            }
        );
    };

    const handleEdit = (property: any) => {
        console.log("Editing property:", property);

        const fileList =
            property.images?.map((img: any, index: number) => ({
                uid: img.id,
                name: img.image_url.split("/").pop(),
                status: "done",
                url: `${window.location.origin}/storage/${img.image_url}`,
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

        Object.entries(values).forEach(([key, val]) => {
            if (key === "images" && Array.isArray(val)) {
                val.forEach((fileWrapper: any) => {
                    if (fileWrapper.originFileObj instanceof File) {
                        formData.append("images[]", fileWrapper.originFileObj);
                    }
                });
            } else if (key === "features" && Array.isArray(val)) {
                val.forEach((data: string) => {
                    formData.append("features[]", data);
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
                    messageApi.success(t("Property updated successfully"));
                    setEditModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("Failed to update property"));
                },
            }
        );
    };

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            available: { color: "green", text: t("Available") },
            sold: { color: "red", text: t("Sold") },
            rented: { color: "blue", text: t("Rented") },
            reserved: { color: "orange", text: t("Reserved") },
            pending: { color: "gold", text: t("Pending") },
            rejected: { color: "red", text: t("Rejected") },
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
                {t("Set as available")}
            </Menu.Item>
            <Menu.Item
                key="sold"
                disabled={currentStatus === "sold"}
                onClick={() => handleStatusChange(id, "sold")}
            >
                {t("Set as sold")}
            </Menu.Item>
            <Menu.Item
                key="rented"
                disabled={currentStatus === "rented"}
                onClick={() => handleStatusChange(id, "rented")}
            >
                {t("Set as rented")}
            </Menu.Item>
            <Menu.Item
                key="reserved"
                disabled={currentStatus === "reserved"}
                onClick={() => handleStatusChange(id, "reserved")}
            >
                {t("Set as reserved")}
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: t("Title"),
            dataIndex: "title",
            key: "title",
            render: (text: string, record: any) => (
                <Button type="link" href={route("properties.show", record.id)}>
                    {text}
                </Button>
            ),
        },
        {
            title: t("Type"),
            dataIndex: "type",
            key: "type",
            render: (text: string) =>
                t(
                    text === "house"
                        ? "House"
                        : text === "apartment"
                        ? "Apartment"
                        : text === "land"
                        ? "Land"
                        : text === "commercial"
                        ? "Commercial"
                        : text
                ),
        },
        {
            title: t("Purpose"),
            dataIndex: "purpose",
            key: "purpose",
            render: (text: string) =>
                t(text === "sale" ? "For Sale" : "For Rent"),
        },
        {
            title: t("Price"),
            dataIndex: "price",
            key: "price",
            render: (price: number) => `${price.toLocaleString()} ${t("SAR")}`,
        },
        {
            title: t("is_featured"),
            dataIndex: "is_featured",
            key: "is_featured",
            render: (is_featured: boolean, record: Property) =>
                getIsFeaturedTag(is_featured, record.id),
        },
        {
            title: t("Status"),
            dataIndex: "status",
            key: "status",
            render: (status: string) => getStatusTag(status),
        },
        {
            title: t("Actions"),
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
                        title={t(
                            "Are you sure you want to delete this property?"
                        )}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t("Yes")}
                        cancelText={t("No")}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    const getIsFeaturedTag = (is_featured: boolean, id: number) => {
        return (
            <Tag
                style={{ cursor: "pointer" }}
                onClick={() => UpdateFeatured(id)}
                color={is_featured ? "geekblue" : "volcano"}
            >
                {is_featured ? t("is_featured") : t("is_not_featured")}
            </Tag>
        );
    };
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
                title={t("Are you sure you want to delete this property?")}
                onConfirm={() => handleDelete(property.id)}
                okText={t("Yes")}
                cancelText={t("No")}
            >
                <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>,
        ];
        return actions.filter((action) => action !== null);
    };

    return (
        <div className="my-listings-page" style={{ padding: "24px" }}>
            {contexHolder}
            <Title level={2}>{t("My Properties")}</Title>
            <Text type="secondary">{t("Manage your property listings")}</Text>

            <Divider />

            {/* Filters and Actions */}
            <Card style={{ marginBottom: "24px" }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder={t("Search properties...")}
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
                            <Option value="all">{t("All statuses")}</Option>
                            <Option value="available">{t("Available")}</Option>
                            <Option value="sold">{t("Sold")}</Option>
                            <Option value="rented">{t("Rented")}</Option>
                            <Option value="reserved">{t("Reserved")}</Option>
                            <Option value="pending">{t("Pending")}</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Radio.Group
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            buttonStyle="solid"
                        >
                            <Radio.Button value="table">
                                {t("Table view")}
                            </Radio.Button>
                            <Radio.Button value="grid">
                                {t("Grid view")}
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
                            {t("Add new property")}
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
                        {t("No properties")}
                    </Title>
                    <Text type="secondary">
                        {props.properties.length === 0
                            ? t("You haven't listed any properties yet")
                            : t("No properties match your filters")}
                    </Text>
                    <br />
                    <Button
                        type="primary"
                        style={{ marginTop: "16px" }}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        {t("List your first property")}
                    </Button>
                </Card>
            )}

            {/* Create Property Modal */}
            <Modal
                title={t("Add new property")}
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
                title={t("Edit property")}
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
    );
};

export default MyListingsPage;
