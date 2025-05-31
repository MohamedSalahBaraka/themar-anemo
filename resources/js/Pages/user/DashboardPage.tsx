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

const DashboardPage: React.FC = () => {
    const { props } = usePage<DashboardPageProps>();
    const { user, stats, subscription, properties } = props;

    const getSubscriptionStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            active: { color: "green", text: "نشط" },
            expired: { color: "red", text: "منتهي" },
            canceled: { color: "orange", text: "ملغي" },
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
                <Title level={2}>لوحة التحكم</Title>
                <Text type="secondary">
                    أهلاً بعودتك، {user?.name || "مستخدم"}!
                </Text>

                <Divider />

                {/* نظرة عامة على الإحصائيات */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="العقارات النشطة"
                                value={stats?.active_listings || 0}
                                prefix={<HomeOutlined />}
                            />
                            <Button
                                type="link"
                                href={route("user.properties.index")}
                                style={{ paddingLeft: 0 }}
                            >
                                عرض جميع العقارات
                            </Button>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="عدد المشاهدات"
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
                                title="الاستفسارات"
                                value={stats?.total_inquiries || 0}
                                prefix={<MessageOutlined />}
                            />
                            <Button
                                type="link"
                                href={route("user.inquiries.index")}
                                style={{ paddingLeft: 0 }}
                            >
                                عرض الاستفسارات
                            </Button>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="طلبات الحجز"
                                value={stats?.total_reservations || 0}
                                prefix={<MessageOutlined />}
                            />
                            <Button
                                type="link"
                                href={route("user.reservations")}
                                style={{ paddingLeft: 0 }}
                            >
                                عرض الحجوزات
                            </Button>
                        </Card>
                    </Col>
                </Row>

                {/* حالة الاشتراك */}
                <Card
                    title="باقة الاشتراك"
                    style={{ marginBottom: "24px" }}
                    extra={
                        <Space>
                            {subscription?.status === "active" ? (
                                <Countdown
                                    title="تنتهي خلال"
                                    value={subscription.expires_at}
                                    prefix={<ClockCircleOutlined />}
                                    format="D يوم H ساعة"
                                />
                            ) : (
                                <Button
                                    type="primary"
                                    href={route("user.subscription.index")}
                                >
                                    ترقية الباقة
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
                                        "لا يوجد اشتراك نشط"}
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
                                                ? "باقة نشطة"
                                                : "باقة غير نشطة"}{" "}
                                        </Text>
                                    </>
                                ) : (
                                    <Text type="secondary">
                                        ليس لديك اشتراك نشط
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
                                    مميزات الاشتراك
                                </Title>
                                <Space direction="vertical">
                                    <Text>
                                        <CheckCircleOutlined /> أولوية الظهور في
                                        نتائج البحث
                                    </Text>
                                    <Text>
                                        <CheckCircleOutlined /> رفع عدد غير
                                        محدود من العقارات
                                    </Text>
                                    <Text>
                                        <CheckCircleOutlined /> لوحة تحليل
                                        بيانات مفصلة
                                    </Text>
                                    <Text>
                                        <CheckCircleOutlined /> دعم فني مخصص
                                    </Text>
                                </Space>
                                <Button
                                    type="primary"
                                    style={{ marginTop: "16px" }}
                                    href={route("user.subscription.index")}
                                >
                                    {subscription
                                        ? "إدارة الاشتراك"
                                        : "اختر باقة"}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* أحدث العقارات */}
                <Card title="أحدث عقاراتك">
                    {properties.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px" }}>
                            <Title level={4} type="secondary">
                                لم تقم بإدراج أي عقارات حتى الآن
                            </Title>
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
                                                تعديل
                                            </Button>,
                                            <Button
                                                type="link"
                                                href={route(
                                                    "properties.show",
                                                    property.id
                                                )}
                                            >
                                                عرض
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
