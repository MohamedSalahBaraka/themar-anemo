import React from "react";
import { Table, Button, Space, Popconfirm, message } from "antd";
import { router } from "@inertiajs/react";
import { Package } from "@/types/user";
import PackageForm from "./PackageForm";

interface PackageListProps {
    initialPackages: Package[];
}

const PackageList: React.FC<PackageListProps> = ({ initialPackages }) => {
    const [editingPackage, setEditingPackage] = React.useState<Package | null>(
        null
    );
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [packages, setPackages] = React.useState<Package[]>(initialPackages);

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
            title: "السعر",
            dataIndex: "price",
            key: "price",
            render: (price: number) => `$${parseInt(`${price}`).toFixed(2)}`,
        },
        {
            title: "المدة (أيام)",
            dataIndex: "duration",
            key: "duration",
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
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
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
    );
};

export default PackageList;
