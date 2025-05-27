import { JSX, useCallback, useEffect, useState } from "react";
import {
    message,
    Layout as AntLayout,
    Menu,
    theme,
    Avatar,
    Dropdown,
    Button,
} from "antd";
import {
    DashboardOutlined,
    HistoryOutlined,
    TeamOutlined,
    ApiOutlined,
    UserOutlined,
    PhoneOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FileTextOutlined,
    BookOutlined,
    SwapOutlined,
    ApartmentOutlined,
    PercentageOutlined,
    AuditOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { Link, usePage } from "@inertiajs/react";

const { Header, Sider, Content, Footer } = AntLayout;

const AdminLayout = ({ children }: { children: JSX.Element }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const user = usePage().props.auth.user;
    const [collapsed, setCollapsed] = useState(false);
    // const [settings, setsettings] = useState<Setting>();
    const [isMobile, setIsMobile] = useState(false);

    const {
        token: { colorBgContainer, colorTextBase },
    } = theme.useToken();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992); // Ant Design's lg breakpoint is 992px
        };

        handleResize(); // Check on initial render
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link href="/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />}>
                <Link href="/logout" method="post">
                    تسجيل خروج
                </Link>
            </Menu.Item>
        </Menu>
    );

    const MenuItems = [
        {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: <Link href="/admin/dashboard">الرئيسية</Link>,
        },
        {
            key: "inquiries",
            icon: <HistoryOutlined />,
            label: <Link href="/admin/packages">عروض الاشتراكات</Link>,
        },
        {
            key: "MyListingsPage",
            icon: <TeamOutlined />,
            label: (
                <Link href="/admin/properties/pending">اذن نشر العقارات</Link>
            ),
        },
        {
            key: "services",
            icon: <UserOutlined />,
            label: <Link href="/admin/users">ادارة المستخدمين</Link>,
        },
        {
            key: "SettingsPage",
            icon: <SettingOutlined />,
            label: <Link href="/admin/SettingsPage">الاعدادات</Link>,
        },
    ];

    return (
        <AntLayout style={{ minHeight: "100vh" }}>
            {contextHolder}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={250}
                theme="dark"
                breakpoint="lg"
                collapsedWidth={isMobile ? 0 : 80}
                trigger={null}
                style={{
                    overflow: "auto",
                    height: "100vh",
                    position: "fixed",
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div
                    className="logo"
                    style={{
                        height: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: collapsed ? "16px" : "20px",
                        fontWeight: "bold",
                        margin: "16px 0",
                    }}
                >
                    {/* {collapsed ? "DT" : settings?.value} */}
                    DT
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    // @ts-ignore
                    items={MenuItems}
                    style={{ paddingBottom: "64px" }} // Add padding to prevent items from being hidden behind the footer
                />
            </Sider>
            <AntLayout
                style={{
                    marginRight: collapsed ? (isMobile ? 0 : 80) : 250,
                    minHeight: "100vh",
                }}
            >
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingLeft: "24px",
                        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                    }}
                >
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: "16px",
                            width: 64,
                            height: 64,
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginRight: "16px",
                        }}
                    >
                        <Dropdown overlay={userMenu} placement="bottomRight">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                <Avatar
                                    size="default"
                                    style={{ backgroundColor: "#1890ff" }}
                                    icon={<UserOutlined />}
                                />
                                {!collapsed && (
                                    <span style={{ color: colorTextBase }}>
                                        {user?.name || "User"}
                                    </span>
                                )}
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: "calc(100vh - 180px)", // Adjust based on header and footer height
                        background: colorBgContainer,
                        borderRadius: "8px",
                        overflow: "auto",
                    }}
                >
                    {children}
                </Content>
                <Footer
                    style={{
                        textAlign: "center",
                        background: colorBgContainer,
                        padding: "16px 50px",
                    }}
                >
                    {/* {settings?.value} © {new Date().getFullYear()} - All Rights */}
                    Dragon tech © {new Date().getFullYear()} - All Rights
                    Reserved
                </Footer>
            </AntLayout>
        </AntLayout>
    );
};

export default AdminLayout;
