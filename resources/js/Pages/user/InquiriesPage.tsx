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
    Modal,
    Form,
    Input,
    List,
} from "antd";
import {
    MessageOutlined,
    HomeOutlined,
    UserOutlined,
    MailOutlined,
    InboxOutlined,
    ExclamationCircleOutlined,
    SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PageProps } from "@/types";
import AppLayout from "@/Layouts/Layout";
import SimpleComment from "@/Components/SimpleComment";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

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
    replies?: Reply[];
}

interface Reply {
    id: string;
    message: string;
    sender_id: number;
    sender_name: string;
    sender_avatar?: string;
    created_at: string;
    is_read: boolean;
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
    const [replyModalVisible, setReplyModalVisible] = React.useState(false);
    const [currentInquiry, setCurrentInquiry] = React.useState<Inquiry | null>(
        null
    );
    const [replyForm] = Form.useForm();
    const [loadingReplies, setLoadingReplies] = React.useState(false);

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

    const openReplyModal = async (inquiry: Inquiry) => {
        setCurrentInquiry(inquiry);
        setReplyModalVisible(true);

        // If this is a received inquiry and it's unread, mark it as read
        if (!inquiry.is_sent_by_me && inquiry.status === "unread") {
            await markAsRead(inquiry.id);
        }

        // Load replies if not already loaded
        if (!inquiry.replies) {
            setLoadingReplies(true);
            try {
                await router.get(
                    route("user.inquiries.replies", inquiry.id),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: (page) => {
                            setCurrentInquiry((prev) => ({
                                ...prev!,
                                replies: page.props.replies as Reply[],
                            }));
                        },
                        onError: (error) => {
                            console.error("Failed to load replies:", error);
                        },
                        onFinish: () => {
                            setLoadingReplies(false);
                        },
                    }
                );
            } catch (error) {
                console.error("Failed to load replies:", error);
                setLoadingReplies(false);
            }
        }
    };

    const handleReplySubmit = async (values: { message: string }) => {
        if (!currentInquiry) return;

        try {
            await router.post(
                route("user.inquiries.reply", currentInquiry.id),
                {
                    message: values.message,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Refresh the replies after successful submission
                        router.get(
                            route("user.inquiries.replies", currentInquiry.id),
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: (response) => {
                                    setCurrentInquiry((prev) => ({
                                        ...prev!,
                                        replies: response.props
                                            .replies as Reply[],
                                        status: "replied",
                                    }));
                                    router.reload({
                                        only: ["receivedInquiries"],
                                    });
                                },
                            }
                        );
                        replyForm.resetFields();
                    },
                }
            );
        } catch (error) {
            console.error("Failed to send reply:", error);
        }
    };

    // Ant Design v5+ removed the Comment component. We'll create a simple replacement:
    interface SimpleCommentProps {
        author: React.ReactNode;
        avatar?: React.ReactNode;
        content: React.ReactNode;
        datetime?: React.ReactNode;
        style?: React.CSSProperties;
    }

    // Replace usages of <Comment ... /> with <SimpleComment ... />

    const getStatusTag = (status: string) => {
        const statusMap: Record<
            string,
            { color: string; text: string; icon: React.ReactNode }
        > = {
            unread: { color: "blue", text: "جديد", icon: <MailOutlined /> },
            read: { color: "default", text: "مقروء", icon: <InboxOutlined /> },
            replied: {
                color: "green",
                text: "تم الرد",
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
            title: "العقار",
            dataIndex: "property_title",
            key: "property",
            render: (text: string, record: Inquiry) => (
                <Space>
                    <Avatar
                        src={`${window.location.origin}/storage/${record.property_image}`}
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
            title: "جهة الاتصال",
            dataIndex: "sender_name",
            key: "contact",
            render: (text: string, record: Inquiry) => (
                <Space>
                    <Avatar
                        src={`${window.location.origin}/storage/${record.sender_avatar}`}
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
            title: "الرسالة",
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
            title: "التاريخ",
            dataIndex: "created_at",
            key: "date",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY hh:mm A"),
        },
        {
            title: "الحالة",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: Inquiry) =>
                record.is_sent_by_me ? <Tag>مرسل</Tag> : getStatusTag(status),
        },
        {
            title: "الإجراءات",
            key: "actions",
            render: (_: any, record: Inquiry) => (
                <Space>
                    {!record.is_sent_by_me && record.status === "unread" && (
                        <Button
                            size="small"
                            onClick={() => markAsRead(record.id)}
                            loading={processingIds.includes(record.id)}
                        >
                            تمييز كمقروء
                        </Button>
                    )}
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => openReplyModal(record)}
                        loading={processingIds.length > 0}
                    >
                        {record.is_sent_by_me ? "عرض" : "رد"}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <AppLayout>
            <div className="inquiries-page" style={{ padding: "24px" }}>
                <Title level={2}>الاستفسارات</Title>
                <Text type="secondary">إدارة استفسارات العقارات</Text>

                <Divider />

                {errors && Object.keys(errors).length > 0 && (
                    <Alert
                        message="خطأ"
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
                        <Tabs activeKey={activeTab} onChange={setActiveTab}>
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
                                            <InboxOutlined /> الواردة
                                        </span>
                                    </Badge>
                                }
                                key="received"
                            >
                                {!receivedInquiries ? (
                                    <Spin tip="جاري تحميل الاستفسارات..." />
                                ) : receivedInquiries.length === 0 ? (
                                    <Empty
                                        description={
                                            <Text type="secondary">
                                                لم تتلق أي استفسارات بعد
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
                                        <MailOutlined /> المرسلة
                                    </span>
                                }
                                key="sent"
                            >
                                {!sentInquiries ? (
                                    <Spin tip="جاري تحميل الاستفسارات..." />
                                ) : sentInquiries.length === 0 ? (
                                    <Empty
                                        description={
                                            <Text type="secondary">
                                                لم ترسل أي استفسارات بعد
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

                {/* Reply Modal */}
                <Modal
                    title={
                        <Space>
                            <MessageOutlined />
                            <span>رد على الاستفسار</span>
                            {currentInquiry && (
                                <Tag>{currentInquiry.property_title}</Tag>
                            )}
                        </Space>
                    }
                    visible={replyModalVisible}
                    onCancel={() => setReplyModalVisible(false)}
                    footer={null}
                    width={800}
                    destroyOnClose
                >
                    {currentInquiry && (
                        <>
                            <div style={{ marginBottom: 24 }}>
                                <SimpleComment
                                    author={
                                        <Space>
                                            <span>
                                                {currentInquiry.sender_name}
                                            </span>
                                            <Tag color="blue">المرسل</Tag>
                                        </Space>
                                    }
                                    avatar={
                                        <Avatar
                                            src={currentInquiry.sender_avatar}
                                            icon={<UserOutlined />}
                                        />
                                    }
                                    content={<p>{currentInquiry.message}</p>}
                                    datetime={currentInquiry.created_at}
                                />
                            </div>

                            <Divider orientation="left">
                                <Space>
                                    <span>الردود</span>
                                    <Badge
                                        count={
                                            currentInquiry.replies?.filter(
                                                (r) =>
                                                    !r.is_read &&
                                                    r.sender_id !==
                                                        props.auth.user.id
                                            ).length
                                        }
                                        offset={[5, 0]}
                                    />
                                </Space>
                            </Divider>

                            {loadingReplies ? (
                                <Spin tip="جاري تحميل الردود..." />
                            ) : (
                                <List
                                    dataSource={currentInquiry.replies || []}
                                    itemLayout="horizontal"
                                    renderItem={(reply) => (
                                        <SimpleComment
                                            author={
                                                <Space>
                                                    <span>
                                                        {reply.sender_name}
                                                    </span>
                                                    {reply.sender_id ===
                                                    props.auth.user.id ? (
                                                        <Tag color="green">
                                                            أنت
                                                        </Tag>
                                                    ) : (
                                                        !reply.is_read && (
                                                            <Tag color="blue">
                                                                جديد
                                                            </Tag>
                                                        )
                                                    )}
                                                </Space>
                                            }
                                            avatar={
                                                <Avatar
                                                    src={reply.sender_avatar}
                                                    icon={<UserOutlined />}
                                                />
                                            }
                                            content={<p>{reply.message}</p>}
                                            datetime={reply.created_at}
                                            style={{
                                                backgroundColor:
                                                    !reply.is_read &&
                                                    reply.sender_id !==
                                                        props.auth.user.id
                                                        ? "#f6ffed"
                                                        : "transparent",
                                                padding: "8px 12px",
                                                borderRadius: 4,
                                            }}
                                        />
                                    )}
                                    locale={{
                                        emptyText: (
                                            <Empty
                                                description="لا توجد ردود بعد"
                                                image={
                                                    Empty.PRESENTED_IMAGE_SIMPLE
                                                }
                                            />
                                        ),
                                    }}
                                />
                            )}

                            <Divider />

                            <Form form={replyForm} onFinish={handleReplySubmit}>
                                <Form.Item
                                    name="message"
                                    rules={[
                                        {
                                            required: true,
                                            message: "الرجاء إدخال رسالة الرد",
                                        },
                                        {
                                            max: 1000,
                                            message:
                                                "يجب ألا تتجاوز الرسالة 1000 حرف",
                                        },
                                    ]}
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="اكتب ردك هنا..."
                                        maxLength={1000}
                                        showCount
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SendOutlined />}
                                        loading={processingIds.includes(
                                            currentInquiry.id
                                        )}
                                    >
                                        إرسال الرد
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </Modal>
            </div>
        </AppLayout>
    );
};

export default InquiriesPage;
