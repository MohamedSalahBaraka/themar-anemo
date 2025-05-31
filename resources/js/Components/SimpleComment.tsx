import React from "react";
import { Avatar, Typography, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

interface SimpleCommentProps {
    author: React.ReactNode;
    avatar?: string | React.ReactNode;
    content: React.ReactNode;
    datetime?: string | Date;
    style?: React.CSSProperties;
    className?: string;
    isCurrentUser?: boolean;
}

const SimpleComment: React.FC<SimpleCommentProps> = ({
    author,
    avatar,
    content,
    datetime,
    style,
    className,
    isCurrentUser = false,
}) => {
    const renderAvatar = () => {
        if (typeof avatar === "string") {
            return (
                <Avatar
                    src={`${window.location.origin}/storage/${avatar}`}
                    icon={<UserOutlined />}
                    style={{
                        backgroundColor: isCurrentUser ? "#1890ff" : "#f56a00",
                    }}
                />
            );
        }
        return avatar || <Avatar icon={<UserOutlined />} />;
    };

    const formattedDatetime = datetime
        ? dayjs(datetime).format("MMM D, YYYY [at] h:mm A")
        : null;

    return (
        <div
            style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                ...style,
            }}
            className={className}
        >
            <div style={{ flexShrink: 0 }}>{renderAvatar()}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <Space
                    size="small"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 4,
                        flexWrap: "wrap",
                    }}
                >
                    <Text strong style={{ fontSize: 14 }}>
                        {author}
                    </Text>

                    {isCurrentUser && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            (You)
                        </Text>
                    )}

                    {formattedDatetime && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formattedDatetime}
                        </Text>
                    )}
                </Space>

                <div
                    style={{
                        padding: 8,
                        borderRadius: 6,
                        wordBreak: "break-word",
                    }}
                >
                    {content}
                </div>
            </div>
        </div>
    );
};

export default SimpleComment;
