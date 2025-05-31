import { useState, useEffect } from "react";

type Translations = {
    [key: string]: string;
};

const useLocalization = () => {
    const [language, setLanguage] = useState<string>(
        localStorage.getItem("language") || "en"
    );
    const [translations, setTranslations] = useState<Translations>({});

    useEffect(() => {
        // Load translations based on selected language
        const loadTranslations = async () => {
            try {
                const response = await import(`../locales/${language}.json`);
                setTranslations(response.default);
            } catch (error) {
                console.error("Failed to load translations:", error);
            }
        };

        loadTranslations();

        // Save to localStorage
        localStorage.setItem("language", language);
    }, [language]);

    const t = (
        key: string,
        params?: { [key: string]: string | number }
    ): string => {
        let translation = translations[key] || key;

        // Replace placeholders if any
        if (params) {
            Object.keys(params).forEach((param) => {
                translation = translation.replace(
                    `{${param}}`,
                    params[param].toString()
                );
            });
        }

        return translation;
    };

    return { t, language, setLanguage };
};

export default useLocalization;
