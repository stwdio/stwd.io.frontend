import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { RouteGuard } from "@/components/auth/route-guard";
import { ClientLayout } from "@/components/client-layout";
import { Toaster } from "@/components/ui/sonner";
import { createServerComponentClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "stwd.io - Professional Recording Studios",
  description: "Book professional recording studios worldwide",
};

/**
 * Root layout now fetches auth data SERVER-SIDE.
 * This is THE KEY to fixing the race condition. It ensures data
 * is available before ANY client-side rendering or logic occurs.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Create a server-side Supabase client
  const supabase = await createServerComponentClient();

  // 2. Fetch the user from cookies already validated by middleware
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. If a user exists, fetch their profile
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    profile = profileData;
  }

  // 4. Pass the resolved data to the client-side AuthProvider
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider initialUser={user} initialProfile={profile}>
          <RouteGuard>
            <ClientLayout>
              {children}
            </ClientLayout>
          </RouteGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
