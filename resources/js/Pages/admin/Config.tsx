import React, { useState } from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import {
    Card,
    Input,
    Switch,
    InputNumber,
    Select,
    Upload,
    message,
    Button,
    Divider,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import AdminLayout from "@/Layouts/AdminLayout";
import { PageProps } from "@/types";
import { theme } from "@/config/theme/themeVariables";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfigItem {
    key: string;
    value: string;
    type: "boolean" | "text" | "link" | "enum" | "number";
    options?: string[];
    description?: string;
    group: string;
}

interface Props extends PageProps {
    configs: ConfigItem[];
}
const ConfigIndex: React.FC = () => (
    <AdminLayout>
        <Page />
    </AdminLayout>
);
const Page = () => {
    const { props } = usePage<Props>();
    const { configs } = props;
    const [logoUploading, setLogoUploading] = useState(false);
    const grouped = configs.reduce((acc, item) => {
        acc[item.group] = acc[item.group] || [];
        acc[item.group].push(item);
        return acc;
    }, {} as Record<string, ConfigItem[]>);

    const { data, setData, processing, put } = useForm<
        Record<string, string | boolean | number>
    >(
        configs.reduce((acc, item) => {
            acc[item.key] =
                item.type === "boolean" ? item.value === "true" : item.value;
            return acc;
        }, {} as Record<string, string | boolean | number>)
    );

    const handleSubmit = () => {
        put(route("admin.configs.update"), {
            onSuccess: () => message.success("Settings saved"),
            onError: () => message.error("Failed to save"),
        });
    };

    const handleFileChange = async (file: File, type: "light" | "dark") => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        setLogoUploading(true);
        try {
            const csrf = (
                document.querySelector(
                    'meta[name="csrf-token"]'
                ) as HTMLMetaElement
            )?.content;
            const response = await fetch(route("admin.configs.uploadLogo"), {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-TOKEN": csrf,
                    acctept: "application/json",
                },
            });
            const result = await response.json();
            if (result.url) {
                setData(
                    `app.logo_${type === "dark" ? "dark_" : ""}url`,
                    // @ts-ignore
                    result.url
                );
                message.success(`${type} logo uploaded`);
            } else {
                throw new Error();
            }
        } catch (e) {
            console.log(e);

            message.error("Upload failed");
        } finally {
            setLogoUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([group, items]) => (
                <Card key={group} title={group.toUpperCase()}>
                    {items.map((item) => {
                        let input;
                        switch (item.type) {
                            case "boolean":
                                input = (
                                    <Switch
                                        checked={data[item.key] as boolean}
                                        onChange={(checked) =>
                                            setData(item.key, checked)
                                        }
                                    />
                                );
                                break;
                            case "number":
                                input = (
                                    <InputNumber
                                        value={Number(data[item.key])}
                                        onChange={(val) =>
                                            setData(item.key, val || 0)
                                        }
                                    />
                                );
                                break;
                            case "enum":
                                input = (
                                    <Select
                                        value={data[item.key] as string}
                                        onChange={(val) =>
                                            setData(item.key, val)
                                        }
                                        options={(item.options || []).map(
                                            (opt) => ({
                                                value: opt,
                                                label: opt,
                                            })
                                        )}
                                    />
                                );
                                break;
                            case "link":
                            case "text":
                            default:
                                input =
                                    item.key === "app.logo_url" ? (
                                        <>
                                            <Upload
                                                showUploadList={false}
                                                customRequest={({ file }) =>
                                                    handleFileChange(
                                                        file as File,
                                                        "light"
                                                    )
                                                }
                                            >
                                                <Button
                                                    icon={<UploadOutlined />}
                                                    loading={logoUploading}
                                                >
                                                    Upload Logo
                                                </Button>
                                            </Upload>
                                            {data[item.key] && (
                                                <div className="mt-2">
                                                    <img
                                                        src={
                                                            data[
                                                                item.key
                                                            ] as string
                                                        }
                                                        alt="Logo Preview"
                                                        style={{
                                                            maxWidth: "150px",
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : item.key === "app.logo_dark_url" ? (
                                        <div>
                                            <p className="font-semibold mb-1">
                                                Dark Mode Logo
                                            </p>
                                            <Upload
                                                showUploadList={false}
                                                customRequest={({ file }) =>
                                                    handleFileChange(
                                                        file as File,
                                                        "dark"
                                                    )
                                                }
                                            >
                                                <Button
                                                    icon={<UploadOutlined />}
                                                    loading={logoUploading}
                                                >
                                                    Upload Dark Logo
                                                </Button>
                                            </Upload>
                                            {data["app.logo_dark_url"] && (
                                                <img
                                                    src={
                                                        data[
                                                            "app.logo_dark_url"
                                                        ] as string
                                                    }
                                                    alt="Dark Logo"
                                                    style={{
                                                        maxWidth: 150,
                                                        marginTop: 8,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <Input
                                            style={{
                                                background: "transparent",
                                            }}
                                            value={data[item.key] as string}
                                            onChange={(e) =>
                                                setData(
                                                    item.key,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    );
                        }

                        return (
                            <div key={item.key} className="mb-4">
                                <label className="block font-semibold">
                                    {item.description || item.key}
                                </label>
                                {input}
                            </div>
                        );
                    })}
                </Card>
            ))}

            <Divider />
            <Button type="primary" onClick={handleSubmit} loading={processing}>
                Save Settings
            </Button>
        </div>
    );
};

export default ConfigIndex;
