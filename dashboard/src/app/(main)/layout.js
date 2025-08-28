import "@/app/globals.css";
import { Roboto } from "next/font/google";
import { sessionwrapper } from "@/components/sessionWrapper";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/modeToggle";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "sonner"; 

import { AlarmPoller } from "@/components/layout/AlarmPoller"; // import the client component

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata = {
  title: "W! Platform",
  description: "Developed with heart by W! Platform team",
};

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme")?.value || "system";
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <sessionwrapper>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <ThemeProvider
              attribute="class"
              defaultTheme={theme}
              enableSystem
              disableTransitionOnChange={false}
            >
              <div className="flex flex-col flex-auto items-center justify-between">
                <div
                  id="header"
                  className="flex items-center justify-between w-full p-2 shadow-sm bg-gray-100 dark:bg-gray-900"
                >
                  <SidebarTrigger className="cursor-pointer h-9 w-9 border-2" />
                  <div className="flex flex-row justify-between gap-2">
                    <ModeToggle className="cursor-pointer" />
                    <Separator orientation="vertical" />
                    <div id="notifications" className="flex">
                      <Bell className="h-9 w-9 border bg-background shadow-xs rounded-md hover:bg-accent hover:text-accent-foreground p-2" />
                      <Badge
                        className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
                        variant="destructive"
                        style={{
                          position: "relative",
                          top: "-0.4rem",
                          right: "0.6rem",
                        }}
                      >
                        99+
                      </Badge>
                    </div>
                    <Separator orientation="vertical" />
                  </div>
                </div>

                {/* Wrap children in AlarmPoller so it can handle toast + polling */}
                <AlarmPoller>{children}</AlarmPoller>
                 <Toaster position="bottom-center" richColors />
              </div>
            </ThemeProvider>
          </SidebarProvider>
        </sessionwrapper>
      </body>
    </html>
  );
}
