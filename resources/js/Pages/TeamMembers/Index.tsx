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
import { useLanguage } from "@/contexts/LanguageContext";

interface Props extends PageProps {
    teamMembers: TeamMember[];
}

const TeamMemberIndex: React.FC<Props> = ({ teamMembers, auth }) => (
    <AdminLayout>
        <Page teamMembers={teamMembers} auth={auth} />
    </AdminLayout>
);

const Page: React.FC<Props> = ({ teamMembers }) => {
    const { t } = useLanguage();

    const handleDelete = (id: number) => {
        router.delete(route("admin.team-members.destroy", id), {
            onSuccess: () => message.success(t("team_member_deleted_success")),
            onError: () => message.error(t("team_member_delete_error")),
        });
    };

    const columns = [
        {
            title: t("photo"),
            dataIndex: "photo",
            key: "photo",
            render: (photo?: string) => (
                <Avatar
                    icon={<UserOutlined />}
                    src={`${window.location.origin}/storage/${photo}`}
                    size="large"
                    alt={t("team_member_photo")}
                />
            ),
        },
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
            sorter: (a: TeamMember, b: TeamMember) =>
                a.name.localeCompare(b.name),
        },
        {
            title: t("title"),
            dataIndex: "title",
            key: "title",
        },
        {
            title: t("order"),
            dataIndex: "order",
            key: "order",
            sorter: (a: TeamMember, b: TeamMember) => a.order - b.order,
        },
        {
            title: t("actions"),
            key: "actions",
            render: (_: any, record: TeamMember) => (
                <Space size="middle">
                    <Link href={route("admin.team-members.edit", record.id)}>
                        <Button type="primary" icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title={t("confirm_delete_team_member")}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t("yes")}
                        cancelText={t("no")}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Head title={t("team_members")} />
            <Card
                title={t("team_members")}
                extra={
                    <Link href={route("admin.team-members.create")}>
                        <Button type="primary" icon={<PlusOutlined />}>
                            {t("add_member")}
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
        </div>
    );
};

export default TeamMemberIndex;
