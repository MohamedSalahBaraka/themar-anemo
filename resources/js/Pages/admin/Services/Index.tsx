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
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);

    const columns: ColumnsType<Service> = [
        {
            title: "الصورة",
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
            title: "الاسم",
            dataIndex: "name",
            key: "name",
            render: (text: string, record: Service) => (
                <Link href={route("admin.services.edit", record.id)}>
                    {text}
                </Link>
            ),
        },
        {
            title: "التصنيف",
            dataIndex: "category",
            key: "category",
            render: (category: Service["category"]) =>
                category?.name || "غير محدد",
        },
        {
            title: "السعر",
            dataIndex: "price",
            key: "price",
            render: (price: number) =>
                price ? `${price.toFixed(2)}` : "غير محدد",
        },
        {
            title: "الحالة",
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
            title: "تم الإنشاء بواسطة",
            dataIndex: "creator",
            key: "creator",
            render: (creator: Service["creator"]) => creator.name,
        },
        {
            title: "الإجراءات",
            key: "actions",
            render: (_: any, record: Service) => (
                <Space size="middle">
                    <Link href={route("admin.services.edit", record.id)}>
                        <Button icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title="هل أنت متأكد من حذف هذه الخدمة؟"
                        onConfirm={() => handleDelete(record.id)}
                        okText="نعم"
                        cancelText="لا"
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
                onSuccess: () => message.success("تم تحديث الحالة بنجاح"),
            }
        );
    };

    const handleDelete = (id: number) => {
        router.delete(route("admin.services.destroy", id), {
            onSuccess: () => message.success("تم حذف الخدمة بنجاح"),
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
            <Head title="إدارة الخدمات" />

            <Card
                title="الخدمات"
                extra={
                    <Link href={route("admin.services.create")}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            إنشاء خدمة جديدة
                        </Button>
                    </Link>
                }
            >
                <div className="mb-4">
                    <Space size="large">
                        <Search
                            placeholder="ابحث عن الخدمات"
                            allowClear
                            enterButton
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                        <Select<number>
                            placeholder="تصفية حسب التصنيف"
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
                            placeholder="تصفية حسب الحالة"
                            style={{ width: 200 }}
                            onChange={(value) =>
                                handleFilterChange("status", value)
                            }
                            allowClear
                            value={filters.status}
                        >
                            <Option value="active">نشط</Option>
                            <Option value="inactive">غير نشط</Option>
                        </Select>
                        <Select<number>
                            placeholder="تصفية حسب المنشئ"
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
