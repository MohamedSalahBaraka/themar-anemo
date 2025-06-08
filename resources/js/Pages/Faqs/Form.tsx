// resources/js/Pages/Faqs/Form.tsx
import React from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Row,
    Col,
    Switch,
    InputNumber,
    message,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Layout from "../../Layouts/Layout";
import { Faq } from "../../types/faq";
import { PageProps } from "@/types";
import { Head, Link, router, useForm } from "@inertiajs/react";

interface FaqFormProps extends PageProps {
    faq?: Faq;
}

const FaqForm: React.FC<FaqFormProps> = ({ faq }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        question: faq?.question || "",
        answer: faq?.answer || "",
        category: faq?.category || "",
        order: faq?.order || 0,
        is_active: faq?.is_active || true,
    });

    const onFinish = (values: any) => {
        if (faq) {
            console.log(values);
            router.put(route("admin.faqs.update", faq.id), values, {
                onSuccess: () => message.success("Faq updated successfully"),
                onError: (e) => {
                    console.log(e);
                    message.error("Error updating Faq");
                },
            });
        } else {
            console.log(values);

            router.post(route("admin.faqs.store"), values, {
                onSuccess: () => message.success("Faq created successfully"),
                onError: (e) => {
                    console.log(e);
                    message.error("Error creating Faq");
                },
            });
        }
    };

    return (
        <Layout>
            <Head title={faq ? "Edit FAQ" : "Create FAQ"} />
            <Card
                title={faq ? "Edit FAQ" : "Create FAQ"}
                extra={
                    <Link href="/faqs">
                        <Button icon={<ArrowLeftOutlined />}>Back</Button>
                    </Link>
                }
            >
                <Form
                    layout="vertical"
                    initialValues={data}
                    onFinish={onFinish}
                    onValuesChange={(changedValues) => setData(changedValues)}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="Question"
                                name="question"
                                validateStatus={errors.question ? "error" : ""}
                                help={errors.question}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the question",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Answer"
                                name="answer"
                                validateStatus={errors.answer ? "error" : ""}
                                help={errors.answer}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the answer",
                                    },
                                ]}
                            >
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Category"
                                name="category"
                                validateStatus={errors.category ? "error" : ""}
                                help={errors.category}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                label="Order"
                                name="order"
                                validateStatus={errors.order ? "error" : ""}
                                help={errors.order}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the order",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                label="Active"
                                name="is_active"
                                valuePropName="checked"
                                validateStatus={errors.is_active ? "error" : ""}
                                help={errors.is_active}
                            >
                                <Switch />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={processing}
                                    icon={<SaveOutlined />}
                                >
                                    {faq ? "Update" : "Create"}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </Layout>
    );
};

export default FaqForm;
