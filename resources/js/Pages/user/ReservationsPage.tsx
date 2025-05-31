// src/pages/user/ReservationsPage.tsx
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
    Descriptions,
    Statistic,
} from "antd";
import {
    HomeOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    MessageOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PageProps } from "@/types";
import AppLayout from "@/Layouts/Layout";
import SimpleComment from "@/Components/SimpleComment";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Reservation {
    id: string;
    property_id: string;
    property_title: string;
    property_image?: string;
    user_id: number;
    user_name: string;
    user_email: string;
    user_phone?: string;
    user_avatar?: string;
    price: number;
    special_requests?: string;
    start_date: string;
    end_date: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    created_at: string;
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

interface ReservationsPageProps extends PageProps {
    reservations: {
        upcomingReservations: Reservation[];
        pastReservations: Reservation[];
        pendingReservations: Reservation[];
    };
    receivedReservations: {
        upcomingReservations: Reservation[];
        pastReservations: Reservation[];
        pendingReservations: Reservation[];
    };
    errors?: Record<string, string>;
}

const ReservationsPage: React.FC = () => {
    const { props } = usePage<ReservationsPageProps>();
    const { reservations, receivedReservations, errors } = props;
    const user = props.auth.user;
    const [activeTab, setActiveTab] = React.useState<string>("upcoming");
    const [mainTab, setmainTab] = React.useState<string>(
        "receivedReservations"
    );
    const [processingIds, setProcessingIds] = React.useState<string[]>([]);
    const [messageModalVisible, setMessageModalVisible] = React.useState(false);
    const [currentReservation, setCurrentReservation] =
        React.useState<Reservation | null>(null);
    const [messageForm] = Form.useForm();
    const [loadingReplies, setLoadingReplies] = React.useState(false);

    const updateReservationStatus = async (
        reservationId: string,
        status: string
    ) => {
        setProcessingIds((prev) => [...prev, reservationId]);

        try {
            router.put(
                route("user.reservations.update-status", reservationId),
                { status },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({
                            only: [
                                "upcomingReservations",
                                "pendingReservations",
                                "pastReservations",
                            ],
                        });
                    },
                    onError: (errors) => {
                        console.error("Error updating status:", errors);
                    },
                    onFinish: () => {
                        setProcessingIds((prev) =>
                            prev.filter((id) => id !== reservationId)
                        );
                    },
                }
            );
        } catch (error) {
            console.error("Failed to update status:", error);
            setProcessingIds((prev) =>
                prev.filter((id) => id !== reservationId)
            );
        }
    };

    const openMessageModal = async (reservation: Reservation) => {
        setCurrentReservation(reservation);
        setMessageModalVisible(true);

        // Load replies if not already loaded
        if (!reservation.replies) {
            setLoadingReplies(true);
            try {
                await router.get(
                    route("user.reservations.replies", reservation.id),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: (page) => {
                            setCurrentReservation((prev) => ({
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

    const handleMessageSubmit = async (values: { message: string }) => {
        if (!currentReservation) return;

        try {
            await router.post(
                route("user.reservations.send-message", currentReservation.id),
                {
                    message: values.message,
                },
                {
                    preserveScroll: true,
                    onSuccess: async () => {
                        // Refresh the replies after successful submission
                        try {
                            setLoadingReplies(true);
                            const response = await fetch(
                                route(
                                    "user.reservations.replies",
                                    currentReservation.id
                                ),
                                {
                                    headers: {
                                        "X-Requested-With": "XMLHttpRequest",
                                        Accept: "application/json",
                                    },
                                    credentials: "same-origin",
                                }
                            );
                            if (!response.ok) {
                                throw new Error("Failed to load replies");
                            }
                            const data = await response.json();
                            setCurrentReservation((prev) => ({
                                ...prev!,
                                replies: data.replies as Reply[],
                            }));
                        } catch (error) {
                            console.error("Failed to load replies:", error);
                        } finally {
                            setLoadingReplies(false);
                            messageForm.resetFields();
                        }
                    },
                }
            );
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const getStatusTag = (status: string) => {
        const statusMap: Record<
            string,
            { color: string; text: string; icon: React.ReactNode }
        > = {
            pending: {
                color: "orange",
                text: "قيد الانتظار",
                icon: <ClockCircleOutlined />,
            },
            confirmed: {
                color: "green",
                text: "تم التأكيد",
                icon: <CheckCircleOutlined />,
            },
            cancelled: {
                color: "red",
                text: "ملغية",
                icon: <CloseCircleOutlined />,
            },
            completed: {
                color: "blue",
                text: "مكتملة",
                icon: <CheckCircleOutlined />,
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
            render: (text: string, record: Reservation) => (
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
            title: "التواريخ",
            key: "dates",
            render: (_: any, record: Reservation) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        <CalendarOutlined /> من:{" "}
                        {dayjs(record.start_date).format("DD/MM/YYYY")}
                    </Text>
                    <Text>
                        <CalendarOutlined /> إلى:{" "}
                        {dayjs(record.end_date).format("DD/MM/YYYY")}
                    </Text>
                    <Text type="secondary">
                        {dayjs(record.end_date).diff(
                            dayjs(record.start_date),
                            "day"
                        )}{" "}
                        ليالي
                    </Text>
                </Space>
            ),
        },
        {
            title: "المعلومات",
            key: "info",
            render: (_: any, record: Reservation) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        <DollarOutlined /> السعر: {record.price} ر.س
                    </Text>
                    {record.special_requests && (
                        <Text ellipsis={{ tooltip: record.special_requests }}>
                            طلبات خاصة: {record.special_requests}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: "الحالة",
            dataIndex: "status",
            key: "status",
            render: (status: string) => getStatusTag(status),
        },
        {
            title: "الإجراءات",
            key: "actions",
            render: (_: any, record: Reservation) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => openMessageModal(record)}
                        loading={processingIds.includes(record.id)}
                        icon={<MessageOutlined />}
                    >
                        مراسلة
                    </Button>

                    {record.status === "pending" && (
                        <>
                            {record.user_id !== user.id && (
                                <Button
                                    size="small"
                                    color="green"
                                    onClick={() =>
                                        updateReservationStatus(
                                            record.id,
                                            "confirmed"
                                        )
                                    }
                                    loading={processingIds.includes(record.id)}
                                >
                                    تأكيد
                                </Button>
                            )}
                            <Button
                                size="small"
                                danger
                                onClick={() =>
                                    updateReservationStatus(
                                        record.id,
                                        "cancelled"
                                    )
                                }
                                loading={processingIds.includes(record.id)}
                            >
                                إلغاء
                            </Button>
                        </>
                    )}

                    {record.status === "confirmed" &&
                        record.user_id !== user.id && (
                            <Button
                                size="small"
                                onClick={() =>
                                    updateReservationStatus(
                                        record.id,
                                        "completed"
                                    )
                                }
                                loading={processingIds.includes(record.id)}
                            >
                                تأكيد الانتهاء
                            </Button>
                        )}
                </Space>
            ),
        },
    ];

    return (
        <AppLayout>
            <div className="reservations-page" style={{ padding: "24px" }}>
                <Title level={2}>الحجوزات</Title>
                <Text type="secondary">إدارة حجوزات العقارات</Text>

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
                        <Tabs activeKey={mainTab} onChange={setmainTab}>
                            <TabPane
                                key="reservation"
                                tab={
                                    <Text>
                                        <ClockCircleOutlined /> الحجوزات المرسلة
                                    </Text>
                                }
                            >
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                >
                                    <TabPane
                                        tab={
                                            <Badge
                                                count={
                                                    reservations
                                                        .pendingReservations
                                                        ?.length || 0
                                                }
                                            >
                                                <span>
                                                    <ClockCircleOutlined /> قيد
                                                    الانتظار
                                                </span>
                                            </Badge>
                                        }
                                        key="pending"
                                    >
                                        {!reservations.pendingReservations ? (
                                            <Spin tip="جاري تحميل الحجوزات..." />
                                        ) : reservations.pendingReservations
                                              .length === 0 ? (
                                            <Empty
                                                description={
                                                    <Text type="secondary">
                                                        لا توجد حجوزات قيد
                                                        الانتظار
                                                    </Text>
                                                }
                                                style={{ padding: "40px" }}
                                            />
                                        ) : (
                                            <Table
                                                columns={columns}
                                                dataSource={
                                                    reservations.pendingReservations
                                                }
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                                scroll={{ x: true }}
                                                loading={
                                                    processingIds.length > 0
                                                }
                                            />
                                        )}
                                    </TabPane>
                                    <TabPane
                                        tab={
                                            <span>
                                                <CalendarOutlined /> القادمة
                                            </span>
                                        }
                                        key="upcoming"
                                    >
                                        {!reservations.upcomingReservations ? (
                                            <Spin tip="جاري تحميل الحجوزات..." />
                                        ) : reservations.upcomingReservations
                                              .length === 0 ? (
                                            <Empty
                                                description={
                                                    <Text type="secondary">
                                                        لا توجد حجوزات قادمة
                                                    </Text>
                                                }
                                                style={{ padding: "40px" }}
                                            />
                                        ) : (
                                            <Table
                                                columns={columns}
                                                dataSource={
                                                    reservations.upcomingReservations
                                                }
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                                scroll={{ x: true }}
                                                loading={
                                                    processingIds.length > 0
                                                }
                                            />
                                        )}
                                    </TabPane>
                                    <TabPane
                                        tab={
                                            <span>
                                                <CheckCircleOutlined /> السابقة
                                            </span>
                                        }
                                        key="past"
                                    >
                                        {!reservations.pastReservations ? (
                                            <Spin tip="جاري تحميل الحجوزات..." />
                                        ) : reservations.pastReservations
                                              .length === 0 ? (
                                            <Empty
                                                description={
                                                    <Text type="secondary">
                                                        لا توجد حجوزات سابقة
                                                    </Text>
                                                }
                                                style={{ padding: "40px" }}
                                            />
                                        ) : (
                                            <Table
                                                columns={columns}
                                                dataSource={
                                                    reservations.pastReservations
                                                }
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                                scroll={{ x: true }}
                                                loading={
                                                    processingIds.length > 0
                                                }
                                            />
                                        )}
                                    </TabPane>
                                </Tabs>
                            </TabPane>
                            <TabPane
                                key="receivedReservations"
                                tab={
                                    <Text>
                                        <ClockCircleOutlined /> الحجوزات الواردة
                                    </Text>
                                }
                            >
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                >
                                    <TabPane
                                        tab={
                                            <Badge
                                                count={
                                                    receivedReservations
                                                        .pendingReservations
                                                        ?.length || 0
                                                }
                                            >
                                                <span>
                                                    <ClockCircleOutlined /> قيد
                                                    الانتظار
                                                </span>
                                            </Badge>
                                        }
                                        key="pending"
                                    >
                                        {!receivedReservations.pendingReservations ? (
                                            <Spin tip="جاري تحميل الحجوزات..." />
                                        ) : receivedReservations
                                              .pendingReservations.length ===
                                          0 ? (
                                            <Empty
                                                description={
                                                    <Text type="secondary">
                                                        لا توجد حجوزات قيد
                                                        الانتظار
                                                    </Text>
                                                }
                                                style={{ padding: "40px" }}
                                            />
                                        ) : (
                                            <Table
                                                columns={columns}
                                                dataSource={
                                                    receivedReservations.pendingReservations
                                                }
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                                scroll={{ x: true }}
                                                loading={
                                                    processingIds.length > 0
                                                }
                                            />
                                        )}
                                    </TabPane>
                                    <TabPane
                                        tab={
                                            <span>
                                                <CalendarOutlined /> القادمة
                                            </span>
                                        }
                                        key="upcoming"
                                    >
                                        {!receivedReservations.upcomingReservations ? (
                                            <Spin tip="جاري تحميل الحجوزات..." />
                                        ) : receivedReservations
                                              .upcomingReservations.length ===
                                          0 ? (
                                            <Empty
                                                description={
                                                    <Text type="secondary">
                                                        لا توجد حجوزات قادمة
                                                    </Text>
                                                }
                                                style={{ padding: "40px" }}
                                            />
                                        ) : (
                                            <Table
                                                columns={columns}
                                                dataSource={
                                                    receivedReservations.upcomingReservations
                                                }
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                                scroll={{ x: true }}
                                                loading={
                                                    processingIds.length > 0
                                                }
                                            />
                                        )}
                                    </TabPane>
                                    <TabPane
                                        tab={
                                            <span>
                                                <CheckCircleOutlined /> السابقة
                                            </span>
                                        }
                                        key="past"
                                    >
                                        {!receivedReservations.pastReservations ? (
                                            <Spin tip="جاري تحميل الحجوزات..." />
                                        ) : receivedReservations
                                              .pastReservations.length === 0 ? (
                                            <Empty
                                                description={
                                                    <Text type="secondary">
                                                        لا توجد حجوزات سابقة
                                                    </Text>
                                                }
                                                style={{ padding: "40px" }}
                                            />
                                        ) : (
                                            <Table
                                                columns={columns}
                                                dataSource={
                                                    receivedReservations.pastReservations
                                                }
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                                scroll={{ x: true }}
                                                loading={
                                                    processingIds.length > 0
                                                }
                                            />
                                        )}
                                    </TabPane>
                                </Tabs>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Spin>

                {/* Message Modal */}
                <Modal
                    title={
                        <Space>
                            <MessageOutlined />
                            <span>مراسلة حول الحجز</span>
                            {currentReservation && (
                                <Tag>{currentReservation.property_title}</Tag>
                            )}
                        </Space>
                    }
                    visible={messageModalVisible}
                    onCancel={() => setMessageModalVisible(false)}
                    footer={null}
                    width={800}
                    destroyOnClose
                >
                    {currentReservation && (
                        <>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="العقار">
                                    <Space>
                                        <Avatar
                                            src={`${window.location.origin}/storage/${currentReservation.property_image}`}
                                            icon={<HomeOutlined />}
                                            shape="square"
                                        />
                                        <Button
                                            type="link"
                                            href={route(
                                                "properties.show",
                                                currentReservation.property_id
                                            )}
                                            style={{ padding: 0 }}
                                        >
                                            {currentReservation.property_title}
                                        </Button>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="التواريخ">
                                    <Space direction="vertical" size={0}>
                                        <Text>
                                            من:{" "}
                                            {dayjs(
                                                currentReservation.start_date
                                            ).format("DD/MM/YYYY")}
                                        </Text>
                                        <Text>
                                            إلى:{" "}
                                            {dayjs(
                                                currentReservation.end_date
                                            ).format("DD/MM/YYYY")}
                                        </Text>
                                        <Text>
                                            المدة:{" "}
                                            {dayjs(
                                                currentReservation.end_date
                                            ).diff(
                                                dayjs(
                                                    currentReservation.start_date
                                                ),
                                                "day"
                                            )}{" "}
                                            ليالي
                                        </Text>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="السعر">
                                    <Statistic
                                        value={currentReservation.price}
                                        suffix="ر.س"
                                        precision={2}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="الحالة">
                                    {getStatusTag(currentReservation.status)}
                                </Descriptions.Item>
                                {currentReservation.special_requests && (
                                    <Descriptions.Item label="طلبات خاصة">
                                        {currentReservation.special_requests}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            <Divider orientation="left">
                                <Space>
                                    <span>المراسلات</span>
                                    <Badge
                                        count={
                                            currentReservation.replies?.filter(
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
                                <Spin tip="جاري تحميل المراسلات..." />
                            ) : (
                                <List
                                    dataSource={
                                        currentReservation.replies || []
                                    }
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
                                                description="لا توجد مراسلات بعد"
                                                image={
                                                    Empty.PRESENTED_IMAGE_SIMPLE
                                                }
                                            />
                                        ),
                                    }}
                                />
                            )}

                            <Divider />

                            <Form
                                form={messageForm}
                                onFinish={handleMessageSubmit}
                            >
                                <Form.Item
                                    name="message"
                                    rules={[
                                        {
                                            required: true,
                                            message: "الرجاء إدخال رسالتك",
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
                                        placeholder="اكتب رسالتك هنا..."
                                        maxLength={1000}
                                        showCount
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<MessageOutlined />}
                                        loading={processingIds.includes(
                                            currentReservation.id
                                        )}
                                    >
                                        إرسال
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

export default ReservationsPage;
