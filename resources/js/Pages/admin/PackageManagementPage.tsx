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
import { router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";
import { Package } from "@/types/user";
import PackageForm from "@/Components/PackageForm";
import { useLanguage } from "@/contexts/LanguageContext";

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
    const { t } = useLanguage();
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
        message.success(t("package_updated_successfully"));
    };

    return (
        <div className="px-6 py-4">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Typography.Title level={2}>
                    {t("package_management")}
                </Typography.Title>
                <Typography.Text type="secondary">
                    {t("manage_packages_by_user_type")}
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
                                {t("edit_package_for", {
                                    role: t(
                                        type === "owner"
                                            ? "owner"
                                            : type === "agent"
                                            ? "agent"
                                            : "company"
                                    ),
                                })}
                            </Button>
                        ))}
                    </div>
                    <Table
                        columns={[
                            {
                                title: t("name"),
                                dataIndex: "name",
                                key: "name",
                            },
                            {
                                title: t("description"),
                                dataIndex: "description",
                                key: "description",
                            },
                            {
                                title: t("monthly_price"),
                                dataIndex: "price",
                                key: "price",
                                render: (price: number) =>
                                    `$${parseInt(`${price}`).toFixed(2)}`,
                            },
                            {
                                title: t("yearly_price"),
                                dataIndex: "yearly_price",
                                key: "yearly_price",
                                render: (price: number) =>
                                    `$${parseInt(`${price}`).toFixed(2)}`,
                            },
                            {
                                title: t("user_role"),
                                dataIndex: "user_type",
                                key: "user_type",
                                render: (userType: string) => t(userType),
                            },
                            {
                                title: t("status"),
                                dataIndex: "isActive",
                                key: "isActive",
                                render: (isActive: boolean) =>
                                    isActive ? t("active") : t("inactive"),
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
                        userType={editingPackage?.user_type}
                    />
                </div>
            </Space>
        </div>
    );
};

export default PackageManagementPage;
