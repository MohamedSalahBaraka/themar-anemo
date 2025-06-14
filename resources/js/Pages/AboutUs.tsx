import React from "react";
import { usePage } from "@inertiajs/react";
import {
    Card,
    Row,
    Col,
    Typography,
    Divider,
    Button,
    Descriptions,
    DatePicker,
    Collapse,
    Avatar,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { PageProps } from "@/types";
import FrontLayout from "@/Layouts/FrontLayout";
import { Package } from "@/Components/PackageCard";
import { TeamMember } from "@/types/teamMember";
import { useLanguage } from "@/contexts/LanguageContext";

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface PropertyDetailsPageProps extends PageProps {
    packages: Package[];
    aboutValues: { id: number; icon: string; details: string; title: string }[];
    teamMembers: TeamMember[];
    statictis: { cities: number; all: number; active: number };
}
const AboutUs: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
const Page: React.FC = () => {
    const { props } = usePage<PropertyDetailsPageProps>();
    const appConfigs = usePage().props.appConfigs as Record<string, any>;
    const { teamMembers, aboutValues, meta, auth, statictis } = props;

    const { t } = useLanguage();
    return (
        <section>
            <div style={{ position: "relative", overflow: "hidden" }}>
                <div
                    style={{
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
                            {t("about_us")}
                        </Title>

                        <Paragraph
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                color: "#eee",
                            }}
                        >
                            {appConfigs["about.short"]}
                        </Paragraph>
                    </Card>
                </div>
            </div>
            <div
                style={{ padding: "24px" }}
                className="container mx-auto px-4 py-6"
            >
                <Card>
                    <Typography>
                        <Title level={4}>{t("about_our_platform")}</Title>

                        <Paragraph>{appConfigs["about.detailed"]}</Paragraph>
                    </Typography>
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
                    {t("about_us")}
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
                                {t("our_mission")}
                            </Title>
                        </Row>
                        <Paragraph
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                textAlign: "right",
                            }}
                        >
                            {appConfigs["about.vision"]}
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
                                {t("our_vision")}
                            </Title>
                        </Row>
                        <Paragraph
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                textAlign: "right",
                            }}
                        >
                            {appConfigs["about.mission"]}
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
                            sm={6}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>
                                {statictis.all}+
                            </Title>

                            <Text style={{ color: "#ccc" }}>
                                {t("property_listings")}
                            </Text>
                        </Col>
                        <Col
                            sm={6}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>
                                {statictis.active}
                            </Title>

                            <Text style={{ color: "#ccc" }}>
                                {t("active_work")}
                            </Text>
                        </Col>
                        <Col
                            sm={6}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>
                                {statictis.cities}+
                            </Title>

                            <Text style={{ color: "#ccc" }}>{t("cities")}</Text>
                        </Col>
                        <Col
                            sm={6}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "white",
                            }}
                        >
                            <Title style={{ color: "white" }}>
                                {appConfigs["about.statictis_experiance"]}
                            </Title>

                            <Text style={{ color: "#ccc" }}>
                                {t("years_experience")}
                            </Text>
                        </Col>
                    </Row>
                </div>
            </div>
            <div style={{ padding: "24px" }}>
                <Card>
                    <Paragraph>
                        <Text strong>{appConfigs["about.values_intro"]}</Text>
                    </Paragraph>

                    <Divider />
                    <Row style={{ gap: 10, justifyContent: "space-around" }}>
                        {aboutValues.map((value) => (
                            <Col
                                key={value.id}
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
                                    style={{
                                        margin: "auto",
                                        width: "fit-content",
                                    }}
                                >
                                    <img
                                        width={100}
                                        height={100}
                                        src={`${window.location.origin}/storage/${value.icon}`}
                                        alt={value.title}
                                    />
                                </div>
                                <Title level={3}>{value.title}</Title>
                                <Paragraph>{value.details}</Paragraph>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </div>
            <div style={{ padding: "24px" }}>
                <Card style={{ textAlign: "center" }}>
                    <Title level={3}>{t("our_team")}</Title>
                    <Paragraph>
                        {appConfigs["about.team_catchy_phrase"]}
                    </Paragraph>
                    <Row gutter={[16, 16]}>
                        {teamMembers.map((member, index) => (
                            <Col key={index} xs={24} sm={12} md={8} lg={6}>
                                <Card size="small">
                                    <Row>
                                        <Col>
                                            <Avatar
                                                src={`${window.location.origin}/storage/${member.photo}`}
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
                                                {member.title}
                                            </Text>
                                            <br />
                                            <Paragraph type="secondary">
                                                {member.bio}
                                            </Paragraph>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </div>
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

export default AboutUs;
