import React from "react";
import { Card, Form, Input, Button, Upload, message, Typography } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Layout from "@/Layouts/Layout";
import { PageProps } from "@/types";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const { TextArea } = Input;
const { Title } = Typography;
const CityCreate: React.FC = () => (
    <AdminLayout>
        <Page />
    </AdminLayout>
);
const Page: React.FC = () => {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        bio: "",
        photo: null as File | null,
    });
    const { t } = useLanguage();

    const handleSubmit = (values: any) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("bio", data.bio);
        if (data.photo) {
            formData.append("photo", data.photo);
        }

        router.post(route("admin.cities.store"), formData, {
            onSuccess: () => message.success(t("city_created_successfully")),
            onError: () => message.error(t("city_creation_failed")),
        });
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        if (e && e.fileList.length > 0) {
            setData("photo", e.fileList[0].originFileObj);
            return e?.fileList;
        }
        return [];
    };

    return (
        <div>
            <Head title={t("create_city")} />
            <Card
                title={<Title level={2}>{t("create_new_city")}</Title>}
                extra={
                    <Link href="/admin/cities">
                        <Button icon={<ArrowLeftOutlined />}>
                            {t("back")}
                        </Button>
                    </Link>
                }
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
                >
                    <Form.Item
                        label={t("title")}
                        name="title"
                        validateStatus={errors.title ? "error" : ""}
                        help={errors.title}
                        rules={[
                            {
                                required: true,
                                message: t("title_required_message"),
                            },
                        ]}
                    >
                        <Input
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("bio")}
                        name="bio"
                        validateStatus={errors.bio ? "error" : ""}
                        help={errors.bio}
                    >
                        <TextArea
                            rows={4}
                            value={data.bio}
                            onChange={(e) => setData("bio", e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("photo")}
                        name="photo"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        validateStatus={errors.photo ? "error" : ""}
                        help={errors.photo}
                    >
                        <Upload
                            name="photo"
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>
                                {t("upload_photo")}
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            {t("submit")}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CityCreate;
