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
    const { t } = useLanguage();
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
                    message.success(t("package_created_successfully"));
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error(t("failed_to_create_package"));
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
            title={packageData ? t("edit_package") : t("add_package")}
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
                    label={t("package_name")}
                    rules={[
                        {
                            required: true,
                            message: t("please_enter_package_name"),
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
                    label={t("description")}
                    rules={[
                        {
                            required: true,
                            message: t("please_enter_description"),
                        },
                    ]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="price"
                    label={t("monthly_price")}
                    rules={[
                        { required: true, message: t("please_enter_price") },
                    ]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="yearly_price"
                    label={t("yearly_price")}
                    rules={[
                        { required: true, message: t("please_enter_price") },
                    ]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="user_type"
                    label={t("user_type")}
                    rules={[
                        {
                            required: true,
                            message: t("please_select_user_type"),
                        },
                    ]}
                >
                    <Radio.Group>
                        <Radio.Button value="owner">{t("owner")}</Radio.Button>
                        <Radio.Button value="agent">{t("agent")}</Radio.Button>
                        <Radio.Button value="company">
                            {t("company")}
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="max_listings"
                    label={t("max_listings")}
                    rules={[
                        {
                            required: true,
                            message: t("please_enter_max_listings"),
                        },
                    ]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="max_adds"
                    label={t("max_featured_listings")}
                    rules={[
                        {
                            required: true,
                            message: t("please_enter_max_listings"),
                        },
                    ]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label={t("features")}>
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
                                                    message: t(
                                                        "please_enter_feature"
                                                    ),
                                                },
                                            ]}
                                        >
                                            <Input
                                                placeholder={t(
                                                    "feature_example"
                                                )}
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
                                        {t("add_feature")}
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label={t("status")}
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren={t("active")}
                        unCheckedChildren={t("inactive")}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PackageForm;
