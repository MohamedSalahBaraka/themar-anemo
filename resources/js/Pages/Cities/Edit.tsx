import React from "react";
import {
    Card,
    Form,
    Input,
    Button,
    Upload,
    message,
    Typography,
    Image,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Layout from "@/Layouts/Layout";
import { City } from "@/types/city";
import { PageProps } from "@/types";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const { TextArea } = Input;
const { Title } = Typography;

interface Props extends PageProps {
    city: City;
}
const CityEdit: React.FC<Props> = ({ city, auth }) => (
    <AdminLayout>
        <Page city={city} auth={auth} />
    </AdminLayout>
);
const Page: React.FC<Props> = ({ city }) => {
    const { data, setData, put, processing, errors } = useForm({
        title: city.title,
        bio: city.bio,
        photo: null as File | null,
    });
    const { t } = useLanguage();

    const handleSubmit = (values: any) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("bio", data.bio ?? "");
        if (data.photo) {
            formData.append("photo", data.photo);
        }
        formData.append("_method", "PUT");
        router.post(route("admin.cities.update", city.id), formData, {
            onSuccess: () => message.success(t("city_updated_successfully")),
            onError: (e) => {
                console.log(e);
                message.error(t("city_update_failed"));
            },
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
            <Head title={`${t("edit")} ${city.title}`} />
            <Card
                title={<Title level={2}>{t("edit_city")}</Title>}
                extra={
                    <Link href="/admin/cities">
                        <Button icon={<ArrowLeftOutlined />}>
                            {t("back")}
                        </Button>
                    </Link>
                }
            >
                {city.photo && (
                    <Image
                        width={200}
                        src={`/storage/${city.photo}`}
                        style={{ marginBottom: 20 }}
                        alt={t("city_image")}
                    />
                )}
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
                                {t("upload_new_photo")}
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            {t("update")}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CityEdit;
