import React from "react";
import { router } from "@inertiajs/react";
import { Typography, Card, message, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PropertyForm from "@/Components/PropertyForm";
import AppLayout from "@/Layouts/Layout";

const { Title, Text } = Typography;

const CreatePropertyPage: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (values: any) => {
        const formData = new FormData();

        Object.entries(values).forEach(([key, val]) => {
            if (key === "images" && Array.isArray(val)) {
                val.forEach((fileWrapper: any) => {
                    if (fileWrapper.originFileObj instanceof File) {
                        formData.append("images[]", fileWrapper.originFileObj);
                    }
                });
            } else if (val !== null && val !== undefined) {
                // @ts-ignore
                formData.append(key, val);
            }
        });

        router.post(route("user.properties.store"), formData, {
            forceFormData: true,
            onSuccess: () => {
                messageApi.success("Property created successfully");
                router.visit(route("user.properties.index"));
            },
            onError: (errors) => {
                console.error(errors);
                messageApi.error("Failed to create property");
            },
        });
    };

    return (
        <AppLayout>
            <div style={{ padding: "24px" }}>
                {contextHolder}
                <Card>
                    <Title level={2}>
                        <PlusOutlined /> Create New Property
                    </Title>
                    <Text type="secondary">
                        Fill out the form to list a new property
                    </Text>

                    <div style={{ marginTop: 24 }}>
                        <PropertyForm
                            onSubmit={handleSubmit}
                            onCancel={() =>
                                router.visit(route("user.properties.index"))
                            }
                        />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
};

export default CreatePropertyPage;
