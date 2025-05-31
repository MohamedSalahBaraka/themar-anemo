// src/pages/admin/Dashboard.tsx
import React, { useState, useEffect } from "react";
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

    const { t, language, setLanguage } = useLanguage();
    const { stats, revenueData } = usePage<AdminDashboardProps>().props;

    const revenueChartData = {
        labels: revenueData.map((item) => item.date),
        datasets: [
            {
                label: "الإيرادات اليومية",
                data: revenueData.map((item) => item.total),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };

    const userGrowthData = {
        labels: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"],
        datasets: [
            {
                label: "مستخدمين جدد",
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1,
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
                text: "نظرة عامة على الإيرادات",
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
            <Title level={2}>لوحة تحكم المشرف</Title>

            {/* بطاقات الإحصائيات */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="إجمالي المستخدمين"
                            value={stats?.users_count || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="إجمالي العقارات"
                            value={stats?.properties_count || 0}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="العروض النشطة"
                            value={stats?.active_listings || 0}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="إيرادات 30 يوم"
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
            <Card style={{ marginBottom: "24px" }}>
                <Space size="large">
                    <Select
                        defaultValue="7days"
                        style={{ width: 120 }}
                        onChange={(value) => setTimeRange(value)}
                    >
                        <Option value="7days">آخر 7 أيام</Option>
                        <Option value="30days">آخر 30 يوم</Option>
                        <Option value="90days">آخر 90 يوم</Option>
                    </Select>

                    <RangePicker
                        onChange={(dates) => setDateRange(dates)}
                        style={{ width: 250 }}
                    />

                    <Select defaultValue="all" style={{ width: 120 }}>
                        <Option value="all">جميع الأنواع</Option>
                        <Option value="sale">للبيع</Option>
                        <Option value="rent">للإيجار</Option>
                    </Select>
                </Space>
            </Card>

            {/* الرسوم البيانية */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <BarChartOutlined />
                                <Text strong>تقرير الإيرادات</Text>
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
                                <Text strong>نمو المستخدمين</Text>
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
                                        text: "نمو المستخدمين",
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
            <Card title="النشاط الأخير" style={{ marginTop: "24px" }}>
                <div
                    style={{
                        minHeight: "200px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text type="secondary">
                        ستظهر هنا أحدث المعاملات والأنشطة
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
