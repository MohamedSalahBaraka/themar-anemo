import React from "react";
import {
    Button,
    Row,
    Col,
    Card,
    Descriptions,
    Tag,
    List,
    Input,
    Avatar,
    Space,
    Select,
    Table,
} from "antd";
import { usePage, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    ServiceField,
    ServiceStep,
    UserService,
    UserServiceFieldValue,
    UserServiceStep,
} from "@/types/Services";
import { DownloadOutlined } from "@ant-design/icons";
import AdminLayout from "@/Layouts/AdminLayout";
import AppLayout from "@/Layouts/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

const { TextArea } = Input;
const { Option } = Select;

interface Page extends PageProps {
    userService: UserService & {
        service: {
            fields?: ServiceField[];
            steps?: ServiceStep[];
            category?: {
                name: string;
            };
        };
        fieldValues?: UserServiceFieldValue[];
        userServiceSteps?: UserServiceStep[];
        currentStep?: {
            title: string;
        };
        activityLogs?: Array<{
            id: number;
            action: string;
            created_at: string;
            user: {
                id: number;
                name: string;
                email: string;
                profile?: {
                    profile_image?: string;
                };
            };
            meta?: {
                step_title?: string;
            };
        }>;
        attachments?: Array<{
            id: number;
            file_path: string;
            note: string;
            created_at: string;
            step_id: number | null;
        }>;
    };
    serviceSteps: ServiceStep[];
}
const UserServiceShow: React.FC = () => (
    <AppLayout>
        <Page />
    </AppLayout>
);
const Page = () => {
    const { t } = useLanguage();
    const { props } = usePage<Page>();
    const { userService, serviceSteps } = props;

    // Group fields by step and show_on_creation status
    const creationFields =
        userService.service.fields?.filter((field) => field.show_on_creation) ||
        [];

    const stepFields = serviceSteps.map((step) => {
        const userStepData = userService.steps?.find(
            (uss) => uss.service_step_id === step.id
        );
        return {
            step,
            fields:
                userService.service.fields?.filter(
                    (field) =>
                        field.step_id === step.id && !field.show_on_creation
                ) || [],
            userStepData,
        };
    });

    // Get current field values
    const getFieldValue = (fieldId: number) => {
        const fieldValue = userService.field_values?.find(
            (fv) => fv.service_field_id === fieldId
        );
        return fieldValue?.value || "";
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleString();
    };

    const handleDownload = (filePath: string, fileName?: string) => {
        // Create a temporary link element
        const link = document.createElement("a");
        link.href = `${window.location.origin}/storage/` + filePath;
        link.target = "_blank";
        link.download = fileName || filePath.split("/").pop() || "download";
        console.log(`${window.location.origin}/storage/` + filePath);

        // Append to the DOM, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const attachmentsColumns = [
        {
            title: t("File"),
            dataIndex: "file_path",
            key: "file_path",
            render: (text: string) => (
                <a onClick={() => handleDownload(text)}>
                    {text.split("/").pop()}
                </a>
            ),
        },
        {
            title: t("Note"),
            dataIndex: "note",
            key: "note",
        },
        {
            title: t("Uploaded At"),
            dataIndex: "created_at",
            key: "created_at",
            render: (text: string) => formatDate(text),
        },
        {
            title: t("Actions"),
            key: "action",
            render: (_: any, record: any) => (
                <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(record.file_path)}
                >
                    {t("Download")}
                </Button>
            ),
        },
    ];

    if (!userService) {
        return <div>{t("Loading...")}</div>;
    }

    return (
        <AdminLayout>
            <div>
                <Card
                    title={
                        <Space>
                            {/* <Button
                                type="link"
                                onClick={() =>
                                    router.visit(
                                        route("admin.user-services.index")
                                    )
                                }
                            >
                                Back
                            </Button> */}
                            <span>
                                {t("Service")}:{" "}
                                <b>{userService.service.name}</b>
                            </span>
                            <Tag color="blue">{userService.status}</Tag>
                        </Space>
                    }
                    style={{ marginBottom: 24 }}
                >
                    <Row gutter={16}>
                        {/* User and Service Info */}
                        <Col span={6}>
                            <Card
                                type="inner"
                                title="User Information"
                                style={{ marginBottom: 16 }}
                            >
                                <Descriptions size="small" column={1}>
                                    <Descriptions.Item label={t("Name")}>
                                        {userService.user?.name || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={t("Email")}>
                                        {userService.user?.email || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={t("Created At")}>
                                        {formatDate(userService.created_at)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                            <Card type="inner" title={t("Service Information")}>
                                <Descriptions size="small" column={1}>
                                    <Descriptions.Item label={t("Service")}>
                                        {userService.service.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={t("Category")}>
                                        {userService.service.category?.name ||
                                            "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label={t("Current Step")}
                                    >
                                        {userService.current_step?.title ||
                                            t("Not started")}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        {/* Fields and Steps */}
                        <Col span={18}>
                            {/* Creation Fields */}
                            {creationFields.length > 0 && (
                                <Card
                                    type="inner"
                                    title={t("Initial Information")}
                                    style={{ marginBottom: 16 }}
                                >
                                    <Descriptions column={2}>
                                        {creationFields.map((field) => (
                                            <Descriptions.Item
                                                key={field.id}
                                                label={field.label}
                                            >
                                                {getFieldValue(field.id) ||
                                                    "N/A"}
                                                {field.field_type == "file" && (
                                                    <Button
                                                        icon={
                                                            <DownloadOutlined />
                                                        }
                                                        onClick={() =>
                                                            handleDownload(
                                                                getFieldValue(
                                                                    field.id
                                                                )
                                                            )
                                                        }
                                                    >
                                                        {t("Download")}
                                                    </Button>
                                                )}
                                            </Descriptions.Item>
                                        ))}
                                    </Descriptions>
                                </Card>
                            )}

                            {/* Steps with Fields */}
                            {stepFields.map(
                                ({ step, fields, userStepData }) =>
                                    fields.length > 0 && (
                                        <Card
                                            key={step.id}
                                            type="inner"
                                            title={`${t("Step")}: ${
                                                step.title
                                            }`}
                                            style={{ marginBottom: 16 }}
                                            extra={
                                                <Space>
                                                    {userStepData && (
                                                        <Tag
                                                            color={
                                                                userStepData.status ===
                                                                "completed"
                                                                    ? t(
                                                                          "success"
                                                                      )
                                                                    : t(
                                                                          "processing"
                                                                      )
                                                            }
                                                        >
                                                            {
                                                                userStepData.status
                                                            }
                                                        </Tag>
                                                    )}
                                                </Space>
                                            }
                                        >
                                            {userStepData && (
                                                <Descriptions
                                                    column={2}
                                                    style={{ marginBottom: 16 }}
                                                >
                                                    <Descriptions.Item label="Status">
                                                        <Tag
                                                            color={
                                                                userStepData.status ===
                                                                "completed"
                                                                    ? t(
                                                                          "success"
                                                                      )
                                                                    : t(
                                                                          "processing"
                                                                      )
                                                            }
                                                        >
                                                            {
                                                                userStepData.status
                                                            }
                                                        </Tag>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item
                                                        label={t(
                                                            "Completed At"
                                                        )}
                                                    >
                                                        {userStepData.completed_at
                                                            ? formatDate(
                                                                  userStepData.completed_at
                                                              )
                                                            : t(
                                                                  "Not completed"
                                                              )}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item
                                                        label={t("Admin Note")}
                                                        span={2}
                                                    >
                                                        {userStepData.admin_note ||
                                                            t("No notes")}
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            )}
                                            <Descriptions column={2}>
                                                {fields.map((field) => (
                                                    <Descriptions.Item
                                                        key={field.id}
                                                        label={field.label}
                                                    >
                                                        {field.field_type ===
                                                        "file" ? (
                                                            getFieldValue(
                                                                field.id
                                                            ) ? (
                                                                <a
                                                                    onClick={() =>
                                                                        handleDownload(
                                                                            getFieldValue(
                                                                                field.id
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    {t(
                                                                        "View File"
                                                                    )}
                                                                </a>
                                                            ) : (
                                                                "N/A"
                                                            )
                                                        ) : (
                                                            getFieldValue(
                                                                field.id
                                                            ) || "N/A"
                                                        )}
                                                    </Descriptions.Item>
                                                ))}
                                            </Descriptions>
                                        </Card>
                                    )
                            )}

                            {/* Attachments */}
                            {userService.attachments &&
                                userService.attachments.length > 0 && (
                                    <Card
                                        type="inner"
                                        title="Attachments"
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Table
                                            columns={attachmentsColumns}
                                            dataSource={userService.attachments}
                                            rowKey="id"
                                            size="small"
                                            pagination={false}
                                        />
                                    </Card>
                                )}

                            {/* Activity Log */}
                            {userService.activityLogs &&
                                userService.activityLogs.length > 0 && (
                                    <Card type="inner" title="Activity Log">
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={
                                                userService.activity_logs
                                            }
                                            renderItem={(log) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                src={
                                                                    log.user
                                                                        .profile
                                                                        ?.profile_image
                                                                }
                                                                size="small"
                                                            />
                                                        }
                                                        title={
                                                            <span>
                                                                {log.user.name}{" "}
                                                                {log.action.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                                {log.meta
                                                                    ?.step_title && (
                                                                    <Tag
                                                                        color="blue"
                                                                        style={{
                                                                            marginLeft: 8,
                                                                        }}
                                                                    >
                                                                        {
                                                                            log
                                                                                .meta
                                                                                .step_title
                                                                        }
                                                                    </Tag>
                                                                )}
                                                            </span>
                                                        }
                                                        description={
                                                            <span
                                                                style={{
                                                                    color: "#999",
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                {formatDate(
                                                                    log.created_at
                                                                )}
                                                            </span>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                )}
                        </Col>
                    </Row>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default UserServiceShow;
