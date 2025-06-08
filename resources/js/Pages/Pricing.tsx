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
    const { faqs, aboutValues, meta, auth } = props;
    // Map user_type to column names
    const userTypeLabelMap: Record<string, "company" | "agent" | "owner"> = {
        company: "company",
        agent: "agent",
        owner: "owner",
    };

    const features: PlanFeature[] = [
        {
            key: "1",
            name: "عدد الإعلانات",
            company:
                props.packages.find((pkg) => pkg.user_type === "company")
                    ?.max_listings === -1
                    ? "غير محدود"
                    : props.packages
                          .find((pkg) => pkg.user_type === "company")
                          ?.max_listings?.toString() ?? "",
            agent:
                props.packages.find((pkg) => pkg.user_type === "agent")
                    ?.max_listings === -1
                    ? "غير محدود"
                    : props.packages
                          .find((pkg) => pkg.user_type === "agent")
                          ?.max_listings?.toString() ?? "",
            owner:
                props.packages.find((pkg) => pkg.user_type === "owner")
                    ?.max_listings === -1
                    ? "غير محدود"
                    : props.packages
                          .find((pkg) => pkg.user_type === "owner")
                          ?.max_listings?.toString() ?? "",
        },
        {
            key: "2",
            name: "الإعلانات المميزة",
            company:
                props.packages.find((pkg) => pkg.user_type === "company")
                    ?.max_adds === -1
                    ? "غير محدود"
                    : props.packages
                          .find((pkg) => pkg.user_type === "company")
                          ?.max_adds?.toString() ?? "",
            agent:
                props.packages.find((pkg) => pkg.user_type === "agent")
                    ?.max_adds === -1
                    ? "غير محدود"
                    : props.packages
                          .find((pkg) => pkg.user_type === "agent")
                          ?.max_adds?.toString() ?? "",
            owner:
                props.packages.find((pkg) => pkg.user_type === "owner")
                    ?.max_adds === -1
                    ? "غير محدود"
                    : props.packages
                          .find((pkg) => pkg.user_type === "owner")
                          ?.max_adds?.toString() ?? "",
        },
        {
            key: "3",
            name: "لوحة تحكم",
            company: "متقدمة مع تقارير",
            agent: "متقدمة",
            owner: "أساسي",
        },
        {
            key: "4",
            name: "إحصائيات",
            company: true,
            agent: true,
            owner: false,
        },
        {
            key: "5",
            name: "ظهور في نتائج البحث",
            company: true,
            agent: true,
            owner: false,
        },
        {
            key: "6",
            name: "تقرير مالية",
            company: true,
            agent: false,
            owner: false,
        },
        {
            key: "7",
            name: "ربط مع انظمة العقود",
            company: true,
            agent: false,
            owner: false,
        },
        {
            key: "8",
            name: "دعم فني",
            company: "مخصص",
            agent: "أولوية",
            owner: "عادي",
        },
    ];

    const columns = [
        {
            title: "الفئة/الشركات",
            dataIndex: "name",
            key: "name",
            width: 200,
        },
        {
            title: "الباقة الأساسية",
            dataIndex: "owner",
            key: "owner",
            render: (value: string | boolean) => renderCell(value),
            align: "center" as const,
        },
        {
            title: "باقة المميزة",
            dataIndex: "agent",
            key: "agent",
            render: (value: string | boolean) => renderCell(value),
            align: "center" as const,
        },
        {
            title: "الشركات",
            dataIndex: "company",
            key: "company",
            render: (value: string | boolean) => renderCell(value),
            align: "center" as const,
        },
    ];

    const renderCell = (value: string | boolean) => {
        if (typeof value === "boolean") {
            return value ? (
                <CheckOutlined style={{ color: "green" }} />
            ) : (
                <CloseOutlined style={{ color: "red" }} />
            );
        }
        return value;
    };
    return (
        <section>
            <div
                style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    marginBottom: 30,
                    background: "linear-gradient(135deg, #7091D2, #5275B9)",
                }}
            >
                <Title
                    level={2}
                    style={{ marginBottom: "16px", color: "white" }}
                >
                    {appConfigs["pricing.catchy_phrase_primary"]}
                </Title>
                <Text
                    style={{
                        display: "block",
                        marginBottom: "40px",
                        fontSize: "16px",
                        color: "white",
                    }}
                >
                    {appConfigs["pricing.catchy_phrase_secondary"]}
                </Text>
            </div>

            <Row className="flex flex-row justify-around container mx-auto px-4 py-6">
                {props.packages.map((pkg) => (
                    <PackageCard
                        key={pkg.id}
                        pkg={{
                            ...pkg,
                            features: pkg.features,
                        }}
                        selected={false}
                        onSelect={() => {}}
                        selectedFrequency={"monthly"}
                    />
                ))}
            </Row>
            <Card className="container mx-auto px-4 py-6">
                <Title level={3} style={{ textAlign: "center" }}>
                    مقارنة شاملة بين الباقات
                </Title>
                <p style={{ textAlign: "center", marginBottom: 24 }}>
                    {appConfigs["pricing.package_comperson"]}
                </p>

                <Table
                    dataSource={features}
                    columns={columns}
                    pagination={false}
                    bordered
                    style={{ direction: "rtl" }}
                />
            </Card>
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
