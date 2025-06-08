// resources/js/Pages/Faqs/Index.tsx
import React, { useState } from "react";
import {
    Table,
    Space,
    Button,
    Tag,
    Card,
    Row,
    Col,
    Input,
    Select,
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import AdminLayout from "../../Layouts/AdminLayout";
import { Faq } from "../../types/faq";
import { Head, Link, usePage } from "@inertiajs/react";
import { PageProps as BasePageProps } from "@/types";
import axios from "axios";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableRow } from "./SortableRow";

interface PageProps extends BasePageProps {
    faqs: Faq[];
}

const FaqIndex: React.FC<PageProps> = () => {
    const { faqs } = usePage<PageProps>().props;
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [items, setItems] = useState<Faq[]>(faqs);
    const [loading, setLoading] = useState(false);

    const categories = Array.from(
        new Set(faqs.map((faq) => faq.category).filter(Boolean))
    ) as string[];

    const filteredFaqs = items.filter((faq) => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory
            ? faq.category === selectedCategory
            : true;
        return matchesSearch && matchesCategory;
    });

    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            const activeIndex = items.findIndex(
                (item) => item.id === active.id
            );
            const overIndex = items.findIndex((item) => item.id === over?.id);
            const newItems = arrayMove(items, activeIndex, overIndex);

            setItems(newItems);

            try {
                setLoading(true);
                await axios.post("admin/faqs/reorder", {
                    order: newItems.map((item) => item.id),
                });
                message.success("FAQ order updated successfully");
            } catch (error) {
                message.error("Failed to update FAQ order");
                setItems(faqs); // Revert if API call fails
            } finally {
                setLoading(false);
            }
        }
    };

    const columns = [
        {
            title: "Question",
            dataIndex: "question",
            key: "question",
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (category: string | null) => category || "-",
        },
        {
            title: "Order",
            dataIndex: "order",
            key: "order",
            sorter: (a: Faq, b: Faq) => a.order - b.order,
        },
        {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Faq) => (
                <Space size="middle">
                    <Link href={`/admin/faqs/${record.id}/edit`}>
                        <Button type="primary" icon={<EditOutlined />} />
                    </Link>
                    <Link
                        href={`/admin/faqs/${record.id}`}
                        method="delete"
                        as="button"
                        type="button"
                        onBefore={() =>
                            confirm("Are you sure you want to delete this FAQ?")
                        }
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Link>
                </Space>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="FAQs" />
            <Card
                title="Frequently Asked Questions"
                extra={
                    <Link href="/admin/faqs/create">
                        <Button type="primary" icon={<PlusOutlined />}>
                            Add FAQ
                        </Button>
                    </Link>
                }
            >
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder="Search FAQs..."
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder="Filter by category"
                            allowClear
                            style={{ width: "100%" }}
                            onChange={setSelectedCategory}
                            options={categories.map((cat) => ({
                                value: cat,
                                label: cat,
                            }))}
                        />
                    </Col>
                </Row>

                <DndContext
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext
                        items={items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <Table
                            components={{
                                body: {
                                    row: SortableRow,
                                },
                            }}
                            columns={columns}
                            dataSource={filteredFaqs}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            loading={loading}
                            rowClassName={() => "draggable-row"}
                        />
                    </SortableContext>
                </DndContext>
            </Card>
        </AdminLayout>
    );
};

export default FaqIndex;
