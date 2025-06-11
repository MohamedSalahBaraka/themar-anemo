import React from "react";
import { Table, Space, Button, Card, Image, Popconfirm, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import AdminLayout from "@/Layouts/AdminLayout";
import { City } from "@/types/city";
import { PageProps } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props extends PageProps {
    cities: City[];
}

const CityIndex: React.FC<Props> = ({ cities, auth }) => (
    <AdminLayout>
        <Page cities={cities} auth={auth} />
    </AdminLayout>
);

const Page: React.FC<Props> = ({ cities }) => {
    const { flash } = usePage().props;
    const { t } = useLanguage();

    React.useEffect(() => {
        if ((flash as { success?: string })?.success) {
            message.success(t((flash as { success: string }).success));
        }
    }, [flash, t]);

    const columns = [
        {
            title: t("title"),
            dataIndex: "title",
            key: "title",
        },
        {
            title: t("photo"),
            dataIndex: "photo",
            key: "photo",
            render: (photo: string | null) =>
                photo ? (
                    <Image
                        width={50}
                        src={`/storage/${photo}`}
                        alt={t("city_photo")}
                    />
                ) : (
                    t("no_photo")
                ),
        },
        {
            title: t("bio"),
            dataIndex: "bio",
            key: "bio",
            render: (bio: string | null) => bio || "-",
        },
        {
            title: t("action"),
            key: "action",
            render: (_: any, record: City) => (
                <Space size="middle">
                    <Link href={`/admin/cities/${record.id}/edit`}>
                        <Button type="primary" icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title={t("confirm_delete_city")}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t("yes")}
                        cancelText={t("no")}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleDelete = (id: number) => {
        router.delete(`/admin/cities/${id}`, {
            onSuccess: () => {
                message.success(t("city_deleted_success"));
            },
            onError: () => {
                message.error(t("city_delete_failed"));
            },
        });
    };

    return (
        <div>
            <Head title={t("cities")} />
            <Card
                title={t("cities")}
                extra={
                    <Link href="/admin/cities/create">
                        <Button type="primary" icon={<PlusOutlined />}>
                            {t("add_city")}
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
        </div>
    );
};

export default CityIndex;
