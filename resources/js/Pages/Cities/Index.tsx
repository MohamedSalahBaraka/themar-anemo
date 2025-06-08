import React from "react";
import { Table, Space, Button, Card, Image, Popconfirm, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import AdminLayout from "@/Layouts/AdminLayout";
import { City } from "@/types/city";
import { PageProps } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";

interface Props extends PageProps {
    cities: City[];
}

const CityIndex: React.FC<Props> = ({ cities }) => {
    const { flash } = usePage().props;

    React.useEffect(() => {
        if ((flash as { success?: string })?.success) {
            message.success((flash as { success?: string }).success);
        }
    }, [flash]);

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Photo",
            dataIndex: "photo",
            key: "photo",
            render: (photo: string | null) =>
                photo ? (
                    <Image width={50} src={`/storage/${photo}`} />
                ) : (
                    "No photo"
                ),
        },
        {
            title: "Bio",
            dataIndex: "bio",
            key: "bio",
            render: (bio: string | null) => bio || "-",
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: City) => (
                <Space size="middle">
                    <Link href={`/admin/cities/${record.id}/edit`}>
                        <Button type="primary" icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title="Are you sure to delete this city?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleDelete = (id: number) => {
        router.delete(`/admin/cities/${id}`);
    };

    return (
        <AdminLayout>
            <Head title="Cities" />
            <Card
                title="Cities"
                extra={
                    <Link href="/admin/cities/create">
                        <Button type="primary" icon={<PlusOutlined />}>
                            Add City
                        </Button>
                    </Link>
                }
            >
                <Table
                    dataSource={cities}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                />
            </Card>
        </AdminLayout>
    );
};

export default CityIndex;
