// resources/js/Components/StatusTag.tsx
import React from "react";
import { Tag } from "antd";

type Status = "pending" | "in_progress" | "completed" | "rejected";

interface StatusTagProps {
    status?: Status;
}

const StatusTag: React.FC<StatusTagProps> = ({ status = "pending" }) => {
    const statusText =
        {
            pending: "PENDING",
            in_progress: "IN PROGRESS",
            completed: "COMPLETED",
            rejected: "REJECTED",
        }[status] || status.toUpperCase();

    const color =
        {
            pending: "orange",
            in_progress: "blue",
            completed: "green",
            rejected: "red",
        }[status] || "gray";

    return <Tag color={color}>{statusText}</Tag>;
};

export default StatusTag;
