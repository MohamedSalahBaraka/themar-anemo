// src/pages/admin/Dashboard.tsx
import React, { useState } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Statistic,
    Space,
    DatePicker,
    Select,
    Divider,
    Spin,
} from "antd";
import {
    UserOutlined,
    HomeOutlined,
    DollarOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from "chart.js";
import { usePage } from "@inertiajs/react";
import { AdminDashboardProps } from "@/types/admin";
import AdminLayout from "@/Layouts/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ChartTitle,
    Tooltip,
    Legend
);

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const AdminDashboard: React.FC = () => (
    <AdminLayout>
        <Page />
    </AdminLayout>
);
const Page: React.FC = () => {
    const [timeRange, setTimeRange] = useState<string>("7days");
    const [dateRange, setDateRange] = useState<any>(null);

    const { t } = useLanguage();
    const { stats, revenueData, userGrowth } =
        usePage<AdminDashboardProps>().props;

    const revenueChartData = {
        labels: revenueData.map((item) => item.date),
        datasets: [
            {
                label: t("daily_revenue"),
                data: revenueData.map((item) => item.total),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };

    const userGrowthData = {
        labels: [
            t("january"),
            t("february"),
            t("march"),
            t("april"),
            t("may"),
            t("june"),
            t("july"),
            t("august"),
            t("september"),
            t("october"),
            t("november"),
            t("december"),
        ],
        datasets: [
            {
                label: t("new_users"),
                data: userGrowth, // Comes from backend
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: t("revenue_overview"),
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: any) => `$${value}`,
                },
            },
        },
    };

    return (
        <div className="admin-dashboard" style={{ padding: "24px" }}>
            <Title level={2}>{t("admin_dashboard")}</Title>

            {/* بطاقات الإحصائيات */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("total_users")}
                            value={stats?.users_count || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("total_properties")}
                            value={stats?.properties_count || 0}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("active_listings")}
                            value={stats?.active_listings || 0}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={t("30days_revenue")}
                            value={stats?.revenue_30days || 0}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                            prefixCls="dollar"
                            formatter={(value) => `$${value}`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* الفلاتر */}
            {/* <Card style={{ marginBottom: "24px" }}>
                <Space size="large">
                    <Select
                        defaultValue="7days"
                        style={{ width: 120 }}
                        onChange={(value) => setTimeRange(value)}
                    >
                        <Option value="7days">{t("last_7days")}</Option>
                        <Option value="30days">{t("last_30days")}</Option>
                        <Option value="90days">{t("last_90days")}</Option>
                    </Select>

                    <RangePicker
                        onChange={(dates) => setDateRange(dates)}
                        style={{ width: 250 }}
                    />

                    <Select defaultValue="all" style={{ width: 120 }}>
                        <Option value="all">{t("all_types")}</Option>
                        <Option value="sale">{t("for_sale")}</Option>
                        <Option value="rent">{t("for_rent")}</Option>
                    </Select>
                </Space>
            </Card> */}

            {/* الرسوم البيانية */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <BarChartOutlined />
                                <Text strong>{t("revenue_report")}</Text>
                            </Space>
                        }
                    >
                        <Bar data={revenueChartData} options={chartOptions} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <UserOutlined />
                                <Text strong>{t("user_growth")}</Text>
                            </Space>
                        }
                    >
                        <Line
                            data={userGrowthData}
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    title: {
                                        display: true,
                                        text: t("user_growth"),
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* النشاط الأخير */}
            <Card title={t("recent_activity")} style={{ marginTop: "24px" }}>
                <div
                    style={{
                        minHeight: "200px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text type="secondary">{t("recent_activity_message")}</Text>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
