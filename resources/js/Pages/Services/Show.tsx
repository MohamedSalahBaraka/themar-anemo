import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import {
    Card,
    Row,
    Col,
    Button,
    Tag,
    Divider,
    List,
    Typography,
    Space,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Upload,
    Checkbox,
    Radio,
    message,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Service } from "@/types/Services";
import { PageProps } from "@/types";
import FrontLayout from "@/Layouts/FrontLayout";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { TextArea } = Input;

interface prop extends PageProps {
    service: Service;
    relatedServices: Service[];
}

const ServiceShow: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);

const Page: React.FC = () => {
    const { service, relatedServices, auth } = usePage<prop>().props;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { t } = useLanguage();

    const showModal = () => {
        if (!auth.user) return router.get(route("register"));
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async (values: any) => {
        try {
            const formData = new FormData();
            formData.append("service_id", service.id.toString());

            creationFields.forEach((field) => {
                const value = values[field.label];
                if (field.field_type === "file" && value) {
                    value.fileList.forEach((file: any) => {
                        formData.append(`${field.id}`, file.originFileObj);
                    });
                } else if (
                    field.field_type === "checkbox" ||
                    field.field_type === "multiselect"
                ) {
                    if (Array.isArray(value)) {
                        formData.append(
                            `fields[${field.id}]`,
                            JSON.stringify(value)
                        );
                    }
                } else {
                    if (value !== undefined && value !== null) {
                        formData.append(`fields[${field.id}]`, value);
                    }
                }
            });

            const response = await axios.post(
                route("public.services.apply", service.id),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            message.success(t("request_submitted_success"));
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error(t("request_submission_failed"));
            console.error(t("submission_error"), error);
        }
    };

    const renderField = (field: any) => {
        const rules = [
            {
                required: field.required,
                message: t("field_required", { field: field.label }),
            },
        ];

        switch (field.field_type) {
            case "text":
                return (
                    <Input
                        placeholder={t("enter_field", { field: field.label })}
                    />
                );
            case "textarea":
                return (
                    <TextArea
                        rows={4}
                        placeholder={t("enter_field", { field: field.label })}
                    />
                );
            case "email":
                return (
                    <Input
                        type="email"
                        placeholder={t("enter_field", { field: field.label })}
                    />
                );
            case "number":
                return (
                    <Input
                        type="number"
                        placeholder={t("enter_field", { field: field.label })}
                    />
                );
            case "select":
                return (
                    <Select
                        placeholder={t("select_field", { field: field.label })}
                    >
                        {field.options?.map((option: string) => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                );
            case "checkbox":
                return <Checkbox.Group options={field.options} />;
            case "multiselect":
                return (
                    <Select
                        mode="multiple"
                        placeholder={t("select_field", { field: field.label })}
                    >
                        {field.options?.map((option: string) => (
                            <Select.Option key={option} value={option}>
                                {option}
                            </Select.Option>
                        ))}
                    </Select>
                );
            case "radio":
                return <Radio.Group options={field.options} />;
            case "date":
                return <DatePicker style={{ width: "100%" }} />;
            case "file":
                return (
                    <Upload beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>
                            {t("click_to_upload")}
                        </Button>
                    </Upload>
                );
            default:
                return (
                    <Input
                        placeholder={t("enter_field", { field: field.label })}
                    />
                );
        }
    };

    const creationFields =
        service.fields?.filter((field) => field.show_on_creation) || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => window.history.back()}
                className="mb-4"
            >
                {t("back_to_services")}
            </Button>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card>
                        <div className="mb-6">
                            <Title level={2}>{service.name}</Title>
                            <Space size="middle">
                                <Tag color="blue">{service.category.name}</Tag>
                                {service.tags?.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </Space>
                        </div>
                        <img
                            alt={service.name}
                            className="h-64 bg-gray-100 flex items-center justify-center mb-6 rounded"
                            src={`${window.location.origin}/storage/${service.photo}`}
                            style={{
                                objectFit: "cover",
                            }}
                        />

                        <div
                            className="text-lg mb-6"
                            dangerouslySetInnerHTML={{
                                __html: service.description || "",
                            }}
                        />

                        <Divider />

                        <Title level={4} className="mb-4">
                            {t("pricing")}
                        </Title>
                        <Text strong className="text-2xl">
                            {service.price}
                        </Text>

                        <Divider />

                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={showModal}
                        >
                            {auth.user
                                ? t("apply_now")
                                : t("register_to_apply")}
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title={t("related_services")}>
                        <List
                            itemLayout="horizontal"
                            dataSource={relatedServices}
                            renderItem={(item) => (
                                <List.Item>
                                    <Link
                                        href={route(
                                            "public.services.show",
                                            item.id
                                        )}
                                    >
                                        <Card
                                            hoverable
                                            size="small"
                                            style={{ width: "100%" }}
                                        >
                                            <Meta
                                                title={item.name}
                                                description={
                                                    <>
                                                        <Text>
                                                            {item.price}
                                                        </Text>
                                                        <div className="mt-1">
                                                            {item.tags
                                                                ?.slice(0, 2)
                                                                .map((tag) => (
                                                                    <Tag
                                                                        key={
                                                                            tag
                                                                        }
                                                                    >
                                                                        {tag}
                                                                    </Tag>
                                                                ))}
                                                        </div>
                                                    </>
                                                }
                                            />
                                        </Card>
                                    </Link>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={t("apply_for_service", { service: service.name })}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        {t("cancel")}
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                    >
                        {t("submit_request")}
                    </Button>,
                ]}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {creationFields.map((field) => (
                        <Form.Item
                            key={field.id}
                            label={field.label}
                            name={field.label}
                            rules={[
                                {
                                    required: field.required,
                                    message: t("field_required", {
                                        field: field.label,
                                    }),
                                },
                            ]}
                        >
                            {renderField(field)}
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
        </div>
    );
};

export default ServiceShow;
