// src/pages/admin/PropertyManagement.tsx
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
    InputNumber,
    Select,
    DatePicker,
} from "antd";
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { usePage, router } from "@inertiajs/react";
import { PageProps } from "../../types";
import { Property, PropertyPurpose, PropertyType } from "@/types/property";
import AdminLayout from "@/Layouts/AdminLayout";
import PropertyForm from "@/Components/PropertyForm";
import moment from "moment";

interface PageData extends PageProps {
    properties: Property[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
    filters: {
        type?: PropertyType;
        purpose?: PropertyPurpose;
        min_price?: number;
        max_price?: number;
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

const { Title, Text, Paragraph } = Typography;
const { Column } = Table;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PropertyManagement: React.FC = () => {
    const { props } = usePage<PageData>();
    const { properties, pagination, filters } = props;

    const [rejectModalVisible, setRejectModalVisible] = React.useState(false);
    const [currentProperty, setCurrentProperty] = React.useState<Property>();
    const [rejectReason, setRejectReason] = React.useState("");
    const [previewVisible, setPreviewVisible] = React.useState(false);
    const [previewProperty, setPreviewProperty] =
        React.useState<Property | null>(null);
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    const [showFilters, setShowFilters] = React.useState(false);
    React.useEffect(() => {
        filterForm.setFieldsValue({
            type: filters?.type,
            purpose: filters?.purpose,
            price_range:
                filters?.min_price && filters?.max_price
                    ? [filters.min_price, filters.max_price]
                    : undefined,
            search: filters?.search,
            status: filters?.status,
            date_range:
                filters?.date_from && filters?.date_to
                    ? [moment(filters.date_from), moment(filters.date_to)]
                    : undefined,
        });
    }, [filters]);
    const handleTableChange = (newPagination: any) => {
        const currentFilters = filterForm.getFieldsValue();
        router.get(
            route("admin.properties.pending"),
            {
                page: newPagination.current,
                limit: newPagination.pageSize,
                ...filters,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleFilterSubmit = (values: any) => {
        router.get(
            route("admin.properties.pending"),
            {
                ...values,
                min_price: values.price_range?.[0],
                max_price: values.price_range?.[1],
                date_from: values.date_range?.[0]?.format("YYYY-MM-DD"),
                date_to: values.date_range?.[1]?.format("YYYY-MM-DD"),
                page: 1, // Reset to first page when filtering
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const resetFilters = () => {
        filterForm.resetFields();
        router.get(
            route("admin.properties.pending"),
            { page: 1 },
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
                        message.success("تمت الموافقة على العقار بنجاح"),
                    onError: () => message.error("فشل في الموافقة على العقار"),
                }
            );
        } catch (error) {
            message.error("فشل في الموافقة على العقار");
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
                        message.success("تم رفض العقار بنجاح");
                        setRejectModalVisible(false);
                        setRejectReason("");
                    },
                    onError: () => message.error("فشل في رفض العقار"),
                }
            );
        } catch (error) {
            message.error("فشل في رفض العقار");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            router.delete(route("admin.properties.destroy", id), {
                preserveScroll: true,
                onSuccess: () => message.success("تم حذف العقار بنجاح"),
                onError: () => message.error("فشل في حذف العقار"),
            });
        } catch (error) {
            message.error("فشل في حذف العقار");
        }
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
            route("admin.properties.update", currentProperty.id),
            formData,
            {
                forceFormData: true,
                onSuccess: () => {
                    message.success("تم تحديث العقار بنجاح");
                    setEditModalVisible(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    message.error("فشل تحديث العقار");
                },
            }
        );
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
            apartment: { color: "purple", text: "شقة" },
            villa: { color: "gold", text: "فيلا" },
            land: { color: "cyan", text: "أرض" },
            office: { color: "blue", text: "مكتب" },
        };
        return <Tag color={typeMap[type].color}>{typeMap[type].text}</Tag>;
    };

    const getPurposeTag = (purpose: PropertyPurpose) => {
        return (
            <Tag color={purpose === "rent" ? "geekblue" : "volcano"}>
                {purpose === "rent" ? "للإيجار" : "للبيع"}
            </Tag>
        );
    };

    return (
        <AdminLayout>
            <div className="property-approval" style={{ padding: "24px" }}>
                <Title level={2}>
                    <Space>
                        <ClockCircleOutlined />
                        العقارات
                    </Space>
                </Title>

                <Card
                    title={
                        <Space>
                            <Button
                                type="default"
                                icon={<FilterOutlined />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? "إخفاء الفلتر" : "عرض الفلتر"}
                            </Button>
                            {showFilters && (
                                <Button onClick={resetFilters}>
                                    مسح الفلتر
                                </Button>
                            )}
                        </Space>
                    }
                >
                    {showFilters && (
                        <Form
                            form={filterForm}
                            layout="vertical"
                            onFinish={handleFilterSubmit}
                            initialValues={{
                                type: filters?.type,
                                purpose: filters?.purpose,
                                price_range:
                                    filters?.min_price && filters?.max_price
                                        ? [filters.min_price, filters.max_price]
                                        : undefined,
                                search: filters?.search,
                                status: filters?.status,
                                date_range:
                                    filters?.date_from && filters?.date_to
                                        ? [
                                              moment(filters.date_from),
                                              moment(filters.date_to),
                                          ]
                                        : undefined,
                            }}
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="search" label="بحث">
                                        <Input
                                            placeholder="ابحث بالعنوان أو الوصف"
                                            prefix={<SearchOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="type" label="نوع العقار">
                                        <Select
                                            placeholder="اختر النوع"
                                            allowClear
                                        >
                                            <Option value="apartment">
                                                شقة
                                            </Option>
                                            <Option value="villa">فيلا</Option>
                                            <Option value="land">أرض</Option>
                                            <Option value="office">مكتب</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="purpose" label="الغرض">
                                        <Select
                                            placeholder="اختر الغرض"
                                            allowClear
                                        >
                                            <Option value="rent">
                                                للإيجار
                                            </Option>
                                            <Option value="sale">للبيع</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="status" label="الحالة">
                                        <Select
                                            placeholder="اختر الحالة"
                                            allowClear
                                        >
                                            <Option value="pending">
                                                قيد الانتظار
                                            </Option>
                                            <Option value="approved">
                                                مقبول
                                            </Option>
                                            <Option value="rejected">
                                                مرفوض
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="price_range"
                                        label="نطاق السعر"
                                    >
                                        <Input.Group compact>
                                            <Form.Item
                                                name={["price_range", 0]}
                                                noStyle
                                            >
                                                <InputNumber
                                                    style={{ width: "45%" }}
                                                    min={0}
                                                    placeholder="من"
                                                    formatter={(value) =>
                                                        `$${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ","
                                                        )
                                                    }
                                                />
                                            </Form.Item>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: "10%",
                                                    textAlign: "center",
                                                }}
                                            >
                                                -
                                            </span>
                                            <Form.Item
                                                name={["price_range", 1]}
                                                noStyle
                                            >
                                                <InputNumber
                                                    style={{ width: "45%" }}
                                                    min={0}
                                                    placeholder="إلى"
                                                    formatter={(value) =>
                                                        `$${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ","
                                                        )
                                                    }
                                                />
                                            </Form.Item>
                                        </Input.Group>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="date_range"
                                        label="تاريخ الإضافة"
                                    >
                                        <RangePicker
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            style={{ marginTop: 30 }}
                                        >
                                            تطبيق الفلتر
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    )}

                    <Table
                        dataSource={properties}
                        rowKey="id"
                        loading={!properties}
                        pagination={pagination}
                        onChange={handleTableChange}
                        scroll={{ x: true }}
                    >
                        <Column
                            title="العقار"
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
                            title="السعر"
                            dataIndex="price"
                            key="price"
                            render={(price, record: Property) => (
                                <Text strong>
                                    ${price.toLocaleString()}
                                    {record.purpose === "rent" && "/شهرياً"}
                                </Text>
                            )}
                        />
                        <Column
                            title="النوع"
                            dataIndex="type"
                            key="type"
                            render={(type) => getTypeTag(type)}
                        />
                        <Column
                            title="الغرض"
                            dataIndex="purpose"
                            key="purpose"
                            render={(purpose) => getPurposeTag(purpose)}
                        />
                        <Column
                            title="تاريخ الإضافة"
                            dataIndex="created_at"
                            key="created_at"
                            render={(date) =>
                                new Date(date).toLocaleDateString()
                            }
                        />
                        <Column
                            title="الإجراءات"
                            key="actions"
                            fixed="right"
                            render={(_, record: Property) => (
                                <Space size="middle">
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => showPreviewModal(record)}
                                    />
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(record)}
                                    />
                                    {record.status === "pending" && (
                                        <>
                                            <Popconfirm
                                                title="هل أنت متأكد من الموافقة على هذا العقار؟"
                                                onConfirm={() =>
                                                    handleApprove(record.id)
                                                }
                                                okText="نعم"
                                                cancelText="لا"
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
                                                onClick={() =>
                                                    showRejectModal(record)
                                                }
                                            />
                                        </>
                                    )}
                                    <Popconfirm
                                        title="هل أنت متأكد من حذف هذا العقار؟"
                                        onConfirm={() =>
                                            handleDelete(record.id)
                                        }
                                        okText="نعم"
                                        cancelText="لا"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                        />
                                    </Popconfirm>
                                </Space>
                            )}
                        />
                    </Table>
                </Card>

                {/* نافذة رفض العقار */}
                <Modal
                    title="رفض إدراج العقار"
                    visible={rejectModalVisible}
                    onCancel={() => {
                        setRejectModalVisible(false);
                        setRejectReason("");
                    }}
                    onOk={handleReject}
                    okText="رفض"
                    okButtonProps={{ danger: true }}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="سبب الرفض"
                            rules={[
                                {
                                    required: true,
                                    message: "الرجاء تقديم سبب الرفض",
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={4}
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                placeholder="الرجاء تحديد سبب رفض إدراج هذا العقار..."
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* نافذة معاينة العقار */}
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
                                        <Descriptions.Item label="النوع">
                                            {getTypeTag(previewProperty.type)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="الغرض">
                                            {getPurposeTag(
                                                previewProperty.purpose
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="السعر">
                                            <Text strong>
                                                $
                                                {previewProperty.price.toLocaleString()}
                                                {previewProperty.purpose ===
                                                    "rent" && "/شهرياً"}
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
                                            <Descriptions.Item label="المساحة">
                                                {previewProperty.area} قدم مربع
                                            </Descriptions.Item>
                                        )}
                                        {previewProperty.bedrooms && (
                                            <Descriptions.Item label="غرف النوم">
                                                {previewProperty.bedrooms}
                                            </Descriptions.Item>
                                        )}
                                        {previewProperty.bathrooms && (
                                            <Descriptions.Item label="الحمامات">
                                                {previewProperty.bathrooms}
                                            </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="العنوان">
                                            {previewProperty.address ||
                                                "غير محدد"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>

                            <Divider />

                            <Title level={5}>الوصف</Title>
                            <Paragraph>{previewProperty.description}</Paragraph>

                            <Divider />

                            <Row justify="end">
                                <Space>
                                    {previewProperty.status === "pending" && (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={() => {
                                                    handleApprove(
                                                        previewProperty.id
                                                    );
                                                    setPreviewVisible(false);
                                                }}
                                            >
                                                موافقة
                                            </Button>
                                            <Button
                                                danger
                                                icon={<CloseOutlined />}
                                                onClick={() => {
                                                    setPreviewVisible(false);
                                                    showRejectModal(
                                                        previewProperty
                                                    );
                                                }}
                                            >
                                                رفض
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setPreviewVisible(false);
                                            handleEdit(previewProperty);
                                        }}
                                    >
                                        تعديل
                                    </Button>
                                </Space>
                            </Row>
                        </div>
                    )}
                </Modal>

                {/* نافذة تعديل العقار */}
                <Modal
                    title="تعديل العقار"
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
        </AdminLayout>
    );
};

export default PropertyManagement;
