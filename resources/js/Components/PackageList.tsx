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
                    message.success("Package deleted successfully");
                },
            });
            // router.reload({ only: ["packages"] });
        } catch (error) {
            message.error("Failed to delete package");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingPackage(null);
    };

    const handleSuccess = () => {
        setIsModalVisible(false);
        setEditingPackage(null);
        // router.reload({ only: ["packages"] });
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price: number) => `$${parseInt(`${price}`).toFixed(2)}`,
        },
        {
            title: "Duration (days)",
            dataIndex: "duration",
            key: "duration",
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean) => (isActive ? "Active" : "Inactive"),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Package) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this package?"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Delete
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
                    Add Package
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
