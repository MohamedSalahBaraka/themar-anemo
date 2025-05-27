import React from "react";
import { Typography, Space, Divider } from "antd";
import PackageList from "@/Components/PackageList";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import AdminLayout from "@/Layouts/AdminLayout";

interface PackagePageProps extends PageProps {
    packages: any[];
}

const PackageManagementPage: React.FC = () => {
    const { props } = usePage<PackagePageProps>();

    return (
        <AdminLayout>
            <div className="px-6 py-4">
                <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                >
                    <Typography.Title level={2}>
                        Package Management
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        Create and manage packages
                    </Typography.Text>
                    <Divider />
                    <PackageList initialPackages={props.packages} />
                </Space>
            </div>
        </AdminLayout>
    );
};

export default PackageManagementPage;
