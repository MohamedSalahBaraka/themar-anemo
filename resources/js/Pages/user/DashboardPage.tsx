// src/pages/user/DashboardPage.tsx
import React from "react";
import { usePage } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    Typography,
    Statistic,
    Progress,
    Space,
    Button,
    Divider,
    List,
    Tag,
    Badge,
} from "antd";
import {
    HomeOutlined,
    EyeOutlined,
    MessageOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import PropertyCard from "@/Components/PropertyCard";
import { PageProps } from "@/types";
import AppLayout from "@/Layouts/Layout";

const { Title, Text } = Typography;
const { Countdown } = Statistic;

interface DashboardPageProps extends PageProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
    stats: {
        active_listings: number;
        total_views: number;
        total_inquiries: number;
    };
    subscription: {
        id: string;
        plan_name: string;
        status: "active" | "expired" | "canceled";
        expires_at: string;
        features: string[];
    } | null;
    properties: any[];
}

const DashboardPage: React.FC = () => {
    const { props } = usePage<DashboardPageProps>();
    const { user, stats, subscription, properties } = props;

    const getSubscriptionStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            active: { color: "green", text: "Active" },
            expired: { color: "red", text: "Expired" },
            canceled: { color: "orange", text: "Canceled" },
        };
        return (
            <Tag color={statusMap[status]?.color || "default"}>
                {statusMap[status]?.text || status}
            </Tag>
        );
    };

    return (
        <AppLayout>
            <div className="dashboard-page" style={{ padding: "24px" }}>
                <Title level={2}>Dashboard</Title>
                <Text type="secondary">
                    Welcome back, {user?.name || "User"}!
                </Text>

                <Divider />

                {/* Stats Overview */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Active Listings"
                                value={stats?.active_listings || 0}
                                prefix={<HomeOutlined />}
                            />
                            <Button
                                type="link"
                                href={route("user.properties.index")}
                                style={{ paddingLeft: 0 }}
                            >
                                View all properties
                            </Button>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Total Views"
                                value={stats?.total_views || 0}
                                prefix={<EyeOutlined />}
                            />
                            <Progress
                                percent={Math.min(
                                    ((stats?.total_views || 0) / 100) * 100,
                                    100
                                )}
                                size="small"
                                status="active"
                                style={{ marginTop: "8px" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card>
                            <Statistic
                                title="Inquiries"
                                value={stats?.total_inquiries || 0}
                                prefix={<MessageOutlined />}
                            />
                            <Button
                                type="link"
                                href={route("user.inquiries.index")}
                                style={{ paddingLeft: 0 }}
                            >
                                View inquiries
                            </Button>
                        </Card>
                    </Col>
                </Row>

                {/* Subscription Status */}
                <Card
                    title="Subscription Plan"
                    style={{ marginBottom: "24px" }}
                    extra={
                        <Space>
                            {subscription?.status === "active" ? (
                                <Countdown
                                    title="Expires in"
                                    value={subscription.expires_at}
                                    prefix={<ClockCircleOutlined />}
                                    format="D day H hour"
                                />
                            ) : (
                                <Button
                                    type="primary"
                                    href={route("user.subscription.index")}
                                >
                                    Upgrade Plan
                                </Button>
                            )}
                        </Space>
                    }
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Space direction="vertical">
                                <Title
                                    level={4}
                                    style={{ marginBottom: "4px" }}
                                >
                                    {subscription?.plan_name ||
                                        "No active subscription"}
                                    {subscription && (
                                        <span style={{ marginLeft: "8px" }}>
                                            {getSubscriptionStatusTag(
                                                subscription.status
                                            )}
                                        </span>
                                    )}
                                </Title>

                                {subscription ? (
                                    <>
                                        <Text type="secondary">
                                            <DollarOutlined />{" "}
                                            {subscription.status === "active"
                                                ? "Active"
                                                : "Inactive"}{" "}
                                            plan
                                        </Text>
                                    </>
                                ) : (
                                    <Text type="secondary">
                                        You don't have an active subscription
                                    </Text>
                                )}
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <div
                                style={{
                                    background: "#f0f2f5",
                                    padding: "16px",
                                    borderRadius: "8px",
                                }}
                            >
                                <Title
                                    level={5}
                                    style={{ marginBottom: "16px" }}
                                >
                                    Subscription Benefits
                                </Title>
                                <Space direction="vertical">
                                    <Text>
                                        <CheckCircleOutlined /> Priority listing
                                        in search results
                                    </Text>
                                    <Text>
                                        <CheckCircleOutlined /> Unlimited
                                        property uploads
                                    </Text>
                                    <Text>
                                        <CheckCircleOutlined /> Detailed
                                        analytics dashboard
                                    </Text>
                                    <Text>
                                        <CheckCircleOutlined /> Dedicated
                                        support
                                    </Text>
                                </Space>
                                <Button
                                    type="primary"
                                    style={{ marginTop: "16px" }}
                                    href={route("user.subscription.index")}
                                >
                                    {subscription
                                        ? "Manage Subscription"
                                        : "Choose a Plan"}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Recent Properties */}
                <Card
                    title="Your Recent Listings"
                    // extra={
                    //     <Button
                    //         type="primary"
                    //         icon={<PlusOutlined />}
                    //         href={route("user.properties.create")}
                    //     >
                    //         Add New Property
                    //     </Button>
                    // }
                >
                    {properties.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px" }}>
                            <Title level={4} type="secondary">
                                You haven't listed any properties yet
                            </Title>
                            {/* <Button
                            type="primary"
                            href={route("user.properties.create")}
                        >
                            List Your First Property
                        </Button> */}
                        </div>
                    ) : (
                        <Row gutter={[16, 16]}>
                            {properties.slice(0, 4).map((property) => (
                                <Col
                                    xs={24}
                                    sm={12}
                                    md={12}
                                    lg={8}
                                    xl={6}
                                    key={property.id}
                                >
                                    <PropertyCard
                                        property={property}
                                        actions={[
                                            <Button
                                                type="link"
                                                href={route(
                                                    "user.properties.edit",
                                                    property.id
                                                )}
                                            >
                                                Edit
                                            </Button>,
                                            <Button
                                                type="link"
                                                href={route(
                                                    "properties.show",
                                                    property.id
                                                )}
                                            >
                                                View
                                            </Button>,
                                        ]}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
};

export default DashboardPage;
