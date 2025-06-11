// contexts/LanguageContext.tsx
import {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect,
} from "react";
import ar_EG from "antd/locale/ar_EG";
import en_US from "antd/locale/en_US";

type DirectionType = "ltr" | "rtl";

interface LanguageContextType {
    t: (key: string, params?: Record<string, string | number>) => string;
    language: string;
    direction: DirectionType;
    antdLocale: any;
    setLanguage: (lang: string) => void;
    darkMode: boolean;
    setDarkMode: (t: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);
type Translations = {
    [key: string]: string;
};
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("language") || "ar";
        }
        return "ar";
    });
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            const savedMode = localStorage.getItem("darkMode");
            return savedMode ? JSON.parse(savedMode) : false;
        }
        return false;
    });
    const direction: DirectionType = language === "ar" ? "rtl" : "ltr";
    const [translations, setTranslations] = useState<Translations>({});
    const antdLocale = language === "ar" ? ar_EG : en_US;
    const loadTranslations = async () => {
        try {
            const response = await import(`../locales/${language}.json`);
            setTranslations(response.default);
        } catch (error) {
            console.error("Failed to load translations:", error);
        }
    };

    loadTranslations();
    // Load translations dynamically
    const t = (
        key: string,
        params?: Record<string, string | number>
    ): string => {
        const resolvePath = (path: string, obj: any): any => {
            return path.split(".").reduce((prev, part) => {
                // Handle array indices like rating_levels.3
                if (prev && !isNaN(Number(part))) {
                    return prev[Number(part)];
                }
                return prev?.[part];
            }, obj);
        };

        // Attempt to resolve the full key path
        let translation = resolvePath(key, translations) ?? key;

        // Replace placeholders like {param}
        if (typeof translation === "string" && params) {
            Object.entries(params).forEach(([param, value]) => {
                translation = translation.replace(
                    new RegExp(`{${param}}`, "g"),
                    value.toString()
                );
            });
        }

        return typeof translation === "string" ? translation : key;
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("language", language);
            document.documentElement.dir = direction;
            document.documentElement.lang = language;
        }
    }, [language, direction]);

    return (
        <LanguageContext.Provider
            value={{
                t,
                language,
                direction,
                antdLocale,
                setLanguage,
                darkMode,
                setDarkMode,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
