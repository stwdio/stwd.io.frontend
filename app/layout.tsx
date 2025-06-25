import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OnboardingGate } from "@/components/onboarding-gate";
import { ClientLayout } from "@/components/client-layout";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "stwd.io - Professional Recording Studios",
  description: "Book professional recording studios worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          <OnboardingGate>
            {children}
          </OnboardingGate>
          <Toaster />
        </ClientLayout>
      </body>
    </html>
  );
}
