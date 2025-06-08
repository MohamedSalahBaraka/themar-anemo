import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Divider,
    Row,
    Col,
    Space,
    Alert,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    PhoneOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { PageProps } from "@/types";
import Checkbox from "@/Components/Checkbox";
import PackageCard, { Package } from "@/Components/PackageCard";
import FrontLayout from "@/Layouts/FrontLayout";

const { Title, Text } = Typography;
const { Item } = Form;

interface PageData extends PageProps {
    packages: Package[];
    preselectedPackageId?: number; // Add this to your page props
}

const Register: React.FC = () => {
    const { packages, preselectedPackageId } = usePage<PageData>().props;
    const [selectedFrequency, setSelectedFrequency] = React.useState<
        "monthly" | "yearly"
    >("monthly");

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone: string;
        package_id: number | null;
        billing_frequency: "monthly" | "yearly";
        terms: boolean;
    }>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        package_id: parseInt(`${preselectedPackageId}`) || null, // Set preselected package if available
        billing_frequency: "monthly",
        terms: false,
    });

    // Auto-advance to registration if package is preselected
    React.useEffect(() => {
        if (preselectedPackageId && packages.length > 0) {
            setStep(2);
        }
    }, [preselectedPackageId, packages]);

    const [step, setStep] = React.useState<number>(1);

    const onFinish = () => {
        post(route("register"), {
            onSuccess: () => {
                // Handle successful registration
            },
            onError: (e) => {
                console.log(e);

                // Errors are automatically handled by Inertia
            },
        });
    };

    const handlePackageSelect = (
        id: number,
        frequency: "monthly" | "yearly"
    ) => {
        setData({
            ...data,
            package_id: id,
            billing_frequency: frequency,
        });
        setSelectedFrequency(frequency);
    };

    const renderPackageSelection = () => {
        // Find the preselected package if it exists
        const preselectedPackage = preselectedPackageId
            ? packages.find((pkg) => pkg.id === preselectedPackageId)
            : null;

        return (
            <Space
                direction="vertical"
                size="large"
                align="center"
                style={{ width: "100%" }}
            >
                <Title level={4} style={{ textAlign: "center" }}>
                    اختر باقة
                </Title>

                {preselectedPackage && (
                    <Alert
                        message="الباقة المحددة مسبقاً"
                        description={`لقد تم تحديد باقة "${preselectedPackage.name}" لك مسبقاً. يمكنك اختيار باقة مختلفة إذا أردت.`}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {packages.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {packages.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={{
                                    ...pkg,
                                    features: Object.values(pkg.features),
                                }}
                                selected={data.package_id === pkg.id}
                                onSelect={handlePackageSelect}
                                selectedFrequency={selectedFrequency}
                            />
                        ))}
                    </Row>
                ) : (
                    <Alert
                        message="لا توجد باقات متاحة حالياً"
                        description="يرجى الاتصال بالدعم لمعرفة المزيد عن الباقات المتاحة."
                        type="warning"
                        showIcon
                    />
                )}

                <Button
                    type="primary"
                    block
                    onClick={() => setStep(2)}
                    disabled={!data.package_id && packages.length > 0}
                >
                    {preselectedPackageId ? "تأكيد الباقة والمتابعة" : "متابعة"}
                </Button>
                <Button
                    // type="primary"
                    block
                    onClick={() => setStep(2)}
                    // disabled={!data.package_id && packages.length > 0}
                >
                    تخطي
                </Button>
            </Space>
        );
    };

    const renderRegistrationForm = () => (
        <Form layout="vertical">
            <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
                إنشاء حسابك
            </Title>

            {/* Show selected package info if available */}
            {data.package_id && (
                <div style={{ marginBottom: 24, textAlign: "center" }}>
                    <Text strong>الباقة المختارة: </Text>
                    {packages.find((p) => p.id === data.package_id)?.name}
                    <Button
                        type="link"
                        onClick={() => setStep(1)}
                        style={{ padding: "0 4px" }}
                    >
                        (تغيير)
                    </Button>
                </div>
            )}

            <Item
                label="الاسم الكامل"
                validateStatus={errors.name ? "error" : ""}
                help={errors.name}
            >
                <Input
                    prefix={<UserOutlined />}
                    placeholder="الاسم"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    disabled={processing}
                />
            </Item>
            <Item
                label="البريد الإلكتروني"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="البريد الإلكتروني"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    disabled={processing}
                />
            </Item>
            <Item
                label="كلمة المرور"
                validateStatus={errors.password ? "error" : ""}
                help={errors.password}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="كلمة المرور"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    disabled={processing}
                />
            </Item>
            <Item
                label="تأكيد كلمة المرور"
                validateStatus={errors.password_confirmation ? "error" : ""}
                help={errors.password_confirmation}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="تأكيد كلمة المرور"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                    disabled={processing}
                />
            </Item>
            <Item
                label="رقم الهاتف"
                validateStatus={errors.phone ? "error" : ""}
                help={errors.phone}
            >
                <Input
                    prefix={<PhoneOutlined />}
                    placeholder="الهاتف (اختياري)"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                    disabled={processing}
                />
            </Item>
            <Item
                name="terms"
                validateStatus={errors.terms ? "error" : ""}
                help={errors.terms}
            >
                <Checkbox
                    checked={data.terms}
                    onChange={(e) => setData("terms", e.target.checked)}
                />
                أوافق على <a href="#">الشروط والأحكام</a>
            </Item>

            {packages.length > 0 && (
                <Button
                    type="default"
                    block
                    onClick={() => setStep(1)}
                    style={{ marginBottom: 16 }}
                    disabled={processing}
                >
                    رجوع لاختيار الباقة
                </Button>
            )}

            <Button
                type="primary"
                onClick={onFinish}
                loading={processing}
                block
            >
                إتمام التسجيل
            </Button>

            <Divider>أو</Divider>
            <div style={{ textAlign: "center" }}>
                <Text>لديك حساب بالفعل؟ </Text>
                <a href={route("login")}>
                    <Button type="link" style={{ padding: 0 }}>
                        تسجيل الدخول الآن
                    </Button>
                </a>
            </div>
        </Form>
    );

    return (
        <FrontLayout>
            <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
                <Col xs={24} sm={22} md={20} lg={18} xl={16}>
                    <Card>
                        {step === 1 &&
                            packages.length > 0 &&
                            renderPackageSelection()}
                        {step === 2 && renderRegistrationForm()}
                        {packages.length === 0 && renderRegistrationForm()}
                    </Card>
                </Col>
            </Row>
        </FrontLayout>
    );
};

export default Register;
