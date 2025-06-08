// resources/js/Pages/Faqs/Create.tsx
import React from "react";
import FaqForm from "./Form";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

const FaqCreate: React.FC<PageProps> = () => {
    const auth = usePage().props.auth;
    return <FaqForm auth={auth} />;
};

export default FaqCreate;
