// resources/js/Pages/ServiceCategories/Index.jsx
import React, { useState } from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import { Table, Button, Modal, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ServiceCategory } from "@/types/Services";
import { PageProps } from "@/types";
import { RcFile, UploadFile } from "antd/es/upload";
import { UploadChangeParam } from "antd/lib/upload";
import AdminLayout from "@/Layouts/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
interface page extends PageProps {
    categories: ServiceCategory[];
}
const ServiceCategoriesIndex: React.FC = () => (
    <AdminLayout>
        <Page />
    </AdminLayout>
);
const Page = () => {
    const { categories } = usePage<page>().props;
    const { t } = useLanguage();
    const { data, setData, processing, errors, reset } = useForm<{
        id: number;
        name: string;
        icon: string | RcFile | null;
    }>({
        id: 0,
        name: "",
        icon: "",
    });

    const [visible, setVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const columns = [
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
        },
        {
            title: t("icon"),
            dataIndex: "icon_url",
            key: "icon_url",
            render: (iconUrl: string) =>
                iconUrl ? (
                    <img
                        src={iconUrl}
                        style={{ width: 40, height: 40, objectFit: "contain" }}
                        alt={t("icon")}
                    />
                ) : null,
        },
        {
            title: t("Actions"),
            key: "actions",
            render: (record: ServiceCategory) => (
                <div>
                    <Button type="link" onClick={() => showEditModal(record)}>
                        {t("Edit")}
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record.id)}
                    >
                        {t("Delete")}
                    </Button>
                </div>
            ),
        },
    ];

    const showCreateModal = () => {
        reset();
        setIsEdit(false);
        setVisible(true);
    };

    const showEditModal = (category: ServiceCategory) => {
        setData("name", category.name);
        setData("icon", "");
        setData("id", category.id);
        // Optionally store the id elsewhere if needed for update

        setIsEdit(true);
        setVisible(true);
    };

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.icon) {
            console.log(data);

            formData.append("icon", data.icon);
        }

        if (isEdit) {
            formData.append("_method", "PUT"); // 👈 spoof the method
            router.post(route("service-categories.update", data.id), formData, {
                // forceFormData: true,
                onSuccess: () =>
                    message.success(t("Category have been Updated")),
                onError: (e) => {
                    console.log(e);
                    if (e.icon) message.error(e.icon);
                    else message.error(t("Faild to Update Category"));
                },
                onFinish: (e) => {
                    setVisible(false);
                },
            });
        } else {
            router.post(route("service-categories.store"), formData, {
                onSuccess: () =>
                    message.success(
                        t("Category have been created successfully")
                    ),
                onError: (e) => {
                    console.log(e);
                    message.error(t("Error Creating Category"));
                },
                onFinish: (e) => {
                    setVisible(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: t("Are you sure you want to delete this Category?"),
            onOk: () => {
                router.delete(route("service-categories.destroy", id), {
                    onSuccess: () => {
                        message.success(
                            t("Category have beed deleted successfully")
                        );
                    },
                });
            },
        });
    };

    const handleFileChange = (info: any) => {
        setData("icon", info.fileList[0].originFileObj);
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={showCreateModal}>
                    {t("create new Category")}
                </Button>
            </div>

            <Table columns={columns} dataSource={categories} rowKey="id" />

            <Modal
                visible={visible}
                title={isEdit ? t("Edit Category") : t("create new Category")}
                onOk={handleSubmit}
                confirmLoading={processing}
                onCancel={() => setVisible(false)}
            >
                <Form layout="vertical">
                    <Form.Item label={t("name")} required>
                        <Input
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && (
                            <span className="text-red-500">{errors.name}</span>
                        )}
                    </Form.Item>

                    <Form.Item label={t("icon")}>
                        <Upload
                            name="photo"
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={handleFileChange}
                            showUploadList={true}
                        >
                            <Button icon={<UploadOutlined />}>
                                {t("click to upload")}
                            </Button>
                        </Upload>
                        {errors.icon && (
                            <span className="text-red-500">{errors.icon}</span>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ServiceCategoriesIndex;
