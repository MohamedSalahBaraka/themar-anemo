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
import { useLanguage } from "@/contexts/LanguageContext";

interface PageProps extends BasePageProps {
    faqs: Faq[];
}

const FaqIndex: React.FC<PageProps> = ({ faqs, auth }) => (
    <AdminLayout>
        <Page faqs={faqs} auth={auth} />
    </AdminLayout>
);

const Page: React.FC<PageProps> = () => {
    const { faqs } = usePage<PageProps>().props;
    const { t } = useLanguage();
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
                message.success(t("faq_order_updated"));
            } catch (error) {
                message.error(t("faq_order_update_failed"));
                setItems(faqs); // Revert if API call fails
            } finally {
                setLoading(false);
            }
        }
    };

    const columns = [
        {
            title: t("question"),
            dataIndex: "question",
            key: "question",
        },
        {
            title: t("category"),
            dataIndex: "category",
            key: "category",
            render: (category: string | null) => category || "-",
        },
        {
            title: t("order"),
            dataIndex: "order",
            key: "order",
            sorter: (a: Faq, b: Faq) => a.order - b.order,
        },
        {
            title: t("status"),
            dataIndex: "is_active",
            key: "is_active",
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? t("active") : t("inactive")}
                </Tag>
            ),
        },
        {
            title: t("actions"),
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
                        onBefore={() => confirm(t("confirm_delete_faq"))}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Link>
                </Space>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title={t("faqs")} />
            <Card
                title={t("frequently_asked_questions")}
                extra={
                    <Link href="/admin/faqs/create">
                        <Button type="primary" icon={<PlusOutlined />}>
                            {t("add_faq")}
                        </Button>
                    </Link>
                }
            >
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Input
                            placeholder={t("search_faqs_placeholder")}
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder={t("filter_by_category")}
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
