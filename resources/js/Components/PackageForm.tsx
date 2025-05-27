import React from "react";
import { Form, Input, InputNumber, Switch, Modal, message } from "antd";
import { router } from "@inertiajs/react";
import { Package } from "@/types/user";

interface PackageFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    packageData?: Package | null;
}

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
        const values = await form.validateFields();
        setisLoading(true);
        if (packageData && packageData.id) {
            router.put(route("admin.packages.update", packageData.id), values, {
                onSuccess: () => {
                    message.success("Package updated successfully");
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("Failed to update Package");
                },
                onFinish: () => {
                    onSuccess();
                    setisLoading(false);
                },
            });
        } else {
            router.post(route("admin.packages.store"), values, {
                onSuccess: () => {
                    message.success("Package created successfully");
                },
                onError: (errors) => {
                    console.error(errors);
                    messageApi.error("Failed to create Package");
                },
                onFinish: () => {
                    onSuccess();
                    setisLoading(false);
                },
            });
        }
    };

    React.useEffect(() => {
        if (visible && packageData) {
            form.setFieldsValue({
                ...packageData,
                // Ensure features is properly formatted if it's a string
                features:
                    typeof packageData.features === "string"
                        ? JSON.parse(packageData.features)
                        : packageData.features,
            });
        } else {
            form.resetFields();
        }
    }, [visible, packageData, form]);

    return (
        <Modal
            title={packageData ? "Edit Package" : "Add Package"}
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
                    label="Package Name"
                    rules={[
                        {
                            required: true,
                            message: "Please input package name",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                        { required: true, message: "Please input description" },
                    ]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: "Please input price" }]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="duration"
                    label="Duration (days)"
                    rules={[
                        { required: true, message: "Please input duration" },
                    ]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="max_listings"
                    label="Maximum Listings"
                    rules={[
                        {
                            required: true,
                            message: "Please input maximum listings",
                        },
                    ]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    name="features"
                    label="Features (JSON)"
                    rules={[
                        {
                            validator: (_, value) => {
                                try {
                                    if (value && typeof value === "string") {
                                        JSON.parse(value);
                                    }
                                    return Promise.resolve();
                                } catch (e) {
                                    return Promise.reject(
                                        "Please enter valid JSON"
                                    );
                                }
                            },
                        },
                    ]}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder='Enter features as JSON, e.g. {"feature1": true, "feature2": "value"}'
                    />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Status"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PackageForm;
