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
    const { t, language, direction, antdLocale, setLanguage } = useLanguage();
    const user = usePage().props.auth.user;
    const appConfigs = usePage().props.appConfigs as Record<string, any>;
    const services = usePage().props.footerServices as Service[];
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            const savedMode = localStorage.getItem("darkMode");
            return savedMode ? JSON.parse(savedMode) : false;
        }
        return false;
    });
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

    const navItems = [
        {
            key: "home",
            icon: <HomeOutlined />,
            label: <Link href="/">{t("home")}</Link>,
        },
        {
            key: "properties",
            icon: <HomeOutlined />,
            label: <Link href="/properties">{t("properties")}</Link>,
        },
        {
            key: "favorites",
            icon: <HeartOutlined />,
            label: <Link href="/favorites">{t("favorites")}</Link>,
        },
        {
            key: "about",
            icon: <InfoCircleOutlined />,
            label: <Link href="/about">{t("about_us")}</Link>,
        },
        {
            key: "contact",
            icon: <PhoneOutlined />,
            label: <Link href="/contact">{t("contact_us")}</Link>,
        },
    ];

    const userMenuItems = [
        {
            key: "profile",
            label: <Link href="/profile">{t("profile")}</Link>,
            icon: <UserOutlined />,
        },
        {
            key: "logout",
            label: (
                <Link href="/logout" method="post">
                    {t("logout")}
                </Link>
            ),
            icon: <UserOutlined />,
        },
    ];

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
                    {/* Mobile Menu Drawer */}
                    <Drawer
                        title={
                            <div className="flex items-center gap-2">
                                <img
                                    className="h-8"
                                    src={
                                        darkMode
                                            ? appConfigs["app.logo_dark_url"]
                                            : appConfigs["app.logo_url"]
                                    }
                                    alt="Logo"
                                />
                            </div>
                        }
                        placement={direction === "rtl" ? "right" : "left"}
                        onClose={toggleMobileMenu}
                        open={mobileMenuVisible}
                        bodyStyle={{ padding: 0 }}
                        width={280}
                    >
                        <Scrollbars
                            autoHide
                            autoHideTimeout={500}
                            autoHideDuration={200}
                            renderThumbVertical={renderThumb}
                        >
                            <div className="flex flex-col h-full">
                                <Menu
                                    mode="inline"
                                    theme={darkMode ? "dark" : "light"}
                                    items={[
                                        {
                                            key: "home",
                                            label: "الرئيسة",
                                            icon: <HomeOutlined />,
                                        },
                                        {
                                            key: "properties",
                                            label: "العقارات",
                                            icon: <ShopOutlined />,
                                        },
                                        {
                                            key: "languages",
                                            label: "اللغات",
                                            icon: <GlobalOutlined />,
                                        },
                                        {
                                            key: "about",
                                            label: "من نحن",
                                            icon: <InfoCircleOutlined />,
                                        },
                                        {
                                            key: "contact",
                                            label: "إضاءة",
                                            icon: <BulbOutlined />,
                                        },
                                    ]}
                                    className="flex-1 border-0"
                                    selectedKeys={[]}
                                />

                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <Button
                                            type="text"
                                            icon={
                                                darkMode ? (
                                                    <SunOutlined />
                                                ) : (
                                                    <MoonOutlined />
                                                )
                                            }
                                            onClick={toggleDarkMode}
                                        />
                                        <Button
                                            type="text"
                                            icon={<TranslationOutlined />}
                                            onClick={() => {
                                                setLanguage(
                                                    language === "ar"
                                                        ? "en"
                                                        : "ar"
                                                );
                                                toggleMobileMenu();
                                            }}
                                        >
                                            {language === "ar"
                                                ? "EN"
                                                : "العربية"}
                                        </Button>
                                    </div>

                                    {user ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar icon={<UserOutlined />} />
                                            <div>
                                                <div className="font-medium">
                                                    {user.name}
                                                </div>
                                                <Link
                                                    href="/logout"
                                                    className="text-sm text-gray-500"
                                                >
                                                    تسجيل خروج
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <Space className="w-full">
                                            <Button block href="/login">
                                                السجل الدخول
                                            </Button>
                                            <Button
                                                block
                                                type="primary"
                                                href="/register"
                                            >
                                                إشاء حساب
                                            </Button>
                                        </Space>
                                    )}
                                </div>
                            </div>
                        </Scrollbars>
                    </Drawer>
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
                                        menu={{
                                            items: [
                                                {
                                                    key: "profile",
                                                    label: "الملف الشخصي",
                                                },
                                                {
                                                    key: "logout",
                                                    label: "تسجيل خروج",
                                                },
                                            ],
                                        }}
                                        placement="bottomRight"
                                    >
                                        <Avatar
                                            icon={<UserOutlined />}
                                            className="cursor-pointer"
                                        />
                                    </Dropdown>
                                ) : (
                                    <Space>
                                        <Button
                                            type="default"
                                            href="/login"
                                            className="text-sm font-medium"
                                        >
                                            تسجيل الدخول
                                        </Button>
                                        <Button
                                            type="primary"
                                            href="/register"
                                            className="text-sm font-medium"
                                        >
                                            إنشاء حساب
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
                                        label: <a href="/">الرئيسية</a>,
                                    },
                                    {
                                        key: "properties",
                                        label: (
                                            <a href="/properties/search">
                                                العقارات
                                            </a>
                                        ),
                                    },
                                    {
                                        key: "pricing",
                                        label: <a href="/pricing">الباقات</a>,
                                    },
                                    {
                                        key: "services",
                                        label: <a href="/services">الخدمات</a>,
                                    },
                                    {
                                        key: "about-us",
                                        label: <a href="/about-us">من نحن</a>,
                                    },
                                ]}
                                className="border-0 bg-transparent font-medium flex-1"
                                selectedKeys={[selectedKey]}
                            />

                            {/* Add Property Link */}
                            <Link
                                href={route("user.properties.create")}
                                className="text-green-600 font-medium text-sm hover:underline"
                            >
                                + إضافة عقار
                            </Link>
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
                                        عن {appConfigs["app.name"]}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {appConfigs["about.short"]}
                                    </p>
                                </div>

                                {/* Quick Links Section */}
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-4">
                                        روابط سريعة
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <a
                                                href={route("Page", "help")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                المساعدة
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={route("Page", "privacy")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                سياسة الخصوصية
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={route("Page", "terms")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                شروط الاستخدام
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={route("Faq")}
                                                className="text-gray-500 dark:text-gray-400 hover:text-primary"
                                            >
                                                الأسئلة الشائعة
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                {/* Services Section */}
                                <div>
                                    <h3 className="text-lg text-white font-semibold mb-4">
                                        الخدمات
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
                                        اتصل بنا
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
                                    {appConfigs["app.name"]}. جميع الحقوق محفوظة
                                </span>
                                <div className="flex gap-4">
                                    <Button
                                        href={route("Page", "privacy")}
                                        type="text"
                                        className="text-white"
                                    >
                                        سياسة الخصوصية
                                    </Button>
                                    <Button
                                        href={route("Page", "terms")}
                                        type="text"
                                        className="text-white"
                                    >
                                        شروط الخدمة
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
