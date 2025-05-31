import React from "react";
import {
    Typography,
    Space,
    Divider,
    Button,
    Popconfirm,
    Table,
    message,
} from "antd";
import PackageList from "@/Components/PackageList";
import { router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { Package } from "@/types/user";
import PackageForm from "@/Components/PackageForm";

interface PackagePageProps extends PageProps {
    packages: any[];
}
const PackageManagementPage: React.FC = () => (
    <AdminLayout>
        <Page />
    </AdminLayout>
);
const Page: React.FC = () => {
    const { props } = usePage<PackagePageProps>();
    const [editingPackage, setEditingPackage] = React.useState<Package | null>(
        null
    );
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const { packages } = props;

    const handleEdit = (pkg: Package) => {
        setEditingPackage(pkg);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            router.delete(route("admin.packages.destroy", id), {
                onSuccess: () => {
                    message.success("تم حذف الباقة بنجاح");
                },
            });
        } catch (error) {
            message.error("فشل حذف الباقة");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingPackage(null);
    };

    const handleSuccess = () => {
        setIsModalVisible(false);
        setEditingPackage(null);
    };

    const columns = [
        {
            title: "الاسم",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "الوصف",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "السعر الشهري",
            dataIndex: "price",
            key: "price",
            render: (price: number) => `$${parseInt(`${price}`).toFixed(2)}`,
        },
        {
            title: "السعر السنوي",
            dataIndex: "yearly_price",
            key: "yearly_price",
            render: (price: number) => `$${parseInt(`${price}`).toFixed(2)}`,
        },
        {
            title: "دور المستخدم",
            dataIndex: "user_type",
            key: "user_type",
            render: (userType: string) => {
                switch (userType) {
                    case "owner":
                        return "مالك";
                    case "agent":
                        return "وسيط";
                    case "company":
                        return "شركة";
                    default:
                        return "غير محدد";
                }
            },
        },
        {
            title: "الحالة",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean) => (isActive ? "نشط" : "غير نشط"),
        },
        {
            title: "الإجراءات",
            key: "actions",
            render: (_: any, record: Package) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        تعديل
                    </Button>
                    <Popconfirm
                        title="هل أنت متأكد من حذف هذه الباقة؟"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="نعم"
                        cancelText="لا"
                    >
                        <Button type="link" danger>
                            حذف
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    return (
        <div className="px-6 py-4">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Typography.Title level={2}>إدارة الباقات</Typography.Title>
                <Typography.Text type="secondary">
                    إنشاء وإدارة الباقات
                </Typography.Text>
                <Divider />
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            onClick={() => setIsModalVisible(true)}
                        >
                            إضافة باقة
                        </Button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={packages}
                        rowKey="id"
                        loading={!packages}
                    />
                    <PackageForm
                        visible={isModalVisible}
                        onCancel={handleCancel}
                        onSuccess={handleSuccess}
                        packageData={editingPackage}
                    />
                </div>
            </Space>
        </div>
    );
};

export default PackageManagementPage;
