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
    InputNumber,
    Empty,
} from "antd";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    CalendarOutlined,
    HomeOutlined,
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

import { FaBath } from "react-icons/fa";
import FrontLayout from "@/Layouts/FrontLayout";
import Meta from "antd/es/card/Meta";
import { useLanguage } from "@/contexts/LanguageContext";

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
    const { t, language } = useLanguage();
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
                        t("Your inquiry has been submitted successfully!")
                    );
                    setInquiryModalVisible(false);
                    inquiryForm.resetFields();
                },
                onError: () => {
                    message.error(
                        t("Failed to submit inquiry. Please try again.")
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
                            ? t(
                                  "Your rental request has been submitted successfully!"
                              )
                            : t(
                                  "Your purchase request has been submitted successfully!"
                              )
                    );
                    setReservationModalVisible(false);
                    reservationForm.resetFields();
                },
                onError: () => {
                    message.error(
                        t("Failed to submit inquiry. Please try again.")
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
            text={t("Featured")}
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
                        <span
                            className={`absolute top-1 ${
                                language === "ar" ? `left-1` : "right-1"
                            }  px-1.5 py-0.5 rounded text-xs font-medium text-white ${
                                property.purpose === "sale"
                                    ? "bg-blue-600"
                                    : "bg-green-600"
                            }`}
                        >
                            {property.purpose === "sale"
                                ? t("For Sale")
                                : t("For Rent")}
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
                                        t("Location not specified")}
                                </Text>
                            </Space>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space size="large">
                                <Space>
                                    <HomeOutlined />
                                    {property.bedrooms ||
                                        t("Not specified")}{" "}
                                    {t("Rooms")}
                                </Space>
                                <Space>
                                    <FaBath />
                                    {property.bathrooms ||
                                        t("Not specified")}{" "}
                                    {t("Bathrooms")}
                                </Space>
                                <Space>
                                    <ArrowsAltOutlined />
                                    {property.area
                                        ? `${property.area} m²`
                                        : t("Not specified")}
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
                <Empty
                    description={`${t("No")} ${title} ${t(
                        "available currently"
                    )}`}
                />
            )}
        </section>
    );
    type StatusKey = "available" | "sold" | "rented" | "reserved";
    type TypeKey = "apartment" | "villa" | "land" | "office";

    const getStatusTag = (status: string) => {
        const statusMap: Record<StatusKey, { color: string; text: string }> = {
            available: { color: "green", text: t("Available") },
            sold: { color: "red", text: t("Sold") },
            rented: { color: "blue", text: t("Rented") },
            reserved: { color: "orange", text: t("Reserved") },
        };
        const key = status as StatusKey;
        return <Tag color={statusMap[key]?.color}>{statusMap[key]?.text}</Tag>;
    };

    const getTypeTag = (type: string) => {
        const typeMap: Record<TypeKey, { color: string; text: string }> = {
            apartment: { color: "purple", text: t("Apartment") },
            villa: { color: "gold", text: t("Villa") },
            land: { color: "cyan", text: t("Land") },
            office: { color: "blue", text: t("Office") },
        };
        const key = type as TypeKey;
        return <Tag color={typeMap[key]?.color}>{typeMap[key]?.text}</Tag>;
    };

    const handleFacebookShare = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            "_blank"
        );
    };
    const handleWhatsAppShare = () => {
        const url = window.location.href;
        const text =
            t("Maskan, your real estate guide, browse this property:") +
            ` ${url}`;
        window.open(
            `https://wa.me/?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    };
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            message.success(t("Link copied successfully!"));
        } catch (err) {
            message.error(t("An error occurred while copying the link"));
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
                        ...(language === "ar" ? { right: 40 } : { left: 40 }),
                        maxWidth: 500,
                        borderRadius: 12,
                        padding: 24,
                        ...(language === "en" && {
                            fontFamily: "Arial, sans-serif",
                        }),
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
                        {property.city?.title && property.city?.title + ", "}
                        {property.address || t("7th Circle, Amman")}
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
                                    <div>{t("Bathrooms")}</div>
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
                                    <div>{t("Rooms")}</div>
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
                                    <div>{t("Area")}</div>
                                </div>
                                <Text strong style={{ color: "#fff" }}>
                                    {property.area} m²
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
                                    <div>{t("Price")}</div>
                                </div>
                                <Text strong style={{ color: "#fff" }}>
                                    {property.price} {t("JOD")}
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
                                {t("View all photos")} (
                                {property.images?.length || 5})
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
                                {t("Contact advertiser")}
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="container mx-auto px-4 py-6">
                <Card style={{ margin: 20 }}>
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <Title level={4}>{t("Detailed Description")}</Title>
                            <Paragraph>{property.description}</Paragraph>

                            <Divider />

                            <Space>
                                <Text>
                                    <EyeOutlined /> {property.views_count}
                                </Text>
                                <Text>
                                    <CalendarOutlined />{" "}
                                    {new Date(
                                        property.created_at
                                    ).toDateString()}
                                </Text>
                            </Space>

                            <Divider />

                            <Title level={4}>{t("Property Features")}</Title>
                            <Space wrap size="large">
                                {property.features?.map((item, index) => (
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
                                <Title level={4}>{t("Location")}</Title>
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
                            <Title level={4}>{t("Photo Gallery")}</Title>
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
                        <Title level={4}>{t("Advertiser Information")}</Title>
                        <div
                            style={{ display: "flex", flexDirection: "column" }}
                        >
                            <Text>{property.user.name}</Text>
                            <Text>
                                {property.user.role == "agent"
                                    ? t("Real estate agent")
                                    : property.user.role == "company"
                                    ? t("Real estate company and developer")
                                    : t("Owner")}
                            </Text>
                        </div>
                    </Col>
                    <Row style={{ gap: 10 }}>
                        <Button
                            variant="filled"
                            style={{ flex: 1 }}
                            type="primary"
                            onClick={() => {
                                window.location.href = `tel:${property.user.phone}`;
                            }}
                        >
                            <PhoneOutlined />
                            {t("Call now")}
                        </Button>

                        <Button
                            onClick={() => setInquiryModalVisible(true)}
                            style={{ flex: 1 }}
                        >
                            <CommentOutlined />
                            {t("Send message")}
                        </Button>
                        <Button
                            type="primary"
                            style={{ backgroundColor: "#22C55E", flex: 1 }}
                            onClick={() => {
                                const phone = property.user.phone;
                                const message = `${t(
                                    "Hello, I would like to inquire about the property:"
                                )} ${window.location.href}`;
                                window.open(
                                    `https://wa.me/${phone}?text=${encodeURIComponent(
                                        message
                                    )}`,
                                    "_blank"
                                );
                            }}
                        >
                            <WhatsAppOutlined />
                            {t("Contact via WhatsApp")}
                        </Button>
                    </Row>
                </Card>
                <Card style={{ margin: 20 }}>
                    <Title level={4}>{t("Share Property")}</Title>
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
                            WhatsApp
                        </Button>
                        <Button style={{ flex: 1 }} onClick={handleCopyLink}>
                            <CopyOutlined />
                            {t("Copy")}
                        </Button>
                    </Row>
                </Card>
                {renderPropertySection(
                    similarProperties,
                    t("Similar Properties"),
                    <ShopOutlined />
                )}
            </div>
            {/* Inquiry Modal */}
            <Modal
                title={t("Contact Property Owner")}
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
                        label={t("Message")}
                        rules={[
                            {
                                required: true,
                                message: t("Please enter your message"),
                            },
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {t("Send Inquiry")}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reservation Modal */}
            <Modal
                title={
                    property.purpose === "rent"
                        ? t("Rent This Property")
                        : t("Make an Offer")
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
                            label={t("Rental Period")}
                            rules={[
                                {
                                    required: true,
                                    message: t("Please select rental dates"),
                                },
                            ]}
                        >
                            <RangePicker style={{ width: "100%" }} />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="price"
                        label={t("Price")}
                        rules={[
                            {
                                required: true,
                                message: t("Please enter the price"),
                            },
                        ]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="special_requests"
                        label={t("Special Requests")}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder={t(
                                "Any special requirements or notes..."
                            )}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {property.purpose === "rent"
                                ? t("Submit Rental Request")
                                : t("Submit Offer")}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PropertyDetails;
