import { useState, useEffect, ReactNode } from "react";
import {
    Layout,
    Menu,
    Button,
    ConfigProvider,
    theme,
    ConfigProviderProps,
} from "antd";
import {
    DashboardOutlined,
    HistoryOutlined,
    TeamOutlined,
    UserOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ApiOutlined,
    HomeOutlined,
    SearchOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import { Link, usePage } from "@inertiajs/react";
// @ts-ignore
import { Scrollbars } from "@pezhmanparsaee/react-custom-scrollbars";
import { ThemeProvider } from "styled-components";
import AuthInfo from "./AuthInfo";
import { theme as themeVariables } from "../config/theme/themeVariables";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

const { Header, Sider, Content, Footer } = Layout;

interface AdminLayoutProps {
    children: ReactNode;
}

type DirectionType = ConfigProviderProps["direction"];
const AdminLayout = ({ children }: AdminLayoutProps) => (
    <LanguageProvider>
        <MainLayout>{children}</MainLayout>
    </LanguageProvider>
);
const MainLayout = ({ children }: AdminLayoutProps) => {
    const { t, language, direction, antdLocale, setLanguage } = useLanguage();
    const user = usePage().props.auth.user;
    const appConfigs = usePage().props.appConfigs as Record<string, any>;
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        // Get theme preference from localStorage if it exists
        if (typeof window !== "undefined") {
            const savedMode = localStorage.getItem("darkMode");
            return savedMode ? JSON.parse(savedMode) : false;
        }
        return false;
    });
    const [currentTheme, setCurrentTheme] = useState({
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: "#1890ff", // Your primary color
            borderRadius: 2, // Your border radius
            // Add other token overrides if needed
        },
    });

    // Debug effect
    useEffect(() => {
        setCurrentTheme({
            algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
                colorPrimary: "#1890ff", // Your primary color
                borderRadius: 2, // Your border radius
                // Add other token overrides if needed
            },
        });
    }, [darkMode]);

    useEffect(() => {
        // Save theme preference to localStorage whenever it changes
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        const handleResize = () => {
            const small = window.innerWidth < 992;
            setIsMobile(small);
            setCollapsed(small);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleCollapsed = () => setCollapsed(!collapsed);

    const MenuItems = [
        {
            key: "dashboard",
            icon: <HomeOutlined />, // More intuitive for "Home/Dashboard"
            label: <Link href="/user/dashboard">الرئيسية</Link>,
        },
        {
            key: "inquiries",
            icon: <SearchOutlined />, // Better for "Inquiries/Search"
            label: <Link href="/user/inquiries">الاستعلامات</Link>,
        },
        {
            key: "reservations",
            icon: <SearchOutlined />, // Better for "Inquiries/Search"
            label: <Link href="/user/reservations">الحجوزات</Link>,
        },
        {
            key: "MyListingsPage",
            icon: <ShopOutlined />, // Better for properties/listings
            label: <Link href="/user/properties">عروضي</Link>,
        },
        {
            key: "services",
            icon: <ShoppingCartOutlined />, // More relevant for purchasing services
            label: <Link href="/user/services">شراء الخدمات</Link>,
        },
        {
            key: "subscription",
            icon: <CreditCardOutlined />, // Represents payments/subscriptions
            label: <Link href="/user/subscription">الاشتراك</Link>,
        },
        {
            key: "SettingsPage",
            icon: <SettingOutlined />, // This one is perfect as-is
            label: <Link href="/user/SettingsPage">الاعدادات</Link>,
        },
    ];

    const renderThumb = ({ style }: { style: React.CSSProperties }) => (
        <div
            style={{
                ...style,
                borderRadius: 6,
                backgroundColor: "#F1F2F6",
            }}
        />
    );

    const renderView = ({ style }: { style: React.CSSProperties }) => (
        <div style={{ ...style, marginRight: "auto" }} />
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
                <Layout className="font-cairo min-h-screen">
                    {/* Header */}
                    <Header
                        className="p-0 flex items-center justify-between h-[72px] z-[998] fixed w-full right-0 top-0"
                        style={{
                            backgroundColor: darkMode
                                ? themeVariables.darkMode.background
                                : themeVariables.lightMode.background,
                        }}
                    >
                        <div className="flex items-center w-full h-full px-4">
                            <div className="flex items-center justify-between w-full max-w-[260px]">
                                <Link href="/admin">
                                    <img
                                        className="w-full max-w-[120px]"
                                        src={
                                            darkMode
                                                ? appConfigs[
                                                      "app.logo_dark_url"
                                                  ]
                                                : appConfigs["app.logo_url"]
                                        }
                                        alt="Logo"
                                    />
                                </Link>
                                <Button type="text" onClick={toggleCollapsed}>
                                    {collapsed ? (
                                        <MenuUnfoldOutlined
                                            color={
                                                darkMode
                                                    ? themeVariables.lightMode
                                                          .text
                                                    : themeVariables.darkMode
                                                          .text
                                            }
                                        />
                                    ) : (
                                        <MenuFoldOutlined
                                            color={
                                                darkMode
                                                    ? themeVariables.lightMode
                                                          .text
                                                    : themeVariables.darkMode
                                                          .text
                                            }
                                        />
                                    )}
                                </Button>
                            </div>
                            <div className="flex justify-end flex-1 items-center gap-4 pr-6">
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
                                <AuthInfo
                                    darkMode={darkMode}
                                    setDarkMode={setDarkMode}
                                />
                            </div>
                        </div>
                    </Header>

                    {/* Main layout */}
                    <Layout style={{ marginTop: 72 }}>
                        {/* Sidebar */}
                        <Sider
                            width={280}
                            theme={darkMode ? "dark" : "light"}
                            collapsed={collapsed}
                            collapsible
                            className="shadow-sm fixed z-[998]"
                            style={{
                                height: "calc(100vh - 72px)",
                                overflowY: "auto",
                                top: 72,
                                ...(direction === "rtl"
                                    ? { right: 0 }
                                    : { left: 0 }),
                            }}
                        >
                            <Scrollbars
                                autoHide
                                autoHideTimeout={500}
                                autoHideDuration={200}
                                renderThumbVertical={renderThumb}
                                renderView={renderView}
                            >
                                <Menu
                                    mode="inline"
                                    theme={darkMode ? "dark" : "light"}
                                    items={MenuItems}
                                    style={{ paddingBottom: 64 }}
                                />
                            </Scrollbars>
                        </Sider>

                        {/* Content */}
                        <Layout
                            className="transition-all"
                            style={{
                                ...(direction === "rtl"
                                    ? {
                                          marginRight: collapsed ? 80 : 280,
                                      }
                                    : {
                                          marginLeft: collapsed ? 80 : 280,
                                      }),
                            }}
                        >
                            <Content className="m-6">{children}</Content>
                            <Footer className="text-center py-4">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    <span className="text-theme-gray dark:text-white60">
                                        {t("copyright", {
                                            year: new Date().getFullYear(),
                                            name: appConfigs["app.name"],
                                        })}
                                    </span>
                                    <div className="flex gap-4 flex-wrap">
                                        <Link
                                            href="/about"
                                            className="text-theme-gray dark:text-white60 light:text-black60 hover:text-primary"
                                        >
                                            {t("about")}
                                        </Link>
                                        <Link
                                            href="/team"
                                            className="text-theme-gray dark:text-white60 light:text-black60 hover:text-primary"
                                        >
                                            {t("team")}
                                        </Link>
                                        <Link
                                            href="/contact"
                                            className="text-theme-gray dark:text-white60 light:text-black60 hover:text-primary"
                                        >
                                            {t("contact")}
                                        </Link>
                                    </div>
                                </div>
                            </Footer>
                        </Layout>
                    </Layout>

                    {/* Mobile overlay */}
                    {isMobile && !collapsed && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-[997]"
                            onClick={toggleCollapsed}
                        />
                    )}
                </Layout>
            </ThemeProvider>
        </ConfigProvider>
    );
};

export default AdminLayout;
