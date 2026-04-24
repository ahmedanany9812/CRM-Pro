import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { QueryProvider } from "@/providers/queryProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your CRM Pro account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
