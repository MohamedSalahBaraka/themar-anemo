import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import {
    Form,
    Input,
    Button,
    Card,
    Select,
    Switch,
    InputNumber,
    Space,
    message,
    Row,
    Col,
    Divider,
    Collapse,
    DatePicker,
    Upload,
    Checkbox,
    Radio,
    List,
} from "antd";
import {
    SaveOutlined,
    CloseOutlined,
    PlusOutlined,
    MinusCircleOutlined,
    UploadOutlined,
    MenuOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/Layouts/AdminLayout";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TiptapEditor from "@/Components/TiptapEditor";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface ServiceStep {
    id?: number;
    title: string;
    description: string;
    order: number;
    deadline_days?: number | null;
}

interface ServiceField {
    id?: number;
    label: string;
    field_type: FieldType;
    required: boolean;
    show_on_creation: boolean;
    options: string;
    step_id: number | null;
    order: number;
    step_order: number;
    dependency?: any;
}

type FieldType =
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file"
    | "multiselect";

interface Service {
    id?: number;
    name: string;
    photo: string | File;
    category_id: number | null;
    description: string;
    price: number | null;
    tags: string;
    is_active: boolean;
    steps: ServiceStep[];
    fields: ServiceField[];
}

interface Category {
    id: number;
    name: string;
}

interface ServiceFormProps {
    service?: Service;
    categories: Category[];
}

const SortableItem = ({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                }}
            >
                <Button
                    icon={<MenuOutlined />}
                    {...listeners}
                    style={{ cursor: "grab", marginRight: 8 }}
                />
                {children}
            </div>
        </div>
    );
};

const ServiceForm: React.FC<ServiceFormProps> = ({ service, categories }) => {
    // @ts-ignore
    const { data, setData, post, put, processing, errors } = useForm<Service>({
        name: service?.name || "",
        category_id: service?.category_id || null,
        description: service?.description || "",
        price: service?.price || null,
        tags: Array.isArray(service?.tags)
            ? service.tags.join(",")
            : service?.tags || "",
        is_active: service?.is_active ?? true,
        steps: service?.steps || [],
        fields:
            service?.fields.map((field) => ({
                ...field,
                show_on_creation: !field.step_id, // This sets show_on_creation based on step_id
            })) || [],
    });

    const [activePanels, setActivePanels] = useState<string[]>(["1", "2"]);
    const prepareSubmitData = (): FormData => {
        const formData = new FormData();

        // Handle basic fields
        formData.append("name", data.name);
        if (data.category_id)
            formData.append("category_id", data.category_id.toString());
        if (data.description) formData.append("description", data.description);
        if (data.price) formData.append("price", data.price.toString());

        // Proper boolean handling
        formData.append("is_active", data.is_active ? "1" : "0");
        console.log(data.photo);

        // Handle photo upload
        if (data.photo instanceof File) {
            formData.append("photo", data.photo);
        } else if (typeof data.photo === "string") {
            formData.append("photo_url", data.photo);
        }

        // Handle tags
        const tagsArray =
            typeof data.tags === "string"
                ? data.tags.split(",").map((tag) => tag.trim())
                : Array.isArray(data.tags)
                ? data.tags
                : [];

        tagsArray.forEach((tag, index) => {
            formData.append(`tags[${index}]`, tag);
        });

        // Handle steps
        data.steps.forEach((step, index) => {
            formData.append(`steps[${index}][title]`, step.title);
            if (step.description)
                formData.append(
                    `steps[${index}][description]`,
                    step.description
                );
            formData.append(`steps[${index}][order]`, step.order.toString());
            if (step.id)
                formData.append(`steps[${index}][id]`, step.id.toString());
        });

        // Handle fields with proper boolean conversion
        data.fields.forEach((field, index) => {
            formData.append(`fields[${index}][label]`, field.label);
            formData.append(`fields[${index}][field_type]`, field.field_type);

            // Convert booleans to '1'/'0' strings
            formData.append(
                `fields[${index}][required]`,
                field.required ? "1" : "0"
            );
            formData.append(
                `fields[${index}][show_on_creation]`,
                field.step_id ? "0" : "1"
            );

            if (field.options) {
                const optionArray =
                    typeof field.options === "string"
                        ? field.options
                              .split(",")
                              .map((option) => option.trim())
                        : Array.isArray(field.options)
                        ? field.options
                        : [];

                optionArray.forEach((option, i) => {
                    formData.append(`fields[${index}][options][${i}]`, option);
                });
            }
            if (field.step_id)
                formData.append(
                    `fields[${index}][step_order]`,
                    field.step_id.toString()
                );
            if (field.id)
                formData.append(`fields[${index}][id]`, field.id.toString());
        });

        return formData;
    };

    const handleSubmit = () => {
        const formData = prepareSubmitData();

        if (service?.id) {
            formData.append("_method", "PUT");
            router.post(route("admin.services.update", service.id), formData, {
                onSuccess: () =>
                    message.success("Service updated successfully"),
                onError: (errors) => {
                    console.error(errors);
                    message.error("Error updating service");
                },
            });
        } else {
            router.post(route("admin.services.store"), formData, {
                onSuccess: () =>
                    message.success("Service created successfully"),
                onError: (errors) => {
                    console.error(errors);
                    message.error("Error creating service");
                },
            });
        }
    };

    const handlePanelChange = (keys: string | string[]) => {
        setActivePanels(Array.isArray(keys) ? keys : [keys]);
    };

    const addStep = () => {
        const newStep = {
            title: "",
            description: "",
            order: data.steps.length + 1,
            deadline_days: null,
        };
        setData("steps", [...data.steps, newStep]);
        setActivePanels([...activePanels, `step-${data.steps.length}`]);
    };

    const removeStep = (index: number) => {
        const newSteps = [...data.steps];
        newSteps.splice(index, 1);

        // Reorder remaining steps
        const reorderedSteps = newSteps.map((step, i) => ({
            ...step,
            order: i + 1,
        }));

        setData("steps", reorderedSteps);

        // Update fields that were assigned to this step
        const updatedFields = data.fields.map((field) => ({
            ...field,
            step_id: field.step_id === index + 1 ? null : field.step_id,
        }));

        setData("fields", updatedFields);
    };

    const moveStep = (fromIndex: number, toIndex: number) => {
        const newSteps = [...data.steps];
        const [removed] = newSteps.splice(fromIndex, 1);
        newSteps.splice(toIndex, 0, removed);

        // Update orders
        const reorderedSteps = newSteps.map((step, index) => ({
            ...step,
            order: index + 1,
        }));

        setData("steps", reorderedSteps);
    };

    const addField = (stepId: number | null = null) => {
        const newField: ServiceField = {
            label: "",
            field_type: "text" as FieldType,
            required: false,
            options: "",
            step_id: stepId,
            order:
                data.fields.filter((f) =>
                    stepId ? f.step_id === stepId : !f.step_id
                ).length + 1,
            show_on_creation: !stepId, // Consistent with initialization
            step_order: stepId
                ? data.fields.filter((f) => f.step_id === stepId).length + 1
                : 0,
        };
        setData("fields", [...data.fields, newField]);
    };

    const removeField = (index: number) => {
        const newFields = [...data.fields];
        newFields.splice(index, 1);
        setData("fields", newFields);
    };

    const moveField = (
        fromIndex: number,
        toIndex: number,
        stepId: number | null = null
    ) => {
        const fieldIds = data.fields
            .map((field, index) => ({ index, step_id: field.step_id }))
            .filter(({ step_id }) => (stepId ? step_id === stepId : !step_id))
            .map(({ index }) => index);

        const actualFromIndex = fieldIds.indexOf(fromIndex);
        const actualToIndex = fieldIds.indexOf(toIndex);

        if (actualFromIndex === -1 || actualToIndex === -1) return;

        const newOrder = [...fieldIds];
        const [removed] = newOrder.splice(actualFromIndex, 1);
        newOrder.splice(actualToIndex, 0, removed);

        const newFields = [...data.fields];
        newOrder.forEach((fieldIndex, order) => {
            newFields[fieldIndex].order = order + 1;
        });

        setData("fields", newFields);
    };

    const renderFieldOptions = (field: ServiceField, index: number) => {
        if (["select", "radio", "multiselect"].includes(field.field_type)) {
            return (
                <Form.Item
                    label="Options"
                    name={["fields", index, "options"]}
                    extra="Comma separated options"
                >
                    <Input
                        value={field.options}
                        onChange={(e) => {
                            const newFields = [...data.fields];
                            newFields[index].options = e.target.value;
                            setData("fields", newFields);
                        }}
                    />
                </Form.Item>
            );
        }
        return null;
    };

    const renderFieldInput = (field: ServiceField, index: number) => {
        switch (field.field_type) {
            case "text":
                return <Input />;
            case "textarea":
                return <TextArea rows={4} />;
            case "number":
                return <InputNumber style={{ width: "100%" }} />;
            case "email":
                return <Input type="email" />;
            case "select":
                return (
                    <Select>
                        {field.options.split(",").map((opt) => (
                            <Option key={opt} value={opt.trim()}>
                                {opt.trim()}
                            </Option>
                        ))}
                    </Select>
                );
            case "multiselect":
                return (
                    <Select mode="multiple">
                        {field.options.split(",").map((opt) => (
                            <Option key={opt} value={opt.trim()}>
                                {opt.trim()}
                            </Option>
                        ))}
                    </Select>
                );
            case "checkbox":
                return <Checkbox />;
            case "radio":
                return (
                    <Radio.Group>
                        {field.options.split(",").map((opt) => (
                            <Radio key={opt} value={opt.trim()}>
                                {opt.trim()}
                            </Radio>
                        ))}
                    </Radio.Group>
                );
            case "date":
                return <DatePicker style={{ width: "100%" }} />;
            case "file":
                return (
                    <Upload>
                        <Button icon={<UploadOutlined />}>Upload File</Button>
                    </Upload>
                );
            default:
                return <Input />;
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeIndex = data.steps.findIndex(
                (step) => `step-${step.order}` === active.id
            );
            const overIndex = data.steps.findIndex(
                (step) => `step-${step.order}` === over.id
            );

            if (activeIndex !== -1 && overIndex !== -1) {
                moveStep(activeIndex, overIndex);
            }
        }
    };
    const handleFileChange = (info: any) => {
        setData("photo", info.fileList[0].originFileObj);
    };
    return (
        <AdminLayout>
            <Head title={service ? "Edit Service" : "Create Service"} />

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={data}
            >
                <Card
                    title={service ? "Edit Service" : "Create New Service"}
                    extra={
                        <Space>
                            <Link href={route("admin.services.index")}>
                                <Button icon={<CloseOutlined />}>Cancel</Button>
                            </Link>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={processing}
                            >
                                Save
                            </Button>
                        </Space>
                    }
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Service Name"
                                name="name"
                                validateStatus={errors.name ? "error" : ""}
                                help={errors.name}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input service name!",
                                    },
                                ]}
                            >
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Category"
                                name="category_id"
                                validateStatus={
                                    errors.category_id ? "error" : ""
                                }
                                help={errors.category_id}
                            >
                                <Select<number | null>
                                    placeholder="Select a category"
                                    value={data.category_id}
                                    onChange={(value) =>
                                        setData("category_id", value)
                                    }
                                    allowClear
                                >
                                    {categories.map((category) => (
                                        <Option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Description"
                        name="description"
                        validateStatus={errors.description ? "error" : ""}
                        help={errors.description}
                    >
                        <TiptapEditor
                            value={data.description}
                            onChange={(value) => setData("description", value)}
                        />
                    </Form.Item>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Photo"
                            validateStatus={errors.photo ? "error" : ""}
                            help={errors.photo}
                        >
                            <Upload
                                name="photo"
                                listType="picture"
                                maxCount={1}
                                beforeUpload={() => false}
                                onChange={handleFileChange}
                                showUploadList={true}
                            >
                                <Button icon={<UploadOutlined />}>
                                    Click to upload
                                </Button>
                            </Upload>
                            {service?.photo && !data.photo && (
                                <div style={{ marginTop: 8 }}>
                                    <img
                                        src={`/storage/${service.photo}`}
                                        alt="Current"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: 200,
                                        }}
                                    />
                                </div>
                            )}
                        </Form.Item>
                    </Col>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Price"
                                name="price"
                                validateStatus={errors.price ? "error" : ""}
                                help={errors.price}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    step={0.01}
                                    value={data.price}
                                    onChange={(value) =>
                                        setData("price", value)
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tags"
                                name="tags"
                                validateStatus={errors.tags ? "error" : ""}
                                help={errors.tags}
                                extra="Comma separated list of tags"
                            >
                                <Input
                                    value={data.tags}
                                    onChange={(e) =>
                                        setData("tags", e.target.value)
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {service && (
                        <Form.Item
                            label="Status"
                            name="is_active"
                            valuePropName="checked"
                        >
                            <Switch
                                checked={data.is_active}
                                onChange={(checked) =>
                                    setData("is_active", checked)
                                }
                            />
                        </Form.Item>
                    )}

                    <Divider />

                    <Collapse
                        activeKey={activePanels}
                        onChange={handlePanelChange}
                    >
                        <Panel
                            header="Creation Form Fields (shown when creating a service)"
                            key="creation-fields"
                        >
                            <DndContext onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={data.fields
                                        .filter((field) => !field.step_id)
                                        .map((_, index) => `field-${index}`)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {data.fields
                                        .filter((field) => !field.step_id)
                                        .map((field, index) => {
                                            const originalIndex =
                                                data.fields.findIndex(
                                                    (f) => f === field
                                                );
                                            return (
                                                <SortableItem
                                                    key={`field-${index}`}
                                                    id={`field-${index}`}
                                                >
                                                    <Card
                                                        title={
                                                            field.label ||
                                                            `Field ${index + 1}`
                                                        }
                                                        style={{
                                                            marginBottom: 16,
                                                            width: "100%",
                                                        }}
                                                        extra={
                                                            <Space>
                                                                <Button
                                                                    icon={
                                                                        <MinusCircleOutlined />
                                                                    }
                                                                    onClick={() =>
                                                                        removeField(
                                                                            originalIndex
                                                                        )
                                                                    }
                                                                    danger
                                                                />
                                                            </Space>
                                                        }
                                                    >
                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Label"
                                                                    name={[
                                                                        "fields",
                                                                        originalIndex,
                                                                        "label",
                                                                    ]}
                                                                    rules={[
                                                                        {
                                                                            required:
                                                                                true,
                                                                            message:
                                                                                "Please input field label!",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Input
                                                                        value={
                                                                            field.label
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newFields =
                                                                                [
                                                                                    ...data.fields,
                                                                                ];
                                                                            newFields[
                                                                                originalIndex
                                                                            ].label =
                                                                                e.target.value;
                                                                            setData(
                                                                                "fields",
                                                                                newFields
                                                                            );
                                                                        }}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Type"
                                                                    name={[
                                                                        "fields",
                                                                        originalIndex,
                                                                        "field_type",
                                                                    ]}
                                                                    rules={[
                                                                        {
                                                                            required:
                                                                                true,
                                                                            message:
                                                                                "Please select field type!",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Select
                                                                        value={
                                                                            field.field_type
                                                                        }
                                                                        onChange={(
                                                                            value
                                                                        ) => {
                                                                            const newFields =
                                                                                [
                                                                                    ...data.fields,
                                                                                ];
                                                                            newFields[
                                                                                originalIndex
                                                                            ].field_type =
                                                                                value;
                                                                            setData(
                                                                                "fields",
                                                                                newFields
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Option value="text">
                                                                            Text
                                                                        </Option>
                                                                        <Option value="textarea">
                                                                            Textarea
                                                                        </Option>
                                                                        <Option value="number">
                                                                            Number
                                                                        </Option>
                                                                        <Option value="email">
                                                                            Email
                                                                        </Option>
                                                                        <Option value="select">
                                                                            Select
                                                                        </Option>
                                                                        <Option value="multiselect">
                                                                            Multi-Select
                                                                        </Option>
                                                                        <Option value="checkbox">
                                                                            Checkbox
                                                                        </Option>
                                                                        <Option value="radio">
                                                                            Radio
                                                                        </Option>
                                                                        <Option value="date">
                                                                            Date
                                                                        </Option>
                                                                        <Option value="file">
                                                                            File
                                                                        </Option>
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    label="Required"
                                                                    name={[
                                                                        "fields",
                                                                        originalIndex,
                                                                        "required",
                                                                    ]}
                                                                    valuePropName="checked"
                                                                >
                                                                    <Switch
                                                                        checked={
                                                                            field.required
                                                                        }
                                                                        onChange={(
                                                                            checked
                                                                        ) => {
                                                                            const newFields =
                                                                                [
                                                                                    ...data.fields,
                                                                                ];
                                                                            newFields[
                                                                                originalIndex
                                                                            ].required =
                                                                                checked;
                                                                            setData(
                                                                                "fields",
                                                                                newFields
                                                                            );
                                                                        }}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                        {renderFieldOptions(
                                                            field,
                                                            originalIndex
                                                        )}
                                                    </Card>
                                                </SortableItem>
                                            );
                                        })}
                                </SortableContext>
                            </DndContext>
                            <Button
                                type="dashed"
                                onClick={() => addField(null)}
                                block
                                icon={<PlusOutlined />}
                            >
                                Add Creation Field
                            </Button>
                        </Panel>

                        <Panel header="Service Steps" key="steps">
                            <DndContext onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={data.steps.map(
                                        (step) => `step-${step.order}`
                                    )}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {data.steps.map((step, stepIndex) => (
                                        <SortableItem
                                            key={`step-${step.order}`}
                                            id={`step-${step.order}`}
                                        >
                                            <Card
                                                title={`Step ${step.order}: ${
                                                    step.title || "New Step"
                                                }`}
                                                style={{ marginBottom: 24 }}
                                                extra={
                                                    <Space>
                                                        <Button
                                                            icon={
                                                                <MinusCircleOutlined />
                                                            }
                                                            onClick={() =>
                                                                removeStep(
                                                                    stepIndex
                                                                )
                                                            }
                                                            danger
                                                        />
                                                    </Space>
                                                }
                                            >
                                                <Row gutter={24}>
                                                    <Col span={12}>
                                                        <Form.Item
                                                            label="Title"
                                                            name={[
                                                                "steps",
                                                                stepIndex,
                                                                "title",
                                                            ]}
                                                            rules={[
                                                                {
                                                                    required:
                                                                        true,
                                                                    message:
                                                                        "Please input step title!",
                                                                },
                                                            ]}
                                                        >
                                                            <Input
                                                                value={
                                                                    step.title
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const newSteps =
                                                                        [
                                                                            ...data.steps,
                                                                        ];
                                                                    newSteps[
                                                                        stepIndex
                                                                    ].title =
                                                                        e.target.value;
                                                                    setData(
                                                                        "steps",
                                                                        newSteps
                                                                    );
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item
                                                            label="Deadline (days)"
                                                            name={[
                                                                "steps",
                                                                stepIndex,
                                                                "deadline_days",
                                                            ]}
                                                        >
                                                            <InputNumber
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                                min={0}
                                                                value={
                                                                    step.deadline_days ||
                                                                    undefined
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    const newSteps =
                                                                        [
                                                                            ...data.steps,
                                                                        ];
                                                                    newSteps[
                                                                        stepIndex
                                                                    ].deadline_days =
                                                                        value ||
                                                                        null;
                                                                    setData(
                                                                        "steps",
                                                                        newSteps
                                                                    );
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Form.Item
                                                    label="Description"
                                                    name={[
                                                        "steps",
                                                        stepIndex,
                                                        "description",
                                                    ]}
                                                >
                                                    <TextArea
                                                        rows={2}
                                                        value={step.description}
                                                        onChange={(e) => {
                                                            const newSteps = [
                                                                ...data.steps,
                                                            ];
                                                            newSteps[
                                                                stepIndex
                                                            ].description =
                                                                e.target.value;
                                                            setData(
                                                                "steps",
                                                                newSteps
                                                            );
                                                        }}
                                                    />
                                                </Form.Item>

                                                <Divider orientation="left">
                                                    Step Fields
                                                </Divider>

                                                <DndContext
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <SortableContext
                                                        items={data.fields
                                                            .filter(
                                                                (field) =>
                                                                    field.step_id ===
                                                                    step.order
                                                            )
                                                            .map(
                                                                (_, index) =>
                                                                    `step-field-${step.order}-${index}`
                                                            )}
                                                        strategy={
                                                            verticalListSortingStrategy
                                                        }
                                                    >
                                                        {data.fields
                                                            .filter(
                                                                (field) =>
                                                                    field.step_id ===
                                                                    step.order
                                                            )
                                                            .map(
                                                                (
                                                                    field,
                                                                    fieldIndex
                                                                ) => {
                                                                    const originalIndex =
                                                                        data.fields.findIndex(
                                                                            (
                                                                                f
                                                                            ) =>
                                                                                f ===
                                                                                field
                                                                        );
                                                                    return (
                                                                        <SortableItem
                                                                            key={`step-field-${step.order}-${fieldIndex}`}
                                                                            id={`step-field-${step.order}-${fieldIndex}`}
                                                                        >
                                                                            <Card
                                                                                title={
                                                                                    field.label ||
                                                                                    `Field ${
                                                                                        fieldIndex +
                                                                                        1
                                                                                    }`
                                                                                }
                                                                                style={{
                                                                                    marginBottom: 16,
                                                                                    width: "100%",
                                                                                }}
                                                                                extra={
                                                                                    <Space>
                                                                                        <Button
                                                                                            icon={
                                                                                                <MinusCircleOutlined />
                                                                                            }
                                                                                            onClick={() =>
                                                                                                removeField(
                                                                                                    originalIndex
                                                                                                )
                                                                                            }
                                                                                            danger
                                                                                        />
                                                                                    </Space>
                                                                                }
                                                                            >
                                                                                <Row
                                                                                    gutter={
                                                                                        16
                                                                                    }
                                                                                >
                                                                                    <Col
                                                                                        span={
                                                                                            8
                                                                                        }
                                                                                    >
                                                                                        <Form.Item
                                                                                            label="Label"
                                                                                            name={[
                                                                                                "fields",
                                                                                                originalIndex,
                                                                                                "label",
                                                                                            ]}
                                                                                            rules={[
                                                                                                {
                                                                                                    required:
                                                                                                        true,
                                                                                                    message:
                                                                                                        "Please input field label!",
                                                                                                },
                                                                                            ]}
                                                                                        >
                                                                                            <Input
                                                                                                value={
                                                                                                    field.label
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    const newFields =
                                                                                                        [
                                                                                                            ...data.fields,
                                                                                                        ];
                                                                                                    newFields[
                                                                                                        originalIndex
                                                                                                    ].label =
                                                                                                        e.target.value;
                                                                                                    setData(
                                                                                                        "fields",
                                                                                                        newFields
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                    <Col
                                                                                        span={
                                                                                            8
                                                                                        }
                                                                                    >
                                                                                        <Form.Item
                                                                                            label="Type"
                                                                                            name={[
                                                                                                "fields",
                                                                                                originalIndex,
                                                                                                "field_type",
                                                                                            ]}
                                                                                            rules={[
                                                                                                {
                                                                                                    required:
                                                                                                        true,
                                                                                                    message:
                                                                                                        "Please select field type!",
                                                                                                },
                                                                                            ]}
                                                                                        >
                                                                                            <Select
                                                                                                value={
                                                                                                    field.field_type
                                                                                                }
                                                                                                onChange={(
                                                                                                    value
                                                                                                ) => {
                                                                                                    const newFields =
                                                                                                        [
                                                                                                            ...data.fields,
                                                                                                        ];
                                                                                                    newFields[
                                                                                                        originalIndex
                                                                                                    ].field_type =
                                                                                                        value;
                                                                                                    setData(
                                                                                                        "fields",
                                                                                                        newFields
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <Option value="text">
                                                                                                    Text
                                                                                                </Option>
                                                                                                <Option value="textarea">
                                                                                                    Textarea
                                                                                                </Option>
                                                                                                <Option value="number">
                                                                                                    Number
                                                                                                </Option>
                                                                                                <Option value="email">
                                                                                                    Email
                                                                                                </Option>
                                                                                                <Option value="select">
                                                                                                    Select
                                                                                                </Option>
                                                                                                <Option value="multiselect">
                                                                                                    Multi-Select
                                                                                                </Option>
                                                                                                <Option value="checkbox">
                                                                                                    Checkbox
                                                                                                </Option>
                                                                                                <Option value="radio">
                                                                                                    Radio
                                                                                                </Option>
                                                                                                <Option value="date">
                                                                                                    Date
                                                                                                </Option>
                                                                                                <Option value="file">
                                                                                                    File
                                                                                                </Option>
                                                                                            </Select>
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                    <Col
                                                                                        span={
                                                                                            8
                                                                                        }
                                                                                    >
                                                                                        <Form.Item
                                                                                            label="Required"
                                                                                            name={[
                                                                                                "fields",
                                                                                                originalIndex,
                                                                                                "required",
                                                                                            ]}
                                                                                            valuePropName="checked"
                                                                                        >
                                                                                            <Switch
                                                                                                checked={
                                                                                                    field.required
                                                                                                }
                                                                                                onChange={(
                                                                                                    checked
                                                                                                ) => {
                                                                                                    const newFields =
                                                                                                        [
                                                                                                            ...data.fields,
                                                                                                        ];
                                                                                                    newFields[
                                                                                                        originalIndex
                                                                                                    ].required =
                                                                                                        checked;
                                                                                                    setData(
                                                                                                        "fields",
                                                                                                        newFields
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                </Row>
                                                                                {renderFieldOptions(
                                                                                    field,
                                                                                    originalIndex
                                                                                )}
                                                                            </Card>
                                                                        </SortableItem>
                                                                    );
                                                                }
                                                            )}
                                                    </SortableContext>
                                                </DndContext>

                                                <Button
                                                    type="dashed"
                                                    onClick={() =>
                                                        addField(step.order)
                                                    }
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                    Add Field to This Step
                                                </Button>
                                            </Card>
                                        </SortableItem>
                                    ))}
                                </SortableContext>
                            </DndContext>
                            <Button
                                type="dashed"
                                onClick={addStep}
                                block
                                icon={<PlusOutlined />}
                            >
                                Add Step
                            </Button>
                        </Panel>
                    </Collapse>
                </Card>
            </Form>
        </AdminLayout>
    );
};

export default ServiceForm;
