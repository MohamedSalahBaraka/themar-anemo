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
                        تسجيل الدخول إلى حسابك
                    </Title>

                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label="البريد الإلكتروني"
                            validateStatus={errors.email ? "error" : ""}
                            help={errors.email}
                            rules={[
                                {
                                    required: true,
                                    message: "الرجاء إدخال البريد الإلكتروني!",
                                },
                                {
                                    type: "email",
                                    message: "الرجاء إدخال بريد إلكتروني صحيح!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="البريد الإلكتروني"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                disabled={processing}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="كلمة المرور"
                            validateStatus={errors.password ? "error" : ""}
                            help={errors.password}
                            rules={[
                                {
                                    required: true,
                                    message: "الرجاء إدخال كلمة المرور!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="كلمة المرور"
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
                                تسجيل الدخول
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider>أو</Divider>

                    <div style={{ textAlign: "center" }}>
                        <Text>ليس لديك حساب؟ </Text>
                        <a href={route("register")}>
                            <Button type="link" style={{ padding: 0 }}>
                                سجل الآن
                            </Button>
                        </a>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default Login;
