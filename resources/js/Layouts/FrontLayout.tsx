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
} from "@ant-design/icons";
import { Link, usePage } from "@inertiajs/react";
// @ts-ignore
import { Scrollbars } from "@pezhmanparsaee/react-custom-scrollbars";
import { ThemeProvider } from "styled-components";
import { theme as themeVariables } from "../config/theme/themeVariables";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

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
                        className={`sticky top-0 z-50 w-full flex items-center justify-between px-4 ${
                            darkMode ? "bg-gray-900" : "bg-white"
                        } shadow-sm`}
                        style={{
                            height: 72,
                            borderBottom: `1px solid ${
                                darkMode ? "#424242" : "#f0f0f0"
                            }`,
                        }}
                    >
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <img
                                className="h-10"
                                src={
                                    darkMode
                                        ? appConfigs["app.logo_dark_url"]
                                        : appConfigs["app.logo_url"]
                                }
                                alt="Logo"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-6">
                            <Menu
                                mode="horizontal"
                                theme={darkMode ? "dark" : "light"}
                                items={navItems}
                                className="border-0"
                                selectedKeys={[]}
                            />

                            <Space size="middle">
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
                                    onClick={() =>
                                        setLanguage(
                                            language === "ar" ? "en" : "ar"
                                        )
                                    }
                                >
                                    {language === "ar" ? "EN" : "العربية"}
                                </Button>

                                {user ? (
                                    <Dropdown
                                        menu={{ items: userMenuItems }}
                                        placement="bottomRight"
                                    >
                                        <Avatar
                                            icon={<UserOutlined />}
                                            className="cursor-pointer"
                                        />
                                    </Dropdown>
                                ) : (
                                    <Space>
                                        <Button href="/login">
                                            {t("login")}
                                        </Button>
                                        <Button type="primary" href="/register">
                                            {t("register")}
                                        </Button>
                                    </Space>
                                )}
                            </Space>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex lg:hidden items-center gap-4">
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={toggleMobileMenu}
                            />
                        </div>
                    </Header>

                    {/* Content */}
                    <Content className="flex-1">
                        <div className="container mx-auto px-4 py-6">
                            {children}
                        </div>
                    </Content>

                    {/* Footer */}
                    <Footer
                        className={`py-8 ${
                            darkMode ? "bg-gray-900" : "bg-gray-50"
                        }`}
                    >
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">
                                        {t("about_company")}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {appConfigs["app.description"]}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">
                                        {t("quick_links")}
                                    </h3>
                                    <Menu
                                        mode="vertical"
                                        theme={darkMode ? "dark" : "light"}
                                        items={navItems}
                                        selectedKeys={[]}
                                        className="border-0"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">
                                        {t("contact_us")}
                                    </h3>
                                    <div className="text-gray-500 dark:text-gray-400">
                                        <p>{appConfigs["app.address"]}</p>
                                        <p>{appConfigs["app.phone"]}</p>
                                        <p>{appConfigs["app.email"]}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">
                                        {t("newsletter")}
                                    </h3>
                                    <div className="flex">
                                        <Input
                                            placeholder={t("your_email")}
                                            className="flex-1"
                                        />
                                        <Button type="primary">
                                            {t("subscribe")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
                                    © {new Date().getFullYear()}{" "}
                                    {appConfigs["app.name"]}.{" "}
                                    {t("all_rights_reserved")}
                                </span>
                                <div className="flex gap-4">
                                    <Button type="text">
                                        {t("privacy_policy")}
                                    </Button>
                                    <Button type="text">
                                        {t("terms_of_service")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Footer>

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
                                    items={navItems}
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
                                                    {t("logout")}
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <Space className="w-full">
                                            <Button block href="/login">
                                                {t("login")}
                                            </Button>
                                            <Button
                                                block
                                                type="primary"
                                                href="/register"
                                            >
                                                {t("register")}
                                            </Button>
                                        </Space>
                                    )}
                                </div>
                            </div>
                        </Scrollbars>
                    </Drawer>
                </Layout>
            </ThemeProvider>
        </ConfigProvider>
    );
};

export default FrontLayout;
