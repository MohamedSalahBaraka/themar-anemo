// src/pages/auth/Register.tsx
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
} from "@ant-design/icons";
import { PageProps } from "@/types";
import Checkbox from "@/Components/Checkbox";

const { Title, Text } = Typography;
const { Item } = Form;

interface Package {
    id: number;
    description: string;
    name: string;
    price: number;
    duration: number;
    max_listings: number;
    features: string[];
}

interface PageData extends PageProps {
    packages: Package[];
}

interface PackageCardProps {
    pkg: Package;
    selected: boolean;
    onSelect: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
    pkg,
    selected,
    onSelect,
}) => (
    <Card
        onClick={onSelect}
        style={{
            border: selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
            cursor: "pointer",
            marginBottom: 16,
        }}
        hoverable
    >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={4} style={{ margin: 0 }}>
                {pkg.name} <Tag color="gold">${pkg.price}</Tag>
            </Title>
            <Text type="secondary">{pkg.duration} days</Text>
            <Text type="secondary">{pkg.description}</Text>
            <Text strong>Max Listings: {pkg.max_listings}</Text>
        </Space>
    </Card>
);

const Register: React.FC = () => {
    const { packages } = usePage<PageData>().props;
    console.log(
        "Available packages for registration:",
        usePage<PageData>().props
    );

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone: string;
        role: string;
        package_id: number | null;
        terms: boolean;
    }>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
        role: "buyer",
        package_id: null,
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

    const renderRoleSelection = () => (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={4} style={{ textAlign: "center" }}>
                Select Your Role
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
                                <Text strong>Buyer</Text>
                                <Text type="secondary">
                                    Looking to buy or rent properties
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
                                <Text strong>Owner</Text>
                                <Text type="secondary">
                                    Listing my own properties
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
                                <Text strong>Agent</Text>
                                <Text type="secondary">
                                    Real estate professional
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
                                <Text strong>Company</Text>
                                <Text type="secondary">
                                    Real estate company
                                </Text>
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
                Continue
            </Button>
        </Space>
    );

    const renderPackageSelection = () => (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={4} style={{ textAlign: "center" }}>
                Choose a Package
            </Title>

            {data.role === "buyer" ? (
                <Alert
                    message="Buyers don't need a package"
                    description="You can skip this step as packages are only required for property listings."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 24 }}
                />
            ) : packages.length > 0 ? (
                packages.map((pkg) => (
                    <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        selected={data.package_id === pkg.id}
                        onSelect={() => setData("package_id", pkg.id)}
                    />
                ))
            ) : (
                <Alert
                    message="No packages available"
                    description="Please contact support as there are currently no available packages."
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
                Back
            </Button>
            <Button
                type="primary"
                block
                onClick={() => setStep(3)}
                disabled={!data.package_id && data.role !== "buyer"}
            >
                Continue
            </Button>
        </Space>
    );

    const renderRegistrationForm = () => (
        <Form layout="vertical">
            <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
                Create Your Account
            </Title>
            <Item
                label="Full Name"
                validateStatus={errors.name ? "error" : ""}
                help={errors.name}
            >
                <Input
                    prefix={<UserOutlined />}
                    placeholder="Name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    disabled={processing}
                />
            </Item>
            <Item
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    disabled={processing}
                />
            </Item>
            <Item
                label="Password"
                validateStatus={errors.password ? "error" : ""}
                help={errors.password}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    disabled={processing}
                />
            </Item>
            <Item
                label="Confirm Password"
                validateStatus={errors.password_confirmation ? "error" : ""}
                help={errors.password_confirmation}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm Password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                    disabled={processing}
                />
            </Item>
            <Item
                label="Phone Number"
                validateStatus={errors.phone ? "error" : ""}
                help={errors.phone}
            >
                <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Phone (optional)"
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
                I agree to the <a href="#">Terms and Conditions</a>
            </Item>
            <Item>
                <Button
                    type="default"
                    block
                    onClick={() => setStep(2)}
                    style={{ marginBottom: 16 }}
                    disabled={processing}
                >
                    Back
                </Button>
                <Button
                    type="primary"
                    onClick={onFinish}
                    loading={processing}
                    block
                >
                    Complete Registration
                </Button>
            </Item>
            <Divider>or</Divider>
            <div style={{ textAlign: "center" }}>
                <Text>Already have an account? </Text>
                <a href={route("login")}>
                    <Button type="link" style={{ padding: 0 }}>
                        Login now
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
