import React from "react";
import { usePage, router } from "@inertiajs/react";
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

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Meta } = Card;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

interface HomePageProps extends PageProps {
    featuredProperties: Property[];
    filters: PropertyFilter;
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
const Page: React.FC = () => {
    const { props } = usePage<HomePageProps>();
    const screens = useBreakpoint();
    const [filter, setFilter] = React.useState<PropertyFilter>(
        props.filters || {}
    );
    const [loading, setLoading] = React.useState(false);
    const [favorites, setFavorites] = React.useState<Set<number>>(new Set());

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
                        <button
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
                        </button>
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
                        <Space>
                            {property.title}
                            {getStatusTag(property.status)}
                        </Space>
                    }
                    description={
                        <>
                            <Text
                                ellipsis={{ tooltip: property.description }}
                                style={{ display: "block", marginBottom: 8 }}
                            >
                                {property.description}
                            </Text>
                            <Divider style={{ margin: "8px 0" }} />
                            <Space size="large">
                                <Space>
                                    <HomeOutlined />{" "}
                                    {property.bedrooms || "غير محدد"}
                                </Space>
                                <Space>
                                    <FaBath />{" "}
                                    {property.bathrooms || "غير محدد"}
                                </Space>
                                <Space>
                                    <ArrowsAltOutlined />{" "}
                                    {property.area
                                        ? `${property.area} قدم²`
                                        : "غير محدد"}
                                </Space>
                            </Space>
                        </>
                    }
                />
                <div className="property-footer">
                    <Space>
                        <EnvironmentOutlined />
                        <Text type="secondary">
                            {property.address?.split(",")[0] ||
                                "الموقع غير محدد"}
                        </Text>
                    </Space>
                    <Text strong>{formatPrice(property.price)}</Text>
                </div>
            </Card>
        </Badge.Ribbon>
    );

    const renderPropertySection = (
        properties: Property[],
        title: string,
        icon: React.ReactNode
    ) => (
        <section className="section">
            <Divider orientation="left">
                <Title level={3} style={{ marginBottom: 0 }}>
                    {icon} {title}
                </Title>
            </Divider>
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
            {/* Hero Search Section */}
            <div className="hero-section">
                <div className="hero-overlay">
                    <Row
                        justify="center"
                        align="middle"
                        style={{ height: "100%" }}
                    >
                        <Col span={24} style={{ textAlign: "center" }}>
                            <Title
                                level={1}
                                style={{ color: "#fff", marginBottom: 24 }}
                            >
                                ابحث عن عقارك المثالي
                            </Title>
                            <div className="search-container">
                                <Row gutter={[16, 16]} justify="center">
                                    <Col xs={24} sm={24} md={6}>
                                        <Search
                                            placeholder="العنوان، الحي أو الرمز البريدي"
                                            allowClear
                                            size="large"
                                            value={filter.location}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "location",
                                                    e.target.value
                                                )
                                            }
                                            onPressEnter={handleSearch}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={4}>
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
                                    <Col xs={24} sm={12} md={4}>
                                        <Select
                                            placeholder="الغرض"
                                            style={{ width: "100%" }}
                                            size="large"
                                            value={filter.purpose}
                                            onChange={(value) =>
                                                handleFilterChange(
                                                    "purpose",
                                                    value
                                                )
                                            }
                                        >
                                            <Option value="sale">للبيع</Option>
                                            <Option value="rent">
                                                للإيجار
                                            </Option>
                                        </Select>
                                    </Col>
                                    <Col xs={24} sm={12} md={3}>
                                        <Input
                                            type="number"
                                            placeholder="أقل سعر"
                                            prefix={<DollarOutlined />}
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
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={3}>
                                        <Input
                                            type="number"
                                            placeholder="أعلى سعر"
                                            prefix={<DollarOutlined />}
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
                                        />
                                    </Col>
                                    <Col xs={24} sm={24} md={4}>
                                        <Button
                                            type="primary"
                                            onClick={handleSearch}
                                            loading={loading}
                                            size="large"
                                            style={{ width: "100%" }}
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
                className="container"
                style={{ padding: screens.xs ? "16px" : "24px" }}
            >
                {/* Featured Properties Carousel */}
                <section className="section">
                    <Divider orientation="left">
                        <Title level={3} style={{ marginBottom: 0 }}>
                            <StarFilled style={{ color: "#faad14" }} /> عقارات
                            مميزة
                        </Title>
                    </Divider>
                    {props.featuredProperties?.length > 0 ? (
                        <Spin spinning={loading}>
                            <Carousel
                                autoplay
                                dots={{ className: "carousel-dots" }}
                                effect="fade"
                                className="featured-carousel"
                            >
                                {props.featuredProperties.map((property) => (
                                    <div key={property.id}>
                                        {renderPropertyCard(property)}
                                    </div>
                                ))}
                            </Carousel>
                        </Spin>
                    ) : (
                        <Empty description="لا توجد عقارات مميزة متاحة" />
                    )}
                </section>

                {/* Property Sections */}
                <Tabs defaultActiveKey="1" className="property-tabs">
                    <TabPane
                        tab={
                            <span>
                                <HomeFilled /> عقارات للبيع
                            </span>
                        }
                        key="1"
                    >
                        {renderPropertySection(
                            props.sectionedProperties.forSale,
                            "عقارات معروضة للبيع",
                            <ShopOutlined />
                        )}
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <HomeOutlined /> عقارات للإيجار
                            </span>
                        }
                        key="2"
                    >
                        {renderPropertySection(
                            props.sectionedProperties.forRent,
                            "عقارات معروضة للإيجار",
                            <HomeOutlined />
                        )}
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <CrownFilled /> الأنواع الأكثر طلباً
                            </span>
                        }
                        key="3"
                    >
                        {renderPropertySection(
                            props.sectionedProperties.popularTypes,
                            "العقارات الأكثر طلباً",
                            <CrownFilled />
                        )}
                    </TabPane>
                </Tabs>

                {/* Recently Viewed Section */}
                {props.recentlyViewed && props.recentlyViewed?.length > 0 && (
                    <section className="section">
                        <Divider orientation="left">
                            <Title level={3} style={{ marginBottom: 0 }}>
                                معروضات شاهدتها مؤخراً
                            </Title>
                        </Divider>
                        <Row gutter={[24, 24]}>
                            {props.recentlyViewed.map((property) => (
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
                    </section>
                )}

                {/* CTA Section */}
                <section className="cta-section">
                    <Row justify="center" align="middle">
                        <Col xs={24} md={18} style={{ textAlign: "center" }}>
                            <Title level={3}>
                                مستعد للعثور على منزل أحلامك؟
                            </Title>
                            <Text
                                type="secondary"
                                style={{ display: "block", marginBottom: 24 }}
                            >
                                انضم إلى الآلاف من الملاك السعداء الذين وجدوا
                                عقارهم المثالي من خلالنا
                            </Text>
                            <Space size="large">
                                <Button
                                    type="primary"
                                    size="large"
                                    href={route("register")}
                                >
                                    سجل الآن
                                </Button>
                                <Button
                                    type="default"
                                    size="large"
                                    // href={route("properties.index")}
                                >
                                    تصفح جميع العقارات
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
