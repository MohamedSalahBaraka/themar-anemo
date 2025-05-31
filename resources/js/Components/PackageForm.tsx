import React from "react";
import {
    Form,
    Input,
    InputNumber,
    Switch,
    Modal,
    message,
    Button,
    Space,
    Select,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { router } from "@inertiajs/react";
import { Package } from "@/types/user";
import { useLanguage } from "@/contexts/LanguageContext";
import useToken from "antd/es/theme/useToken";
import { theme } from "@/config/theme/themeVariables";

interface PackageFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    packageData?: Package | null;
}

interface FeatureItem {
    key: string;
    value: string;
}

const { Option } = Select;
const PackageForm: React.FC<PackageFormProps> = ({
    visible,
    onCancel,
    onSuccess,
    packageData,
}) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setisLoading] = React.useState(false);
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Convert features array to JSON object
            if (values.features && Array.isArray(values.features)) {
                const featuresObj = values.features.reduce(
                    (acc: Record<string, string>, item: FeatureItem) => {
                        if (item.key) {
                            acc[item.key] = item.value || "";
                        }
                        return acc;
                    },
                    {}
                );
                values.features = JSON.stringify(featuresObj);
            } else {
                values.features = "{}";
            }

            setisLoading(true);

            if (packageData && packageData.id) {
                router.put(
                    route("admin.packages.update", packageData.id),
                    values,
                    {
                        onSuccess: () => {
                            message.success("تم تحديث الباقة بنجاح");
                        },
                        onError: (errors) => {
                            console.error(errors);
                            messageApi.error("فشل تحديث الباقة");
                        },
                        onFinish: () => {
                            onSuccess();
                            setisLoading(false);
                        },
                    }
                );
            } else {
                router.post(route("admin.packages.store"), values, {
                    onSuccess: () => {
                        message.success("تم إنشاء الباقة بنجاح");
                    },
                    onError: (errors) => {
                        console.error(errors);
                        messageApi.error("فشل إنشاء الباقة");
                    },
                    onFinish: () => {
                        onSuccess();
                        setisLoading(false);
                    },
                });
            }
        } catch (error) {
            console.error(error);
            setisLoading(false);
        }
    };

    // Convert features JSON to array for the form
    const parseFeatures = (
        features: string | Record<string, any> | null | undefined
    ): FeatureItem[] => {
        try {
            if (!features) return [{ key: "", value: "" }];

            const featuresObj =
                typeof features === "string" ? JSON.parse(features) : features;

            if (!featuresObj || typeof featuresObj !== "object") {
                return [{ key: "", value: "" }];
            }

            return Object.entries(featuresObj).map(([key, value]) => ({
                key,
                value:
                    typeof value === "string" ? value : JSON.stringify(value),
            }));
        } catch (e) {
            console.error("Error parsing features", e);
            return [{ key: "", value: "" }];
        }
    };

    React.useEffect(() => {
        if (visible && packageData) {
            form.setFieldsValue({
                ...packageData,
                features: parseFeatures(packageData.features),
            });
        } else if (visible) {
            form.setFieldsValue({
                features: [{ key: "", value: "" }],
            });
        }
    }, [visible, packageData, form]);

    return (
        <Modal
            title={packageData ? "تعديل الباقة" : "إضافة باقة"}
            visible={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={isLoading}
            width={700}
        >
            {contextHolder}
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="اسم الباقة"
                    rules={[
                        {
                            required: true,
                            message: "يرجى إدخال اسم الباقة",
                        },
                    ]}
                >
                    <Input
                        style={{
                            background: "transparent",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="الوصف"
                    rules={[{ required: true, message: "يرجى إدخال الوصف" }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="السعر الشهري"
                    rules={[{ required: true, message: "يرجى إدخال السعر" }]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="yearly_price"
                    label="السعر السنوي"
                    rules={[{ required: true, message: "يرجى إدخال السعر" }]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="user_type"
                    label="نوع المستخدم"
                    rules={[
                        {
                            required: true,
                            message: "الرجاء اختيار نوع المستخدم",
                        },
                    ]}
                >
                    <Select placeholder="اختر الدور">
                        <Option value="owner">مالك</Option>
                        <Option value="agent">وسيط</Option>
                        <Option value="company">شركة</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="max_listings"
                    label="الحد الأقصى للعروض"
                    rules={[
                        {
                            required: true,
                            message: "يرجى إدخال الحد الأقصى للعروض",
                        },
                    ]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="الميزات">
                    <Form.List name="features">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space
                                        key={key}
                                        style={{
                                            display: "flex",
                                            marginBottom: 8,
                                        }}
                                        align="baseline"
                                    >
                                        <Form.Item
                                            {...restField}
                                            name={[name, "key"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "مطلوب",
                                                },
                                            ]}
                                        >
                                            <Input
                                                style={{
                                                    background: "transparent",
                                                }}
                                                placeholder="اسم الميزة"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "value"]}
                                        >
                                            <Input
                                                style={{
                                                    background: "transparent",
                                                }}
                                                placeholder="وصف الميزة"
                                            />
                                        </Form.Item>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => remove(name)}
                                        />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        إضافة ميزة
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="الحالة"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="مفعل"
                        unCheckedChildren="غير مفعل"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PackageForm;
