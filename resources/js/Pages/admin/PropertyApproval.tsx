// src/pages/admin/PropertyApproval.tsx
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
    Image,
    Modal,
    Form,
    Input,
    Row,
    Col,
    Badge,
    Divider,
    Descriptions,
} from "antd";
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    HomeOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { usePage, router } from "@inertiajs/react";
import { PageProps } from "../../types";
import { Property, PropertyPurpose, PropertyType } from "@/types/property";
import AdminLayout from "@/Layouts/AdminLayout";

interface PageData extends PageProps {
    properties: Property[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
}

const { Title, Text, Paragraph } = Typography;
const { Column } = Table;

const PropertyApproval: React.FC = () => {
    const { props } = usePage<PageData>();
    const { properties, pagination } = props;

    const [rejectModalVisible, setRejectModalVisible] = React.useState(false);
    const [currentProperty, setCurrentProperty] =
        React.useState<Property | null>(null);
    const [rejectReason, setRejectReason] = React.useState("");
    const [previewVisible, setPreviewVisible] = React.useState(false);
    const [previewProperty, setPreviewProperty] =
        React.useState<Property | null>(null);
    const [form] = Form.useForm();

    const handleTableChange = (newPagination: any) => {
        router.get(
            route("admin.properties.pending"),
            {
                page: newPagination.current,
                limit: newPagination.pageSize,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleApprove = async (id: number) => {
        try {
            router.post(
                route("admin.properties.approve", id),
                { approved: true },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () =>
                        message.success("Property approved successfully"),
                    onError: () => message.error("Failed to approve property"),
                }
            );
        } catch (error) {
            message.error("Failed to approve property");
        }
    };

    const handleReject = async () => {
        try {
            if (!currentProperty) return;
            router.post(
                route("admin.properties.approve", currentProperty.id),
                {
                    approved: false,
                    reason: rejectReason,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        message.success("Property rejected successfully");
                        setRejectModalVisible(false);
                        setRejectReason("");
                    },
                    onError: () => message.error("Failed to rejected property"),
                }
            );
        } catch (error) {
            message.error("Failed to reject property");
        }
    };

    const showRejectModal = (property: Property) => {
        setCurrentProperty(property);
        setRejectModalVisible(true);
    };

    const showPreviewModal = (property: Property) => {
        setPreviewProperty(property);
        setPreviewVisible(true);
    };

    const getTypeTag = (type: PropertyType) => {
        const typeMap = {
            apartment: { color: "purple", text: "Apartment" },
            villa: { color: "gold", text: "Villa" },
            land: { color: "cyan", text: "Land" },
            office: { color: "blue", text: "Office" },
        };
        return <Tag color={typeMap[type].color}>{typeMap[type].text}</Tag>;
    };

    const getPurposeTag = (purpose: PropertyPurpose) => {
        return (
            <Tag color={purpose === "rent" ? "geekblue" : "volcano"}>
                {purpose === "rent" ? "For Rent" : "For Sale"}
            </Tag>
        );
    };

    return (
        <AdminLayout>
            <div className="property-approval" style={{ padding: "24px" }}>
                <Title level={2}>
                    <Space>
                        <ClockCircleOutlined />
                        Property Approvals
                        <Badge
                            count={pagination.total}
                            style={{ backgroundColor: "#faad14" }}
                        />
                    </Space>
                </Title>

                <Card>
                    <Table
                        dataSource={properties}
                        rowKey="id"
                        loading={!properties}
                        pagination={pagination}
                        onChange={handleTableChange}
                        scroll={{ x: true }}
                    >
                        <Column
                            title="Property"
                            dataIndex="title"
                            key="title"
                            render={(title, record: Property) => (
                                <Space>
                                    {Array.isArray(record.images) &&
                                    record.images.length > 0 ? (
                                        <Image
                                            src={`${window.location.origin}/storage/${record.images[0].image_url}`}
                                            width={80}
                                            height={60}
                                            style={{ borderRadius: 4 }}
                                            preview={false}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: 80,
                                                height: 60,
                                                background: "#f0f0f0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: 4,
                                            }}
                                        >
                                            <HomeOutlined
                                                style={{
                                                    fontSize: 24,
                                                    color: "#999",
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <Text strong>{title}</Text>
                                        <br />
                                        <Text type="secondary">
                                            {record.address}
                                        </Text>
                                    </div>
                                </Space>
                            )}
                        />
                        <Column
                            title="Price"
                            dataIndex="price"
                            key="price"
                            render={(price, record: Property) => (
                                <Text strong>
                                    ${price.toLocaleString()}
                                    {record.purpose === "rent" && "/mo"}
                                </Text>
                            )}
                        />
                        <Column
                            title="Type"
                            dataIndex="type"
                            key="type"
                            render={(type) => getTypeTag(type)}
                        />
                        <Column
                            title="Purpose"
                            dataIndex="purpose"
                            key="purpose"
                            render={(purpose) => getPurposeTag(purpose)}
                        />
                        <Column
                            title="Submitted"
                            dataIndex="created_at"
                            key="created_at"
                            render={(date) =>
                                new Date(date).toLocaleDateString()
                            }
                        />
                        <Column
                            title="Actions"
                            key="actions"
                            fixed="right"
                            render={(_, record: Property) => (
                                <Space size="middle">
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => showPreviewModal(record)}
                                    />
                                    <Popconfirm
                                        title="Are you sure to approve this property?"
                                        onConfirm={() =>
                                            handleApprove(record.id)
                                        }
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="text"
                                            icon={<CheckOutlined />}
                                            style={{ color: "#52c41a" }}
                                        />
                                    </Popconfirm>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() => showRejectModal(record)}
                                    />
                                </Space>
                            )}
                        />
                    </Table>
                </Card>

                {/* Reject Modal */}
                <Modal
                    title="Reject Property Listing"
                    visible={rejectModalVisible}
                    onCancel={() => {
                        setRejectModalVisible(false);
                        setRejectReason("");
                    }}
                    onOk={handleReject}
                    okText="Reject"
                    okButtonProps={{ danger: true }}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Reason for Rejection"
                            rules={[
                                {
                                    required: true,
                                    message: "Please provide a reason",
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={4}
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                placeholder="Please specify the reason for rejecting this property listing..."
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Preview Modal */}
                <Modal
                    title={previewProperty?.title}
                    visible={previewVisible}
                    onCancel={() => setPreviewVisible(false)}
                    footer={null}
                    width={800}
                >
                    {previewProperty && (
                        <div>
                            <Image.PreviewGroup>
                                <Row
                                    gutter={[16, 16]}
                                    style={{ marginBottom: 16 }}
                                >
                                    {previewProperty.images?.map(
                                        (img, index) => (
                                            <Col
                                                key={index}
                                                xs={24}
                                                sm={12}
                                                md={8}
                                            >
                                                <Image
                                                    src={`${window.location.origin}/storage/${img.image_url}`}
                                                    style={{ borderRadius: 4 }}
                                                />
                                            </Col>
                                        )
                                    )}
                                </Row>
                            </Image.PreviewGroup>

                            <Divider />

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Descriptions
                                        bordered
                                        column={1}
                                        size="small"
                                    >
                                        <Descriptions.Item label="Type">
                                            {getTypeTag(previewProperty.type)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Purpose">
                                            {getPurposeTag(
                                                previewProperty.purpose
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Price">
                                            <Text strong>
                                                $
                                                {previewProperty.price.toLocaleString()}
                                                {previewProperty.purpose ===
                                                    "rent" && "/mo"}
                                            </Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Descriptions
                                        bordered
                                        column={1}
                                        size="small"
                                    >
                                        {previewProperty.area && (
                                            <Descriptions.Item label="Area">
                                                {previewProperty.area} sq.ft
                                            </Descriptions.Item>
                                        )}
                                        {previewProperty.bedrooms && (
                                            <Descriptions.Item label="Bedrooms">
                                                {previewProperty.bedrooms}
                                            </Descriptions.Item>
                                        )}
                                        {previewProperty.bathrooms && (
                                            <Descriptions.Item label="Bathrooms">
                                                {previewProperty.bathrooms}
                                            </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="Address">
                                            {previewProperty.address ||
                                                "Not specified"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>

                            <Divider />

                            <Title level={5}>Description</Title>
                            <Paragraph>{previewProperty.description}</Paragraph>

                            <Divider />

                            <Row justify="end">
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={() => {
                                            handleApprove(previewProperty.id);
                                            setPreviewVisible(false);
                                        }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() => {
                                            setPreviewVisible(false);
                                            showRejectModal(previewProperty);
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </Space>
                            </Row>
                        </div>
                    )}
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default PropertyApproval;
