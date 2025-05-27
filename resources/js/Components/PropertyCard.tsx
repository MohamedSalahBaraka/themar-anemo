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
            available: { color: "green", text: "Available" },
            sold: { color: "red", text: "Sold" },
            rejected: { color: "red", text: "Rejected" },
            pending: { color: "yellow", text: "Pending" },
            rented: { color: "blue", text: "Rented" },
            reserved: { color: "orange", text: "Reserved" },
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
                              <HomeOutlined /> {property.bedrooms || "N/A"} beds
                          </Space>,
                          <Space>
                              <EnvironmentOutlined />{" "}
                              {property.address?.split(",")[0] || "Location"}
                          </Space>,
                          <Text strong>{formatPrice(property.price)}</Text>,
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
                        {property.is_featured && (
                            <Tag color="gold">Featured</Tag>
                        )}
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
                                View Details
                            </Button>
                        </>
                    )
                }
            />
        </Card>
    );
};

export default PropertyCard;
