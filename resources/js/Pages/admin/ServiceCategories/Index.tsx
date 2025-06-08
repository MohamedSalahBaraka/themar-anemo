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
interface page extends PageProps {
    categories: ServiceCategory[];
}
const ServiceCategoriesIndex = () => {
    const { categories } = usePage<page>().props;
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
            title: "الاسم",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "الأيقونة",
            dataIndex: "icon_url",
            key: "icon_url",
            render: (iconUrl: string) =>
                iconUrl ? (
                    <img
                        src={iconUrl}
                        style={{ width: 40, height: 40, objectFit: "contain" }}
                        alt="أيقونة"
                    />
                ) : null,
        },
        {
            title: "الإجراءات",
            key: "actions",
            render: (record: ServiceCategory) => (
                <div>
                    <Button type="link" onClick={() => showEditModal(record)}>
                        تعديل
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record.id)}
                    >
                        حذف
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
                onSuccess: () => message.success("تم تحديث التصنيف بنجاح"),
                onError: (e) => {
                    console.log(e);
                    if (e.icon) message.error(e.icon);
                    else message.error("خطأ في تحديث التصنيف");
                },
                onFinish: (e) => {
                    setVisible(false);
                },
            });
        } else {
            router.post(route("service-categories.store"), formData, {
                onSuccess: () => message.success("تم إنشاء التصنيف بنجاح"),
                onError: (e) => {
                    console.log(e);
                    message.error("خطأ في إنشاء التصنيف");
                },
                onFinish: (e) => {
                    setVisible(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "هل أنت متأكد من رغبتك في حذف هذا التصنيف؟",
            onOk: () => {
                router.delete(route("service-categories.destroy", id), {
                    onSuccess: () => {
                        message.success("تم حذف التصنيف بنجاح");
                    },
                });
            },
        });
    };

    const handleFileChange = (info: any) => {
        setData("icon", info.fileList[0].originFileObj);
    };

    return (
        <AdminLayout>
            <div>
                <div style={{ marginBottom: 16 }}>
                    <Button type="primary" onClick={showCreateModal}>
                        إنشاء تصنيف جديد
                    </Button>
                </div>

                <Table columns={columns} dataSource={categories} rowKey="id" />

                <Modal
                    visible={visible}
                    title={isEdit ? "تعديل التصنيف" : "إنشاء تصنيف جديد"}
                    onOk={handleSubmit}
                    confirmLoading={processing}
                    onCancel={() => setVisible(false)}
                >
                    <Form layout="vertical">
                        <Form.Item label="الاسم" required>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                            {errors.name && (
                                <span className="text-red-500">
                                    {errors.name}
                                </span>
                            )}
                        </Form.Item>

                        <Form.Item label="الأيقونة">
                            <Upload
                                name="photo"
                                listType="picture"
                                maxCount={1}
                                beforeUpload={() => false}
                                onChange={handleFileChange}
                                showUploadList={true}
                            >
                                <Button icon={<UploadOutlined />}>
                                    انقر للرفع
                                </Button>
                            </Upload>
                            {errors.icon && (
                                <span className="text-red-500">
                                    {errors.icon}
                                </span>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default ServiceCategoriesIndex;
