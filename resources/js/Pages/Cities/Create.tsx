import React from "react";
import { Card, Form, Input, Button, Upload, message, Typography } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Layout from "@/Layouts/Layout";
import { PageProps } from "@/types";
import { Head, Link, router, useForm } from "@inertiajs/react";

const { TextArea } = Input;
const { Title } = Typography;

const CityCreate: React.FC<PageProps> = () => {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        bio: "",
        photo: null as File | null,
    });

    const handleSubmit = (values: any) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("bio", data.bio);
        console.log(data);
        if (data.photo) {
            formData.append("photo", data.photo);
        }

        router.post(route("admin.cities.store"), formData, {
            onSuccess: () => message.success("City created successfully"),
            onError: () => message.error("Error creating City"),
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
            <Head title="Create City" />
            <Card
                title={<Title level={2}>Create New City</Title>}
                extra={
                    <Link href="/admin/cities">
                        <Button icon={<ArrowLeftOutlined />}>Back</Button>
                    </Link>
                }
            >
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
                                Upload Photo
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Layout>
    );
};

export default CityCreate;
