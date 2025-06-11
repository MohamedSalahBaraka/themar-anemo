import React from "react";
import { usePage, router } from "@inertiajs/react";
import {
    Card,
    Row,
    Col,
    Typography,
    Divider,
    Button,
    Space,
    Descriptions,
    Input,
    Tag,
    DatePicker,
    Badge,
    Empty,
    Select,
    Radio,
    Pagination,
} from "antd";
import {
    EnvironmentOutlined,
    HomeOutlined,
    ArrowsAltOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { PageProps } from "@/types";
import { Property, PropertyFilter } from "@/types/property";
import { FaBath } from "react-icons/fa";
import Meta from "antd/es/card/Meta";
import FrontLayout from "@/Layouts/FrontLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { City } from "@/types/city";

const { Title, Text, Paragraph } = Typography;
const { Item } = Descriptions;
const { RangePicker } = DatePicker;

interface PropertyDetailsPageProps extends PageProps {
    properties: Property[];
    filters: PropertyFilter;
    cities: City[];
    meta: {
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
    isLoggedIn: boolean;
}
const SearchResultsPage: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
const Page: React.FC = () => {
    const { t, darkMode, language } = useLanguage();
    const { props } = usePage<PropertyDetailsPageProps>();
    const { properties, filters, meta } = props;
    const [filter, setFilter] = React.useState<PropertyFilter>(
        props.filters || {}
    );
    const [loading, setLoading] = React.useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ar-SA", {
            style: "currency",
            currency: "SAR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    type StatusKey = "available" | "sold" | "rented" | "reserved";

    const getStatusTag = (status: string) => {
        const statusMap: Record<StatusKey, { color: string; text: string }> = {
            available: { color: "green", text: t("available") },
            sold: { color: "red", text: t("sold") },
            rented: { color: "blue", text: t("rented") },
            reserved: { color: "orange", text: t("reserved") },
        };
        const key = status as StatusKey;
        return <Tag color={statusMap[key]?.color}>{statusMap[key]?.text}</Tag>;
    };

    const handleSearch = () => {
        setLoading(true);
        router.get(
            route("properties.search"),
            { ...filter, page: 1 },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setLoading(true);
        router.get(
            route("properties.search"),
            { ...filter, page },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
    };

    const propertyTypes = [
        { value: "apartment", label: t("apartment") },
        { value: "villa", label: t("villa") },
        { value: "office", label: t("office") },
        { value: "land", label: t("land") },
        { value: "house", label: t("house") },
    ];

    const renderPropertyCard = (property: Property) => (
        <Badge.Ribbon
            text={t("featured")}
            color="gold"
            placement="start"
            style={{ display: property.is_featured ? "block" : "none" }}
        >
            <Card
                hoverable
                cover={
                    <div className="relative aspect-[4/3]">
                        <img
                            alt={property.title}
                            src={
                                property.primaryImage
                                    ? `${window.location.origin}/storage/${property.primaryImage}`
                                    : "/placeholder-property.jpg"
                            }
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <span
                            className={`absolute top-1 ${
                                language === "ar" ? `left-1` : "right-1"
                            } px-1.5 py-0.5 rounded text-xs font-medium text-white ${
                                property.purpose === "sale"
                                    ? "bg-blue-600"
                                    : "bg-green-600"
                            }`}
                        >
                            {property.purpose === "sale"
                                ? t("for_sale")
                                : t("for_rent")}
                        </span>
                    </div>
                }
                className="property-card"
                onClick={() =>
                    router.visit(route("properties.show", { id: property.id }))
                }
            >
                <Meta
                    title={
                        <>
                            <Space
                                style={{ display: "block", marginBottom: 8 }}
                            >
                                <Title level={4} style={{ color: "#2563EB" }}>
                                    {formatPrice(property.price)}
                                </Title>
                            </Space>
                            <Space>
                                {property.title}
                                {getStatusTag(property.status)}
                            </Space>
                        </>
                    }
                    description={
                        <>
                            <Space>
                                <EnvironmentOutlined />
                                <Text type="secondary">
                                    {property.address?.split(",")[0] ||
                                        t("location_not_specified")}
                                </Text>
                            </Space>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space size="large">
                                <Space>
                                    <HomeOutlined />
                                    {property.bedrooms ||
                                        t("not_specified")}{" "}
                                    {t("bedroom")}
                                </Space>
                                <Space>
                                    <FaBath />
                                    {property.bathrooms ||
                                        t("not_specified")}{" "}
                                    {t("bathroom")}
                                </Space>
                                <Space>
                                    <ArrowsAltOutlined />
                                    {property.area
                                        ? `${property.area} m²`
                                        : t("not_specified")}
                                </Space>
                            </Space>
                        </>
                    }
                />
            </Card>
        </Badge.Ribbon>
    );

    return (
        <section className="section container mx-auto px-4 py-6">
            <Row style={{ height: "100%" }}>
                <Col span={24} style={{ textAlign: "center" }}>
                    <div
                        className="search-container"
                        style={{
                            background: darkMode
                                ? "rgba(50, 50, 50, 0.7)"
                                : "rgba(255, 255, 255, 0.9)",
                            padding: "24px",
                            borderRadius: "8px",
                            maxWidth: "1200px",
                            margin: "0 auto",
                        }}
                    >
                        <Row gutter={[24, 24]} justify="center">
                            <Col span={24}>
                                <Radio.Group
                                    size="large"
                                    value={filter.purpose}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "purpose",
                                            e.target.value
                                        )
                                    }
                                    buttonStyle="solid"
                                    style={{
                                        display: "flex",
                                        gap: "1rem",
                                    }}
                                >
                                    <Radio.Button
                                        value="sale"
                                        style={{
                                            padding: "4px 12px",
                                            border: "none",
                                            borderBottom:
                                                filter.purpose === "sale"
                                                    ? "2px solid #1890ff"
                                                    : "2px solid transparent",
                                            color:
                                                filter.purpose === "sale"
                                                    ? "#1890ff"
                                                    : "inherit",
                                            background: "transparent",
                                            boxShadow: "none",
                                            margin: 0,
                                        }}
                                    >
                                        {t("sale")}
                                    </Radio.Button>
                                    <Radio.Button
                                        value="rent"
                                        style={{
                                            padding: "4px 12px",
                                            border: "none",
                                            borderBottom:
                                                filter.purpose === "rent"
                                                    ? "2px solid #1890ff"
                                                    : "2px solid transparent",
                                            color:
                                                filter.purpose === "rent"
                                                    ? "#1890ff"
                                                    : "inherit",
                                            background: "transparent",
                                            boxShadow: "none",
                                            margin: 0,
                                        }}
                                    >
                                        {t("rent")}
                                    </Radio.Button>
                                </Radio.Group>
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    placeholder={t("city")}
                                    style={{ width: "100%" }}
                                    size="large"
                                    value={
                                        filter.city !== null
                                            ? parseInt(`${filter.city}`)
                                            : undefined
                                    }
                                    onChange={(value) =>
                                        handleFilterChange("city", value)
                                    }
                                    options={[
                                        {
                                            value: null,
                                            label: t("all_areas"),
                                        },
                                        ...props.cities.map((c) => ({
                                            value: c.id,
                                            label: c.title,
                                        })),
                                    ]}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    placeholder={t("property_type")}
                                    style={{ width: "100%" }}
                                    size="large"
                                    value={filter.type}
                                    onChange={(value) =>
                                        handleFilterChange("type", value)
                                    }
                                    options={propertyTypes}
                                />
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Input
                                    type="number"
                                    placeholder={t("min_price")}
                                    size="large"
                                    value={filter.minPrice}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "minPrice",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onPressEnter={handleSearch}
                                    style={{
                                        width: "100%",
                                        background: "transparent",
                                    }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Input
                                    type="number"
                                    placeholder={t("max_price")}
                                    size="large"
                                    value={filter.maxPrice}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "maxPrice",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    onPressEnter={handleSearch}
                                    style={{
                                        width: "100%",
                                        background: "transparent",
                                    }}
                                />
                            </Col>
                            <Col
                                xs={24}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                {/* <Button type="default" size="small">
                                    {t("advanced_options")}
                                </Button> */}
                                <Button
                                    type="primary"
                                    onClick={handleSearch}
                                    loading={loading}
                                    size="small"
                                    icon={<SearchOutlined />}
                                >
                                    {t("search")}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
            <Row
                className="flex flex-row justify-between"
                style={{ marginBottom: 20 }}
            >
                <Title level={3} style={{ marginBottom: 0 }}>
                    {t("properties")}
                </Title>
                {meta && (
                    <Text type="secondary">
                        {t("showing_properties", {
                            count: properties.length,
                            total: meta.total,
                        })}
                    </Text>
                )}
            </Row>
            {properties?.length > 0 ? (
                <>
                    <Row gutter={[24, 24]}>
                        {properties.map((property) => (
                            <Col
                                key={property.id}
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                            >
                                {renderPropertyCard(property)}
                            </Col>
                        ))}
                    </Row>
                    {meta && meta.total > meta.per_page && (
                        <Row justify="center" style={{ marginTop: 24 }}>
                            <Pagination
                                current={meta.current_page}
                                total={meta.total}
                                pageSize={meta.per_page}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper
                                locale={{ items_per_page: `/${t("page")}` }}
                            />
                        </Row>
                    )}
                </>
            ) : (
                <Empty description={t("no_properties_available")} />
            )}
        </section>
    );
};

export default SearchResultsPage;
