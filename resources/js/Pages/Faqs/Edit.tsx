// resources/js/Pages/Faqs/Edit.tsx
import React from "react";
import FaqForm from "./Form";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

interface FaqEditProps extends PageProps {
    faq: any;
}

const FaqEdit: React.FC<FaqEditProps> = ({ faq }) => {
    const auth = usePage().props.auth;
    // console.log(faq);

    return <FaqForm faq={faq} auth={auth} />;
};

export default FaqEdit;
