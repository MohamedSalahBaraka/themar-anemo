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
    Radio,
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
    userType: string | undefined;
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
    userType,
}) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setisLoading] = React.useState(false);
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Convert features array to JSON object
            if (!values.features || !Array.isArray(values.features)) {
                values.features = [];
            }

            setisLoading(true);

            router.post(route("admin.packages.upsert"), values, {
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
        } catch (error) {
            console.error(error);
            setisLoading(false);
        }
    };

    React.useEffect(() => {
        if (visible && packageData) {
            form.setFieldsValue({
                ...packageData,
                features: packageData.features,
            });
            if (userType) form.setFieldValue("user_type", userType);
        } else if (visible) {
            form.setFieldsValue({
                features: [],
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
                    <Radio.Group>
                        <Radio.Button value="owner">مالك</Radio.Button>
                        <Radio.Button value="agent">وسيط</Radio.Button>
                        <Radio.Button value="company">شركة</Radio.Button>
                    </Radio.Group>
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
                <Form.Item
                    name="max_adds"
                    label="الحد الأقصى للعروض المميزة"
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
                                            name={name}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "يرجى إدخال الميزة",
                                                },
                                            ]}
                                        >
                                            <Input placeholder="مثال: دعم العملاء على مدار الساعة" />
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
