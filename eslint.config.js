import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        ignores: [
            'vendor/**',
            'public/**',
            'bootstrap/**',
            'storage/**',
            'node_modules/**',
        ],
    },
    {
        files: ['resources/js/**/*.js', 'resources/js/**/*.jsx'],
        plugins: {
            react,
            'react-hooks': reactHooks,
            prettier,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                route: 'readonly',
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'prettier/prettier': 'error',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    configPrettier,
];
