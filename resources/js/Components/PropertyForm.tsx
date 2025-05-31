// src/components/PropertyForm.tsx
import React, { useState } from "react";
import {
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Space,
    Typography,
    Divider,
    Upload,
    message,
    Row,
    Col,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Property } from "@/types/property";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface PropertyFormProps {
    initialValues?: Partial<Property>;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [form] = Form.useForm();
    const [deletedImages, setDeletedImages] = useState<number[]>([]);

    React.useEffect(() => {
        form.setFieldsValue(initialValues);
    }, [initialValues, form]);

    const onFinish = (values: any) => {
        onSubmit({
            ...values,
            deletedImages: deletedImages,
        });
    };

    const handleRemoveImage = (id: number) => {
        if (!isNaN(id)) setDeletedImages([...deletedImages, id]);
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
        >
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="title"
                        label="عنوان العقار"
                        rules={[
                            { required: true, message: "الرجاء إدخال العنوان" },
                        ]}
                    >
                        <Input
                            style={{
                                background: "transparent",
                            }}
                            placeholder="مثال: شقة جميلة 3 غرف نوم"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="type"
                        label="نوع العقار"
                        rules={[
                            { required: true, message: "الرجاء اختيار النوع" },
                        ]}
                    >
                        <Select placeholder="اختر نوع العقار">
                            <Option value="apartment">شقة</Option>
                            <Option value="villa">فيلا</Option>
                            <Option value="office">مكتب</Option>
                            <Option value="land">أرض</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="purpose"
                        label="الغرض"
                        rules={[
                            { required: true, message: "الرجاء اختيار الغرض" },
                        ]}
                    >
                        <Select placeholder="اختر الغرض">
                            <Option value="sale">للبيع</Option>
                            <Option value="rent">للإيجار</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="price"
                        label="السعر"
                        rules={[
                            { required: true, message: "الرجاء إدخال السعر" },
                        ]}
                    >
                        <InputNumber<number>
                            style={{ width: "100%" }}
                            min={0}
                            formatter={(value) =>
                                `$ ${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                )
                            }
                            parser={(value) =>
                                Number(value?.replace(/\$\s?|(,*)/g, "") ?? "0")
                            }
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="description"
                label="الوصف"
                rules={[{ required: true, message: "الرجاء إدخال الوصف" }]}
            >
                <TextArea rows={4} placeholder="وصف تفصيلي للعقار" />
            </Form.Item>

            <Divider orientation="left">التفاصيل</Divider>

            <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="bedrooms" label="غرف النوم">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="bathrooms" label="الحمامات">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="area" label="المساحة (قدم مربع)">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">الموقع</Divider>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="address" label="العنوان">
                        <Input
                            style={{
                                background: "transparent",
                            }}
                            placeholder="العنوان الكامل للعقار"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="floor" label="الطابق (إن وجد)">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="latitude" label="خط العرض">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="longitude" label="خط الطول">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">الصور</Divider>

            <Form.Item
                name="images"
                label="صور العقار"
                valuePropName="fileList"
                getValueFromEvent={normFile}
            >
                <Upload
                    listType="picture-card"
                    multiple
                    beforeUpload={() => false}
                    onRemove={(file) => {
                        handleRemoveImage(parseInt(file.uid));
                    }}
                >
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>رفع</div>
                    </div>
                </Upload>
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        حفظ التغييرات
                    </Button>
                    <Button onClick={onCancel}>إلغاء</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default PropertyForm;
