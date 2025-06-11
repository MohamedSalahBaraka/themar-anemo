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
import { useLanguage } from "@/contexts/LanguageContext";

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
        total_reservations: number;
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

const DashboardPage: React.FC = () => (
    <AppLayout>
        <Page />
    </AppLayout>
);

const Page: React.FC = () => {
    const { props } = usePage<DashboardPageProps>();
    const { user, stats, subscription, properties } = props;
    const { t } = useLanguage();

    const getSubscriptionStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            active: { color: "green", text: t("active") },
            expired: { color: "red", text: t("expired") },
            canceled: { color: "orange", text: t("canceled") },
        };
        return (
            <Tag color={statusMap[status]?.color || "default"}>
                {statusMap[status]?.text || status}
            </Tag>
        );
    };

    return (
        <div className="dashboard-page" style={{ padding: "24px" }}>
            <Title level={2}>{t("dashboard")}</Title>
            <Text type="secondary">
                {t("welcome_back")}, {user?.name || t("user")}!
            </Text>

            <Divider />

            {/* Statistics Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("active_listings")}
                            value={stats?.active_listings || 0}
                            prefix={<HomeOutlined />}
                        />
                        <Button
                            type="link"
                            href={route("user.properties.index")}
                            style={{ paddingLeft: 0 }}
                        >
                            {t("view_all_properties")}
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("total_views")}
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
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("inquiries")}
                            value={stats?.total_inquiries || 0}
                            prefix={<MessageOutlined />}
                        />
                        <Button
                            type="link"
                            href={route("user.inquiries.index")}
                            style={{ paddingLeft: 0 }}
                        >
                            {t("view_inquiries")}
                        </Button>
                    </Card>
                </Col>
                {/* <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("reservations")}
                            value={stats?.total_reservations || 0}
                            prefix={<MessageOutlined />}
                        />
                        <Button
                            type="link"
                            href={route("user.reservations")}
                            style={{ paddingLeft: 0 }}
                        >
                            {t("view_reservations")}
                        </Button>
                    </Card>
                </Col> */}
            </Row>

            {/* Subscription Status */}
            <Card
                title={t("subscription_plan")}
                style={{ marginBottom: "24px" }}
                extra={
                    <Space>
                        {subscription?.status == "active" ? (
                            <Countdown
                                title={t("expires_in")}
                                value={subscription.expires_at}
                                prefix={<ClockCircleOutlined />}
                                format={`D ${t("days")} H ${t("hours")}`}
                            />
                        ) : (
                            <Button
                                type="primary"
                                href={route("user.subscription.index")}
                            >
                                {t("upgrade_plan")}
                            </Button>
                        )}
                    </Space>
                }
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Space direction="vertical">
                            <Title level={4} style={{ marginBottom: "4px" }}>
                                {subscription?.plan_name ||
                                    t("no_active_subscription")}
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
                                            ? t("active_plan")
                                            : t("inactive_plan")}{" "}
                                    </Text>
                                </>
                            ) : (
                                <Text type="secondary">
                                    {t("no_active_subscription")}
                                </Text>
                            )}
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <div
                            style={{
                                // background: "#f0f2f5",
                                padding: "16px",
                                borderRadius: "8px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Title level={5} style={{ marginBottom: "16px" }}>
                                {t("subscription_features")}
                            </Title>
                            <Space direction="vertical">
                                {subscription?.features?.length ? (
                                    subscription.features.map(
                                        (feature, index) => (
                                            <Text key={index}>
                                                <CheckCircleOutlined />{" "}
                                                {feature}
                                            </Text>
                                        )
                                    )
                                ) : (
                                    <>
                                        <Text>
                                            <CheckCircleOutlined />{" "}
                                            {t("priority_search")}
                                        </Text>
                                        <Text>
                                            <CheckCircleOutlined />{" "}
                                            {t("unlimited_listings")}
                                        </Text>
                                        <Text>
                                            <CheckCircleOutlined />{" "}
                                            {t("detailed_analytics")}
                                        </Text>
                                        <Text>
                                            <CheckCircleOutlined />{" "}
                                            {t("dedicated_support")}
                                        </Text>
                                    </>
                                )}
                            </Space>
                            <Button
                                type="primary"
                                style={{ marginTop: "16px" }}
                                href={route("user.subscription.index")}
                            >
                                {subscription
                                    ? t("manage_subscription")
                                    : t("choose_plan")}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Recent Properties */}
            <Card title={t("recent_properties")}>
                {properties.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                        <Title level={4} type="secondary">
                            {t("no_properties_listed")}
                        </Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            href={route("user.properties.create")}
                            style={{ marginTop: "16px" }}
                        >
                            {t("add_property")}
                        </Button>
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
                                            {t("edit")}
                                        </Button>,
                                        <Button
                                            type="link"
                                            href={route(
                                                "properties.show",
                                                property.id
                                            )}
                                        >
                                            {t("view")}
                                        </Button>,
                                    ]}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>
        </div>
    );
};

export default DashboardPage;
