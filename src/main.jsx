import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'

document.documentElement.lang = 'ar'
document.documentElement.dir = 'rtl'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
            <HelmetProvider>
                <App />
            </HelmetProvider>
    </QueryClientProvider>
)
