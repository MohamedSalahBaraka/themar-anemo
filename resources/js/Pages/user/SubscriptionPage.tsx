import React from "react";
import { usePage, router } from "@inertiajs/react";
import {
    Card,
    Table,
    Button,
    Modal,
    Descriptions,
    Divider,
    Typography,
    Alert,
    List,
    Tag,
    Space,
} from "antd";
import type { DescriptionsProps, TableProps } from "antd";
import { PageProps } from "@/types";
import AppLayout from "@/Layouts/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

const { Title, Text } = Typography;

interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number; // in days
    max_listings: number;
    features: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Transaction {
    id: number;
    user_id: number;
    type: "subscription" | "service";
    amount: number;
    method: "credit_card" | "paypal" | "bank" | "cash";
    status: "pending" | "completed" | "failed" | "refunded";
    reference: string | null;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
    invoice?: Invoice;
}

interface Invoice {
    id: number;
    transaction_id: number;
    invoice_number: string;
    invoice_pdf_url: string | null;
    created_at: string;
    updated_at: string;
    items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    issue_date: string;
    due_date: string;
}

interface Subscription {
    id: number;
    user_id: number;
    package_id: number;
    started_at: string;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    package: Package; // Assuming you eager load this
}

interface SubscriptionPageProps extends PageProps {
    packages: Package[];
    currentSubscription: (Subscription & { package: Package }) | null;
    transactions: (Transaction & { invoice?: Invoice })[];
}
const SubscriptionPage: React.FC = () => (
    <AppLayout>
        <Page />
    </AppLayout>
);
const Page: React.FC = () => {
    const { t } = useLanguage();
    const { props } = usePage<SubscriptionPageProps>();
    const [selectedInvoice, setSelectedInvoice] =
        React.useState<Invoice | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [isSubscribing, setIsSubscribing] = React.useState(false);
    const [isFetchingInvoice, setIsFetchingInvoice] = React.useState(false);

    const handleSubscribe = async (pkgId: number) => {
        setIsSubscribing(true);
        try {
            await router.post(
                route("user.subscriptions.subscribe"),
                {
                    package_id: pkgId,
                },
                {
                    onSuccess: () => {
                        router.reload({
                            only: ["currentSubscription", "transactions"],
                        });
                    },
                    onError: (errors) => {
                        console.error(t("subscription_error"), errors);
                    },
                    onFinish: () => {
                        setIsSubscribing(false);
                    },
                }
            );
        } catch (error) {
            console.error(t("subscription_failed"), error);
            setIsSubscribing(false);
        }
    };

    const handleViewInvoice = async (transactionId: number) => {
        setIsFetchingInvoice(true);
        try {
            const res = await fetch(
                route("user.invoices.show", transactionId),
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );
            if (!res.ok) throw new Error(t("invoice_fetch_failed"));
            const data = await res.json();
            setSelectedInvoice(data.invoice);
            setModalVisible(true);
        } catch (error) {
            console.error(t("invoice_fetch_error"), error);
        } finally {
            setIsFetchingInvoice(false);
        }
    };

    const columns: TableProps<Transaction>["columns"] = [
        {
            title: t("date"),
            dataIndex: "created_at",
            key: "date",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: t("amount"),
            dataIndex: "amount",
            key: "amount",
            render: (amount) => <Text>${amount.toFixed(2)}</Text>,
        },
        {
            title: t("payment_method"),
            dataIndex: "method",
            key: "method",
            render: (method) => (
                <Tag color="blue">
                    {method === "credit_card"
                        ? t("credit_card")
                        : method === "paypal"
                        ? t("paypal")
                        : method === "bank"
                        ? t("bank_transfer")
                        : t("cash")}
                </Tag>
            ),
        },
        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag
                    color={
                        status === "completed"
                            ? "green"
                            : status === "pending"
                            ? "orange"
                            : status === "refunded"
                            ? "blue"
                            : "red"
                    }
                >
                    {status === "completed"
                        ? t("completed")
                        : status === "pending"
                        ? t("pending")
                        : status === "refunded"
                        ? t("refunded")
                        : t("failed")}
                </Tag>
            ),
        },
        {
            title: t("action"),
            key: "action",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => handleViewInvoice(record.id)}
                    disabled={record.status !== "completed" || !record.invoice}
                    loading={isFetchingInvoice}
                >
                    {record.invoice ? t("view_invoice") : t("no_invoice")}
                </Button>
            ),
        },
    ];

    const subscriptionItems: DescriptionsProps["items"] =
        props.currentSubscription
            ? [
                  {
                      key: "1",
                      label: t("package"),
                      children: props.currentSubscription.package.name,
                  },
                  {
                      key: "2",
                      label: t("status"),
                      children: (
                          <Tag
                              color={
                                  props.currentSubscription.is_active
                                      ? "green"
                                      : "red"
                              }
                          >
                              {props.currentSubscription.is_active
                                  ? t("active")
                                  : t("inactive")}
                          </Tag>
                      ),
                  },
                  {
                      key: "3",
                      label: t("start_date"),
                      children: new Date(
                          props.currentSubscription.started_at
                      ).toLocaleDateString(),
                  },
                  {
                      key: "4",
                      label: t("end_date"),
                      children: props.currentSubscription.expires_at
                          ? new Date(
                                props.currentSubscription.expires_at
                            ).toLocaleDateString()
                          : t("no_expiry"),
                  },
                  {
                      key: "5",
                      label: t("max_listings"),
                      children: props.currentSubscription.package.max_listings,
                  },
                  {
                      key: "6",
                      label: t("duration"),
                      children: `${
                          props.currentSubscription.package.duration
                      } ${t("days")}`,
                  },
              ]
            : [];

    return (
        <div className="subscription-page" style={{ direction: "rtl" }}>
            <Title level={2}>{t("subscriptions_billing")}</Title>

            <Card
                title={t("current_subscription")}
                loading={!props}
                style={{ marginBottom: 24 }}
            >
                {props.currentSubscription ? (
                    <Descriptions
                        items={subscriptionItems}
                        bordered
                        column={2}
                    />
                ) : (
                    <Alert
                        message={t("no_active_subscription")}
                        type="warning"
                        showIcon
                        action={
                            <Button
                                type="primary"
                                onClick={() => router.reload()}
                            >
                                {t("refresh")}
                            </Button>
                        }
                    />
                )}
            </Card>

            <Card
                title={t("available_packages")}
                loading={!props.packages}
                style={{ marginBottom: 24 }}
            >
                <div className="packages-list">
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
                        dataSource={props.packages}
                        renderItem={(pkg) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    style={{
                                        border: "2px solid #1890ff",
                                        borderRadius: 12,
                                        boxShadow:
                                            "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        backgroundColor: "#f9f9f9",
                                        transition: "0.3s",
                                    }}
                                    headStyle={{
                                        backgroundColor: "#e6f7ff",
                                        borderBottom: "1px solid #91d5ff",
                                    }}
                                    title={
                                        <Text
                                            strong
                                            style={{ fontSize: "1.2rem" }}
                                        >
                                            {pkg.name}
                                        </Text>
                                    }
                                    extra={
                                        <Text
                                            strong
                                            style={{
                                                fontSize: "1.1rem",
                                                color: "#1890ff",
                                            }}
                                        >
                                            ${pkg.price.toFixed(2)}
                                        </Text>
                                    }
                                    actions={[
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={() =>
                                                handleSubscribe(pkg.id)
                                            }
                                            loading={isSubscribing}
                                            disabled={
                                                props.currentSubscription
                                                    ?.package_id === pkg.id
                                            }
                                            style={{
                                                backgroundColor:
                                                    props.currentSubscription
                                                        ?.package_id === pkg.id
                                                        ? "#52c41a"
                                                        : undefined,
                                                borderColor:
                                                    props.currentSubscription
                                                        ?.package_id === pkg.id
                                                        ? "#52c41a"
                                                        : undefined,
                                            }}
                                        >
                                            {props.currentSubscription
                                                ?.package_id === pkg.id
                                                ? t("current_package")
                                                : t("subscribe_now")}
                                        </Button>,
                                    ]}
                                >
                                    <div style={{ minHeight: 100 }}>
                                        <Divider />
                                        <Space
                                            direction="vertical"
                                            size="middle"
                                        >
                                            <Text>
                                                📅 {t("duration")}:{" "}
                                                {pkg.duration} {t("days")}
                                            </Text>
                                            <Text>
                                                📦 {t("max_listings")}:{" "}
                                                {pkg.max_listings}
                                            </Text>
                                            <Text>{pkg.description}</Text>
                                        </Space>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                </div>
            </Card>

            <Card
                title={t("transaction_history")}
                loading={!props.transactions}
            >
                <Table
                    columns={columns}
                    dataSource={props.transactions}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <Modal
                title={t("invoice_details")}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedInvoice && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label={t("invoice_number")}>
                                {selectedInvoice.invoice_number}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("issue_date")}>
                                {new Date(
                                    selectedInvoice.issue_date
                                ).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("due_date")}>
                                {new Date(
                                    selectedInvoice.due_date
                                ).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("total_amount")}>
                                <Text strong>
                                    ${selectedInvoice.total.toFixed(2)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="right">{t("items")}</Divider>

                        <Table
                            columns={[
                                {
                                    title: t("description"),
                                    dataIndex: "description",
                                    key: "description",
                                },
                                {
                                    title: t("quantity"),
                                    dataIndex: "quantity",
                                    key: "quantity",
                                },
                                {
                                    title: t("unit_price"),
                                    dataIndex: "unit_price",
                                    key: "unitPrice",
                                    render: (value) => `$${value.toFixed(2)}`,
                                },
                                {
                                    title: t("total"),
                                    dataIndex: "total_price",
                                    key: "totalPrice",
                                    render: (value) => `$${value.toFixed(2)}`,
                                },
                            ]}
                            dataSource={selectedInvoice.items}
                            rowKey="description"
                            pagination={false}
                            summary={() => (
                                <Table.Summary fixed>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            index={0}
                                            colSpan={3}
                                            align="left"
                                        >
                                            <Text strong>{t("subtotal")}:</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <Text strong>
                                                $
                                                {selectedInvoice.subtotal.toFixed(
                                                    2
                                                )}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            index={0}
                                            colSpan={3}
                                            align="left"
                                        >
                                            <Text strong>{t("tax")}:</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <Text strong>
                                                $
                                                {selectedInvoice.tax.toFixed(2)}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            index={0}
                                            colSpan={3}
                                            align="left"
                                        >
                                            <Text strong>{t("total")}:</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <Text strong>
                                                $
                                                {selectedInvoice.total.toFixed(
                                                    2
                                                )}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </Table.Summary>
                            )}
                        />

                        {selectedInvoice.invoice_pdf_url && (
                            <div style={{ marginTop: 16 }}>
                                <Button
                                    type="primary"
                                    href={selectedInvoice.invoice_pdf_url}
                                    target="_blank"
                                >
                                    {t("download_pdf")}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SubscriptionPage;
