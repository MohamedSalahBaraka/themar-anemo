import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Divider,
    Radio,
    Row,
    Col,
    Space,
    List,
    Avatar,
    Tag,
    Alert,
    Tabs,
    Badge,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    PhoneOutlined,
    HomeOutlined,
    ShopOutlined,
    TeamOutlined,
    InfoCircleOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import { PageProps } from "@/types";
import Checkbox from "@/Components/Checkbox";

const { Title, Text } = Typography;
const { Item } = Form;
const { TabPane } = Tabs;

interface PackageFeature {
    [key: string]: string;
}

interface Package {
    id: number;
    description: string;
    name: string;
    price: number;
    monthly_price: number;
    yearly_price: number;
    max_listings: number;
    features: PackageFeature;
    user_type: "owner" | "agent" | "company";
}

interface PageData extends PageProps {
    packages: Package[];
}

interface PackageCardProps {
    pkg: Package;
    selected: boolean;
    onSelect: (id: number, frequency: "monthly" | "yearly") => void;
    selectedFrequency: "monthly" | "yearly";
}

const PackageCard: React.FC<PackageCardProps> = ({
    pkg,
    selected,
    onSelect,
    selectedFrequency,
}) => {
    const [frequency, setFrequency] = React.useState<"monthly" | "yearly">(
        selectedFrequency
    );

    const price =
        frequency === "monthly" ? pkg.monthly_price : pkg.yearly_price;
    const duration = frequency === "monthly" ? "شهرياً" : "سنوياً";
    const discount =
        frequency === "yearly"
            ? Math.round(
                  (1 - pkg.yearly_price / (pkg.monthly_price * 12)) * 100
              )
            : 0;

    return (
        <Card
            onClick={() => onSelect(pkg.id, frequency)}
            style={{
                border: selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
                cursor: "pointer",
                marginBottom: 16,
            }}
            hoverable
        >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Title level={4} style={{ margin: 0 }}>
                    {pkg.name}
                    <Tag color="gold" style={{ marginLeft: 8 }}>
                        ${price} / {duration}
                    </Tag>
                    {frequency === "yearly" && discount > 0 && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                            توفير {discount}%
                        </Tag>
                    )}
                </Title>

                <Tabs
                    defaultActiveKey="monthly"
                    size="small"
                    onChange={(key) =>
                        setFrequency(key as "monthly" | "yearly")
                    }
                    onClick={(e) => e.stopPropagation()}
                >
                    <TabPane tab="دفع شهري" key="monthly" />
                    <TabPane tab="دفع سنوي" key="yearly" />
                </Tabs>

                <Text type="secondary">{pkg.description}</Text>
                <Text strong>الحد الأقصى للعقارات: {pkg.max_listings}</Text>

                <List
                    size="small"
                    dataSource={Object.entries(pkg.features)}
                    renderItem={([feature, description]) => (
                        <List.Item>
                            <Space>
                                <CheckOutlined style={{ color: "#52c41a" }} />
                                <Text strong>{feature}:</Text>
                                <Text type="secondary">{description}</Text>
                            </Space>
                        </List.Item>
                    )}
                />
            </Space>
        </Card>
    );
};

const Register: React.FC = () => {
    const { packages } = usePage<PageData>().props;
    const [selectedFrequency, setSelectedFrequency] = React.useState<
        "monthly" | "yearly"
    >("monthly");

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone: string;
        role: string;
        package_id: number | null;
        billing_frequency: "monthly" | "yearly";
        terms: boolean;
    }>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        role: "buyer",
        package_id: null,
        billing_frequency: "monthly",
        terms: false,
    });

    const [step, setStep] = React.useState<number>(1);

    const onFinish = () => {
        post(route("register"), {
            onSuccess: () => {
                // Handle successful registration
            },
            onError: () => {
                // Errors are automatically handled by Inertia
            },
        });
    };

    const filteredPackages = packages.filter((pkg) => {
        if (data.role === "owner") return pkg.user_type === "owner";
        if (data.role === "agent") return pkg.user_type === "agent";
        if (data.role === "company") return pkg.user_type === "company";
        return false;
    });

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

    const renderRoleSelection = () => (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={4} style={{ textAlign: "center" }}>
                اختر دورك
            </Title>

            <Radio.Group
                onChange={(e) => setData("role", e.target.value)}
                value={data.role}
                style={{ width: "100%" }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Radio.Button
                            value="buyer"
                            style={{
                                width: "100%",
                                height: "100%",
                                padding: "16px",
                            }}
                        >
                            <Space direction="vertical" align="center">
                                <UserOutlined style={{ fontSize: "24px" }} />
                                <Text strong>مشتري</Text>
                                <Text type="secondary">
                                    تبحث عن عقار للشراء أو الإيجار
                                </Text>
                            </Space>
                        </Radio.Button>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Radio.Button
                            value="owner"
                            style={{
                                width: "100%",
                                height: "100%",
                                padding: "16px",
                            }}
                        >
                            <Space direction="vertical" align="center">
                                <HomeOutlined style={{ fontSize: "24px" }} />
                                <Text strong>مالك</Text>
                                <Text type="secondary">
                                    لدي عقارات أرغب في عرضها
                                </Text>
                            </Space>
                        </Radio.Button>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Radio.Button
                            value="agent"
                            style={{
                                width: "100%",
                                height: "100%",
                                padding: "16px",
                            }}
                        >
                            <Space direction="vertical" align="center">
                                <TeamOutlined style={{ fontSize: "24px" }} />
                                <Text strong>وسيط عقاري</Text>
                                <Text type="secondary">
                                    محترف في مجال العقارات
                                </Text>
                            </Space>
                        </Radio.Button>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Radio.Button
                            value="company"
                            style={{
                                width: "100%",
                                height: "100%",
                                padding: "16px",
                            }}
                        >
                            <Space direction="vertical" align="center">
                                <ShopOutlined style={{ fontSize: "24px" }} />
                                <Text strong>شركة</Text>
                                <Text type="secondary">شركة عقارية</Text>
                            </Space>
                        </Radio.Button>
                    </Col>
                </Row>
            </Radio.Group>

            <Button
                type="primary"
                block
                onClick={() => setStep(2)}
                disabled={!data.role}
            >
                متابعة
            </Button>
        </Space>
    );

    const renderPackageSelection = () => (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={4} style={{ textAlign: "center" }}>
                اختر باقة
            </Title>

            {data.role === "buyer" ? (
                <Alert
                    message="لا تحتاج المشترين إلى باقة"
                    description="يمكنك تخطي هذه الخطوة حيث أن الباقات مطلوبة فقط لعرض العقارات."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 24 }}
                />
            ) : filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                    <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        selected={data.package_id === pkg.id}
                        onSelect={handlePackageSelect}
                        selectedFrequency={selectedFrequency}
                    />
                ))
            ) : (
                <Alert
                    message="لا توجد باقات متاحة لدورك"
                    description="يرجى الاتصال بالدعم حيث لا توجد باقات متاحة حالياً لدورك."
                    type="warning"
                    showIcon
                />
            )}

            <Button
                type="default"
                block
                onClick={() => setStep(1)}
                style={{ marginBottom: 16 }}
            >
                رجوع
            </Button>
            <Button
                type="primary"
                block
                onClick={() => setStep(3)}
                disabled={!data.package_id && data.role !== "buyer"}
            >
                متابعة
            </Button>
        </Space>
    );

    const renderRegistrationForm = () => (
        <Form layout="vertical">
            <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
                إنشاء حسابك
            </Title>
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
            <Item>
                <Button
                    type="default"
                    block
                    onClick={() => setStep(2)}
                    style={{ marginBottom: 16 }}
                    disabled={processing}
                >
                    رجوع
                </Button>
                <Button
                    type="primary"
                    onClick={onFinish}
                    loading={processing}
                    block
                >
                    إتمام التسجيل
                </Button>
            </Item>
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
        <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
            <Col xs={24} sm={22} md={20} lg={18} xl={16}>
                <Card>
                    {step === 1 && renderRoleSelection()}
                    {step === 2 && renderPackageSelection()}
                    {step === 3 && renderRegistrationForm()}
                </Card>
            </Col>
        </Row>
    );
};

export default Register;
