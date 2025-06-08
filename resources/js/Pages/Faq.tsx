import React from "react";
import { usePage, router, Link } from "@inertiajs/react";
import {
    Card,
    Row,
    Col,
    Image,
    Typography,
    Divider,
    Button,
    Space,
    Descriptions,
    Modal,
    Form,
    Input,
    Tag,
    DatePicker,
    Badge,
    message,
    Empty,
    Select,
    Radio,
    Pagination,
    Table,
    Collapse,
    List,
} from "antd";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined,
    HomeOutlined,
    StarOutlined,
    ArrowsAltOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    CheckOutlined,
    CloseOutlined,
    CaretRightOutlined,
} from "@ant-design/icons";
import Map from "@/Components/Map";
import dayjs from "dayjs";
import { PageProps } from "@/types";
import { Property, PropertyFilter } from "@/types/property";
import { FaBath, FaBed } from "react-icons/fa";
import Meta from "antd/es/card/Meta";
import FrontLayout from "@/Layouts/FrontLayout";
import PackageCard, { Package } from "@/Components/PackageCard";
import { Faq } from "@/types/faq";

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
                    الأسئلة الشائعة
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
                                تجربة مجانية
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
                                احجز باقة الآن
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Pricing;
