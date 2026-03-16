import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
// Notification logic removed

import { SessionProvider } from "@/lib/session-context";
import { NotificationProvider } from "@/components/ui/notification";
import { CartProvider } from "@/components/shop/cart-context";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "SafeQR — Emergency QR Profiles",
  description: "Emergency-ready QR profiles for kids, seniors, and families.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background bg-blue-100 text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ToastProvider />
          <NotificationProvider>
            <SessionProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </SessionProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
