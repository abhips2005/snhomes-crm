import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "S N Homes | Find. Match. Move In.",
  description: "Kerala real estate matchmaking for genuine buyers, sellers, tenants, and landlords.",
  applicationName: "S N Homes",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "S N Homes"
  }
};

export const viewport: Viewport = {
  themeColor: "#175cd3",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-ink`}>
        <QueryProvider>
          {children}
          <ServiceWorkerRegister />
        </QueryProvider>
      </body>
    </html>
  );
}
