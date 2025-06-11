import React from "react";
import {
    Form,
    Input,
    Button,
    Upload,
    message,
    Card,
    Row,
    Col,
    InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Layout from "@/Layouts/Layout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormProps extends PageProps {
    teamMember?: {
        id: number;
        name: string;
        title: string;
        bio?: string;
        photo?: string;
        order: number;
    };
}
const TeamMemberForm: React.FC<FormProps> = ({ teamMember, auth }) => (
    <AdminLayout>
        <Page teamMember={teamMember} auth={auth} />
    </AdminLayout>
);
const Page: React.FC<FormProps> = ({ teamMember }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        name: teamMember?.name || "",
        title: teamMember?.title || "",
        bio: teamMember?.bio || "",
        photo: null as File | null,
        order: teamMember?.order || 0,
    });

    const { t } = useLanguage();
    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("title", data.title);
        formData.append("bio", data.bio);
        formData.append("order", data.order.toString());
        if (data.photo) {
            formData.append("photo", data.photo);
        }

        if (teamMember) {
            formData.append("_method", "PUT");
            router.post(
                route("admin.team-members.update", teamMember.id),
                formData,
                {
                    onSuccess: () =>
                        message.success(t("team_member_updated_success")),
                    onError: (e) => {
                        console.log(e);
                        message.error(t("team_member_update_failed"));
                    },
                }
            );
        } else {
            router.post(route("admin.team-members.store"), formData, {
                onSuccess: () =>
                    message.success(t("team_member_created_success")),
                onError: () => message.error(t("team_member_creation_failed")),
            });
        }
    };

    const handleFileChange = (info: any) => {
        setData("photo", info.fileList[0].originFileObj);
    };

    return (
        <div>
            <Head
                title={
                    teamMember ? t("edit_team_member") : t("create_team_member")
                }
            />
            <Card
                title={
                    teamMember
                        ? t("edit_team_member")
                        : t("create_new_team_member")
                }
                extra={
                    <Link href={route("admin.team-members.index")}>
                        <Button>{t("back_to_list")}</Button>
                    </Link>
                }
            >
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("name")}
                                validateStatus={errors.name ? "error" : ""}
                                help={errors.name}
                            >
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                label={t("title")}
                                validateStatus={errors.title ? "error" : ""}
                                help={errors.title}
                            >
                                <Input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                label={t("order")}
                                validateStatus={errors.order ? "error" : ""}
                                help={errors.order}
                            >
                                <InputNumber
                                    value={data.order}
                                    onChange={(value) =>
                                        setData("order", value || 0)
                                    }
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={t("photo")}
                                validateStatus={errors.photo ? "error" : ""}
                                help={errors.photo}
                            >
                                <Upload
                                    name="photo"
                                    listType="picture"
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    onChange={handleFileChange}
                                    showUploadList={true}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        {t("click_to_upload")}
                                    </Button>
                                </Upload>
                                {teamMember?.photo && !data.photo && (
                                    <div style={{ marginTop: 8 }}>
                                        <img
                                            src={`/storage/${teamMember.photo}`}
                                            alt={t("current_photo")}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: 200,
                                            }}
                                        />
                                    </div>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label={t("bio")}
                        validateStatus={errors.bio ? "error" : ""}
                        help={errors.bio}
                    >
                        <Input.TextArea
                            rows={4}
                            value={data.bio}
                            onChange={(e) => setData("bio", e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            {teamMember ? t("update") : t("create")}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default TeamMemberForm;
