import { PageProps } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import AppLayout from "@/Layouts/Layout";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Image, Input, message, Row, Upload } from "antd";
import { useLanguage } from "@/contexts/LanguageContext";
import React from "react";
import { User } from "@/types/user";
import AdminLayout from "@/Layouts/AdminLayout";
interface props extends PageProps {
    user: User;
}
export default function Edit({
    mustVerifyEmail,
    status,
    auth,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    if (auth.user.role === "admin")
        return (
            <AdminLayout>
                <Page
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                    auth={auth}
                />
            </AdminLayout>
        );
    else
        return (
            <AppLayout>
                <Page
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                    auth={auth}
                />
            </AppLayout>
        );
}
const Page = ({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) => {
    const user = usePage<props>().props.user;
    const [form] = Form.useForm<{
        bio?: string;
        company_name?: string | null;
        address?: string | null;
        national_id?: string | null;
        tax_id?: string | null;
    }>();
    console.log(user);

    React.useEffect(() => {
        form.setFieldsValue({
            company_name: user.profile?.company_name,
            bio: user.profile?.bio,
            address: user.profile?.address,
            national_id: user.profile?.national_id,
            tax_id: user.profile?.tax_id,
        });
    }, [form, user.profile]);

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!currentUser) return;
            router.put(route("user.profile.update", currentUser.id), values, {
                onSuccess: () => {
                    message.success(t("user_updated_success"));
                },
                onError: (errors) => {
                    console.error(errors);
                    message.error(t("user_update_failed"));
                },
            });
        } catch (error) {
            message.error(t("user_update_failed"));
        }
    };
    const { t } = useLanguage();
    const [currentUser, setCurrentUser] = React.useState<User | null>(
        usePage<props>().props.user
    );
    return (
        <>
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>
                    <div>
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={"company_name"}
                                        label={t("company_name")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("company_name")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={"tax_id"}
                                        label={t("tax_id")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("tax_id")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={"national_id"}
                                        label={t("national_id")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("national_id")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={"address"}
                                        label={t("address")}
                                    >
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            placeholder={t("address")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name={"bio"} label={t("bio")}>
                                <Input.TextArea
                                    rows={4}
                                    placeholder={t("bio")}
                                />
                            </Form.Item>
                            <Form.Item label={t("profile_image")}>
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    action={route("user.profile.upload", {
                                        user: currentUser?.id || "",
                                        type: "profile_image",
                                    })}
                                    headers={{
                                        "X-CSRF-TOKEN":
                                            document
                                                .querySelector(
                                                    'meta[name="csrf-token"]'
                                                )
                                                ?.getAttribute("content") || "",
                                    }}
                                    onChange={(info) => {
                                        if (info.file.status === "done") {
                                            message.success(
                                                t("image_upload_success")
                                            );
                                            router.reload({
                                                only: ["users"],
                                            });
                                            setCurrentUser((us) => {
                                                if (!us) return null;
                                                return {
                                                    ...us,
                                                    profile: {
                                                        ...us.profile,
                                                        profile_image:
                                                            info.file.response
                                                                ?.path,
                                                    },
                                                };
                                            });
                                        } else if (
                                            info.file.status === "error"
                                        ) {
                                            message.error(
                                                t("image_upload_failed")
                                            );
                                        }
                                    }}
                                >
                                    {currentUser?.profile?.profile_image ? (
                                        <Image
                                            className="aspect-[1/1]"
                                            src={`${window.location.origin}/storage/${currentUser.profile.profile_image}`}
                                            alt={t("profile_image")}
                                            width="100%"
                                            preview={false}
                                        />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>
                                                {t("upload_image")}
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                            <Form.Item label={t("id_photo")}>
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    action={route("user.profile.upload", {
                                        user: currentUser?.id || "",
                                        type: "id_photo",
                                    })}
                                    headers={{
                                        "X-CSRF-TOKEN":
                                            document
                                                .querySelector(
                                                    'meta[name="csrf-token"]'
                                                )
                                                ?.getAttribute("content") || "",
                                    }}
                                    onChange={(info) => {
                                        if (info.file.status === "done") {
                                            message.success(
                                                t("image_upload_success")
                                            );
                                            router.reload({
                                                only: ["users"],
                                            });
                                            setCurrentUser((us) => {
                                                if (!us) return null;
                                                return {
                                                    ...us,
                                                    profile: {
                                                        ...us.profile,
                                                        id_photo:
                                                            info.file.response
                                                                ?.path,
                                                    },
                                                };
                                            });
                                        } else if (
                                            info.file.status === "error"
                                        ) {
                                            message.error(
                                                t("image_upload_failed")
                                            );
                                        }
                                    }}
                                >
                                    {currentUser?.profile?.id_photo ? (
                                        <Image
                                            className="aspect-[1/1]"
                                            src={`${window.location.origin}/storage/${currentUser.profile.id_photo}`}
                                            alt={t("id_photo")}
                                            width="100%"
                                            preview={false}
                                        />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>
                                                {t("upload_image")}
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                            <Button onClick={handleEditSubmit}>
                                {t("save_changes")}
                            </Button>
                        </Form>
                    </div>
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </>
    );
};
