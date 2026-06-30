import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { RoleProvider } from "@/components/role-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/toaster";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Citrus — Creative Operations",
  description: "Lightweight ERP for a creative studio.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resolve theme before first paint to avoid a flash. Reads the saved
            choice, else falls back to the OS preference, and keeps
            color-scheme in sync so native UI (scrollbars, form controls)
            matches. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <RoleProvider user={user}>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </TooltipProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
