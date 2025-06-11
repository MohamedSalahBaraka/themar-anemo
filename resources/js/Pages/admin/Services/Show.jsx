// resources/js/Pages/Services/Show.jsx
import React from "react";
import { router } from "@inertiajs/react";
import {
    PageHeader,
    Row,
    Col,
    Card,
    Tag,
    Button,
    Descriptions,
    List,
    Avatar,
    Icon,
} from "antd";

const { Item: DescriptionsItem } = Descriptions;
const { Meta: ListItemMeta } = List.Item;
const ServiceDetailsPage = ({ service, relatedServices }) => (
    <AdminLayout>
        <Page service={service} relatedServices={relatedServices} />
    </AdminLayout>
);
const Page = ({ service, relatedServices }) => {
    const formatDescription = (text) => {
        if (!text) return "";
        return text.replace(/\n/g, "<br>");
    };

    const truncateDescription = (text) => {
        if (!text) return "";
        return text.length > 100 ? text.substring(0, 100) + "..." : text;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const applyForService = () => {
        router.visit(route("services.apply", service.id));
    };

    const navigateToService = (serviceId) => {
        router.visit(route("services.show", serviceId));
    };

    return (
        <div className="service-details-page">
            <PageHeader
                title={service.name}
                subTitle={service.category?.name}
                onBack={() => router.visit(route("services.index"))}
            />

            <div className="service-details-container">
                <Row gutter={24}>
                    {/* Main Content */}
                    <Col span={24} lg={16}>
                        <Card>
                            <div
                                className="service-description"
                                dangerouslySetInnerHTML={{
                                    __html: formatDescription(
                                        service.description
                                    ),
                                }}
                            />

                            {service.tags && service.tags.length > 0 && (
                                <div className="service-tags">
                                    {service.tags.map((tag) => (
                                        <Tag key={tag} color="geekblue">
                                            {tag}
                                        </Tag>
                                    ))}
                                </div>
                            )}

                            <div className="service-actions mt-4">
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={applyForService}
                                >
                                    اطلب الان
                                </Button>
                            </div>
                        </Card>

                        {/* Requirements Section */}
                        {service.requirements && (
                            <Card title="Requirements" className="mt-4">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: formatDescription(
                                            service.requirements
                                        ),
                                    }}
                                />
                            </Card>
                        )}
                    </Col>

                    {/* Sidebar */}
                    <Col span={24} lg={8}>
                        <Card
                            title="Service Details"
                            className="service-details-sidebar"
                        >
                            <Descriptions layout="vertical" bordered>
                                <DescriptionsItem label="Category">
                                    <Tag color="blue">
                                        <Icon
                                            type={
                                                service.category?.icon || "tag"
                                            }
                                        />
                                        {service.category?.name || "N/A"}
                                    </Tag>
                                </DescriptionsItem>

                                {service.price && (
                                    <DescriptionsItem label="Price">
                                        <div className="service-price">
                                            <strong>
                                                {formatPrice(service.price)}
                                            </strong>
                                        </div>
                                    </DescriptionsItem>
                                )}

                                {service.processing_time && (
                                    <DescriptionsItem label="Processing Time">
                                        {service.processing_time}
                                    </DescriptionsItem>
                                )}

                                <DescriptionsItem label="Last Updated">
                                    {formatDate(service.updated_at)}
                                </DescriptionsItem>
                            </Descriptions>
                        </Card>

                        {/* Related Services */}
                        {relatedServices.length > 0 && (
                            <Card title="Related Services" className="mt-4">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={relatedServices}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="link"
                                                    onClick={() =>
                                                        navigateToService(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    عرض
                                                </Button>,
                                            ]}
                                        >
                                            <ListItemMeta
                                                avatar={
                                                    <Avatar
                                                        src={item.image_url}
                                                        icon={
                                                            !item.image_url
                                                                ? "api"
                                                                : undefined
                                                        }
                                                    />
                                                }
                                                title={item.name}
                                                description={truncateDescription(
                                                    item.description
                                                )}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}
                    </Col>
                </Row>
            </div>

            <style jsx>{`
                .service-details-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 16px;
                }

                .service-description {
                    line-height: 1.6;
                }

                .service-tags {
                    margin-top: 16px;
                }

                .service-actions {
                    display: flex;
                    justify-content: center;
                }

                .service-details-sidebar
                    :global(.ant-descriptions-item-content) {
                    display: flex;
                    align-items: center;
                }

                .service-price {
                    font-size: 18px;
                }
            `}</style>
        </div>
    );
};

export default ServiceDetailsPage;
