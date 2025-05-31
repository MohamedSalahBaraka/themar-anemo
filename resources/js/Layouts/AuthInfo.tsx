import { Dropdown, Menu, Avatar } from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    BulbOutlined,
    BulbFilled,
} from "@ant-design/icons";
import { Link } from "@inertiajs/react";

interface AuthInfoProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

const AuthInfo = ({ darkMode, setDarkMode }: AuthInfoProps) => {
    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link href="/profile">الملف الشخصي</Link>
            </Menu.Item>
            <Menu.Item
                key="theme"
                icon={darkMode ? <BulbOutlined /> : <BulbFilled />}
                onClick={() => setDarkMode(!darkMode)}
            >
                {darkMode ? "الوضع النهاري" : "الوضع الليلي"}
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />}>
                <Link href="/logout" method="post">
                    تسجيل خروج
                </Link>
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={userMenu} placement="bottomRight">
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
    );
};

export default AuthInfo;
