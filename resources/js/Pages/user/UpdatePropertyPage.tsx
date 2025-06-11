import React from "react";
import { usePage, router } from "@inertiajs/react";
import { Typography, Card, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import PropertyForm from "@/Components/PropertyForm";
import AppLayout from "@/Layouts/Layout";
import { PageProps } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const { Title, Text } = Typography;

interface UpdatePropertyPageProps extends PageProps {
    property: any;
}
const UpdatePropertyPage: React.FC = () => (
    <AppLayout>
        <Page />
    </AppLayout>
);
const Page: React.FC = () => {
    const { t } = useLanguage();
    const [messageApi, contextHolder] = message.useMessage();
    const { props } = usePage<UpdatePropertyPageProps>();

    // Format initial images
    const initialValues = React.useMemo(() => {
        if (!props.property) return null;

        const fileList =
            props.property.images?.map((img: any) => ({
                uid: `${img.id}`,
                name: img.image_url.split("/").pop(),
                status: "done",
                url: `${window.location.origin}/storage/${img.image_url}`,
                id: img.id,
            })) || [];

        return {
            ...props.property,
            images: fileList,
        };
    }, [props.property]);

    const handleSubmit = async (values: any) => {
        if (!props.property) return;

        const formData = new FormData();

        // Append regular fields
        Object.entries(values).forEach(([key, val]) => {
            if (key === "images" && Array.isArray(val)) {
                val.forEach((fileWrapper: any) => {
                    if (fileWrapper.originFileObj instanceof File) {
                        formData.append("images[]", fileWrapper.originFileObj);
                    }
                });
            } else if (key === "deletedImages" && Array.isArray(val)) {
                val.forEach((id: number) => {
                    formData.append("deleted_images[]", id.toString());
                });
            } else if (val !== null && val !== undefined) {
                // @ts-ignore
                formData.append(key, val);
            }
        });
        formData.append("_method", "PUT");

        router.post(
            route("user.properties.update", props.property.id),
            formData,
            {
                forceFormData: true,
                onSuccess: () => {
                    messageApi.success(
                        t("property have been updated successfully")
                    );
                    router.visit(route("user.properties.index"));
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("Error Updating Property");
                },
            }
        );
    };

    if (!initialValues) {
        return (
            <AppLayout>
                <div style={{ padding: "24px" }}>
                    <Card>
                        <Title level={4}>{t("property Not Found")}</Title>
                        <Text>
                            {t(
                                "this Property Doesn't Exist or u don't have permssion to update it"
                            )}
                        </Text>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            {contextHolder}
            <Card>
                <Title level={2}>
                    <EditOutlined />
                    {t("Edit Property")}
                </Title>
                <Text type="secondary">{t("Update your Property")}</Text>

                <div style={{ marginTop: 24 }}>
                    <PropertyForm
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        onCancel={() =>
                            router.visit(route("user.properties.index"))
                        }
                    />
                </div>
            </Card>
        </div>
    );
};

export default UpdatePropertyPage;
