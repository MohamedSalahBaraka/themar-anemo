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
} from "@ant-design/icons";
import { PageProps } from "@/types";
import { Property, PropertyFilter } from "@/types/property";
import { FaBath } from "react-icons/fa";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Meta } = Card;
const { useBreakpoint } = Grid;

interface HomePageProps extends PageProps {
    featuredProperties: Property[];
    filters: PropertyFilter;
    recentlyViewed?: Property[];
}

const HomePage: React.FC = () => {
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
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
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
            available: { color: "green", text: "Available" },
            sold: { color: "red", text: "Sold" },
            rented: { color: "blue", text: "Rented" },
            reserved: { color: "orange", text: "Reserved" },
        };
        const key = status as StatusKey;
        return <Tag color={statusMap[key]?.color}>{statusMap[key]?.text}</Tag>;
    };

    const propertyTypes = [
        { value: "apartment", label: "Apartment" },
        { value: "villa", label: "Villa" },
        { value: "office", label: "Office" },
        { value: "land", label: "Land" },
        { value: "house", label: "House" },
        { value: "condo", label: "Condo" },
    ];

    const renderPropertyCard = (property: Property) => (
        <Badge.Ribbon
            text="Featured"
            color="gold"
            placement="start"
            style={{ display: property.is_featured ? "block" : "none" }}
        >
            <Card
                hoverable
                cover={
                    <div className="property-image-container">
                        <img
                            alt={property.title}
                            src={
                                property.image_url
                                    ? `${window.location.origin}/storage/${property.image_url}`
                                    : "/placeholder-property.jpg"
                            }
                            className="property-image"
                        />
                        <Button
                            type="text"
                            icon={
                                favorites.has(property.id) ? (
                                    <HeartFilled style={{ color: "#ff4d4f" }} />
                                ) : (
                                    <HeartOutlined />
                                )
                            }
                            className="favorite-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(property.id);
                            }}
                        />
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
                                    {property.bedrooms || "N/A"}
                                </Space>
                                <Space>
                                    <FaBath /> {property.bathrooms || "N/A"}
                                </Space>
                                <Space>
                                    <ArrowsAltOutlined />{" "}
                                    {property.area
                                        ? `${property.area} sqft`
                                        : "N/A"}
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
                                "Location not specified"}
                        </Text>
                    </Space>
                    <Text strong>{formatPrice(property.price)}</Text>
                </div>
            </Card>
        </Badge.Ribbon>
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
                                Find Your Dream Property
                            </Title>
                            <div className="search-container">
                                <Row gutter={[16, 16]} justify="center">
                                    <Col xs={24} sm={24} md={6}>
                                        <Search
                                            placeholder="Address, Neighborhood, or ZIP"
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
                                            placeholder="Property Type"
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
                                            placeholder="Purpose"
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
                                            <Option value="sale">
                                                For Sale
                                            </Option>
                                            <Option value="rent">
                                                For Rent
                                            </Option>
                                        </Select>
                                    </Col>
                                    <Col xs={24} sm={12} md={3}>
                                        <Input
                                            type="number"
                                            placeholder="Min Price"
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
                                            placeholder="Max Price"
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
                                            Search Properties
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
                            <StarFilled style={{ color: "#faad14" }} /> Featured
                            Properties
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
                        <Empty description="No featured properties available" />
                    )}
                </section>

                {/* Recently Viewed Section */}
                {props.recentlyViewed && props.recentlyViewed?.length > 0 && (
                    <section className="section">
                        <Divider orientation="left">
                            <Title level={3} style={{ marginBottom: 0 }}>
                                Recently Viewed
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

                {/* Property Categories */}
                {/* <section className="section">
                    <Divider orientation="left">
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Apartments for Rent
                        </Title>
                    </Divider>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                cover={
                                    <img
                                        alt="example"
                                        src="https://via.placeholder.com/300x200"
                                    />
                                }
                            >
                                <Meta
                                    title="Modern Downtown Apartment"
                                    description={
                                        <>
                                            <Text>
                                                2 beds • 1 bath • 850 sqft
                                            </Text>
                                            <Divider
                                                style={{ margin: "8px 0" }}
                                            />
                                            <Text strong>$1,200/month</Text>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    </Row>
                    <div style={{ textAlign: "center", marginTop: 24 }}>
                        <Button type="link" size="large">
                            View All Apartments for Rent
                        </Button>
                    </div>
                </section> */}

                {/* CTA Section */}
                <section className="cta-section">
                    <Row justify="center" align="middle">
                        <Col xs={24} md={18} style={{ textAlign: "center" }}>
                            <Title level={3}>
                                Ready to Find Your Perfect Home?
                            </Title>
                            <Text
                                type="secondary"
                                style={{ display: "block", marginBottom: 24 }}
                            >
                                Join thousands of happy homeowners who found
                                their dream property through us
                            </Text>
                            <Space size="large">
                                <Button
                                    type="primary"
                                    size="large"
                                    href={route("register")}
                                >
                                    Register Now
                                </Button>
                                {/* <Button size="large" href={route("contact")}>
                                    Contact Agent
                                </Button> */}
                            </Space>
                        </Col>
                    </Row>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
