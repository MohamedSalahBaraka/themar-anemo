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

const TeamMemberForm: React.FC<FormProps> = ({ teamMember }) => {
    const { data, setData, post, put, processing, errors } = useForm({
        name: teamMember?.name || "",
        title: teamMember?.title || "",
        bio: teamMember?.bio || "",
        photo: null as File | null,
        order: teamMember?.order || 0,
    });

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("title", data.title);
        formData.append("bio", data.bio);
        formData.append("order", data.order.toString());
        console.log(data);
        if (data.photo) {
            formData.append("photo", data.photo);
        }

        if (teamMember) {
            formData.append("_method", "PUT"); // 👈 spoof the method
            router.post(
                route("admin.team-members.update", teamMember.id),
                formData,
                {
                    // forceFormData: true,
                    onSuccess: () =>
                        message.success("Team member updated successfully"),
                    onError: (e) => {
                        console.log(e);
                        message.error("Error updating team member");
                    },
                }
            );
        } else {
            router.post(route("admin.team-members.store"), formData, {
                onSuccess: () =>
                    message.success("Team member created successfully"),
                onError: () => message.error("Error creating team member"),
            });
        }
    };

    const handleFileChange = (info: any) => {
        setData("photo", info.fileList[0].originFileObj);
    };

    return (
        <Layout>
            <Head
                title={teamMember ? "Edit Team Member" : "Create Team Member"}
            />
            <Card
                title={
                    teamMember ? "Edit Team Member" : "Create New Team Member"
                }
                extra={
                    <Link href={route("admin.team-members.index")}>
                        <Button>Back to List</Button>
                    </Link>
                }
            >
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Name"
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
                                label="Title"
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
                                label="Order"
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
                                label="Photo"
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
                                        Click to upload
                                    </Button>
                                </Upload>
                                {teamMember?.photo && !data.photo && (
                                    <div style={{ marginTop: 8 }}>
                                        <img
                                            src={`/storage/${teamMember.photo}`}
                                            alt="Current"
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
                        label="Bio"
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
                            {teamMember ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Layout>
    );
};

export default TeamMemberForm;
