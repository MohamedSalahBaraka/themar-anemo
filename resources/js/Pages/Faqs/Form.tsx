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
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from "@/Layouts/AdminLayout";

interface FaqFormProps extends PageProps {
    faq?: Faq;
}
const FaqForm: React.FC<FaqFormProps> = ({ faq, auth }) => (
    <AdminLayout>
        <Page faq={faq} auth={auth} />
    </AdminLayout>
);
const Page: React.FC<FaqFormProps> = ({ faq }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        question: faq?.question || "",
        answer: faq?.answer || "",
        category: faq?.category || "",
        order: faq?.order || 0,
        is_active: faq?.is_active || true,
    });
    const { t } = useLanguage();

    const onFinish = (values: any) => {
        if (faq) {
            router.put(route("admin.faqs.update", faq.id), values, {
                onSuccess: () => message.success(t("faq_updated_successfully")),
                onError: (e) => {
                    console.log(e);
                    message.error(t("faq_update_failed"));
                },
            });
        } else {
            router.post(route("admin.faqs.store"), values, {
                onSuccess: () => message.success(t("faq_created_successfully")),
                onError: (e) => {
                    console.log(e);
                    message.error(t("faq_creation_failed"));
                },
            });
        }
    };

    return (
        <div>
            <Head title={faq ? t("edit_faq") : t("create_faq")} />
            <Card
                title={faq ? t("edit_faq") : t("create_faq")}
                extra={
                    <Link href="/faqs">
                        <Button icon={<ArrowLeftOutlined />}>
                            {t("back")}
                        </Button>
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
                                label={t("question")}
                                name="question"
                                validateStatus={errors.question ? "error" : ""}
                                help={errors.question}
                                rules={[
                                    {
                                        required: true,
                                        message: t("question_required_message"),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label={t("answer")}
                                name="answer"
                                validateStatus={errors.answer ? "error" : ""}
                                help={errors.answer}
                                rules={[
                                    {
                                        required: true,
                                        message: t("answer_required_message"),
                                    },
                                ]}
                            >
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label={t("category")}
                                name="category"
                                validateStatus={errors.category ? "error" : ""}
                                help={errors.category}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                label={t("order")}
                                name="order"
                                validateStatus={errors.order ? "error" : ""}
                                help={errors.order}
                                rules={[
                                    {
                                        required: true,
                                        message: t("order_required_message"),
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
                                label={t("active")}
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
                                    {faq ? t("update") : t("create")}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default FaqForm;
