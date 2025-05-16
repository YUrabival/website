import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import ClientFooter from "@/components/ClientFooter";
import { TrpcProvider } from "@/components/TrpcProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Store",
  description: "Your one-stop shop for everything",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className + " dark:bg-gray-900 bg-white min-h-screen flex flex-col"}>
        <Providers>
          <TrpcProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <ClientFooter />
          </TrpcProvider>
        </Providers>
      </body>
    </html>
  );
} 