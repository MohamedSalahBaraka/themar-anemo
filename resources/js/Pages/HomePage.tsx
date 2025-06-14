import React from "react";
import { usePage, router, Link } from "@inertiajs/react";
import {
    Row,
    Col,
    Input,
    Select,
    Button,
    Card,
    Typography,
    Divider,
    Tag,
    Space,
    Empty,
    Badge,
    Grid,
    Tabs,
    Radio,
} from "antd";
import {
    EnvironmentOutlined,
    HomeOutlined,
    StarFilled,
    SearchOutlined,
    ArrowsAltOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import { PageProps } from "@/types";
import { Property, PropertyFilter } from "@/types/property";
import { FaBath } from "react-icons/fa";
import FrontLayout from "@/Layouts/FrontLayout";
import PackageCard, { Package } from "@/Components/PackageCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { City } from "@/types/city";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Meta } = Card;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

interface HomePageProps extends PageProps {
    featuredProperties: Property[];
    filters: PropertyFilter;
    packages: Package[];
    cities: City[];
    recentlyViewed?: Property[];
    sectionedProperties: {
        forSale: Property[];
        forRent: Property[];
        popularTypes: Property[];
    };
}

const HomePage: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);

type RealEstateType = "apartment" | "villa" | "land" | "office";

const Page: React.FC = () => {
    const { props } = usePage<HomePageProps>();
    const { t, darkMode, language } = useLanguage();
    const screens = useBreakpoint();
    const [filter, setFilter] = React.useState<PropertyFilter>(
        props.filters || {}
    );
    const [loading, setLoading] = React.useState(false);
    const [favorites, setFavorites] = React.useState<Set<number>>(new Set());
    const appConfigs = usePage().props.appConfigs as Record<string, any>;

    const handleSearch = () => {
        setLoading(true);
        router.get(
            route("properties.search"),
            { ...filter },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const realEstateTypes: { type: RealEstateType; count: number }[] = [
        { type: "apartment", count: 1600 },
        { type: "villa", count: 1400 },
        { type: "land", count: 3800 },
        { type: "office", count: 4200 },
    ];

    const translateType = (type: RealEstateType): string => {
        const translations: Record<RealEstateType, string> = {
            apartment: t("apartment"),
            villa: t("villa"),
            land: t("land"),
            office: t("office"),
        };
        return translations[type];
    };

    const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ar-SA", {
            style: "currency",
            currency: "SAR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const toggleFavorite = (id: number) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });
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
                            }  px-1.5 py-0.5 rounded text-xs font-medium text-white ${
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
                                        t("location_undefined")}
                                </Text>
                            </Space>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space size="large">
                                <Space>
                                    <HomeOutlined />
                                    {property.bedrooms || t("undefined")}{" "}
                                    {t("rooms")}
                                </Space>
                                <Space>
                                    <FaBath />
                                    {property.bathrooms || t("undefined")}{" "}
                                    {t("bathrooms")}
                                </Space>
                                <Space>
                                    <ArrowsAltOutlined />
                                    {property.area
                                        ? `${property.area} m²`
                                        : t("undefined")}
                                </Space>
                            </Space>
                        </>
                    }
                />
            </Card>
        </Badge.Ribbon>
    );

    const renderPropertySection = (
        properties: Property[],
        title: string,
        icon: React.ReactNode
    ) => (
        <section className="section" style={{ margin: 30 }}>
            <Row
                className="flex flex-row justify-between"
                style={{ marginBottom: 20 }}
            >
                <Title level={3} style={{ marginBottom: 0 }}>
                    {title}
                </Title>
                <Link
                    style={{ color: "#2563EB", fontSize: 16, fontWeight: 700 }}
                    href={route("properties.search")}
                >
                    {t("view_all")}
                </Link>
            </Row>
            {properties?.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {properties.map((property) => (
                        <Col key={property.id} xs={24} sm={12} md={8} lg={6}>
                            {renderPropertyCard(property)}
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty
                    description={t("no_properties_available", { type: title })}
                />
            )}
        </section>
    );

    return (
        <div className="home-page">
            {/* BG IMG */}
            <img
                src={`${window.location.origin}/Images/landBg.jpg`}
                width={"100%"}
                style={{
                    top: 0,
                    right: 0,
                    position: "absolute",
                    zIndex: 0,
                    height: 500,
                }}
                alt={t("background_image")}
            />
            <div
                style={{
                    top: 0,
                    right: 0,
                    position: "absolute",
                    zIndex: 0,
                    height: 500,
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
            />
            <Col
                span={24}
                className="flex flex-col items-center justify-center text-center text-white"
                style={{ zIndex: 1, margin: 50 }}
            >
                <Title level={1} style={{ color: "white" }}>
                    {appConfigs["landing.catchy_phrase_primary"]}
                </Title>
                <Title
                    level={2}
                    style={{
                        display: "block",
                        marginBottom: 24,
                        color: "white",
                        zIndex: 1,
                    }}
                >
                    {appConfigs["landing.catchy_phrase_secondary"]}
                </Title>
            </Col>

            {/* Hero Search Section */}
            <div className="hero-section">
                <div className="hero-overlay">
                    <Row
                        justify="center"
                        align="middle"
                        style={{ height: "100%" }}
                    >
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
                                <Row gutter={[16, 16]} justify="center">
                                    {/* Sale/Rent/Offices Toggle */}
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
                                                        filter.purpose ===
                                                        "sale"
                                                            ? "2px solid #1890ff"
                                                            : "2px solid transparent",
                                                    color:
                                                        filter.purpose ===
                                                        "sale"
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
                                                        filter.purpose ===
                                                        "rent"
                                                            ? "2px solid #1890ff"
                                                            : "2px solid transparent",
                                                    color:
                                                        filter.purpose ===
                                                        "rent"
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

                                    {/* Area and Property Type */}
                                    <Col xs={24} sm={12} md={6}>
                                        <Select
                                            placeholder={t("city")}
                                            style={{ width: "100%" }}
                                            size="large"
                                            value={filter.city}
                                            onChange={(value) =>
                                                handleFilterChange(
                                                    "city",
                                                    value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: undefined,
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
                                                handleFilterChange(
                                                    "type",
                                                    value
                                                )
                                            }
                                            options={propertyTypes}
                                        />
                                    </Col>

                                    {/* Price Range */}
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
                                                background: "transparent",
                                                width: "100%",
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
                                                background: "transparent",
                                                width: "100%",
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
                </div>
            </div>
            {/* Main Content */}
            <div
                className="container mx-auto px-4 py-6"
                style={{ padding: screens.xs ? "16px" : "24px" }}
            >
                {/* Featured Properties Carousel */}
                <section className="section">
                    {props.featuredProperties?.length > 0 ? (
                        <>
                            {renderPropertySection(
                                props.featuredProperties,
                                t("featured_properties"),
                                <StarFilled />
                            )}
                        </>
                    ) : (
                        <Empty description={t("no_featured_properties")} />
                    )}
                </section>
                <Card title={t("property_categories")}>
                    <Row gutter={16}>
                        {realEstateTypes.map((item, index) => (
                            <Col key={index} span={6}>
                                <Card
                                    style={{
                                        textAlign: "center",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        display: "flex",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: 50,
                                            width: 50,
                                            borderRadius: 25,
                                            backgroundColor:
                                                "rgba(5, 150, 105, 0.06)",
                                        }}
                                    >
                                        <HomeOutlined
                                            style={{
                                                fontSize: 40,
                                                color: "rgba(5, 150, 105, 0.19)",
                                            }}
                                        />
                                    </div>
                                    <h3>{translateType(item.type)}</h3>
                                    <p>
                                        {t("properties_count", {
                                            count: item.count,
                                        })}
                                    </p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
                {renderPropertySection(
                    props.sectionedProperties.forSale,
                    t("latest_properties"),
                    <ShopOutlined />
                )}
            </div>
            <section className="section container mx-auto px-4 py-6">
                <Row
                    className="flex flex-row justify-between"
                    style={{ marginBottom: 20 }}
                >
                    <Title level={3} style={{ marginBottom: 0 }}>
                        {t("subscription_packages")}
                    </Title>
                    <Link
                        style={{
                            color: "#2563EB",
                            fontSize: 16,
                            fontWeight: 700,
                        }}
                        href={"#"}
                    >
                        {t("view_all")}
                    </Link>
                </Row>
                <Row className="flex flex-row justify-around">
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
            </section>
        </div>
    );
};

export default HomePage;
