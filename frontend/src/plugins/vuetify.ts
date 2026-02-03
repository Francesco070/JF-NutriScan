import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

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
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#4CAF50',
                    secondary: '#2196F3',
                    accent: '#FF9800',
                    error: '#F44336',
                    warning: '#FF9800',
                    info: '#2196F3',
                    success: '#4CAF50',
                },
            },
        },
    },
})