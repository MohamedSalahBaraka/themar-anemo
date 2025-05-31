import React from "react";
import { usePage, router } from "@inertiajs/react";
import {
    Card,
    List,
    Button,
    Typography,
    Divider,
    Tag,
    Space,
    Alert,
    Descriptions,
    Modal,
    Spin,
} from "antd";
import { PageProps } from "@/types";
import AppLayout from "@/Layouts/Layout";

const { Title, Text } = Typography;

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    features: string[];
    duration?: number;
    isActive: boolean;
}

interface ServicePurchasePageProps extends PageProps {
    services?: Service[]; // Make services optional
}

const ServicePurchasePage: React.FC = () => {
    const { props } = usePage<ServicePurchasePageProps>();
    const [selectedService, setSelectedService] =
        React.useState<Service | null>(null);
    const [purchaseModalVisible, setPurchaseModalVisible] =
        React.useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Check if the page data is loaded
        if (props) {
            setLoading(false);
        }
    }, [props]);

    const handlePurchaseClick = (service: Service) => {
        setSelectedService(service);
        setPurchaseModalVisible(true);
        setPurchaseSuccess(false);
    };

    const confirmPurchase = async () => {
        if (!selectedService) return;

        try {
            await router.post(
                route("user.services.purchase", {
                    service_id: selectedService.id,
                }),
                {},
                {
                    onSuccess: () => {
                        setPurchaseSuccess(true);
                    },
                    onError: () => {
                        // Error handling is automatic with Inertia
                    },
                }
            );
        } catch (error) {
            console.error("فشل في الشراء:", error);
        }
    };

    const getCategoryTag = (category: string) => {
        switch (category) {
            case "featured_ad":
                return <Tag color="blue">إعلان مميز</Tag>;
            case "photography":
                return <Tag color="green">تصوير</Tag>;
            default:
                return <Tag>{category}</Tag>;
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "200px",
                    }}
                >
                    <Spin size="large" />
                </div>
            </AppLayout>
        );
    }

    if (!props.services) {
        return (
            <AppLayout>
                <Alert
                    message="خطأ"
                    description="بيانات الخدمات غير متوفرة"
                    type="error"
                    showIcon
                />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="service-purchase-page">
                <Title level={2}>شراء الخدمات</Title>
                <Text type="secondary">
                    حسن من قوائمك العقارية مع خدماتنا المميزة
                </Text>

                <Divider />

                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
                    dataSource={props.services.filter((s) => s.isActive)}
                    renderItem={(service) => (
                        <List.Item>
                            <Card
                                title={
                                    <Space>
                                        {service.name}
                                        {getCategoryTag(service.category)}
                                    </Space>
                                }
                                extra={
                                    <Text strong>
                                        ${service.price.toFixed(2)}
                                    </Text>
                                }
                                actions={[
                                    <Button
                                        type="primary"
                                        onClick={() =>
                                            handlePurchaseClick(service)
                                        }
                                    >
                                        شراء
                                    </Button>,
                                ]}
                            >
                                <div style={{ minHeight: 120 }}>
                                    <Text>{service.description}</Text>
                                    <Divider dashed />
                                    <List
                                        size="small"
                                        dataSource={service.features}
                                        renderItem={(feature) => (
                                            <List.Item>
                                                <Text>{feature}</Text>
                                            </List.Item>
                                        )}
                                    />
                                    {service.duration && (
                                        <div style={{ marginTop: 8 }}>
                                            <Text type="secondary">
                                                المدة: {service.duration} يوم
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />

                {/* نافذة تأكيد الشراء */}
                <Modal
                    title={`شراء ${selectedService?.name}`}
                    open={purchaseModalVisible}
                    onCancel={() => setPurchaseModalVisible(false)}
                    footer={
                        purchaseSuccess ? (
                            <Button
                                type="primary"
                                onClick={() => setPurchaseModalVisible(false)}
                            >
                                إغلاق
                            </Button>
                        ) : (
                            <Space>
                                <Button
                                    onClick={() =>
                                        setPurchaseModalVisible(false)
                                    }
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={confirmPurchase}
                                >
                                    تأكيد الشراء
                                </Button>
                            </Space>
                        )
                    }
                >
                    {purchaseSuccess ? (
                        <div style={{ textAlign: "center" }}>
                            <Alert
                                message="تم الشراء بنجاح!"
                                description="تم شراء الخدمة بنجاح."
                                type="success"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="الخدمة">
                                    {selectedService?.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="المبلغ">
                                    ${selectedService?.price.toFixed(2)}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    ) : (
                        <>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="الخدمة">
                                    {selectedService?.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="الوصف">
                                    {selectedService?.description}
                                </Descriptions.Item>
                                <Descriptions.Item label="السعر">
                                    ${selectedService?.price.toFixed(2)}
                                </Descriptions.Item>
                                {selectedService?.duration && (
                                    <Descriptions.Item label="المدة">
                                        {selectedService.duration} يوم
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                            <Divider />
                            <Alert
                                message="سيتم معالجة الدفع باستخدام طريقة الدفع الافتراضية الخاصة بك."
                                type="info"
                                showIcon
                            />
                        </>
                    )}
                </Modal>
            </div>
        </AppLayout>
    );
};

export default ServicePurchasePage;
