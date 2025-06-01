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

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface PropertyDetailsPageProps extends PageProps {
    packages: Package[];
}
const Pricing: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
interface PlanFeature {
    key: string;
    name: string;
    enterprise: string | boolean;
    premium: string | boolean;
    basic: string | boolean;
}
const Page: React.FC = () => {
    const { props } = usePage<PropertyDetailsPageProps>();
    const { packages, filters, meta } = props;
    const [filter, setFilter] = React.useState<PropertyFilter>(
        props.filters || {}
    );
    const features: PlanFeature[] = [
        {
            key: "1",
            name: "عدد الاعلانات",
            enterprise: "غير محدود",
            premium: "اعلان",
            basic: "اعلانات",
        },
        {
            key: "2",
            name: "الاعلانات المميزة",
            enterprise: "30",
            premium: "10",
            basic: "1",
        },
        {
            key: "3",
            name: "لوحة تحكم",
            enterprise: "متقدمة مع تقارير",
            premium: "متقدمة",
            basic: "أساسي",
        },
        {
            key: "4",
            name: "إحصائيات",
            enterprise: true,
            premium: true,
            basic: false,
        },
        {
            key: "5",
            name: "ظهور في نتائج البحث",
            enterprise: true,
            premium: true,
            basic: false,
        },
        {
            key: "6",
            name: "تقرير مالية",
            enterprise: true,
            premium: false,
            basic: false,
        },
        {
            key: "7",
            name: "ربط مع انظمة العقود",
            enterprise: true,
            premium: false,
            basic: false,
        },
        {
            key: "8",
            name: "دعم فني",
            enterprise: "مخصص",
            premium: "أولوية",
            basic: "عادي",
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
            dataIndex: "basic",
            key: "basic",
            render: (value: string | boolean) => renderCell(value),
            align: "center" as const,
        },
        {
            title: "باقة المميزة",
            dataIndex: "premium",
            key: "premium",
            render: (value: string | boolean) => renderCell(value),
            align: "center" as const,
        },
        {
            title: "الشركات",
            dataIndex: "enterprise",
            key: "enterprise",
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
                    اختر الباقة المناسبة وإبدأ نشر مقاراتك بكل احترافية
                </Title>
                <Text
                    style={{
                        display: "block",
                        marginBottom: "40px",
                        fontSize: "16px",
                        color: "white",
                    }}
                >
                    تقدم لك باقات متنوعة لتلبي احتياجاتك سواء كانت قادرًا، وكيلا
                    عقارياً أو نشاطًا عقاريًا.
                </Text>
            </div>

            <Row className="flex flex-row justify-around container mx-auto px-4 py-6">
                {props.packages.map((pkg) => (
                    <PackageCard
                        key={pkg.id}
                        pkg={{
                            ...pkg,
                            features: Object.values(pkg.features),
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
                    قابل بين الباقات واختر المناسب لانتقلاتك من بين مجموعة
                    متنوعة من المرازات والخدمات
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
                    إجابات على الاستفسارات الأكثر شيوعاً حول باقاتنا.
                </p>

                <Collapse
                    bordered={false}
                    defaultActiveKey={["1"]}
                    expandIcon={({ isActive }) => (
                        <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                    style={{ background: "#fff" }}
                >
                    <Panel
                        header="هل يمكنك تغيير باقتي بعد الاشتراك؟"
                        key="1"
                        style={{
                            textAlign: "right",
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    >
                        <p style={{ paddingRight: "16px" }}>
                            يمكنك ترقية باقتك في أي وقت مع دفع فرق السعر. أما في
                            حالة التغيير لباقة أقل، فيمكن ذلك عند تجديد
                            الاشتراك.
                        </p>
                    </Panel>

                    <Panel
                        header="هل هناك قوالب تدريبية مجانية؟"
                        key="2"
                        style={{
                            textAlign: "right",
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    >
                        <p style={{ paddingRight: "16px" }}>
                            عند الباقة الأساسية، تحصل على تجربة إصدارات الأساسية
                            للمنصة قبل الاشتراك.
                        </p>
                    </Panel>

                    <Panel
                        header="ما هي سياسة استرداد الأموال؟"
                        key="3"
                        style={{
                            textAlign: "right",
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    >
                        <p style={{ paddingRight: "16px" }}>
                            خلال 7 أيام من بداية الاشتراك إذا لم تكن راضياً عن
                            الخدمة، شريطة عدم استخدام أكثر من 25% من المصادر
                            المتاحة.
                        </p>
                    </Panel>

                    <Panel
                        header="كيف يتم احتساب عدد الإعلانات؟"
                        key="4"
                        style={{
                            textAlign: "right",
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    >
                        <p style={{ paddingRight: "16px" }}>
                            يتم احتساب الإعلان النشط على أنه واحد من حصتك
                            الشهرية، عند القيام بنشر هذا الإعلان أو حذفه، لا يتم
                            استرجاعه إلى حصتك لنفس الشهر.
                        </p>
                    </Panel>
                </Collapse>
            </Card>
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
                        نبدأ اليوم ونضم إلى آلاف الوكالات والشركات العقارية
                    </Title>

                    <Paragraph
                        style={{
                            fontSize: "18px",
                            color: "#eee",
                            marginBottom: "32px",
                        }}
                    >
                        سواء كنت مالكاً فرداً أو وكيلاً عقارياً أو شركة لدينا
                        الباقة المثالية لاحتياجاتك
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
        </section>
    );
};

export default Pricing;
