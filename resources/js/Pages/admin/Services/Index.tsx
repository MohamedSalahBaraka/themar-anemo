import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Table,
    Button,
    Space,
    Card,
    Input,
    Select,
    Tag,
    Switch,
    Popconfirm,
    message,
    Avatar,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { PaginationProps } from "antd/lib/pagination";
import { ColumnsType } from "antd/lib/table";
import AdminLayout from "@/Layouts/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const { Search } = Input;
const { Option } = Select;

interface Service {
    id: number;
    name: string;
    price: number;
    is_active: boolean;
    category: {
        id: number;
        name: string;
    };
    creator: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
}

interface Creator {
    id: number;
    name: string;
}

interface PaginatedServices {
    data: Service[];
    current_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Filters {
    category?: number;
    status?: string;
    creator?: number;
    search?: string;
}

interface ServicesIndexProps {
    services: PaginatedServices;
    categories: Category[];
    creators: Creator[];
    filters: Filters;
}

const ServicesIndex: React.FC<ServicesIndexProps> = ({
    services,
    categories,
    creators,
    filters,
}) => (
    <AdminLayout>
        <Page
            categories={categories}
            creators={creators}
            filters={filters}
            services={services}
        />
    </AdminLayout>
);

const Page: React.FC<ServicesIndexProps> = ({
    services,
    categories,
    creators,
    filters,
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const columns: ColumnsType<Service> = [
        {
            title: t("image"),
            dataIndex: "photo",
            key: "photo",
            render: (photo?: string) => (
                <Avatar
                    icon={<UserOutlined />}
                    src={`${window.location.origin}/storage/${photo}`}
                    size="large"
                />
            ),
        },
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
            render: (text: string, record: Service) => (
                <Link href={route("admin.services.edit", record.id)}>
                    {text}
                </Link>
            ),
        },
        {
            title: t("category"),
            dataIndex: "category",
            key: "category",
            render: (category: Service["category"]) =>
                category?.name || t("not_specified"),
        },
        {
            title: t("price"),
            dataIndex: "price",
            key: "price",
            render: (price: number) =>
                price ? `${price.toFixed(2)}` : t("not_specified"),
        },
        {
            title: t("status"),
            dataIndex: "is_active",
            key: "is_active",
            render: (isActive: boolean, record: Service) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) =>
                        handleStatusChange(record.id, checked)
                    }
                />
            ),
        },
        {
            title: t("created_by"),
            dataIndex: "creator",
            key: "creator",
            render: (creator: Service["creator"]) => creator.name,
        },
        {
            title: t("actions"),
            key: "actions",
            render: (_: any, record: Service) => (
                <Space size="middle">
                    <Link href={route("admin.services.edit", record.id)}>
                        <Button icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title={t("confirm_delete_service")}
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

    const handleStatusChange = (id: number, isActive: boolean) => {
        router.patch(
            route("services.toggle-status", id),
            {
                is_active: isActive,
            },
            {
                onSuccess: () => message.success(t("status_updated_success")),
            }
        );
    };

    const handleDelete = (id: number) => {
        router.delete(route("admin.services.destroy", id), {
            onSuccess: () => message.success(t("service_deleted_success")),
        });
    };

    const handleSearch = (value: string) => {
        router.get(
            route("services.index"),
            { search: value },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleFilterChange = (name: keyof Filters, value: any) => {
        router.get(
            route("services.index"),
            { ...filters, [name]: value },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[]) =>
            setSelectedRowKeys(selectedKeys),
    };

    const pagination: PaginationProps = {
        current: services.current_page,
        pageSize: services.per_page,
        total: services.total,
        showSizeChanger: true,
        onChange: (page: number, pageSize?: number) => {
            const url = services.links[page]?.url;
            if (url) {
                router.get(url);
            }
        },
    };

    return (
        <AdminLayout>
            <Head title={t("manage_services")} />

            <Card
                title={t("services")}
                extra={
                    <Link href={route("admin.services.create")}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            {t("create_new_service")}
                        </Button>
                    </Link>
                }
            >
                <div className="mb-4">
                    <Space size="large">
                        <Search
                            placeholder={t("search_services")}
                            allowClear
                            enterButton
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                        <Select<number>
                            placeholder={t("filter_by_category")}
                            style={{ width: 200 }}
                            onChange={(value) =>
                                handleFilterChange("category", value)
                            }
                            allowClear
                            value={filters.category}
                        >
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                        <Select<string>
                            placeholder={t("filter_by_status")}
                            style={{ width: 200 }}
                            onChange={(value) =>
                                handleFilterChange("status", value)
                            }
                            allowClear
                            value={filters.status}
                        >
                            <Option value="active">{t("active")}</Option>
                            <Option value="inactive">{t("inactive")}</Option>
                        </Select>
                        <Select<number>
                            placeholder={t("filter_by_creator")}
                            style={{ width: 200 }}
                            onChange={(value) =>
                                handleFilterChange("creator", value)
                            }
                            allowClear
                            value={filters.creator}
                        >
                            {creators.map((creator) => (
                                <Option key={creator.id} value={creator.id}>
                                    {creator.name}
                                </Option>
                            ))}
                        </Select>
                    </Space>
                </div>

                <Table<Service>
                    rowKey="id"
                    columns={columns}
                    dataSource={services.data}
                    pagination={pagination}
                    rowSelection={rowSelection}
                    loading={loading}
                />
            </Card>
        </AdminLayout>
    );
};

export default ServicesIndex;
