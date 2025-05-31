import React from "react";
import { usePage, router } from "@inertiajs/react";
import {
    Card,
    Row,
    Col,
    Image,
    Typography,
    Divider,
    Button,
    Space,
    Descriptions,
    Modal,
    Form,
    Input,
    Tag,
    DatePicker,
    Badge,
    message,
} from "antd";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined,
    HomeOutlined,
    StarOutlined,
} from "@ant-design/icons";
import Map from "@/Components/Map";
import dayjs from "dayjs";
import { PageProps } from "@/types";
import { Property } from "@/types/property";
import { FaBath, FaBed } from "react-icons/fa";

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { RangePicker } = DatePicker;

interface PropertyDetailsPageProps extends PageProps {
    property: Property;
    isLoggedIn: boolean;
}

interface InquiryFormValues {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface ReservationFormValues {
    dates?: [dayjs.Dayjs, dayjs.Dayjs];
    special_requests: string;
}

const PropertyDetails: React.FC = () => {
    const { props } = usePage<PropertyDetailsPageProps>();
    const { property, isLoggedIn } = props;
    const user = usePage().props.auth.user;
    const [inquiryModalVisible, setInquiryModalVisible] = React.useState(false);
    const [reservationModalVisible, setReservationModalVisible] =
        React.useState(false);
    const [inquiryForm] = Form.useForm();
    const [reservationForm] = Form.useForm();

    const handleInquirySubmit = async (values: InquiryFormValues) => {
        try {
            await router.post(
                route("properties.inquiries.store", property.id),
                { ...values }
            );
            message.success("تم إرسال استفسارك بنجاح!");
            setInquiryModalVisible(false);
            inquiryForm.resetFields();
        } catch (error) {
            message.error("فشل في إرسال الاستفسار. يرجى المحاولة مرة أخرى.");
        }
    };

    const handleReservationSubmit = async (values: ReservationFormValues) => {
        try {
            const reservationData: any = {
                special_requests: values.special_requests || "",
            };

            if (property.purpose === "rent" && values.dates) {
                reservationData.start_date =
                    values.dates[0].format("YYYY-MM-DD");
                reservationData.end_date = values.dates[1].format("YYYY-MM-DD");
            }

            await router.post(
                route("properties.reservations.store", property.id),
                reservationData
            );

            message.success(
                property.purpose === "rent"
                    ? "تم تقديم طلب الإيجار بنجاح!"
                    : "تم تقديم عرض الشراء بنجاح!"
            );
            setReservationModalVisible(false);
            reservationForm.resetFields();
        } catch (error) {
            message.error("فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.");
        }
    };

    type StatusKey = "available" | "sold" | "rented" | "reserved";
    type TypeKey = "apartment" | "villa" | "land" | "office";

    const getStatusTag = (status: string) => {
        const statusMap: Record<StatusKey, { color: string; text: string }> = {
            available: { color: "green", text: "متاح" },
            sold: { color: "red", text: "تم البيع" },
            rented: { color: "blue", text: "تم التأجير" },
            reserved: { color: "orange", text: "محجوز" },
        };
        const key = status as StatusKey;
        return <Tag color={statusMap[key]?.color}>{statusMap[key]?.text}</Tag>;
    };

    const getTypeTag = (type: string) => {
        const typeMap: Record<TypeKey, { color: string; text: string }> = {
            apartment: { color: "purple", text: "شقة" },
            villa: { color: "gold", text: "فيلا" },
            land: { color: "cyan", text: "أرض" },
            office: { color: "blue", text: "مكتب" },
        };
        const key = type as TypeKey;
        return <Tag color={typeMap[key]?.color}>{typeMap[key]?.text}</Tag>;
    };

    return (
        <div
            className="property-details-page"
            style={{ padding: "24px", direction: "rtl" }}
        >
            <Card
                title={
                    <Space>
                        <Title level={3} style={{ margin: 0 }}>
                            {property.title}
                        </Title>
                        {property.is_featured && (
                            <Badge
                                count={
                                    <StarOutlined
                                        style={{ color: "#fadb14" }}
                                    />
                                }
                            />
                        )}
                    </Space>
                }
                extra={getStatusTag(property.status)}
            >
                <Row gutter={[24, 24]}>
                    {/* صور العقار */}
                    <Col xs={24} md={12}>
                        <Image.PreviewGroup>
                            <Space
                                direction="vertical"
                                size="middle"
                                style={{ width: "100%" }}
                            >
                                <Image
                                    src={
                                        property.images?.length
                                            ? `${window.location.origin}/storage/${property.images[0].image_url}`
                                            : "/placeholder-property.jpg"
                                    }
                                    alt={property.title}
                                    style={{
                                        width: "100%",
                                        borderRadius: "8px",
                                    }}
                                />
                                {property.images &&
                                    property.images.length > 1 && (
                                        <Row gutter={[8, 8]}>
                                            {property.images
                                                .slice(1)
                                                .map((img, index) => (
                                                    <Col key={index} xs={8}>
                                                        <Image
                                                            src={`${window.location.origin}/storage/${img.image_url}`}
                                                            alt={`${
                                                                property.title
                                                            } ${index + 1}`}
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                            }}
                                                        />
                                                    </Col>
                                                ))}
                                        </Row>
                                    )}
                            </Space>
                        </Image.PreviewGroup>
                    </Col>

                    {/* تفاصيل العقار */}
                    <Col xs={24} md={12}>
                        <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                        >
                            <div>
                                <Text
                                    type="secondary"
                                    style={{ fontSize: "16px" }}
                                >
                                    <EnvironmentOutlined />{" "}
                                    {property.address || "العنوان غير محدد"}
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                    {getTypeTag(property.type)}
                                    <Tag
                                        color={
                                            property.purpose === "rent"
                                                ? "geekblue"
                                                : "volcano"
                                        }
                                    >
                                        {property.purpose === "rent"
                                            ? "للإيجار"
                                            : "للبيع"}
                                    </Tag>
                                </div>
                            </div>

                            <Divider />

                            <Descriptions bordered column={1}>
                                <Item label="السعر">
                                    <Text strong>
                                        ${property.price.toLocaleString()}
                                        {property.purpose === "rent" &&
                                            " / شهرياً"}
                                    </Text>
                                </Item>
                                {property.area && (
                                    <Item label="المساحة">
                                        {property.area} قدم مربع
                                    </Item>
                                )}
                                {property.bedrooms && (
                                    <Item label="غرف النوم">
                                        <FaBed /> {property.bedrooms}
                                    </Item>
                                )}
                                {property.bathrooms && (
                                    <Item label="الحمامات">
                                        <FaBath /> {property.bathrooms}
                                    </Item>
                                )}
                                {property.floor && (
                                    <Item label="الطابق">
                                        <HomeOutlined /> {property.floor}
                                    </Item>
                                )}
                                {property.published_at && (
                                    <Item label="تاريخ النشر">
                                        <CalendarOutlined />{" "}
                                        {dayjs(property.published_at).format(
                                            "MMMM D, YYYY"
                                        )}
                                    </Item>
                                )}
                            </Descriptions>

                            <Divider />

                            <Title level={4}>الوصف</Title>
                            <Paragraph>{property.description}</Paragraph>

                            {property.latitude && property.longitude && (
                                <>
                                    <Divider />
                                    <Title level={4}>الموقع</Title>
                                    <div
                                        style={{
                                            height: "300px",
                                            width: "100%",
                                        }}
                                    >
                                        <Map
                                            latitude={property.latitude}
                                            longitude={property.longitude}
                                            address={property.address || ""}
                                        />
                                    </div>
                                </>
                            )}

                            <Divider />

                            <Space size="middle">
                                {user.id == property.user_id ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        href={route(
                                            "user.properties.edit",
                                            property.id
                                        )}
                                    >
                                        تعديل
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={() =>
                                                setInquiryModalVisible(true)
                                            }
                                        >
                                            تواصل مع المالك
                                        </Button>
                                        <Button
                                            type="default"
                                            size="large"
                                            onClick={() =>
                                                setReservationModalVisible(true)
                                            }
                                            disabled={
                                                property.status !==
                                                    "available" || !isLoggedIn
                                            }
                                        >
                                            {property.purpose === "rent"
                                                ? "إيجار الآن"
                                                : "تقديم عرض"}
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* نافذة الاستفسار */}
            <Modal
                title="تواصل مع مالك العقار"
                open={inquiryModalVisible}
                onCancel={() => setInquiryModalVisible(false)}
                footer={null}
            >
                <Form
                    form={inquiryForm}
                    layout="vertical"
                    onFinish={handleInquirySubmit}
                >
                    <Form.Item
                        name="name"
                        label="اسمك"
                        rules={[
                            {
                                required: true,
                                message: "الرجاء إدخال اسمك",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="البريد الإلكتروني"
                        rules={[
                            {
                                required: true,
                                message: "الرجاء إدخال بريدك الإلكتروني",
                            },
                            {
                                type: "email",
                                message: "الرجاء إدخال بريد إلكتروني صحيح",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="رقم الهاتف">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="message"
                        label="الرسالة"
                        rules={[
                            {
                                required: true,
                                message: "الرجاء إدخال رسالتك",
                            },
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            إرسال الاستفسار
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* نافذة الحجز */}
            <Modal
                title={
                    property.purpose === "rent"
                        ? "إيجار هذا العقار"
                        : "تقديم عرض شراء"
                }
                open={reservationModalVisible}
                onCancel={() => setReservationModalVisible(false)}
                footer={null}
            >
                <Form
                    form={reservationForm}
                    layout="vertical"
                    onFinish={handleReservationSubmit}
                >
                    {property.purpose === "rent" && (
                        <Form.Item
                            name="dates"
                            label="فترة الإيجار"
                            rules={[
                                {
                                    required: true,
                                    message: "الرجاء تحديد فترة الإيجار",
                                },
                            ]}
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    )}
                    <Form.Item name="special_requests" label="طلبات خاصة">
                        <Input.TextArea
                            rows={4}
                            placeholder="أي متطلبات أو ملاحظات خاصة..."
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {property.purpose === "rent"
                                ? "تقديم طلب إيجار"
                                : "تقديم عرض"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PropertyDetails;
