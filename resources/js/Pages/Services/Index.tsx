import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Link, router } from "@inertiajs/react";
import {
    Card,
    Row,
    Col,
    Input,
    Select,
    Tag,
    Pagination,
    Empty,
    Spin,
    Button,
    Typography,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import {
    Service,
    ServiceCategory,
    ServicesFilterParams,
} from "@/types/Services";
import { PageProps } from "@/types";
import FrontLayout from "@/Layouts/FrontLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const { Search } = Input;
const { Option } = Select;
const { Meta } = Card;
const { Title, Text, Paragraph } = Typography;

interface Prop extends PageProps {
    services: {
        data: Service[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    categories: ServiceCategory[];
    allTags: string[];
    filters: ServicesFilterParams;
}
const ServicesIndex: React.FC = () => (
    <FrontLayout>
        <Page />
    </FrontLayout>
);
const Page: React.FC = () => {
    const { services, categories, allTags, filters, auth } =
        usePage<Prop>().props;
    const appConfigs = usePage().props.appConfigs as Record<string, any>;
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const [selectedCategory, setSelectedCategory] = useState<
        number | undefined
    >(filters.category);
    const [selectedTags, setSelectedTags] = useState<string[]>(
        filters.tags || []
    );

    const { t } = useLanguage();
    const handleSearch = (value: string) => {
        setLoading(true);
        router.get(
            route("public.services.index"),
            { search: value },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleCategoryChange = (value: number) => {
        setLoading(true);
        setSelectedCategory(value);
        router.get(
            route("public.services.index"),
            { category: value },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleTagChange = (tags: string[]) => {
        setLoading(true);
        setSelectedTags(tags);
        router.get(
            route("public.services.index"),
            { tags },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const clearFilters = () => {
        setLoading(true);
        setSearchValue("");
        setSelectedCategory(undefined);
        setSelectedTags([]);
        router.get(
            route("public.services.index"),
            {},
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handlePageChange = (page: number) => {
        setLoading(true);
        router.get(
            route("public.services.index"),
            { page },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div
                style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    marginBottom: 30,
                    background: "linear-gradient(135deg, #7091D2, #5275B9)",
                }}
            >
                <Title
                    level={2}
                    style={{ marginBottom: "16px", color: "white" }}
                >
                    {appConfigs["service.catchy_phrase_primary"]}
                </Title>
                <Text
                    style={{
                        display: "block",
                        marginBottom: "40px",
                        fontSize: "16px",
                        color: "white",
                    }}
                >
                    {appConfigs["service.catchy_phrase_secondary"]}
                </Text>
            </div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">{t("our_services")}</h1>

                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder={t("search_services_placeholder")}
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onSearch={handleSearch}
                            />
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder={t("filter_by_category")}
                                style={{ width: "100%" }}
                                size="large"
                                allowClear
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                {categories.map((category) => (
                                    <Option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Select
                                mode="multiple"
                                placeholder={t("filter_by_tags")}
                                style={{ width: "100%" }}
                                size="large"
                                allowClear
                                value={selectedTags}
                                onChange={handleTagChange}
                            >
                                {allTags.map((tag) => (
                                    <Option key={tag} value={tag}>
                                        {tag}
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        {(filters.search ||
                            filters.category ||
                            filters.tags) && (
                            <Col span={24}>
                                <Button
                                    type="link"
                                    onClick={clearFilters}
                                    icon={<FilterOutlined />}
                                >
                                    {t("clear_all_filters")}
                                </Button>
                            </Col>
                        )}
                    </Row>
                </div>
            </div>

            <Spin spinning={loading}>
                {services.data.length > 0 ? (
                    <>
                        <Row gutter={[24, 24]}>
                            {services.data.map((service) => (
                                <Col
                                    key={service.id}
                                    xs={24}
                                    sm={12}
                                    md={8}
                                    lg={6}
                                >
                                    <Link
                                        href={route(
                                            "public.services.show",
                                            service.id
                                        )}
                                    >
                                        <Card
                                            hoverable
                                            cover={
                                                <div
                                                    style={{
                                                        height: "200px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img
                                                        alt={service.name}
                                                        src={`${window.location.origin}/storage/${service.photo}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </div>
                                            }
                                        >
                                            <Meta
                                                title={service.name}
                                                description={
                                                    <>
                                                        <div className="font-bold text-lg">
                                                            {service.price}
                                                        </div>
                                                        <div className="mt-2">
                                                            {service.tags?.map(
                                                                (tag) => (
                                                                    <Tag
                                                                        key={
                                                                            tag
                                                                        }
                                                                    >
                                                                        {tag}
                                                                    </Tag>
                                                                )
                                                            )}
                                                        </div>
                                                    </>
                                                }
                                            />
                                        </Card>
                                    </Link>
                                </Col>
                            ))}
                        </Row>

                        <div className="mt-8 flex justify-center">
                            <Pagination
                                current={services.current_page}
                                total={services.total}
                                pageSize={services.per_page}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    </>
                ) : (
                    <Empty
                        description={t("no_services_available")}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={clearFilters}>
                            {t("clear_filters")}
                        </Button>
                    </Empty>
                )}
            </Spin>
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
        </div>
    );
};

export default ServicesIndex;
