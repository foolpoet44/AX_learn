import globals from "globals";

export default [
    {
        ignores: ["node_modules/", ".git/"]
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "semi": ["error", "always"],
            "quotes": ["error", "single", { "avoidEscape": true }]
        }
    },
    {
        files: ["scripts/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            "no-console": "off"
        }
    }
];
