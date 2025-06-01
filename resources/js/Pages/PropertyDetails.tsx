import React from "react";
import { usePage, router, Link } from "@inertiajs/react";
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
    InputNumber,
    List,
    Empty,
} from "antd";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined,
    HomeOutlined,
    StarOutlined,
    EyeOutlined,
    ArrowsAltOutlined,
    TagOutlined,
    DotChartOutlined,
    CommentOutlined,
    WhatsAppOutlined,
    FacebookFilled,
    CopyOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import Map from "@/Components/Map";
import dayjs from "dayjs";
import { PageProps } from "@/types";
import { Property } from "@/types/property";

import { FaBath, FaBed } from "react-icons/fa";
import FrontLayout from "@/Layouts/FrontLayout";
import Meta from "antd/es/card/Meta";

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { RangePicker } = DatePicker;

interface PropertyDetailsPageProps extends PageProps {
    property: Property;
    isLoggedIn: boolean;
    similarProperties: Property[];
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
    price: number;
}
const PropertyDetails: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
const Page: React.FC = () => {
    const { props } = usePage<PropertyDetailsPageProps>();
    const { property, isLoggedIn, similarProperties } = props;
    const user = usePage().props.auth.user;
    const [inquiryModalVisible, setInquiryModalVisible] = React.useState(false);
    const [reservationModalVisible, setReservationModalVisible] =
        React.useState(false);
    const [inquiryForm] = Form.useForm();
    const [reservationForm] = Form.useForm();

    const handleInquirySubmit = async (values: InquiryFormValues) => {
        router.post(
            route("properties.inquiries.store", property.id),
            { ...values },
            {
                onSuccess: () => {
                    message.success(
                        "Your inquiry has been submitted successfully!"
                    );
                    setInquiryModalVisible(false);
                    inquiryForm.resetFields();
                },
                onError: () => {
                    message.error(
                        "Failed to submit inquiry. Please try again."
                    );
                },
            }
        );
    };

    const handleReservationSubmit = async (values: ReservationFormValues) => {
        const reservationData: any = {
            special_requests: values.special_requests || "",
            price: values.price,
        };

        if (property.purpose === "rent" && values.dates) {
            reservationData.start_date = values.dates[0].format("YYYY-MM-DD");
            reservationData.end_date = values.dates[1].format("YYYY-MM-DD");
        }

        router.post(
            route("properties.reservations.store", property.id),
            reservationData,
            {
                onSuccess: () => {
                    message.success(
                        property.purpose === "rent"
                            ? "Your rental request has been submitted successfully!"
                            : "Your purchase request has been submitted successfully!"
                    );
                    setReservationModalVisible(false);
                    reservationForm.resetFields();
                },
                onError: () => {
                    message.error(
                        "Failed to submit inquiry. Please try again."
                    );
                },
            }
        );
    };
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ar-SA", {
            style: "currency",
            currency: "SAR",
            maximumFractionDigits: 0,
        }).format(price);
    };
    const renderPropertyCard = (property: Property) => (
        <Badge.Ribbon
            text="مميز"
            color="gold"
            placement="start"
            style={{ display: property.is_featured ? "block" : "none" }}
        >
            <Card
                hoverable
                cover={
                    <div className="relative aspect-[4/3]">
                        <img
                            alt={property.title}
                            src={
                                property.primaryImage
                                    ? `${window.location.origin}/storage/${property.primaryImage}`
                                    : "/placeholder-property.jpg"
                            }
                            className="w-full h-full object-cover rounded-lg"
                        />
                        {/* <button
                            type="button"
                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full shadow hover:bg-white focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(property.id);
                            }}
                        >
                            {favorites.has(property.id) ? (
                                <HeartFilled className="text-red-500 text-sm" />
                            ) : (
                                <HeartOutlined className="text-sm" />
                            )}
                        </button> */}
                        <span
                            className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium text-white ${
                                property.purpose === "sale"
                                    ? "bg-blue-600"
                                    : "bg-green-600"
                            }`}
                        >
                            {property.purpose === "sale" ? "للبيع" : "للإيجار"}
                        </span>
                    </div>
                }
                className="property-card"
                onClick={() =>
                    router.visit(route("properties.show", { id: property.id }))
                }
            >
                <Meta
                    title={
                        <>
                            <Space
                                style={{ display: "block", marginBottom: 8 }}
                            >
                                <Title level={4} style={{ color: "#2563EB" }}>
                                    {formatPrice(property.price)}
                                </Title>
                            </Space>
                            <Space>
                                {property.title}
                                {getStatusTag(property.status)}
                            </Space>
                        </>
                    }
                    description={
                        <>
                            <Space>
                                <EnvironmentOutlined />
                                <Text type="secondary">
                                    {property.address?.split(",")[0] ||
                                        "الموقع غير محدد"}
                                </Text>
                            </Space>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space size="large">
                                <Space>
                                    <HomeOutlined />
                                    {property.bedrooms || "غير محدد"} غرفة
                                </Space>
                                <Space>
                                    <FaBath />
                                    {property.bathrooms || "غير محدد"}حمام
                                </Space>
                                <Space>
                                    <ArrowsAltOutlined />
                                    {property.area
                                        ? `${property.area} m²`
                                        : "غير محدد"}
                                </Space>
                            </Space>
                        </>
                    }
                />
            </Card>
        </Badge.Ribbon>
    );

    const renderPropertySection = (
        properties: Property[],
        title: string,
        icon: React.ReactNode
    ) => (
        <section className="section" style={{ margin: 30 }}>
            <Row
                className="flex flex-row justify-between"
                style={{ marginBottom: 20 }}
            >
                <Title level={3} style={{ marginBottom: 0 }}>
                    {title}
                </Title>
            </Row>
            {properties?.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {properties.map((property) => (
                        <Col key={property.id} xs={24} sm={12} md={8} lg={6}>
                            {renderPropertyCard(property)}
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description={`لا توجد ${title} متاحة حالياً`} />
            )}
        </section>
    );
    type StatusKey = "available" | "sold" | "rented" | "reserved";
    type TypeKey = "apartment" | "villa" | "land" | "office";

    const getStatusTag = (status: string) => {
        const statusMap: Record<StatusKey, { color: string; text: string }> = {
            available: { color: "green", text: "Available" },
            sold: { color: "red", text: "Sold" },
            rented: { color: "blue", text: "Rented" },
            reserved: { color: "orange", text: "Reserved" },
        };
        const key = status as StatusKey;
        return <Tag color={statusMap[key]?.color}>{statusMap[key]?.text}</Tag>;
    };

    const getTypeTag = (type: string) => {
        const typeMap: Record<TypeKey, { color: string; text: string }> = {
            apartment: { color: "purple", text: "Apartment" },
            villa: { color: "gold", text: "Villa" },
            land: { color: "cyan", text: "Land" },
            office: { color: "blue", text: "Office" },
        };
        const key = type as TypeKey;
        return <Tag color={typeMap[key]?.color}>{typeMap[key]?.text}</Tag>;
    };

    const features = [
        "إطلالة على المدينة",
        "قريب من الخدمات",
        "نظام أمان",
        "موقف سيارات خاص",
        "تكييف مركزي",
        "مطبخ مجهز",
    ];
    const handleFacebookShare = () => {
        const url = encodeURIComponent(window.location.href); // or your property URL
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            "_blank"
        );
    };
    const handleWhatsAppShare = () => {
        const url = window.location.href;
        const text = `مسكن دليلك العقاري, تصفح هذا العقار: ${url}`;
        window.open(
            `https://wa.me/?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    };
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            message.success("تم نسخ الرابط بنجاح!");
        } catch (err) {
            message.error("حدث خطأ أثناء نسخ الرابط");
        }
    };

    return (
        <div className="property-details-page">
            <div style={{ position: "relative" }}>
                {/* Background Image with Overlay */}
                <img
                    src={
                        property.images?.length
                            ? `${window.location.origin}/storage/${property.images[0].image_url}`
                            : "/placeholder-property.jpg"
                    }
                    alt={property.title}
                    style={{
                        width: "100%",
                        height: "90vh",
                        objectFit: "cover",
                        filter: "brightness(60%)",
                    }}
                />

                {/* Overlay Content */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 40,
                        right: 40,
                        maxWidth: 500,
                        // backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: 12,
                        padding: 24,
                        fontFamily: "Arial, sans-serif",
                    }}
                >
                    {/* Title */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        {getStatusTag(property.status)}
                        <div
                            style={{
                                fontSize: 14,
                                color: "#fff",
                                marginBottom: 4,
                            }}
                        >
                            REF-{property.id || "2023-12345"}
                        </div>
                    </div>
                    <Title level={3} style={{ marginBottom: 4, color: "#fff" }}>
                        {property.title}
                    </Title>
                    <Text style={{ fontSize: 16, color: "#fff" }}>
                        <EnvironmentOutlined />{" "}
                        {property.address || "الدوار السابع، عمان"}
                    </Text>

                    {/* Features */}
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <div style={{ textAlign: "center", color: "#fff" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <FaBath size={20} />
                                    <div>الحمامات</div>
                                </div>
                                <Text strong style={{ color: "#fff" }}>
                                    {property.bathrooms}
                                </Text>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ textAlign: "center", color: "#fff" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <HomeOutlined />
                                    <div>الغرف</div>
                                </div>
                                <Text strong style={{ color: "#fff" }}>
                                    {property.bedrooms}
                                </Text>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ textAlign: "center", color: "#fff" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <ArrowsAltOutlined />
                                    <div>المساحة</div>
                                </div>
                                <Text strong style={{ color: "#fff" }}>
                                    {property.area} م²
                                </Text>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ textAlign: "center", color: "#fff" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <TagOutlined />
                                    <div>السعر</div>
                                </div>
                                <Text strong style={{ color: "#fff" }}>
                                    {property.price} دينار
                                </Text>
                            </div>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 24 }}>
                        <Col span={12}>
                            <Button
                                block
                                icon={<EyeOutlined />}
                                size="large"
                                href="#photos"
                            >
                                عرض جميع الصور ({property.images?.length || 5})
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                type="primary"
                                block
                                icon={<PhoneOutlined />}
                                onClick={() => setInquiryModalVisible(true)}
                                size="large"
                            >
                                تواصل مع المعلن
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
            <Card style={{ margin: 20 }}>
                <Row gutter={[24, 24]}>
                    {/* Property Images would go here */}

                    {/* Property Description */}
                    <Col span={24}>
                        <Title level={4}>الوصف التفصيلي</Title>
                        <Paragraph>
                            شقة مفروشة بالكامل، تقع في منطقة رافية بعمان. تتميز
                            بإطلالة رائعة على المدينة، وقريبة من جميع الخدمات
                            الأساسية. الشقة حديثة البناء ومفروشة بالكامل، وتحتوي
                            على مطبخ مجهز، وغرفة معيشة واسعة، وغرفة نوم رئيسية،
                            وتكييف مركزي، وموقف سيارات خاص. المبنى مزود بنظام
                            أمان متطور ومصعد خاص.
                        </Paragraph>

                        <Divider />

                        <Space>
                            <Text>
                                <EyeOutlined /> 1243
                            </Text>
                            <Text>
                                <CalendarOutlined /> 15/04/2025
                            </Text>
                        </Space>

                        <Divider />

                        <Title level={4}>مميزات العقار</Title>
                        <Space wrap size="large">
                            {features.map((item, index) => (
                                <Space key={index} align="start">
                                    <DotChartOutlined
                                        style={{ color: "#52c41a" }}
                                    />
                                    <Text>{item}</Text>
                                </Space>
                            ))}
                        </Space>
                    </Col>
                </Row>
            </Card>
            <Card style={{ margin: 20 }}>
                <Row gutter={[24, 24]}>
                    {property.latitude && property.longitude && (
                        <>
                            <Title level={4}>الموقع</Title>
                            <div
                                style={{
                                    height: "300px",
                                    width: "100%",
                                    zIndex: 1,
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
                </Row>
            </Card>
            <Card style={{ margin: 20 }}>
                <Row gutter={[24, 24]} id="photos">
                    <Col xs={24} md={24}>
                        <Title level={4}>معرض الصور</Title>
                        <Image.PreviewGroup>
                            <Space
                                direction="vertical"
                                size="middle"
                                style={{ width: "100%" }}
                            >
                                {property.images &&
                                    property.images.length > 1 && (
                                        <Row gutter={[8, 8]}>
                                            {property.images
                                                .slice(1)
                                                .map((img, index) => (
                                                    <Col key={index} xs={6}>
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
                </Row>
            </Card>
            <Card style={{ margin: 20 }}>
                <Col>
                    <Title level={4}>معلومات المعلن</Title>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <Text>{property.user.name}</Text>
                        <Text>
                            {property.user.role == "agent"
                                ? " وكبل عقاري"
                                : property.user.role == "company"
                                ? "شركة ومطور عقاري"
                                : "مالك"}
                        </Text>
                    </div>
                </Col>
                <Row style={{ gap: 10 }}>
                    <Button
                        variant="filled"
                        style={{ flex: 1 }}
                        type="primary"
                        onClick={() => {
                            window.location.href = `tel:${property.user.phone}`; // make sure phone exists
                        }}
                    >
                        <PhoneOutlined />
                        اتصل الآن
                    </Button>

                    <Button
                        onClick={() => setInquiryModalVisible(true)}
                        style={{ flex: 1 }}
                    >
                        <CommentOutlined />
                        ارسل رسالة
                    </Button>
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#22C55E", flex: 1 }}
                        onClick={() => {
                            const phone = property.user.phone; // e.g., "249912345678"
                            const message = `مرحباً، أود الاستفسار عن العقار: ${window.location.href}`;
                            window.open(
                                `https://wa.me/${phone}?text=${encodeURIComponent(
                                    message
                                )}`,
                                "_blank"
                            );
                        }}
                    >
                        <WhatsAppOutlined />
                        تواصل عبر واتساب
                    </Button>
                </Row>
            </Card>
            <Card style={{ margin: 20 }}>
                <Title level={4}>مشاركة العقار</Title>
                <Row style={{ gap: 10 }}>
                    <Button
                        variant="filled"
                        style={{ flex: 1 }}
                        type="primary"
                        onClick={handleFacebookShare}
                    >
                        <FacebookFilled />
                        Facebook
                    </Button>
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#22C55E", flex: 1 }}
                        onClick={handleWhatsAppShare}
                    >
                        <WhatsAppOutlined />
                        واتساب
                    </Button>
                    <Button style={{ flex: 1 }} onClick={handleCopyLink}>
                        <CopyOutlined />
                        نسخ
                    </Button>
                </Row>
            </Card>
            {renderPropertySection(
                similarProperties,
                "عقارات مشابهة",
                <ShopOutlined />
            )}
            {/* Inquiry Modal */}
            <Modal
                title="Contact Property Owner"
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
                        name="message"
                        label="Message"
                        rules={[
                            {
                                required: true,
                                message: "Please enter your message",
                            },
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            // loading={router.page.props.processing}
                        >
                            Send Inquiry
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reservation Modal */}
            <Modal
                title={
                    property.purpose === "rent"
                        ? "Rent This Property"
                        : "Make an Offer"
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
                            label="Rental Period"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select rental dates",
                                },
                            ]}
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="price"
                        label="السعر "
                        rules={[
                            { required: true, message: "يرجى إدخال السعر" },
                        ]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="special_requests" label="Special Requests">
                        <Input.TextArea
                            rows={4}
                            placeholder="Any special requirements or notes..."
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            // loading={router.page.props.processing}
                        >
                            {property.purpose === "rent"
                                ? "Submit Rental Request"
                                : "Submit Offer"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PropertyDetails;
