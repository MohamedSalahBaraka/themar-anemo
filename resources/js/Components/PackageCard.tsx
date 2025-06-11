import React from "react";
import {
    Card,
    Space,
    Typography,
    Tag,
    List,
    Radio,
    Button,
    RadioChangeEvent,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { usePage, Link } from "@inertiajs/react";
import { useLanguage } from "@/contexts/LanguageContext";

const { Text, Title } = Typography;

export interface Package {
    id: number;
    description: string;
    idealFor: string;
    name: string;
    price: number;
    monthly_price: number;
    yearly_price: number;
    max_listings: number;
    max_adds: number;
    features: string[];
    user_type: "owner" | "agent" | "company";
}

interface PackageCardProps {
    pkg: Package;
    selected: boolean;
    onSelect: (id: number, frequency: "monthly" | "yearly") => void;
    selectedFrequency: "monthly" | "yearly";
    showActions?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({
    pkg,
    selected,
    onSelect,
    selectedFrequency,
    showActions = true,
}) => {
    const { url } = usePage();
    const { t } = useLanguage();
    const isRegistrationPage = url.includes("/register");

    const handleFrequencyChange = (e: RadioChangeEvent) => {
        onSelect(pkg.id, e.target.value);
    };

    const handleSelect = () => {
        if (!isRegistrationPage) {
            window.location.href = `/register?package=${pkg.id}&frequency=${selectedFrequency}`;
            return;
        }
        onSelect(pkg.id, selectedFrequency);
    };

    return (
        <Card
            style={{
                border: selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
                cursor: "pointer",
                margin: "0 8px 16px",
                width: 300,
                textAlign: "right",
            }}
            hoverable
            bodyStyle={{ padding: 16 }}
            onClick={handleSelect}
        >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Title level={4} style={{ margin: 0, textAlign: "center" }}>
                    {pkg.name}
                </Title>

                <div style={{ textAlign: "center" }}>
                    <Radio.Group
                        value={selectedFrequency}
                        onChange={handleFrequencyChange}
                        buttonStyle="solid"
                        size="middle"
                        style={{ marginBottom: 16 }}
                    >
                        <Radio.Button value="monthly">
                            {t("Monthly")}
                        </Radio.Button>
                        <Radio.Button value="yearly">
                            {t("Yearly")}
                        </Radio.Button>
                    </Radio.Group>

                    <Text strong style={{ fontSize: 24 }}>
                        {selectedFrequency === "monthly"
                            ? pkg.price
                            : pkg.yearly_price}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        {selectedFrequency === "monthly"
                            ? `/${t("Month")}`
                            : `/${t("Year")}`}
                    </Text>
                </div>

                {selectedFrequency === "yearly" && (
                    <Text style={{ textAlign: "center", color: "#52c41a" }}>
                        {t("Save")}{" "}
                        {Math.round(
                            100 - (pkg.yearly_price / (pkg.price * 12)) * 100
                        )}
                        %
                    </Text>
                )}

                <Text
                    type="secondary"
                    style={{ textAlign: "center", display: "block" }}
                >
                    {pkg.user_type === "agent"
                        ? t("Ideal for real estate agents")
                        : pkg.user_type === "company"
                        ? t("For companies and real estate developers")
                        : t("Ideal for individuals and owners")}
                </Text>

                <List
                    size="small"
                    dataSource={[
                        ...pkg.features,
                        `${pkg.max_listings} ${t("Listings")}`,
                        `${pkg.max_adds} ${t("Featured Listings")}`,
                    ]}
                    renderItem={(feature) => (
                        <List.Item style={{ padding: "4px 0", border: "none" }}>
                            <Space align="start">
                                <CheckOutlined style={{ color: "#52c41a" }} />
                                <Text>{feature}</Text>
                            </Space>
                        </List.Item>
                    )}
                />

                {showActions && (
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        {isRegistrationPage ? (
                            <Tag
                                color={selected ? "blue" : "default"}
                                style={{
                                    padding: "8px 24px",
                                    fontSize: 16,
                                    cursor: "pointer",
                                    borderRadius: 4,
                                }}
                            >
                                {selected ? t("Selected") : t("Choose Package")}
                            </Tag>
                        ) : (
                            <Link
                                href={`/register?package=${pkg.id}&frequency=${selectedFrequency}`}
                            >
                                <Button type="primary">
                                    {t("Subscribe Now")}
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default PackageCard;
