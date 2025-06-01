import "../css/app.css";
import "./bootstrap";
import "leaflet/dist/leaflet.css";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import arEG from "antd/locale/ar_EG";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Set HTML direction and language
// document.documentElement.setAttribute("dir", "rtl");
// document.documentElement.setAttribute("lang", "ar");

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx")
        ),

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ConfigProvider
                direction="rtl"
                locale={arEG}
                theme={{
                    token: {
                        fontFamily: "Cairo, sans-serif",
                    },
                }}
            >
                <App {...props} />
            </ConfigProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
