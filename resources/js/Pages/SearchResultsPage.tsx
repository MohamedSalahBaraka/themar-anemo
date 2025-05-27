// src/pages/SearchResultsPage.tsx
import React from "react";
import {
    Row,
    Col,
    Card,
    Typography,
    Select,
    Input,
    Button,
    Slider,
    Divider,
    Spin,
    Pagination,
    Radio,
    Space,
    Tag,
    Empty,
} from "antd";
import {
    AppstoreOutlined,
    UnorderedListOutlined,
    FilterOutlined,
    EnvironmentOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import { Property, PropertyFilter } from "@/types/property";
import { usePage, router } from "@inertiajs/react";
import PropertyCard from "@/Components/PropertyCard";
import { PageProps } from "@/types";

// Define TypeScript interfaces for the page props
interface SearchResultsPageProps extends PageProps {
    properties: Property[];
    filters: PropertyFilter;
    meta: {
        total: number;
    };
}

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

const SearchResultsPage: React.FC = () => {
    // Get page props from Inertia
    const { props } = usePage<SearchResultsPageProps>();
    const { properties, filters: initialFilters, meta } = props;
    const totalProperties = meta.total;

    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = React.useState<boolean>(false);
    const [filters, setFilters] =
        React.useState<PropertyFilter>(initialFilters);

    const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
        const newFilters = { ...filters, [key]: value, page: 1 }; // Reset to first page when filters change
        setFilters(newFilters);
        updateURL(newFilters);
    };

    const handlePriceRangeChange = (value: number[]) => {
        handleFilterChange("minPrice", value[0]);
        handleFilterChange("maxPrice", value[1]);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        const newFilters = { ...filters, page, per_page: pageSize };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    const updateURL = (newFilters: PropertyFilter) => {
        router.get(
            route("properties.search"),
            { ...newFilters },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        const clearedFilters: PropertyFilter = {
            page: 1,
            per_page: 12,
            status: "available",
        };
        setFilters(clearedFilters);
        updateURL(clearedFilters);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="search-results-page" style={{ padding: "24px" }}>
            <Title level={2}>Property Search Results</Title>
            <Text type="secondary">{totalProperties} properties found</Text>

            <Divider />

            <Row gutter={[24, 24]}>
                {/* Filters Column - shown always on large screens, toggleable on smaller screens */}
                <Col xs={24} sm={24} md={showFilters ? 24 : 0} lg={6}>
                    <Card
                        title={
                            <Space>
                                <FilterOutlined />
                                <Text strong>Filters</Text>
                            </Space>
                        }
                        extra={
                            <Button type="link" onClick={clearFilters}>
                                Clear All
                            </Button>
                        }
                        style={{ marginBottom: "24px" }}
                    >
                        {/* Property Type Filter */}
                        <div style={{ marginBottom: "16px" }}>
                            <Text strong>Property Type</Text>
                            <Select
                                style={{ width: "100%", marginTop: "8px" }}
                                placeholder="All Types"
                                value={filters.type}
                                onChange={(value) =>
                                    handleFilterChange("type", value)
                                }
                                allowClear
                            >
                                <Option value="apartment">Apartment</Option>
                                <Option value="villa">Villa</Option>
                                <Option value="office">Office</Option>
                                <Option value="land">Land</Option>
                            </Select>
                        </div>

                        {/* Purpose Filter */}
                        <div style={{ marginBottom: "16px" }}>
                            <Text strong>Purpose</Text>
                            <Select
                                style={{ width: "100%", marginTop: "8px" }}
                                placeholder="All Purposes"
                                value={filters.purpose}
                                onChange={(value) =>
                                    handleFilterChange("purpose", value)
                                }
                                allowClear
                            >
                                <Option value="sale">For Sale</Option>
                                <Option value="rent">For Rent</Option>
                            </Select>
                        </div>

                        {/* Price Range Filter */}
                        <div style={{ marginBottom: "16px" }}>
                            <Text strong>Price Range</Text>
                            <Slider
                                range
                                min={0}
                                max={10000000}
                                step={50000}
                                defaultValue={[
                                    filters.minPrice || 0,
                                    filters.maxPrice || 10000000,
                                ]}
                                onChange={handlePriceRangeChange}
                                onAfterChange={handlePriceRangeChange}
                                tipFormatter={(value) =>
                                    formatPrice(value || 0)
                                }
                                style={{ marginTop: "16px" }}
                            />
                            <Space
                                style={{
                                    width: "100%",
                                    justifyContent: "space-between",
                                    marginTop: "8px",
                                }}
                            >
                                <Text>
                                    {formatPrice(filters.minPrice || 0)}
                                </Text>
                                <Text>
                                    {formatPrice(filters.maxPrice || 10000000)}
                                </Text>
                            </Space>
                        </div>

                        {/* Bedrooms Filter */}
                        <div style={{ marginBottom: "16px" }}>
                            <Text strong>Bedrooms</Text>
                            <Select
                                style={{ width: "100%", marginTop: "8px" }}
                                placeholder="Any"
                                value={filters.bedrooms}
                                onChange={(value) =>
                                    handleFilterChange("bedrooms", value)
                                }
                                allowClear
                            >
                                <Option value="1">1+</Option>
                                <Option value="2">2+</Option>
                                <Option value="3">3+</Option>
                                <Option value="4">4+</Option>
                                <Option value="5">5+</Option>
                            </Select>
                        </div>

                        {/* Location Search */}
                        <div style={{ marginBottom: "16px" }}>
                            <Text strong>Location</Text>
                            <Search
                                placeholder="Search by address"
                                allowClear
                                value={filters.location}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "location",
                                        e.target.value
                                    )
                                }
                                style={{ marginTop: "8px" }}
                            />
                        </div>

                        {/* Status Filter */}
                        <div style={{ marginBottom: "16px" }}>
                            <Text strong>Status</Text>
                            <Select
                                style={{ width: "100%", marginTop: "8px" }}
                                value={filters.status}
                                onChange={(value) =>
                                    handleFilterChange("status", value)
                                }
                            >
                                <Option value="available">Available</Option>
                                <Option value="sold">Sold</Option>
                                <Option value="rented">Rented</Option>
                                <Option value="reserved">Reserved</Option>
                            </Select>
                        </div>
                    </Card>
                </Col>

                {/* Results Column */}
                <Col xs={24} sm={24} md={showFilters ? 24 : 24} lg={18}>
                    <Card>
                        <Row
                            justify="space-between"
                            align="middle"
                            style={{ marginBottom: "16px" }}
                        >
                            <Col>
                                <Button
                                    icon={<FilterOutlined />}
                                    onClick={() => setShowFilters(!showFilters)}
                                    style={{
                                        display: ["lg", "xl"].includes("lg")
                                            ? "none"
                                            : "inline-flex",
                                    }} // Hide on large screens
                                >
                                    {showFilters
                                        ? "Hide Filters"
                                        : "Show Filters"}
                                </Button>
                            </Col>
                            <Col>
                                <Radio.Group
                                    value={viewMode}
                                    onChange={(e) =>
                                        setViewMode(e.target.value)
                                    }
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="grid">
                                        <AppstoreOutlined />
                                    </Radio.Button>
                                    <Radio.Button value="list">
                                        <UnorderedListOutlined />
                                    </Radio.Button>
                                </Radio.Group>
                            </Col>
                        </Row>

                        {properties.length === 0 ? (
                            <Empty
                                description={
                                    <Text type="secondary">
                                        No properties found matching your
                                        criteria
                                    </Text>
                                }
                                style={{ padding: "40px" }}
                            />
                        ) : viewMode === "grid" ? (
                            <Row gutter={[16, 16]}>
                                {properties.map((property) => (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        md={12}
                                        lg={8}
                                        xl={6}
                                        key={property.id}
                                    >
                                        <PropertyCard property={property} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="list-view">
                                {properties.map((property) => (
                                    <Card
                                        key={property.id}
                                        style={{ marginBottom: "16px" }}
                                        hoverable
                                    >
                                        <Row gutter={16} align="middle">
                                            <Col xs={24} sm={8} md={6}>
                                                <img
                                                    alt={property.title}
                                                    src={
                                                        property.imageUrl ||
                                                        "https://via.placeholder.com/300x200"
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                            </Col>
                                            <Col xs={24} sm={16} md={18}>
                                                <Title
                                                    level={5}
                                                    style={{
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    {property.title}
                                                    <Tag
                                                        color={
                                                            property.status ===
                                                            "available"
                                                                ? "green"
                                                                : "red"
                                                        }
                                                        style={{
                                                            marginLeft: "8px",
                                                        }}
                                                    >
                                                        {property.status}
                                                    </Tag>
                                                    {property.is_featured && (
                                                        <Tag color="gold">
                                                            Featured
                                                        </Tag>
                                                    )}
                                                </Title>
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        display: "block",
                                                        marginBottom: "8px",
                                                    }}
                                                >
                                                    <EnvironmentOutlined />{" "}
                                                    {property.address ||
                                                        "Address not specified"}
                                                </Text>
                                                <Space
                                                    size="large"
                                                    style={{
                                                        marginBottom: "8px",
                                                    }}
                                                >
                                                    <Text>
                                                        <HomeOutlined />{" "}
                                                        {property.bedrooms ||
                                                            "N/A"}{" "}
                                                        beds
                                                    </Text>
                                                    <Text>
                                                        {property.bathrooms ||
                                                            "N/A"}{" "}
                                                        baths
                                                    </Text>
                                                    <Text>
                                                        {property.area
                                                            ? `${property.area} sq.ft.`
                                                            : "Area not specified"}
                                                    </Text>
                                                </Space>
                                                <Divider
                                                    style={{ margin: "12px 0" }}
                                                />
                                                <Row
                                                    justify="space-between"
                                                    align="middle"
                                                >
                                                    <Col>
                                                        <Text strong>
                                                            {formatPrice(
                                                                property.price
                                                            )}
                                                        </Text>
                                                    </Col>
                                                    <Col>
                                                        <Button type="primary">
                                                            View Details
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {properties.length > 0 && (
                            <Row justify="center" style={{ marginTop: "24px" }}>
                                <Pagination
                                    current={filters.page || 1}
                                    total={totalProperties}
                                    pageSize={filters.per_page || 12}
                                    onChange={handlePageChange}
                                    showSizeChanger
                                    pageSizeOptions={["12", "24", "48", "96"]}
                                />
                            </Row>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SearchResultsPage;
