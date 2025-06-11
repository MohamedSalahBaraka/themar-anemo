import { useState, useEffect, ReactNode } from "react";
import {
    Layout,
    Menu,
    Button,
    ConfigProvider,
    theme,
    Dropdown,
    Space,
    Avatar,
    Badge,
    Divider,
    Drawer,
    App,
    Input,
} from "antd";
import {
    MenuOutlined,
    UserOutlined,
    MoonOutlined,
    SunOutlined,
    TranslationOutlined,
    BellOutlined,
    SearchOutlined,
    HomeOutlined,
    HeartOutlined,
    ShoppingCartOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    ShopOutlined,
    GlobalOutlined,
    BulbOutlined,
    BulbFilled,
    MoonFilled,
    SunFilled,
    LogoutOutlined,
    DashboardOutlined,
} from "@ant-design/icons";
import { Link, usePage } from "@inertiajs/react";
// @ts-ignore
import { Scrollbars } from "@pezhmanparsaee/react-custom-scrollbars";
import { ThemeProvider } from "styled-components";
import { theme as themeVariables } from "../config/theme/themeVariables";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { Service } from "@/types/Services";

const { Header, Content, Footer } = Layout;

interface FrontLayoutProps {
    children: ReactNode;
}

const FrontLayout = ({ children }: FrontLayoutProps) => (
    <LanguageProvider>
        <MainLayout>{children}</MainLayout>
    </LanguageProvider>
);

const MainLayout = ({ children }: FrontLayoutProps) => {
    const {
        t,
        language,
        direction,
        antdLocale,
        setLanguage,
        darkMode,
        setDarkMode,
    } = useLanguage();
    const user = usePage().props.auth.user;
    const appConfigs = usePage().props.appConfigs as Record<string, any>;
    const services = usePage().props.footerServices as Service[];

    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [currentTheme, setCurrentTheme] = useState({
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: darkMode
                ? themeVariables.darkMode.primary
                : themeVariables.lightMode.primary,
            borderRadius: 6,
        },
    });

    useEffect(() => {
        setCurrentTheme({
            algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
                colorPrimary: darkMode
                    ? themeVariables.darkMode.primary
                    : themeVariables.lightMode.primary,
                borderRadius: 6,
            },
        });
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleMobileMenu = () => setMobileMenuVisible(!mobileMenuVisible);

    const renderThumb = ({ style }: { style: React.CSSProperties }) => (
        <div
            style={{
                ...style,
                borderRadius: 6,
                backgroundColor: darkMode ? "#424242" : "#F1F2F6",
            }}
        />
    );
    const { url } = usePage();
    const currentPath = new URL(url, window.location.origin).pathname;
    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link href="/profile">{t("profile")}</Link>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />}>
                <Link href="/logout" method="post">
                    {t("logout")}
                </Link>
            </Menu.Item>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                <Link href="/user/dashboard">{t("dashboard")}</Link>
            </Menu.Item>
        </Menu>
    );
    const pathKeyMap: Record<string, string> = {
        "/": "home",
        "/properties/search": "properties",
        "/pricing": "pricing",
        "/about-us": "about-us",
    };

    const selectedKey = pathKeyMap[currentPath] || "home";
    return (
        <ConfigProvider
            theme={currentTheme}
            direction={direction}
            locale={antdLocale}
        >
            <ThemeProvider
                theme={
                    darkMode
                        ? themeVariables.darkMode
                        : themeVariables.lightMode
                }
            >
                <Layout className="min-h-screen font-cairo">
                    {/* Header */}
                    <Header
                        className={`sticky top-0 z-50 w-full px-6 ${
                            darkMode ? "bg-gray-900" : "bg-[#F7FAFC]"
                        } shadow-sm`}
                        style={{
                            paddingTop: 12,
                            paddingBottom: 0,
                            borderBottom: "none",
                            height: 150,
                        }}
                    >
                        {/* Top Row */}
                        <div className="flex items-center justify-between h-12">
                            {/* Logo */}
                            <Link href="/" className="flex items-center">
                                <img
                                    className="h-10"
                                    src={
                                        darkMode
                                            ? appConfigs["app.logo_dark_url"]
                                            : appConfigs["app.logo_url"]
                                    }
                                    style={{ margin: 5 }}
                                    alt="Logo"
                                />
                                {appConfigs["app.name"]}
                            </Link>

                            {/* Actions: Login/Register */}
                            <div className="flex items-center gap-3">
                                {user ? (
                                    <Dropdown
                                        overlay={userMenu}
                                        placement="bottomRight"
                                    >
                                        <div className="flex items-center gap-2 cursor-pointer px-4">
                                            <Avatar
                                                size="default"
                                                className="bg-primary"
                                                icon={<UserOutlined />}
                                            />
                                            <span className="text-dark dark:text-white60 hidden md:inline-block">
                                                المستخدم
                                            </span>
                                        </div>
                                    </Dropdown>
                                ) : (
                                    // <Dropdown
                                    //     menu={{
                                    //         items: [
                                    //             {
                                    //                 key: "profile",
                                    //                 label: t("profile"),
                                    //             },
                                    //             {
                                    //                 key: "logout",
                                    //                 label: t("logout"),
                                    //             },
                                    //         ],
                                    //     }}
                                    //     placement="bottomRight"
                                    // >
                                    //     <Avatar
                                    //         icon={<UserOutlined />}
                                    //         className="cursor-pointer"
                                    //     />
                                    // </Dropdown>
                                    <Space>
                                        <Button
                                            type="default"
                                            href="/login"
                                            className="text-sm font-medium"
                                        >
                                            {t("login")}
                                        </Button>
                                        <Button
                                            type="primary"
                                            href="/register"
                                            className="text-sm font-medium"
                                        >
                                            {t("register")}
                                        </Button>
                                    </Space>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <hr
                            className={`my-2 ${
                                darkMode ? "border-gray-700" : "border-gray-300"
                            }`}
                        />

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between h-12">
                            {/* Navigation Menu */}
                            <Menu
                                mode="horizontal"
                                theme={darkMode ? "dark" : "light"}
                                items={[
                                    {
                                        key: "home",
                                        label: <a href="/">{t("home")}</a>,
                                    },
                                    {
                                        key: "properties",
                                        label: (
                                            <a href="/properties/search">
                                                {t("properties")}
                                            </a>
                                        ),
                                    },
                                    {
                                        key: "pricing",
                                        label: (
                                            <a href="/pricing">
                                                {t("pricing")}
                                            </a>
                                        ),
                                    },
                                    {
                                        key: "services",
                                        label: (
                                            <a href="/services">
                                                {t("services")}
                                            </a>
                                        ),
                                    },
                                    {
                                        key: "about-us",
                                        label: (
                                            <a href="/about-us">
                                                {t("about_us")}
                                            </a>
                                        ),
                                    },
                                ]}
                                className="border-0 bg-transparent font-medium flex-1"
                                selectedKeys={[selectedKey]}
                            />

                            {/* Add Property Link */}
                            <div>
                                <Button
                                    type="text"
                                    onClick={() => {
                                        setLanguage(
                                            language === "ar" ? "en" : "ar"
                                        );
                                    }}
                                >
                                    {t("switch_to_arabic")}
                                </Button>
                                <Button
                                    type="text"
                                    onClick={() => setDarkMode(!darkMode)}
                                >
                                    {darkMode ? <SunFilled /> : <MoonFilled />}
                                </Button>
                            </div>
                        </div>
                    </Header>

                    {/* Content */}
                    <Content className="flex-1">{children}</Content>

                    {/* Footer */}
                    <Footer
                        className={`py-8`}
                        style={{ backgroundColor: "#1F2937" }}
                    >
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                {/* About Section */}
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-4">
                                        {t("about")} {appConfigs["app.name"]}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {appConfigs["about.short"]}
                                    </p>
                                </div>

                                {/* Quick Links Section */}
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-4">
                                        {t("quick_links")}
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <a
                                                href={route("Page", "help")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                {t("help")}
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={route("Page", "privacy")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                {t("privacy_policy")}
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={route("Page", "terms")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                {t("terms_of_service")}
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={route("Faq")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                {t("faqs")}
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                {/* Services Section */}
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-4">
                                        {t("services")}
                                    </h3>
                                    <ul className="space-y-2">
                                        {services.map((service) => (
                                            <li key={service.id}>
                                                <a
                                                    href={route(
                                                        "public.services.show",
                                                        service.id
                                                    )}
                                                    className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                                >
                                                    {service.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Contact Section */}
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-4">
                                        {t("contact_us")}
                                    </h3>
                                    <div className="text-gray-500 dark:text-gray-400 space-y-2">
                                        <p>
                                            {appConfigs["contact_info.address"]}
                                        </p>
                                        <p>
                                            {appConfigs["contact_info.phone"]}
                                        </p>
                                        <p>
                                            {appConfigs["contact_info.email"]}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <img
                                        width={200}
                                        src={`${window.location.origin}/Images/footerLogo.png`}
                                    />
                                </div>
                            </div>

                            <Divider className="my-6" />

                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
                                    © {new Date().getFullYear()}{" "}
                                    {appConfigs["app.name"]}.{" "}
                                    {t("all_rights_reserved")}
                                </span>
                                <div className="flex gap-4">
                                    <Button
                                        href={route("Page", "privacy")}
                                        type="text"
                                        className="text-white"
                                    >
                                        {t("privacy_policy")}
                                    </Button>
                                    <Button
                                        href={route("Page", "terms")}
                                        type="text"
                                        className="text-white"
                                    >
                                        {t("terms_of_service")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Footer>
                </Layout>
            </ThemeProvider>
        </ConfigProvider>
    );
};

export default FrontLayout;
