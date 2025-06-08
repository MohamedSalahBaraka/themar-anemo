import React from "react";
import { Table, Space, Button, Card, Avatar, Popconfirm, message } from "antd";
import { TeamMember } from "@/types/teamMember";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

interface Props extends PageProps {
    teamMembers: TeamMember[];
}

const TeamMemberIndex: React.FC<Props> = ({ teamMembers }) => {
    const { props } = usePage();

    const handleDelete = (id: number) => {
        router.delete(route("admin.team-members.destroy", id), {
            onSuccess: () =>
                message.success("Team member deleted successfully"),
            onError: () => message.error("Error deleting team member"),
        });
    };

    const columns = [
        {
            title: "Photo",
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
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a: TeamMember, b: TeamMember) =>
                a.name.localeCompare(b.name),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Order",
            dataIndex: "order",
            key: "order",
            sorter: (a: TeamMember, b: TeamMember) => a.order - b.order,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: TeamMember) => (
                <Space size="middle">
                    <Link href={route("admin.team-members.edit", record.id)}>
                        <Button type="primary" icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title="Are you sure you want to delete this team member?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Team Members" />
            <Card
                title="Team Members"
                extra={
                    <Link href={route("admin.team-members.create")}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            Add Member
                        </Button>
                    </Link>
                }
            >
                <Table
                    dataSource={teamMembers}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                />
            </Card>
        </AdminLayout>
    );
};

export default TeamMemberIndex;
