// src/components/PropertyForm.tsx
import React, { useEffect, useState } from "react";
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
import {
    DeleteOutlined,
    PlusOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { Property } from "@/types/property";
import MapPicker from "./MapPicker";
import { useLanguage } from "@/contexts/LanguageContext";

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
    const { t } = useLanguage();
    const [deletedImages, setDeletedImages] = useState<number[]>([]);
    const [location, setLocation] = useState<
        { lat: number; lng: number } | undefined
    >(
        initialValues?.latitude && initialValues?.longitude
            ? { lat: initialValues.latitude, lng: initialValues.longitude }
            : undefined
    );
    const [cities, setCities] = useState<{ id: number; title: string }[]>([]);

    useEffect(() => {
        fetch("/cities") // adjust path if needed
            .then((res) => res.json())
            .then((data) => setCities(data))
            .catch(() => message.error(t("failedToLoadCities")));
    }, []);

    React.useEffect(() => {
        if (initialValues?.latitude && initialValues?.longitude) {
            setLocation({
                lat: initialValues.latitude,
                lng: initialValues.longitude,
            });
        }
        form.setFieldsValue(initialValues);
    }, [initialValues, form]);

    const onFinish = (values: any) => {
        onSubmit({
            ...values,
            latitude: location?.lat,
            longitude: location?.lng,
            deletedImages,
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
                        label={t("propertyTitle")}
                        rules={[
                            { required: true, message: t("pleaseEnterTitle") },
                        ]}
                    >
                        <Input
                            style={{
                                background: "transparent",
                            }}
                            placeholder={t(
                                "example: beautiful 3 bedroom apartment"
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="type"
                        label={t("propertyType")}
                        rules={[
                            { required: true, message: t("pleaseSelectType") },
                        ]}
                    >
                        <Select placeholder={t("selectPropertyType")}>
                            <Option value="apartment">{t("apartment")}</Option>
                            <Option value="villa">{t("villa")}</Option>
                            <Option value="office">{t("office")}</Option>
                            <Option value="land">{t("land")}</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="purpose"
                        label={t("purpose")}
                        rules={[
                            {
                                required: true,
                                message: t("pleaseSelectPurpose"),
                            },
                        ]}
                    >
                        <Select placeholder={t("selectPurpose")}>
                            <Option value="sale">{t("forSale")}</Option>
                            <Option value="rent">{t("forRent")}</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="price"
                        label={t("price")}
                        rules={[
                            { required: true, message: t("pleaseEnterPrice") },
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
                label={t("description")}
                rules={[
                    { required: true, message: t("pleaseEnterDescription") },
                ]}
            >
                <TextArea
                    rows={4}
                    placeholder={t("detailedPropertyDescription")}
                />
            </Form.Item>

            <Divider orientation="left">{t("details")}</Divider>

            <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="bedrooms" label={t("bedrooms")}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="bathrooms" label={t("bathrooms")}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="area" label={t("areaSqFt")}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">{t("location")}</Divider>
            <Form.Item
                name="city_id"
                label={t("city")}
                rules={[{ required: true, message: t("pleaseSelectCity") }]}
            >
                <Select placeholder={t("selectCity")}>
                    {cities.map((city) => (
                        <Select.Option key={city.id} value={city.id}>
                            {city.title}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="address" label={t("address")}>
                        <Input
                            style={{
                                background: "transparent",
                            }}
                            placeholder={t("fullPropertyAddress")}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="floor" label={t("floorIfApplicable")}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <MapPicker
                        value={location}
                        onChange={(coords) => {
                            setLocation(coords);
                            form.setFieldsValue({
                                latitude: coords.lat,
                                longitude: coords.lng,
                            });
                        }}
                    />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="latitude" label={t("latitude")}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="longitude" label={t("longitude")}>
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">{t("images")}</Divider>

            <Form.Item
                name="images"
                label={t("propertyImages")}
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
                        <div style={{ marginTop: 8 }}>{t("upload")}</div>
                    </div>
                </Upload>
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
                                                message:
                                                    t("pleaseEnterFeature"),
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder={t(
                                                "example: 24/7 customer support"
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
                                    {t("addFeature")}
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {t("saveChanges")}
                    </Button>
                    <Button onClick={onCancel}>{t("cancel")}</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default PropertyForm;
