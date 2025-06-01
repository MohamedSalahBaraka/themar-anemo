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
    Avatar,
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
    UserOutlined,
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
const AboutUs: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
const Page: React.FC = () => {
    const { props } = usePage<PropertyDetailsPageProps>();
    const { packages, filters, meta } = props;
    const [filter, setFilter] = React.useState<PropertyFilter>(
        props.filters || {}
    );
    const teamMembers = [
        { name: "نوع الأعداد", position: "مديرة دعم الصناع" },
        { name: "أحد العلي", position: "مدير تغيير المنتهيات" },
        { name: "سارة المؤسس", position: "مديرة السوق" },
        { name: "محمد الأحمد", position: "المؤسس والرئيس التنفيذي" },
    ];
    return (
        <section>
            <div style={{ position: "relative", overflow: "hidden" }}>
                <div
                    style={{
                        textAlign: "right",
                        padding: "40px 0",
                        background: "linear-gradient(135deg, #7091D2, #5275B9)",
                        clipPath: "polygon(0 0, 100% 0, 100% 70%, 0% 100%)",
                    }}
                >
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: "8px",
                            background: "transparent",
                        }}
                        bodyStyle={{ padding: "40px" }}
                    >
                        <Title
                            level={2}
                            style={{
                                color: "#eee",
                                marginBottom: "24px",
                                fontWeight: "bold",
                            }}
                        >
                            من نحن
                        </Title>

                        <Paragraph
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                color: "#eee",
                            }}
                        >
                            منحة متخصصة في نشر وبيع وكراء العقارات، تجمع بين
                            البساطة والحترافية، وتربط بين المعانيين والمشترين
                            بكل شفافية.
                        </Paragraph>
                    </Card>
                </div>
            </div>
            <div
                style={{ padding: "24px", direction: "rtl" }}
                className="container mx-auto px-4 py-6"
            >
                <Card style={{ textAlign: "right" }}>
                    <Typography>
                        <Title level={4} style={{ textAlign: "right" }}>
                            نبذة عن منصتنا
                        </Title>

                        <Paragraph>
                            يوجد إحداث الفاءل نوعية في مجال التسويق المطبوع
                            الرقمي في العظم العربي لمن يتعين بأن تجربة البحث عن
                            العظم المناسب يجب أن تختبر سواء ومصلحة، وأن عملية
                            يوم أو تأثير الطفل يجب أن يتم بسرعة ومخالية.
                        </Paragraph>

                        <Paragraph>
                            من خلال ملمتنا المخفيف للهم طبقا موضوعات جميع الظروف
                            في السوق المطبوعي، كما من الأفراد الذين ينتجون من
                            خلال أخصائص وحفظ إلى القضوس المطبوعي مطبوعات
                            الخارجي.
                        </Paragraph>

                        <Paragraph>
                            في قلب عطلًا لكم الشفائية والصدقائية خوفاً. أساسية،
                            يفضل على توفير معلومات متابعة، وواضح أهمية تصميمات
                            استخدامها على اتخاذ فورات مديرية بشأن استثماراتهم
                            المقارنة.
                        </Paragraph>
                    </Typography>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            margin: 20,
                        }}
                    >
                        <Image
                            src="/about-us.png"
                            preview={false}
                            style={{ margin: "auto" }}
                        />
                    </div>
                </Card>
            </div>
            <div
                style={{
                    padding: "24px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <Title
                    level={2}
                    style={{ textAlign: "center", marginBottom: "40px" }}
                >
                    من نحن
                </Title>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                    }}
                >
                    <Card
                        bordered={false}
                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    >
                        <Row style={{ gap: 10 }}>
                            <svg
                                width="33"
                                height="33"
                                viewBox="0 0 33 33"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M16.3851 30.0766C23.7489 30.0766 29.7184 24.107 29.7184 16.7432C29.7184 9.37945 23.7489 3.40991 16.3851 3.40991C9.02129 3.40991 3.05176 9.37945 3.05176 16.7432C3.05176 24.107 9.02129 30.0766 16.3851 30.0766Z"
                                    stroke="#2563EB"
                                    stroke-width="2.66637"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M16.3848 24.7432C20.803 24.7432 24.3848 21.1615 24.3848 16.7432C24.3848 12.3249 20.803 8.74323 16.3848 8.74323C11.9665 8.74323 8.38477 12.3249 8.38477 16.7432C8.38477 21.1615 11.9665 24.7432 16.3848 24.7432Z"
                                    stroke="#2563EB"
                                    stroke-width="2.66637"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M16.3841 19.4093C17.8567 19.4093 19.0505 18.2155 19.0505 16.7429C19.0505 15.2703 17.8567 14.0765 16.3841 14.0765C14.9116 14.0765 13.7178 15.2703 13.7178 16.7429C13.7178 18.2155 14.9116 19.4093 16.3841 19.4093Z"
                                    stroke="#2563EB"
                                    stroke-width="2.66637"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <Title
                                level={3}
                                style={{
                                    color: "#1890ff",
                                    marginBottom: "16px",
                                }}
                            >
                                رسالتنا
                            </Title>
                        </Row>
                        <Paragraph
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                textAlign: "right",
                            }}
                        >
                            تقديم خدمة موثوقة وسوفا لعرض العقارات والوصول إلى
                            آخر عدد من الموثقين داخل السوق، نسعى بتربية متكاملة
                            تحقق المعنيين من عرض عقاراتهم بأفضل صورة ممكنة.
                            وتساعد العشائرين والمستأردين على العقار المناسب
                            بسهولة وسرعة.
                        </Paragraph>
                    </Card>

                    <Card
                        bordered={false}
                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                    >
                        <Row style={{ gap: 10 }}>
                            <svg
                                width="33"
                                height="33"
                                viewBox="0 0 33 33"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3.07129 16.0633C3.07129 16.0633 7.07129 6.72998 16.4046 6.72998C25.738 6.72998 29.738 16.0633 29.738 16.0633C29.738 16.0633 25.738 25.3966 16.4046 25.3966C7.07129 25.3966 3.07129 16.0633 3.07129 16.0633Z"
                                    stroke="#2563EB"
                                    stroke-width="2.66637"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M16.4039 20.0625C18.6128 20.0625 20.4034 18.2718 20.4034 16.0629C20.4034 13.854 18.6128 12.0634 16.4039 12.0634C14.195 12.0634 12.4043 13.854 12.4043 16.0629C12.4043 18.2718 14.195 20.0625 16.4039 20.0625Z"
                                    stroke="#2563EB"
                                    stroke-width="2.66637"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <Title
                                level={3}
                                style={{
                                    color: "#1890ff",
                                    marginBottom: "16px",
                                }}
                            >
                                رؤيتنا
                            </Title>
                        </Row>
                        <Paragraph
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                textAlign: "right",
                            }}
                        >
                            أن تكون الخيار الأول للتجارة والشركات في مجال
                            التسويق العقاري الرقمي في العالم العربي، تطمح بناء
                            أكبر مجتمع عقاري رقمي يجمع بين البنكار والثقة، ونسعى
                            إحداث تغيرياتها في كيفية تعامل الناس مع عمليات بيع
                            وشراء رواجر العقارات.
                        </Paragraph>
                    </Card>
                </div>
            </div>
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
                    <Row>
                        <Col
                            sm={12}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>50.000+</Title>

                            <Text style={{ color: "#ccc" }}>اعلان عقاري</Text>
                        </Col>
                        <Col
                            sm={12}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>50.000+</Title>

                            <Text style={{ color: "#ccc" }}>عمل نشط</Text>
                        </Col>
                        <Col
                            sm={12}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>50+</Title>

                            <Text style={{ color: "#ccc" }}>مدينة</Text>
                        </Col>
                        <Col
                            sm={12}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>5+</Title>

                            <Text style={{ color: "#ccc" }}>سنوات خبرة</Text>
                        </Col>
                    </Row>
                </div>
            </div>
            <div style={{ padding: "24px" }}>
                <Card>
                    <Paragraph>
                        <Text strong>
                            تشغل هذه القيم جوهر للفائلا الحاسوبية وترجى كل
                            مزاولنا وتحاسباتنا
                        </Text>
                    </Paragraph>

                    <Divider />
                    <Row style={{ gap: 10, justifyContent: "space-around" }}>
                        <Col
                            sm={11}
                            style={{
                                textAlign: "center",
                                borderColor: "#7091D2",
                                borderLeftWidth: 3,
                                borderRightWidth: 3,
                                borderRadius: 10,
                            }}
                        >
                            <div
                                style={{ margin: "auto", width: "fit-content" }}
                            >
                                <svg
                                    width="24"
                                    height="25"
                                    viewBox="0 0 24 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M11.9997 22.5083C17.5203 22.5083 21.9956 18.033 21.9956 12.5124C21.9956 6.99189 17.5203 2.5166 11.9997 2.5166C6.47919 2.5166 2.00391 6.99189 2.00391 12.5124C2.00391 18.033 6.47919 22.5083 11.9997 22.5083Z"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M11.9995 18.51C15.3118 18.51 17.997 15.8248 17.997 12.5125C17.997 9.20019 15.3118 6.51501 11.9995 6.51501C8.68713 6.51501 6.00195 9.20019 6.00195 12.5125C6.00195 15.8248 8.68713 18.51 11.9995 18.51Z"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M12.0004 14.5122C13.1047 14.5122 13.9998 13.617 13.9998 12.5127C13.9998 11.4085 13.1047 10.5133 12.0004 10.5133C10.8961 10.5133 10.001 11.4085 10.001 12.5127C10.001 13.617 10.8961 14.5122 12.0004 14.5122Z"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <Title level={3}>الابتكار</Title>
                            <Paragraph>
                                نسعى دائمًا لظهور طولنا وتقديم أهكار إبداعية لكي
                                احتياجات السوق.
                            </Paragraph>
                        </Col>
                        <Col
                            sm={11}
                            style={{
                                textAlign: "center",
                                borderColor: "#7091D2",
                                borderLeftWidth: 3,
                                borderRightWidth: 3,
                                borderRadius: 10,
                            }}
                        >
                            <div
                                style={{ margin: "auto", width: "fit-content" }}
                            >
                                <svg
                                    width="24"
                                    height="25"
                                    viewBox="0 0 24 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M15.4752 13.4021L16.9895 21.9245C17.0065 22.0249 16.9924 22.128 16.9492 22.2202C16.9059 22.3123 16.8356 22.389 16.7476 22.4401C16.6595 22.4912 16.558 22.5142 16.4566 22.506C16.3551 22.4978 16.2586 22.4589 16.1799 22.3944L12.6014 19.7085C12.4286 19.5794 12.2188 19.5097 12.0031 19.5097C11.7875 19.5097 11.5776 19.5794 11.4049 19.7085L7.82036 22.3934C7.74172 22.4578 7.6453 22.4967 7.54397 22.5048C7.44265 22.513 7.34124 22.4901 7.25326 22.4392C7.16529 22.3883 7.09494 22.3117 7.0516 22.2198C7.00826 22.1278 6.994 22.0248 7.0107 21.9245L8.52407 13.4021"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M11.9995 14.5116C15.3118 14.5116 17.997 11.8264 17.997 8.5141C17.997 5.20177 15.3118 2.5166 11.9995 2.5166C8.68713 2.5166 6.00195 5.20177 6.00195 8.5141C6.00195 11.8264 8.68713 14.5116 11.9995 14.5116Z"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <Title level={3}>الاحترافية</Title>
                            <Paragraph>
                                لتأثري أعلى معايير الدورة والدقة في كل ما نقدمه
                                من خدمات وحلول.
                            </Paragraph>
                        </Col>

                        <Col
                            sm={11}
                            style={{
                                textAlign: "center",
                                borderColor: "#7091D2",
                                borderLeftWidth: 3,
                                borderRightWidth: 3,
                                borderRadius: 10,
                            }}
                        >
                            <div
                                style={{ margin: "auto", width: "fit-content" }}
                            >
                                <svg
                                    width="24"
                                    height="25"
                                    viewBox="0 0 24 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M21.9956 11.5928V12.5124C21.9943 14.6679 21.2964 16.7653 20.0057 18.4918C18.7151 20.2182 16.901 21.4812 14.8339 22.0923C12.7669 22.7035 10.5576 22.6301 8.53565 21.8831C6.51371 21.1361 4.7874 19.7555 3.6142 17.9472C2.44099 16.1389 1.88375 13.9999 2.02557 11.849C2.1674 9.69816 3.0007 7.65077 4.40119 6.0122C5.80168 4.37363 7.69432 3.23167 9.79685 2.75663C11.8994 2.28159 14.0991 2.49893 16.0681 3.37623"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M9.00098 11.5128L11.9997 14.5116L21.9956 4.51575"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <Title level={3}>الشفافية</Title>
                            <Paragraph>
                                نوعي أهمية الوضوح والحدق في تعاملنا مع الصناع
                                والمتركاء.
                            </Paragraph>
                        </Col>
                        <Col
                            sm={11}
                            style={{
                                textAlign: "center",
                                borderColor: "#7091D2",
                                borderLeftWidth: 3,
                                borderRightWidth: 3,
                                borderRadius: 10,
                            }}
                        >
                            <div
                                style={{ margin: "auto", width: "fit-content" }}
                            >
                                <svg
                                    width="24"
                                    height="25"
                                    viewBox="0 0 24 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M15.9981 21.2862V19.287C15.9981 18.2266 15.5768 17.2096 14.827 16.4598C14.0772 15.7099 13.0602 15.2887 11.9997 15.2887H6.00224C4.94182 15.2887 3.92482 15.7099 3.17499 16.4598C2.42516 17.2096 2.00391 18.2266 2.00391 19.287V21.2862"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M9.00126 11.2904C11.2095 11.2904 12.9996 9.50025 12.9996 7.29203C12.9996 5.08382 11.2095 3.2937 9.00126 3.2937C6.79304 3.2937 5.00293 5.08382 5.00293 7.29203C5.00293 9.50025 6.79304 11.2904 9.00126 11.2904Z"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M21.9962 21.2869V19.2875C21.9955 18.4014 21.7006 17.5407 21.1578 16.8405C20.615 16.1402 19.855 15.6401 18.9971 15.4186"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M15.998 3.42358C16.8581 3.64379 17.6204 4.14398 18.1648 4.8453C18.7092 5.54662 19.0046 6.40917 19.0046 7.29697C19.0046 8.18477 18.7092 9.04732 18.1648 9.74864C17.6204 10.45 16.8581 10.9501 15.998 11.1704"
                                        stroke="#5275B9"
                                        stroke-width="1.99943"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <Title level={3}>رضا العملاء</Title>
                            <Paragraph>
                                نتجها رضا الصناع في مقصة أولوائنا ونحمل على
                                تحقيق توقعاتهم وتجاوزها.
                            </Paragraph>
                        </Col>
                    </Row>
                </Card>
            </div>
            <div style={{ padding: "24px" }}>
                <Card style={{ textAlign: "center" }}>
                    <Title level={3}>فريق العمل</Title>
                    <Paragraph>
                        لهذا يشراكنا الطمير الذي ينتج بين النهج فإنناك يؤكل عفت
                        يساهم بميزاته الفريدة في تحقيق بفئنا الصناع.
                    </Paragraph>
                    <Row gutter={[16, 16]}>
                        {teamMembers.map((member, index) => (
                            <Col key={index} xs={24} sm={12} md={8} lg={6}>
                                <Card size="small">
                                    <Row>
                                        <Col>
                                            <Avatar
                                                src={`${window.location.origin}/`}
                                                icon={<UserOutlined />}
                                                style={{
                                                    backgroundColor: "#777",
                                                }}
                                            />
                                        </Col>
                                        <Col sm={12}>
                                            <Text strong>{member.name}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {member.position}
                                            </Text>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </div>
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

export default AboutUs;
