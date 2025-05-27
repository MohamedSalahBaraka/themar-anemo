// src/pages/auth/Login.tsx
import React from "react";
import { useForm } from "@inertiajs/react";
import { Form, Input, Button, Card, Typography, Divider, Row, Col } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
    });

    const onFinish = () => {
        post(route("login"), {
            onError: () => {
                // Errors are automatically handled by Inertia
            },
        });
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
            <Col xs={24} sm={20} md={16} lg={12} xl={8}>
                <Card>
                    <Title
                        level={3}
                        style={{ textAlign: "center", marginBottom: 24 }}
                    >
                        Login to Your Account
                    </Title>

                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            validateStatus={errors.email ? "error" : ""}
                            help={errors.email}
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your email!",
                                },
                                {
                                    type: "email",
                                    message: "Please enter a valid email!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                disabled={processing}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            validateStatus={errors.password ? "error" : ""}
                            help={errors.password}
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your password!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                disabled={processing}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={processing}
                                block
                            >
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider>or</Divider>

                    <div style={{ textAlign: "center" }}>
                        <Text>Don't have an account? </Text>
                        <a href={route("register")}>
                            <Button type="link" style={{ padding: 0 }}>
                                Register now
                            </Button>
                        </a>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default Login;
