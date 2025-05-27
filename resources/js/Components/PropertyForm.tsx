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
    // Set initial values when they change
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
                        label="Property Title"
                        rules={[
                            { required: true, message: "Please enter a title" },
                        ]}
                    >
                        <Input placeholder="e.g. Beautiful 3-Bedroom Apartment" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="type"
                        label="Property Type"
                        rules={[
                            { required: true, message: "Please select a type" },
                        ]}
                    >
                        <Select placeholder="Select property type">
                            <Option value="apartment">Apartment</Option>
                            <Option value="villa">Villa</Option>
                            <Option value="office">Office</Option>
                            <Option value="land">Land</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="purpose"
                        label="Purpose"
                        rules={[
                            {
                                required: true,
                                message: "Please select a purpose",
                            },
                        ]}
                    >
                        <Select placeholder="Select purpose">
                            <Option value="sale">For Sale</Option>
                            <Option value="rent">For Rent</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[
                            { required: true, message: "Please enter a price" },
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
                label="Description"
                rules={[
                    { required: true, message: "Please enter a description" },
                ]}
            >
                <TextArea
                    rows={4}
                    placeholder="Detailed description of the property"
                />
            </Form.Item>

            <Divider orientation="left">Details</Divider>

            <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="bedrooms" label="Bedrooms">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="bathrooms" label="Bathrooms">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="area" label="Area (sq.ft)">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Location</Divider>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="address" label="Address">
                        <Input placeholder="Full address of the property" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="floor" label="Floor (if applicable)">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="latitude" label="Latitude">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="longitude" label="Longitude">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Images</Divider>

            <Form.Item
                name="images"
                label="Property Images"
                valuePropName="fileList"
                getValueFromEvent={normFile}
            >
                <Upload
                    listType="picture-card"
                    multiple
                    beforeUpload={() => false} // Prevent actual upload in this example
                    onRemove={(file) => {
                        handleRemoveImage(parseInt(file.uid));
                    }}
                >
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save Changes
                    </Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default PropertyForm;
