// src/pages/user/InquiriesPage.tsx
import React from "react";
import { usePage, router } from "@inertiajs/react";
import {
    Table,
    Card,
    Typography,
    Button,
    Tag,
    Space,
    Avatar,
    Divider,
    Empty,
    Tabs,
    Badge,
    Spin,
    Alert,
} from "antd";
import {
    MessageOutlined,
    HomeOutlined,
    UserOutlined,
    MailOutlined,
    InboxOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PageProps } from "@/types";
import AppLayout from "@/Layouts/Layout";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Inquiry {
    id: string;
    property_id: string;
    property_title: string;
    property_image?: string;
    sender_id: string;
    sender_name: string;
    sender_email: string;
    sender_phone?: string;
    sender_avatar?: string;
    message: string;
    status: "unread" | "read" | "replied";
    created_at: string;
    is_sent_by_me?: boolean;
}

interface InquiriesPageProps extends PageProps {
    receivedInquiries: Inquiry[];
    sentInquiries: Inquiry[];
    errors?: Record<string, string>;
}

const InquiriesPage: React.FC = () => {
    const { props } = usePage<InquiriesPageProps>();
    const { receivedInquiries, sentInquiries, errors } = props;
    const [activeTab, setActiveTab] = React.useState<string>("received");
    const [processingIds, setProcessingIds] = React.useState<string[]>([]);
    const markAsRead = async (inquiryId: string) => {
        setProcessingIds((prev) => [...prev, inquiryId]);

        try {
            router.put(
                route("user.inquiries.mark-read", inquiryId),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ["receivedInquiries"] });
                    },
                    onError: (errors) => {
                        console.error("Error marking as read:", errors);
                    },
                    onFinish: () => {
                        setProcessingIds((prev) =>
                            prev.filter((id) => id !== inquiryId)
                        );
                    },
                }
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
            setProcessingIds((prev) => prev.filter((id) => id !== inquiryId));
        }
    };

    const getStatusTag = (status: string) => {
        const statusMap: Record<
            string,
            { color: string; text: string; icon: React.ReactNode }
        > = {
            unread: { color: "blue", text: "New", icon: <MailOutlined /> },
            read: { color: "default", text: "Read", icon: <InboxOutlined /> },
            replied: {
                color: "green",
                text: "Replied",
                icon: <MessageOutlined />,
            },
        };
        return (
            <Tag color={statusMap[status].color} icon={statusMap[status].icon}>
                {statusMap[status].text}
            </Tag>
        );
    };

    const columns = [
        {
            title: "Property",
            dataIndex: "property_title",
            key: "property",
            render: (text: string, record: Inquiry) => (
                <Space>
                    <Avatar
                        src={record.property_image}
                        icon={<HomeOutlined />}
                        shape="square"
                    />
                    <Button
                        type="link"
                        href={route("properties.show", record.property_id)}
                        style={{ padding: 0 }}
                    >
                        {text}
                    </Button>
                </Space>
            ),
        },
        {
            title: "Contact",
            dataIndex: "sender_name",
            key: "contact",
            render: (text: string, record: Inquiry) => (
                <Space>
                    <Avatar
                        src={record.sender_avatar}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div>{text}</div>
                        <Text type="secondary">{record.sender_email}</Text>
                        {record.sender_phone && (
                            <div>
                                <Text type="secondary">
                                    {record.sender_phone}
                                </Text>
                            </div>
                        )}
                    </div>
                </Space>
            ),
        },
        {
            title: "Message",
            dataIndex: "message",
            key: "message",
            render: (text: string) => (
                <Text
                    ellipsis={{ tooltip: text }}
                    style={{ maxWidth: "200px" }}
                >
                    {text}
                </Text>
            ),
        },
        {
            title: "Date",
            dataIndex: "created_at",
            key: "date",
            render: (date: string) => dayjs(date).format("MMM D, YYYY h:mm A"),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: Inquiry) =>
                record.is_sent_by_me ? <Tag>Sent</Tag> : getStatusTag(status),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Inquiry) => (
                <Space>
                    {!record.is_sent_by_me && record.status === "unread" && (
                        <Button
                            size="small"
                            onClick={() => markAsRead(record.id)}
                            loading={processingIds.includes(record.id)}
                        >
                            Mark as Read
                        </Button>
                    )}
                    <Button
                        size="small"
                        type="primary"
                        href={route("properties.show", {
                            property: record.property_id,
                            inquiry: record.id,
                        })}
                        loading={processingIds.length > 0}
                    >
                        {record.is_sent_by_me ? "View" : "Reply"}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <AppLayout>
            <div className="inquiries-page" style={{ padding: "24px" }}>
                <Title level={2}>Inquiries</Title>
                <Text type="secondary">Manage property inquiries</Text>

                <Divider />

                {errors && Object.keys(errors).length > 0 && (
                    <Alert
                        message="Error"
                        description={
                            <ul>
                                {Object.values(errors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        }
                        type="error"
                        showIcon
                        closable
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Spin spinning={processingIds.length > 0}>
                    <Card>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            // tabBarExtraContent={
                            // <Button
                            //     type="primary"
                            //     icon={<MessageOutlined />}
                            //     // href={route("properties.index")}
                            //     loading={processingIds.length > 0}
                            // >
                            //     Send New Inquiry
                            // </Button>
                            // }
                        >
                            <TabPane
                                tab={
                                    <Badge
                                        count={
                                            receivedInquiries?.filter(
                                                (i) => i.status === "unread"
                                            )?.length || 0
                                        }
                                    >
                                        <span>
                                            <InboxOutlined /> Received
                                        </span>
                                    </Badge>
                                }
                                key="received"
                            >
                                {!receivedInquiries ? (
                                    <Spin tip="Loading inquiries..." />
                                ) : receivedInquiries.length === 0 ? (
                                    <Empty
                                        description={
                                            <Text type="secondary">
                                                You haven't received any
                                                inquiries yet
                                            </Text>
                                        }
                                        style={{ padding: "40px" }}
                                    />
                                ) : (
                                    <Table
                                        columns={columns}
                                        dataSource={receivedInquiries}
                                        rowKey="id"
                                        pagination={{ pageSize: 10 }}
                                        scroll={{ x: true }}
                                        loading={processingIds.length > 0}
                                    />
                                )}
                            </TabPane>
                            <TabPane
                                tab={
                                    <span>
                                        <MailOutlined /> Sent
                                    </span>
                                }
                                key="sent"
                            >
                                {!sentInquiries ? (
                                    <Spin tip="Loading inquiries..." />
                                ) : sentInquiries.length === 0 ? (
                                    <Empty
                                        description={
                                            <Text type="secondary">
                                                You haven't sent any inquiries
                                                yet
                                            </Text>
                                        }
                                        style={{ padding: "40px" }}
                                    />
                                ) : (
                                    <Table
                                        columns={columns}
                                        dataSource={sentInquiries}
                                        rowKey="id"
                                        pagination={{ pageSize: 10 }}
                                        scroll={{ x: true }}
                                        loading={processingIds.length > 0}
                                    />
                                )}
                            </TabPane>
                        </Tabs>
                    </Card>
                </Spin>
            </div>
        </AppLayout>
    );
};

export default InquiriesPage;
