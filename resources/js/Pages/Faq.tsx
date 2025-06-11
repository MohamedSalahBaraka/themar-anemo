import React from "react";
import { usePage } from "@inertiajs/react";
import {
    Card,
    Typography,
    Button,
    Descriptions,
    DatePicker,
    Collapse,
} from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { PageProps } from "@/types";
import FrontLayout from "@/Layouts/FrontLayout";
import { Package } from "@/Components/PackageCard";
import { Faq } from "@/types/faq";
import { useLanguage } from "@/contexts/LanguageContext";

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface PropertyDetailsPageProps extends PageProps {
    packages: Package[];
    faqs: Faq[];
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
    const { faqs, auth } = props;
    const { t } = useLanguage();

    return (
        <section>
            <Card
                style={{
                    maxWidth: "800px",
                    margin: "20px auto",
                    padding: "20px",
                }}
            >
                <Title
                    level={2}
                    style={{ textAlign: "right", marginBottom: "24px" }}
                >
                    {t("frequently_asked_questions")}
                </Title>
                <p style={{ textAlign: "right", marginBottom: "24px" }}>
                    {appConfigs["pricing.faq"]}
                </p>

                <Collapse
                    bordered={false}
                    defaultActiveKey={["1"]}
                    expandIcon={({ isActive }) => (
                        <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                    style={{ background: "#fff" }}
                >
                    {faqs.map((faq) => (
                        <Panel
                            header={faq.question}
                            key={faq.id}
                            style={{
                                textAlign: "right",
                                borderBottom: "1px solid #f0f0f0",
                            }}
                        >
                            <p style={{ paddingRight: "16px" }}>{faq.answer}</p>
                        </Panel>
                    ))}
                </Collapse>
            </Card>
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
