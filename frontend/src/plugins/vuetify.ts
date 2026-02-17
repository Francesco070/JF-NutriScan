import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const THEME_KEY = 'nutriscan-theme'

export default createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },

    defaults: {
        VCard: {
            rounded: 'xl',
        },

        VBtn: {
            rounded: 'xl',
        },

        VAlert: {
            rounded: 'xl',
        },

        VImg: {
            rounded: 'xl',
        },

        VTextField: {
            rounded: 'xl',
            variant: 'outlined',
        },

        VChip: {
            rounded: 'xl',
        },

        VDialog: {
            rounded: 'xl',
        },
    },

    theme: {
        defaultTheme: (localStorage.getItem(THEME_KEY) ?? 'dark') as 'light' | 'dark',
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: '#4CAF50',
                    secondary: '#2196F3',
                    accent: '#FF9800',
                    error: '#F44336',
                    warning: '#FF9800',
                    info: '#2196F3',
                    success: '#4CAF50',
                    background: '#F5F5F5',
                    surface: '#FFFFFF',
                },
            },
            dark: {
                dark: true,
                colors: {
                    primary: '#4CAF50',
                    secondary: '#2196F3',
                    accent: '#FF9800',
                    error: '#F44336',
                    warning: '#FF9800',
                    info: '#2196F3',
                    success: '#4CAF50',
                    background: '#151d15',
                    surface: '#192328',
                },
            },
        },
    },
})