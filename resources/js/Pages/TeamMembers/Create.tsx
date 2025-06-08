import React from "react";
import TeamMemberForm from "./Form";
import { usePage } from "@inertiajs/react";

const TeamMemberCreate: React.FC = () => {
    const auth = usePage().props.auth;
    return <TeamMemberForm auth={auth} />;
};

export default TeamMemberCreate;
