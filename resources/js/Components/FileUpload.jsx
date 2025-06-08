// resources/js/Components/FileUpload.jsx

import { Inertia } from "@inertiajs/inertia";
import {
    Upload,
    Button,
    List,
    Tag,
    Modal,
    message,
    Select,
    Form,
    Input,
} from "antd";
import {
    UploadOutlined,
    EyeOutlined,
    DownloadOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Option } = Select;

const FileUpload = ({ userServiceId, stepId, existingFiles = [] }) => {
    const [fileList, setFileList] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [attachments, setAttachments] = useState(existingFiles);

    useEffect(() => {
        if (existingFiles.length > 0) {
            setAttachments(existingFiles);
        }
    }, [existingFiles]);

    const handlePreview = async (file) => {
        if (file.type?.includes("image")) {
            setPreviewImage(file.url);
            setPreviewVisible(true);
        } else {
            window.open(file.url, "_blank");
        }
    };

    const handleRemove = async (file) => {
        try {
            await Inertia.delete(`/attachments/${file.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setAttachments((prev) =>
                        prev.filter((f) => f.id !== file.id)
                    );
                    message.success("File deleted successfully");
                },
                onError: () => message.error("Failed to delete file"),
            });
        } catch (error) {
            message.error("Error deleting file");
        }
    };

    const handleUpload = async () => {
        try {
            const values = await form.validateFields();
            setUploading(true);

            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append("files[]", file);
            });
            formData.append("user_service_id", userServiceId);
            formData.append("step_id", stepId);
            formData.append("type", values.type);
            formData.append("note", values.note);

            Inertia.post("/attachments", formData, {
                preserveScroll: true,
                onSuccess: (response) => {
                    const newAttachments = response.props.attachments || [];
                    setAttachments((prev) => [...prev, ...newAttachments]);
                    setFileList([]);
                    form.resetFields();
                    message.success("Files uploaded successfully");
                },
                onError: () => message.error("Upload failed"),
                onFinish: () => setUploading(false),
            });
        } catch (error) {
            setUploading(false);
            message.error("Validation failed");
        }
    };

    const beforeUpload = (file) => {
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error("File must be smaller than 10MB");
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    const onFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const getFileTypeTag = (type) => {
        const colorMap = {
            image: "green",
            document: "blue",
            other: "orange",
        };
        return <Tag color={colorMap[type] || "gray"}>{type}</Tag>;
    };

    return (
        <div>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="type"
                    label="File Type"
                    rules={[
                        { required: true, message: "Please select file type" },
                    ]}
                >
                    <Select placeholder="Select file type">
                        <Option value="image">Image</Option>
                        <Option value="document">Document</Option>
                        <Option value="other">Other</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="note" label="Note (Optional)">
                    <Input.TextArea placeholder="Add a note about these files" />
                </Form.Item>

                <Upload
                    multiple
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={onFileChange}
                    showUploadList={false}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                >
                    <Button icon={<UploadOutlined />}>Select Files</Button>
                </Upload>

                <Button
                    type="primary"
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    style={{ marginTop: 16 }}
                >
                    {uploading ? "Uploading..." : "Start Upload"}
                </Button>
            </Form>

            <List
                style={{ marginTop: 24 }}
                header={<div>Uploaded Files</div>}
                bordered
                dataSource={attachments}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => handlePreview(item)}
                            />,
                            <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                onClick={() =>
                                    window.open(item.file_url, "_blank")
                                }
                            />,
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemove(item)}
                            />,
                        ]}
                    >
                        <List.Item.Meta
                            title={item.file_path.split("/").pop()}
                            description={
                                <>
                                    {getFileTypeTag(item.type)}
                                    {item.note && <span> - {item.note}</span>}
                                    <br />
                                    <small>
                                        Uploaded by: {item.uploader?.name}
                                    </small>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />

            <Modal
                visible={previewVisible}
                title="File Preview"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img
                    alt="preview"
                    style={{ width: "100%" }}
                    src={previewImage}
                />
            </Modal>
        </div>
    );
};

export default FileUpload;
