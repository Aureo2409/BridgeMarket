import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
    plugins: [react()],
    // Injeta fallbacks diretos no código para evitar ecrã branco na Vercel
    // caso as variáveis de ambiente não estejam configuradas no painel.
    define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || "https://gexlmuclvadddhlbmgkl.supabase.co"),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleGxtdWNsdmFkZGRobGJtZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTM2NjksImV4cCI6MjA5MzY2OTY2OX0.c4Bgf2C-QcTSsl_CzCvyBHzpFDmKVXVdQ0x34LywFTk")
    }
})
