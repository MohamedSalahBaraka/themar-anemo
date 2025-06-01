import React from "react";
import { Card, Space, Typography, Tag, List } from "antd";
import { CheckOutlined } from "@ant-design/icons";

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
    features: string[];
    user_type: "owner" | "agent" | "company";
}
interface PackageCardProps {
    pkg: Package;
    selected: boolean;
    onSelect: (id: number, frequency: "monthly" | "yearly") => void;
    selectedFrequency: string;
}

const PackageCard: React.FC<PackageCardProps> = ({
    pkg,
    selected,
    onSelect,
}) => {
    return (
        <Card
            onClick={() => onSelect(pkg.id, "monthly")}
            style={{
                border: selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
                cursor: "pointer",
                margin: "0 8px 16px",
                width: 300,
                textAlign: "right",
            }}
            hoverable
            bodyStyle={{ padding: 16 }}
        >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Title level={4} style={{ margin: 0, textAlign: "center" }}>
                    {pkg.name}
                </Title>

                <div style={{ textAlign: "center" }}>
                    <Text strong style={{ fontSize: 24 }}>
                        {pkg.price}
                    </Text>
                </div>

                <Text
                    type="secondary"
                    style={{ textAlign: "center", display: "block" }}
                >
                    {pkg.user_type == "agent"
                        ? "مثالية للوكلاء العقاريين"
                        : pkg.user_type == "company"
                        ? "للشركات والمطورين العقاريين"
                        : "مثالية للأفراد والمالكين"}
                </Text>
                <Text
                    type="secondary"
                    style={{ textAlign: "center", display: "block" }}
                >
                    {pkg.description}
                </Text>

                <List
                    size="small"
                    dataSource={[...pkg.features, `${pkg.max_listings} عرض`]}
                    renderItem={(feature) => (
                        <List.Item style={{ padding: "4px 0", border: "none" }}>
                            <Space align="start">
                                <CheckOutlined style={{ color: "#52c41a" }} />
                                <Text>{feature}</Text>
                            </Space>
                        </List.Item>
                    )}
                />

                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <Tag
                        color="blue"
                        style={{
                            padding: "8px 24px",
                            fontSize: 16,
                            cursor: "pointer",
                            borderRadius: 4,
                        }}
                    >
                        الاشتراك الآن
                    </Tag>
                </div>
            </Space>
        </Card>
    );
};

export default PackageCard;
