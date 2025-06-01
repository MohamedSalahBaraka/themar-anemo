// src/components/PropertyCard.tsx
import React from "react";
import { Card, Typography, Tag, Space, Button } from "antd";
import {
    DollarOutlined,
    EnvironmentOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import { Property } from "@/types/property";
import { router } from "@inertiajs/react";

const { Meta } = Card;
const { Text, Title } = Typography;

interface PropertyCardProps {
    property: Property;
    mode?: "grid" | "list";
    actions?: React.ReactNode[];
}

const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    mode = "grid",
    actions,
}) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusTag = (status: Property["status"]) => {
        const statusMap = {
            available: { color: "green", text: "متاح" },
            sold: { color: "red", text: "مباع" },
            rejected: { color: "red", text: "مرفوض" },
            pending: { color: "yellow", text: "قيد الانتظار" },
            rented: { color: "blue", text: "مؤجر" },
            reserved: { color: "orange", text: "محجوز" },
        };
        return (
            <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
        );
    };

    const handleViewDetails = () => {
        router.get(route("properties.show", { property: property.id }));
    };

    return (
        <Card
            hoverable
            cover={
                <div
                    style={{
                        height: mode === "grid" ? "200px" : "100%",
                        overflow: "hidden",
                    }}
                >
                    <img
                        alt={property.title}
                        src={
                            property.images?.length
                                ? `${window.location.origin}/storage/${property.images[0].image_url}`
                                : "/placeholder-property.jpg"
                        }
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </div>
            }
            actions={
                actions || mode === "grid"
                    ? [
                          <Space>
                              <HomeOutlined /> {property.bedrooms || "N/A"} غرف
                          </Space>,
                          <Space>
                              <EnvironmentOutlined />{" "}
                              {property.address?.split(",")[0] || "موقع"}
                          </Space>,
                          <Title level={1} style={{ color: "#5275B9" }}>
                              {formatPrice(property.price)}
                          </Title>,
                      ]
                    : undefined
            }
            onClick={mode === "grid" ? handleViewDetails : undefined}
        >
            <Meta
                title={
                    <Space>
                        <Text
                            ellipsis={{ tooltip: property.title }}
                            style={{ maxWidth: "200px" }}
                        >
                            {property.title}
                        </Text>
                        {getStatusTag(property.status)}
                        {property.is_featured && <Tag color="gold">مميز</Tag>}
                    </Space>
                }
                description={
                    mode === "grid" ? (
                        <Text>{property.description}</Text>
                    ) : (
                        <>
                            <Text>{property.description}</Text>
                            <Button
                                type="primary"
                                style={{ marginTop: "12px" }}
                                onClick={handleViewDetails}
                            >
                                عرض التفاصيل
                            </Button>
                        </>
                    )
                }
            />
        </Card>
    );
};

export default PropertyCard;
