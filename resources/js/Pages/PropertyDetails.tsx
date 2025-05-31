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
import FrontLayout from "@/Layouts/FrontLayout";

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
    price: number;
}
const PropertyDetails: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
const Page: React.FC = () => {
    const { props } = usePage<PropertyDetailsPageProps>();
    const { property, isLoggedIn } = props;
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

    return (
        <div className="property-details-page" style={{ padding: "24px" }}>
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
                    {/* Property Images */}
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

                    {/* Property Details */}
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
                                    {property.address ||
                                        "Address not specified"}
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
                                            ? "For Rent"
                                            : "For Sale"}
                                    </Tag>
                                </div>
                            </div>

                            <Divider />

                            <Descriptions bordered column={1}>
                                <Item label="Price">
                                    <Text strong>
                                        ${property.price.toLocaleString()}
                                        {property.purpose === "rent" &&
                                            " / month"}
                                    </Text>
                                </Item>
                                {property.area && (
                                    <Item label="Area">
                                        {property.area} sq.ft
                                    </Item>
                                )}
                                {property.bedrooms && (
                                    <Item label="Bedrooms">
                                        <FaBed /> {property.bedrooms}
                                    </Item>
                                )}
                                {property.bathrooms && (
                                    <Item label="Bathrooms">
                                        <FaBath /> {property.bathrooms}
                                    </Item>
                                )}
                                {property.floor && (
                                    <Item label="Floor">
                                        <HomeOutlined /> {property.floor}
                                    </Item>
                                )}
                                {property.published_at && (
                                    <Item label="Published">
                                        <CalendarOutlined />{" "}
                                        {dayjs(property.published_at).format(
                                            "MMMM D, YYYY"
                                        )}
                                    </Item>
                                )}
                            </Descriptions>

                            <Divider />

                            <Title level={4}>Description</Title>
                            <Paragraph>{property.description}</Paragraph>

                            {/* {property.features &&
                                property.features.length > 0 && (
                                    <>
                                        <Divider />
                                        <Title level={4}>Features</Title>
                                        <Space size={[8, 8]} wrap>
                                            {property.features.map(
                                                (feature, index) => (
                                                    <Tag key={index}>
                                                        {feature}
                                                    </Tag>
                                                )
                                            )}
                                        </Space>
                                    </>
                                )} */}

                            {property.latitude && property.longitude && (
                                <>
                                    <Divider />
                                    <Title level={4}>Location</Title>
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
                                {user && user.id == property.user_id ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        href={route(
                                            "user.properties.edit",
                                            property.id
                                        )}
                                    >
                                        Edit
                                    </Button>
                                ) : (
                                    <>
                                        {property.status === "available" ||
                                        isLoggedIn ? (
                                            <>
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    onClick={() =>
                                                        setInquiryModalVisible(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Contact Owner
                                                </Button>
                                                <Button
                                                    type="default"
                                                    size="large"
                                                    onClick={() =>
                                                        setReservationModalVisible(
                                                            true
                                                        )
                                                    }
                                                >
                                                    {property.purpose === "rent"
                                                        ? "Rent Now"
                                                        : "Make Offer"}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Text>
                                                    {!isLoggedIn &&
                                                        "you need to register to make offers and inquires "}

                                                    {
                                                        // @ts-ignore
                                                        property.status !==
                                                            "available" &&
                                                            "the property isn't available to make offers and inquires"
                                                    }
                                                </Text>
                                            </>
                                        )}
                                    </>
                                )}
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>

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
