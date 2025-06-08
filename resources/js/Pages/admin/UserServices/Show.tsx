import React, { useState } from "react";
import {
    Button,
    Row,
    Col,
    Card,
    Descriptions,
    Tag,
    List,
    Modal,
    Form,
    Input,
    Avatar,
    Space,
    Select,
    Upload,
    message,
    Divider,
    Checkbox,
    Radio,
    DatePicker,
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
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import AdminLayout from "@/Layouts/AdminLayout";
import dayjs, { isDayjs } from "dayjs";

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

const UserServiceShow = () => {
    const { props } = usePage<Page>();
    const { userService, serviceSteps } = props;
    const [form] = Form.useForm();

    const [editModal, setEditModal] = useState<{
        visible: boolean;
        stepId: number | null;
        stepTitle: string;
        fields: ServiceField[];
        values: Record<string, any>;
    }>({
        visible: false,
        stepId: null,
        stepTitle: "",
        fields: [],
        values: {},
    });

    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    // تجميع الحقول حسب الخطوة وحالة العرض عند الإنشاء
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

    // الحصول على قيم الحقول الحالية
    const getFieldValue = (fieldId: number) => {
        const fieldValue = userService.field_values?.find(
            (fv) => fv.service_field_id === fieldId
        );
        return fieldValue?.value || "";
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleString();
    };

    const showEditModal = (step: ServiceStep | "creation") => {
        const fields =
            step === "creation"
                ? creationFields
                : userService.service.fields?.filter(
                      (field) => field.step_id === step.id
                  ) || [];

        const values: Record<string, any> = {};
        fields.forEach((field) => {
            const value = getFieldValue(field.id);
            if (field.field_type !== "date")
                values[`field_${field.id}`] = value;
            else values[`field_${field.id}`] = dayjs(value);
        });

        setEditModal({
            visible: true,
            stepId: step === "creation" ? null : step.id,
            stepTitle: step === "creation" ? "المعلومات الأولية" : step.title,
            fields,
            values,
        });

        // إعادة تعيين النموذج بقيم جديدة
        form.resetFields();
        form.setFieldsValue(values);
    };

    const handleEditSubmit = () => {
        form.validateFields()
            .then((values) => {
                const fieldValues = Object.entries(values)
                    .filter(([key]) => key.startsWith("field_"))
                    .map(([key, value]) => {
                        const fieldId = parseInt(key.replace("field_", ""));
                        const field = editModal.fields.find(
                            (f) => f.id === fieldId
                        );
                        if (field?.field_type == "file") return null;
                        // تحويل كائن dayjs إلى سلسلة ISO لحقول التاريخ
                        let processedValue = value;
                        if (field?.field_type === "date" && value) {
                            processedValue =
                                value &&
                                (dayjs.isDayjs(value) || value instanceof Date)
                                    ? dayjs(value).toISOString()
                                    : value;
                        }

                        return {
                            field_id: fieldId,
                            value: processedValue,
                        };
                    });

                router.post(
                    route("admin.user-services.update-fields", userService.id),
                    {
                        step_id: editModal.stepId,
                        fields: fieldValues
                            .filter(
                                (f): f is { field_id: number; value: any } =>
                                    f !== null
                            )
                            .map((f) => ({
                                ...f,
                                value:
                                    typeof f.value === "object" &&
                                    f.value !== null
                                        ? JSON.stringify(f.value)
                                        : f.value ?? "",
                            })),
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setEditModal({ ...editModal, visible: false });
                            message.success("تم تحديث الحقول بنجاح");
                        },
                        onError: (errors) => {
                            message.error("فشل في تحديث الحقول");
                            console.error(errors);
                        },
                    }
                );
            })
            .catch((errors) => {
                console.error("أخطاء التحقق:", errors);
            });
    };

    const handleUpload = (file: any, fieldId: number) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("step_id", editModal.stepId?.toString() || "");
        formData.append("field_id", fieldId.toString());
        formData.append("user_service_id", userService.id.toString());

        setUploading(true);
        router.post(
            route("admin.user-services.upload", userService.id),
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setFileList([]);
                    message.success("تم رفع الملف بنجاح");
                    setUploading(false);
                },
                onError: () => {
                    message.error("فشل في رفع الملف");
                    setUploading(false);
                },
            }
        );
        return false; // منع سلوك الرفع الافتراضي
    };

    const handleDownload = (filePath: string, fileName?: string) => {
        // إنشاء عنصر رابط مؤقت
        const link = document.createElement("a");
        link.href = `${window.location.origin}/storage/` + filePath;
        link.target = "_blank";
        link.download = fileName || filePath.split("/").pop() || "download";
        console.log(`${window.location.origin}/storage/` + filePath);

        // إلحاق بـ DOM، النقر وإزالة
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderFieldInput = (field: ServiceField) => {
        const fieldName = `field_${field.id}`;
        const initialValue = getFieldValue(field.id);

        switch (field.field_type) {
            case "text":
                return <Input placeholder={`أدخل ${field.label}`} />;
            case "textarea":
                return (
                    <TextArea rows={4} placeholder={`أدخل ${field.label}`} />
                );
            case "email":
                return (
                    <Input type="email" placeholder={`أدخل ${field.label}`} />
                );
            case "number":
                return (
                    <Input type="number" placeholder={`أدخل ${field.label}`} />
                );
            case "select":
                return (
                    <Select placeholder={`اختر ${field.label}`}>
                        {field.options?.map((option: string) => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                );
            case "checkbox":
                return (
                    <Checkbox.Group
                        options={field.options?.map((option) => ({
                            label: option,
                            value: option,
                        }))}
                    />
                );
            case "multiselect":
                return (
                    <Select mode="multiple" placeholder={`اختر ${field.label}`}>
                        {field.options?.map((option: string) => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                );
            case "radio":
                return (
                    <Radio.Group>
                        {field.options?.map((option: string) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        ))}
                    </Radio.Group>
                );
            case "date":
                let dateValue = null;

                if (initialValue && typeof initialValue === "string") {
                    const parsed = dayjs(initialValue);
                    if (parsed.isValid()) {
                        dateValue = parsed;
                    }
                }

                return (
                    <DatePicker style={{ width: "100%" }} value={dateValue} />
                );

            case "file":
                return (
                    <Upload
                        beforeUpload={(file) => handleUpload(file, field.id)}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                    >
                        <Button icon={<UploadOutlined />}>انقر للرفع</Button>
                    </Upload>
                );
            default:
                return <Input placeholder={`أدخل ${field.label}`} />;
        }
    };

    const attachmentsColumns = [
        {
            title: "الملف",
            dataIndex: "file_path",
            key: "file_path",
            render: (text: string) => (
                <a onClick={() => handleDownload(text)}>
                    {text.split("/").pop()}
                </a>
            ),
        },
        {
            title: "ملاحظة",
            dataIndex: "note",
            key: "note",
        },
        {
            title: "تاريخ الرفع",
            dataIndex: "created_at",
            key: "created_at",
            render: (text: string) => formatDate(text),
        },
        {
            title: "إجراء",
            key: "action",
            render: (_: any, record: any) => (
                <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(record.file_path)}
                >
                    تنزيل
                </Button>
            ),
        },
    ];

    if (!userService) {
        return <div>جاري التحميل...</div>;
    }

    return (
        <AdminLayout>
            <div>
                <Card
                    title={
                        <Space>
                            <Button
                                type="link"
                                onClick={() =>
                                    router.visit(
                                        route("admin.user-services.index")
                                    )
                                }
                            >
                                رجوع
                            </Button>
                            <span>
                                الخدمة: <b>{userService.service.name}</b>
                            </span>
                            <Tag color="blue">{userService.status}</Tag>
                        </Space>
                    }
                    style={{ marginBottom: 24 }}
                >
                    <Row gutter={16}>
                        {/* معلومات المستخدم والخدمة */}
                        <Col span={6}>
                            <Card
                                type="inner"
                                title="معلومات المستخدم"
                                style={{ marginBottom: 16 }}
                            >
                                <Descriptions size="small" column={1}>
                                    <Descriptions.Item label="الاسم">
                                        {userService.user?.name || "غير متوفر"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="البريد الإلكتروني">
                                        {userService.user?.email || "غير متوفر"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="تاريخ الإنشاء">
                                        {formatDate(userService.created_at)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                            <Card type="inner" title="معلومات الخدمة">
                                <Descriptions size="small" column={1}>
                                    <Descriptions.Item label="الخدمة">
                                        {userService.service.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="الفئة">
                                        {userService.service.category?.name ||
                                            "غير متوفر"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="الخطوة الحالية">
                                        {userService.current_step?.title ||
                                            "لم تبدأ بعد"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        {/* الحقول والخطوات */}
                        <Col span={18}>
                            {/* حقول الإنشاء */}
                            {creationFields.length > 0 && (
                                <Card
                                    type="inner"
                                    title="المعلومات الأولية"
                                    style={{ marginBottom: 16 }}
                                    extra={
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() =>
                                                showEditModal("creation")
                                            }
                                        >
                                            تعديل
                                        </Button>
                                    }
                                >
                                    <Descriptions column={2}>
                                        {creationFields.map((field) => (
                                            <Descriptions.Item
                                                key={field.id}
                                                label={field.label}
                                            >
                                                {getFieldValue(field.id) ||
                                                    "غير متوفر"}
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
                                                        تنزيل
                                                    </Button>
                                                )}
                                            </Descriptions.Item>
                                        ))}
                                    </Descriptions>
                                </Card>
                            )}

                            {/* الخطوات مع الحقول */}
                            {stepFields.map(
                                ({ step, fields, userStepData }) =>
                                    fields.length > 0 && (
                                        <Card
                                            key={step.id}
                                            type="inner"
                                            title={`الخطوة: ${step.title}`}
                                            style={{ marginBottom: 16 }}
                                            extra={
                                                <Space>
                                                    {userStepData && (
                                                        <Tag
                                                            color={
                                                                userStepData.status ===
                                                                "completed"
                                                                    ? "success"
                                                                    : "processing"
                                                            }
                                                        >
                                                            {
                                                                userStepData.status
                                                            }
                                                        </Tag>
                                                    )}
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() =>
                                                            showEditModal(step)
                                                        }
                                                    >
                                                        تعديل
                                                    </Button>
                                                </Space>
                                            }
                                        >
                                            {userStepData && (
                                                <Descriptions
                                                    column={2}
                                                    style={{ marginBottom: 16 }}
                                                >
                                                    <Descriptions.Item label="الحالة">
                                                        <Tag
                                                            color={
                                                                userStepData.status ===
                                                                "completed"
                                                                    ? "success"
                                                                    : "processing"
                                                            }
                                                        >
                                                            {
                                                                userStepData.status
                                                            }
                                                        </Tag>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="تاريخ الإكمال">
                                                        {userStepData.completed_at
                                                            ? formatDate(
                                                                  userStepData.completed_at
                                                              )
                                                            : "غير مكتمل"}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item
                                                        label="ملاحظة المشرف"
                                                        span={2}
                                                    >
                                                        {userStepData.admin_note ||
                                                            "لا توجد ملاحظات"}
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
                                                                    عرض الملف
                                                                </a>
                                                            ) : (
                                                                "غير متوفر"
                                                            )
                                                        ) : (
                                                            getFieldValue(
                                                                field.id
                                                            ) || "غير متوفر"
                                                        )}
                                                    </Descriptions.Item>
                                                ))}
                                            </Descriptions>
                                        </Card>
                                    )
                            )}

                            {/* المرفقات */}
                            {userService.attachments &&
                                userService.attachments.length > 0 && (
                                    <Card
                                        type="inner"
                                        title="المرفقات"
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

                            {/* سجل النشاط */}
                            {userService.activityLogs &&
                                userService.activityLogs.length > 0 && (
                                    <Card type="inner" title="سجل النشاط">
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

                {/* نافذة تعديل الحقول */}
                <Modal
                    title={`تعديل الحقول - ${editModal.stepTitle}`}
                    open={editModal.visible}
                    onOk={handleEditSubmit}
                    onCancel={() =>
                        setEditModal({ ...editModal, visible: false })
                    }
                    width={800}
                    okText="حفظ التغييرات"
                    cancelText="إلغاء"
                    confirmLoading={uploading}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={editModal.values}
                    >
                        {editModal.fields.map((field) => (
                            <Form.Item
                                key={field.id}
                                label={field.label}
                                name={`field_${field.id}`}
                                rules={[
                                    {
                                        required: field.required,
                                        message: `${field.label} مطلوب`,
                                    },
                                ]}
                            >
                                {renderFieldInput(field)}
                            </Form.Item>
                        ))}
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default UserServiceShow;
