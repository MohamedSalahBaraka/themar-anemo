import React from "react";
import { usePage } from "@inertiajs/react";
import { Typography, Button, Descriptions, DatePicker, Collapse } from "antd";
import { PageProps } from "@/types";
import FrontLayout from "@/Layouts/FrontLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface PropertyDetailsPageProps extends PageProps {
    page: string;
}
const Pricing: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
interface PlanFeature {
    key: string;
    name: string;
    company: string | boolean;
    agent: string | boolean;
    owner: string | boolean;
}
const Page: React.FC = () => {
    const { props } = usePage<PropertyDetailsPageProps>();
    const appConfigs = usePage().props.appConfigs as Record<string, any>;
    const { page, auth } = props;

    const { t } = useLanguage();
    return (
        <section>
            <div className="m-10" dangerouslySetInnerHTML={{ __html: page }} />
            {!auth.user && (
                <div
                    style={{
                        background: "linear-gradient(135deg, #7091D2, #5275B9)",
                        padding: "40px 20px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "1200px",
                            margin: "0 auto",
                        }}
                    >
                        <Title
                            level={2}
                            style={{ color: "white", marginBottom: "24px" }}
                        >
                            {appConfigs["cta.catchy_phrase_primary"]}
                        </Title>

                        <Paragraph
                            style={{
                                fontSize: "18px",
                                color: "#eee",
                                marginBottom: "32px",
                            }}
                        >
                            {appConfigs["cta.catchy_phrase_secondary"]}
                        </Paragraph>

                        <div>
                            <Button
                                type="primary"
                                size="large"
                                style={{
                                    margin: "0 8px",
                                    padding: "0 32px",
                                    height: "48px",
                                    fontSize: "16px",
                                }}
                            >
                                {t("free_trial")}
                            </Button>
                            <Button
                                size="large"
                                style={{
                                    margin: "0 8px",
                                    padding: "0 32px",
                                    height: "48px",
                                    fontSize: "16px",
                                    backgroundColor: "#4AB861",
                                    borderColor: "#26913C",
                                    color: "white",
                                }}
                            >
                                {t("book_package_now")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Pricing;
