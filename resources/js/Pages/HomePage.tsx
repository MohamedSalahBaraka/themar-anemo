import React from "react";
import { usePage, router, Link } from "@inertiajs/react";
import {
    Row,
    Col,
    Input,
    Select,
    Button,
    Carousel,
    Card,
    Typography,
    Divider,
    Tag,
    Space,
    Spin,
    Empty,
    Badge,
    Grid,
    Tabs,
    Checkbox,
    Radio,
    Image,
} from "antd";
import {
    DollarOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    StarFilled,
    SearchOutlined,
    HeartOutlined,
    HeartFilled,
    ArrowsAltOutlined,
    ShopOutlined,
    HomeFilled,
    CrownFilled,
} from "@ant-design/icons";
import { PageProps } from "@/types";
import { Property, PropertyFilter } from "@/types/property";
import { FaBath } from "react-icons/fa";
import FrontLayout from "@/Layouts/FrontLayout";
import { theme } from "@/config/theme/themeVariables";
import PackageCard, { Package } from "@/Components/PackageCard";

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
            apartment: "شقة",
            villa: "فيلا",
            land: "أرض",
            office: "مكتب",
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
            available: { color: "green", text: "متاح" },
            sold: { color: "red", text: "تم البيع" },
            rented: { color: "blue", text: "مؤجر" },
            reserved: { color: "orange", text: "محجوز" },
        };
        const key = status as StatusKey;
        return <Tag color={statusMap[key]?.color}>{statusMap[key]?.text}</Tag>;
    };

    const propertyTypes = [
        { value: "apartment", label: "شقة" },
        { value: "villa", label: "فيلا" },
        { value: "office", label: "مكتب" },
        { value: "land", label: "أرض" },
        { value: "house", label: "منزل" },
        { value: "condo", label: "شقة فندقية" },
    ];

    const renderPropertyCard = (property: Property) => (
        <Badge.Ribbon
            text="مميز"
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
                        {/* <button
                            type="button"
                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full shadow hover:bg-white focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(property.id);
                            }}
                        >
                            {favorites.has(property.id) ? (
                                <HeartFilled className="text-red-500 text-sm" />
                            ) : (
                                <HeartOutlined className="text-sm" />
                            )}
                        </button> */}
                        <span
                            className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium text-white ${
                                property.purpose === "sale"
                                    ? "bg-blue-600"
                                    : "bg-green-600"
                            }`}
                        >
                            {property.purpose === "sale" ? "للبيع" : "للإيجار"}
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
                                        "الموقع غير محدد"}
                                </Text>
                            </Space>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space size="large">
                                <Space>
                                    <HomeOutlined />
                                    {property.bedrooms || "غير محدد"} غرفة
                                </Space>
                                <Space>
                                    <FaBath />
                                    {property.bathrooms || "غير محدد"}حمام
                                </Space>
                                <Space>
                                    <ArrowsAltOutlined />
                                    {property.area
                                        ? `${property.area} m²`
                                        : "غير محدد"}
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
                    عرض الكل
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
                <Empty description={`لا توجد ${title} متاحة حالياً`} />
            )}
        </section>
    );

    return (
        <div className="home-page">
            {/* BG IMG */}
            <img
                src={`${window.location.origin}/Images/landBg.jpg`}
                width={"100%"}
                // height={100}
                style={{
                    top: 0,
                    right: 0,
                    position: "absolute",
                    zIndex: 0,
                    height: 500,
                }}
            />
            <div
                // height={100}
                style={{
                    top: 0,
                    right: 0,
                    position: "absolute",
                    zIndex: 0,
                    height: 500,
                    width: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black
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
                                    background: "rgba(255, 255, 255, 0.9)",
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
                                                بيع
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
                                                إيجار
                                            </Radio.Button>
                                        </Radio.Group>
                                    </Col>

                                    {/* Area and Property Type */}
                                    <Col xs={24} sm={12} md={6}>
                                        <Select
                                            placeholder="المنطقة"
                                            style={{ width: "100%" }}
                                            size="large"
                                            value={filter.location}
                                            onChange={(value) =>
                                                handleFilterChange(
                                                    "location",
                                                    value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: "all",
                                                    label: "جميع المناطق",
                                                },
                                                // Add other area options here
                                            ]}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Select
                                            placeholder="نوع العقار"
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
                                            placeholder="أقل سعر"
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
                                            style={{ width: "100%" }}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Input
                                            type="number"
                                            placeholder="أعلى سعر"
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
                                            style={{ width: "100%" }}
                                        />
                                    </Col>
                                    <Col
                                        xs={24}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Button type="default" size="small">
                                            خيارات متقدمة
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={handleSearch}
                                            loading={loading}
                                            size="small"
                                            icon={<SearchOutlined />}
                                        >
                                            بحث
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
                                "عقارات مميزة ",
                                <StarFilled />
                            )}
                        </>
                    ) : (
                        <Empty description="لا توجد عقارات مميزة متاحة" />
                    )}
                </section>
                <Card
                    title="الفئات العقارية"
                    style={{ textAlign: "right", direction: "rtl" }}
                >
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
                                    <p>عقار {item.count}+</p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
                {renderPropertySection(
                    props.sectionedProperties.forSale,
                    "احدث العقارات",
                    <ShopOutlined />
                )}
            </div>
            <section className="section container mx-auto px-4 py-6">
                <Row
                    className="flex flex-row justify-between"
                    style={{ marginBottom: 20 }}
                >
                    <Title level={3} style={{ marginBottom: 0 }}>
                        باقات الاشتراك
                    </Title>
                    <Link
                        style={{
                            color: "#2563EB",
                            fontSize: 16,
                            fontWeight: 700,
                        }}
                        href={"#"}
                    >
                        عرض الكل
                    </Link>
                </Row>
                <Row className="flex flex-row justify-around ">
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
