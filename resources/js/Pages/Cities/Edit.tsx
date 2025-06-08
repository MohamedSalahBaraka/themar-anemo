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

const { TextArea } = Input;
const { Title } = Typography;

interface Props extends PageProps {
    city: City;
}

const CityEdit: React.FC<Props> = ({ city }) => {
    const { data, setData, put, processing, errors } = useForm({
        title: city.title,
        bio: city.bio,
        photo: null as File | null,
    });

    const handleSubmit = (values: any) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("bio", data.bio ?? "");
        console.log(data);
        if (data.photo) {
            formData.append("photo", data.photo);
        }
        formData.append("_method", "PUT"); // 👈 spoof the method
        router.post(route("admin.cities.update", city.id), formData, {
            // forceFormData: true,
            onSuccess: () => message.success("City updated successfully"),
            onError: (e) => {
                console.log(e);
                message.error("Error updating City");
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
        <Layout>
            <Head title={`Edit ${city.title}`} />
            <Card
                title={<Title level={2}>Edit City</Title>}
                extra={
                    <Link href="/admin/cities">
                        <Button icon={<ArrowLeftOutlined />}>Back</Button>
                    </Link>
                }
            >
                {city.photo && (
                    <Image
                        width={200}
                        src={`/storage/${city.photo}`}
                        style={{ marginBottom: 20 }}
                    />
                )}
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        validateStatus={errors.title ? "error" : ""}
                        help={errors.title}
                        rules={[
                            {
                                required: true,
                                message: "Please input the title!",
                            },
                        ]}
                    >
                        <Input
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Bio"
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
                        label="Photo"
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
                                Upload New Photo
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            Update
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Layout>
    );
};

export default CityEdit;
