import React, { useState, useEffect } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import {
    Steps,
    Form,
    Button,
    Upload,
    message,
    Card,
    Divider,
    Input,
    Select,
    DatePicker,
    Checkbox,
    Radio,
    Space,
    Typography,
    UploadFile,
} from "antd";
import {
    UploadOutlined,
    SaveOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadChangeParam } from "antd/es/upload";
import {
    Service,
    ServiceStep,
    ServiceField,
    UserService,
    UserServiceAttachment,
    UserServiceFieldValue,
} from "@/types/Services";
import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "axios";

const { Step } = Steps;
const { TextArea } = Input;
const { Text } = Typography;
interface prop extends PageProps {
    service: Service;
    userService: UserService;
    fieldValues: UserServiceFieldValue;
    completedSteps: [];
    currentStepId: number;
}
const ServiceForm: React.FC = () => {
    const { props } = usePage<prop>();
    const {
        service,
        userService,
        fieldValues: initialFieldValues,
        completedSteps,
        currentStepId,
    } = props;

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [form] = Form.useForm();

    // Initialize form with current step
    useEffect(() => {
        if (service?.steps?.length) {
            const initialStepIndex = service.steps.findIndex(
                (step: ServiceStep) => step.id === currentStepId
            );
            setCurrentStep(initialStepIndex >= 0 ? initialStepIndex : 0);
            loadStepData(
                service.steps[initialStepIndex >= 0 ? initialStepIndex : 0].id
            );
        }
    }, [service, currentStepId]);

    const loadStepData = async (stepId: number) => {
        try {
            const response = await axios.get(
                route("admin.user-services.step-data", [userService.id, stepId])
            );

            const { fieldValues, attachments } = response.data;

            form.setFieldsValue(fieldValues);

            setFileList(
                attachments.map((file: UserServiceAttachment) => ({
                    uid: String(file.id),
                    name: file.file_path.split("/").pop() || "file",
                    status: "done",
                    url: `/storage/${file.file_path}`,
                    response: file,
                }))
            );
        } catch (error) {
            console.error("Failed to load step data:", error);
        }
    };

    const handleStepChange = (nextStep: number) => {
        if (nextStep < 0 || nextStep >= service.steps.length) return;

        const nextStepId = service.steps[nextStep].id;
        loadStepData(nextStepId);
        setCurrentStep(nextStep);
    };

    const handleUploadChange: UploadProps["onChange"] = (
        info: UploadChangeParam
    ) => {
        let newFileList = [...info.fileList];

        // Limit the number of files
        newFileList = newFileList.slice(-5);

        // Read response and show message
        newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
        });

        setFileList(newFileList);
    };

    const beforeUpload = (file: RcFile) => {
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error("File must be smaller than 10MB!");
        }
        return isLt10M;
    };

    const onFinish = (values: any) => {
        const formData = new FormData();
        const currentStepData = service.steps[currentStep];

        // Add fields to form data
        Object.entries(values).forEach(([fieldId, value]) => {
            if (fieldId == "note" || fieldId == "is_complete") return;
            formData.append(`fields[${fieldId}]`, value as string);
        });

        // Add files to form data
        fileList.forEach((file) => {
            if (file.originFileObj) {
                formData.append("files[]", file.originFileObj as RcFile);
            }
        });

        formData.append("step_id", currentStepData.id.toString());
        formData.append("is_complete", values.is_complete ? "1" : "0");
        if (values.note) {
            formData.append("note", values.note);
        }

        router.post(
            route("admin.user-services.save-step", userService.id),
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success("Step saved successfully");
                    if (
                        values.is_complete &&
                        currentStep < service.steps.length - 1
                    ) {
                        handleStepChange(currentStep + 1);
                    }
                },
                onError: (e) => console.log(e),
            }
        );
    };
    const handleUpload = (file: any, fieldId: number) => {
        const formData = new FormData();
        formData.append("file", file);
        // formData.append("step_id", editModal.stepId?.toString() || "");
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
                    message.success("File uploaded successfully");
                    setUploading(false);
                },
                onError: () => {
                    message.error("File upload failed");
                    setUploading(false);
                },
            }
        );
        return false; // Prevent default upload behavior
    };
    const renderField = (field: ServiceField) => {
        const commonProps = {
            id: `field_${field.id}`,
            name: field.id.toString(),
            required: field.required,
        };

        switch (field.field_type) {
            case "text":
                return <Input {...commonProps} />;
            case "textarea":
                return <TextArea {...commonProps} rows={4} />;
            case "select":
                return (
                    <Select
                        {...commonProps}
                        options={field.options?.map((opt) => ({
                            value: opt,
                            label: opt,
                        }))}
                    />
                );
            case "checkbox":
                return (
                    <Checkbox.Group {...commonProps} options={field.options} />
                );
            case "radio":
                return <Radio.Group {...commonProps} options={field.options} />;
            case "date":
                return (
                    <DatePicker {...commonProps} style={{ width: "100%" }} />
                );
            case "file":
                return (
                    <Upload
                        beforeUpload={(file) => handleUpload(file, field.id)}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                    >
                        <Button icon={<UploadOutlined />}>اضغط للرفع</Button>
                    </Upload>
                );
            default:
                return <Input {...commonProps} />;
        }
    };

    const isFieldVisible = (field: ServiceField, formValues: any): boolean => {
        if (!field.dependency) return true;

        const dependentFieldId = field.dependency.field_id;
        const dependentValue = formValues?.[dependentFieldId];

        return dependentValue === field.dependency.value;
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-8">
                <Card title={service.name} bordered={false}>
                    <Steps current={currentStep} onChange={handleStepChange}>
                        {service.steps.map((step: ServiceStep) => (
                            <Step
                                key={step.id}
                                title={step.title}
                                status={
                                    completedSteps[step.id] === "completed"
                                        ? "finish"
                                        : currentStep ===
                                          service.steps.findIndex(
                                              (s) => s.id === step.id
                                          )
                                        ? "process"
                                        : "wait"
                                }
                            />
                        ))}
                    </Steps>

                    <Divider />

                    {service.steps.length > 0 && (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{ is_complete: false }}
                        >
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold">
                                    {service.steps[currentStep].title}
                                </h2>
                                {service.steps[currentStep].description && (
                                    <Text type="secondary">
                                        {service.steps[currentStep].description}
                                    </Text>
                                )}
                            </div>

                            <Form.Item shouldUpdate noStyle>
                                {({ getFieldsValue }) => (
                                    <>
                                        {service.steps[currentStep].fields
                                            .filter((field) =>
                                                isFieldVisible(
                                                    field,
                                                    getFieldsValue()
                                                )
                                            )
                                            .map((field: ServiceField) => (
                                                <Form.Item
                                                    key={field.id}
                                                    label={field.label}
                                                    name={field.id.toString()}
                                                    rules={[
                                                        {
                                                            required:
                                                                field.required,
                                                            message: `${field.label} is required`,
                                                        },
                                                    ]}
                                                >
                                                    {renderField(field)}
                                                </Form.Item>
                                            ))}
                                    </>
                                )}
                            </Form.Item>

                            <Form.Item label="Note (Optional)" name="note">
                                <TextArea rows={3} />
                            </Form.Item>

                            <Form.Item
                                name="is_complete"
                                valuePropName="checked"
                            >
                                <Checkbox>عين هذه الخطة كمكتملة</Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={uploading}
                                    >
                                        احفظ
                                    </Button>

                                    {currentStep < service.steps.length - 1 && (
                                        <Button
                                            type="default"
                                            onClick={() => {
                                                form.setFieldsValue({
                                                    is_complete: true,
                                                });
                                                form.submit();
                                            }}
                                            icon={<ArrowRightOutlined />}
                                        >
                                            احفظ وتقدم
                                        </Button>
                                    )}

                                    {currentStep > 0 && (
                                        <Button
                                            onClick={() =>
                                                handleStepChange(
                                                    currentStep - 1
                                                )
                                            }
                                        >
                                            السابقة
                                        </Button>
                                    )}
                                </Space>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ServiceForm;
