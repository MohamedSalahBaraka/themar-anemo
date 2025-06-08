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

    const handleEdit = (userType: string) => {
        const pkg = packages.find((p) => p.user_type === userType) || null;
        setEditingPackage(pkg);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingPackage(null);
    };

    const handleSuccess = () => {
        setIsModalVisible(false);
        setEditingPackage(null);
    };

    return (
        <div className="px-6 py-4">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Typography.Title level={2}>إدارة الباقات</Typography.Title>
                <Typography.Text type="secondary">
                    إدارة الباقات حسب نوع المستخدم
                </Typography.Text>
                <Divider />
                <div>
                    <div className="flex gap-2 mb-4">
                        {["owner", "agent", "company"].map((type) => (
                            <Button
                                key={type}
                                type="primary"
                                onClick={() => handleEdit(type)}
                            >
                                {`تعديل باقة ${
                                    type === "owner"
                                        ? "المالك"
                                        : type === "agent"
                                        ? "الوسيط"
                                        : "الشركة"
                                }`}
                            </Button>
                        ))}
                    </div>
                    <Table
                        columns={[
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
                                render: (price: number) =>
                                    `$${parseInt(`${price}`).toFixed(2)}`,
                            },
                            {
                                title: "السعر السنوي",
                                dataIndex: "yearly_price",
                                key: "yearly_price",
                                render: (price: number) =>
                                    `$${parseInt(`${price}`).toFixed(2)}`,
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
                                render: (isActive: boolean) =>
                                    isActive ? "نشط" : "غير نشط",
                            },
                        ]}
                        dataSource={packages}
                        rowKey="id"
                        pagination={false}
                        loading={!packages}
                    />
                    <PackageForm
                        visible={isModalVisible}
                        onCancel={handleCancel}
                        onSuccess={handleSuccess}
                        packageData={editingPackage}
                        userType={editingPackage?.user_type} // pass down the type
                    />
                </div>
            </Space>
        </div>
    );
};

export default PackageManagementPage;
