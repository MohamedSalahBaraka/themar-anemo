import React from "react";
import { Card, Tag, Button, Space } from "antd";
import { ApiOutlined, TagOutlined } from "@ant-design/icons";
import { router } from "@inertiajs/react";
import { Service } from "@/types/Services";

const { Meta } = Card;

interface ServiceCardProps {
    service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const truncateDescription = (text?: string | null) => {
        if (!text) return "";
        return text.length > 100 ? text.substring(0, 100) + "..." : text;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const navigateToService = () => {
        router.visit(route("services.show", service.id));
    };

    return (
        <Card
            hoverable
            className="service-card"
            cover={
                <div className="service-image-placeholder">
                    <ApiOutlined style={{ fontSize: 48, color: "#999" }} />
                </div>
            }
            actions={[
                <Button
                    type="primary"
                    block
                    onClick={navigateToService}
                    key="learn-more"
                >
                    Learn More
                </Button>,
            ]}
        >
            <Meta
                title={service.name}
                description={
                    <div className="service-meta">
                        {service.category && (
                            <div className="service-category">
                                <Tag color="blue">
                                    <Space>
                                        {service.category.icon_url ? (
                                            <img
                                                src={service.category.icon_url}
                                                alt={service.category.name}
                                                style={{
                                                    width: 100,
                                                    height: 100,
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <TagOutlined />
                                        )}
                                        {service.category.name}
                                    </Space>
                                </Tag>
                            </div>
                        )}

                        {service.price && (
                            <div className="service-price">
                                <strong>{formatPrice(service.price)}</strong>
                            </div>
                        )}

                        {/* <div
                            className="service-description"
                            dangerouslySetInnerHTML={{
                                __html: truncateDescription(
                                    service.description
                                ),
                            }}
                        /> */}

                        {service.tags && service.tags.length > 0 && (
                            <div className="service-tags">
                                {service.tags.map((tag) => (
                                    <Tag key={tag} color="geekblue">
                                        {tag}
                                    </Tag>
                                ))}
                            </div>
                        )}
                    </div>
                }
            />
        </Card>
    );
};

export default ServiceCard;

// CSS Styles (can be moved to a separate CSS file or CSS-in-JS solution)
const styles = `
  .service-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .service-card .ant-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .service-card .ant-card-meta {
    flex: 1;
  }

  .service-card .ant-card-actions {
    padding: 12px;
  }

  .service-image-placeholder {
    height: 160px;
    background-color: #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .service-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .service-description {
    color: rgba(0, 0, 0, 0.65);
    margin: 8px 0;
  }

  .service-tags {
    margin-top: 8px;
  }
`;

// Inject styles
const styleElement = document.createElement("style");
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
