import React from "react";
import TeamMemberForm from "./Form";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

interface Props extends PageProps {
    teamMember: {
        id: number;
        name: string;
        title: string;
        bio?: string;
        photo?: string;
        order: number;
    };
}

const TeamMemberEdit: React.FC<Props> = ({ teamMember }) => {
    const auth = usePage().props.auth;
    return <TeamMemberForm teamMember={teamMember} auth={auth} />;
};

export default TeamMemberEdit;
