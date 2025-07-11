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
 * This is THE KEY to fixing the refresh bug.
 * 
 * WHAT HAPPENS ON REFRESH:
 * 1. Middleware validates/refreshes auth cookies
 * 2. This layout runs server-side with valid auth
 * 3. Fetches user and profile with no race condition
 * 4. Passes data to AuthProvider as props
 * 5. Client hydrates with complete data - no hanging queries!
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerComponentClient();
  
  // Get user from already-validated cookies
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch profile if user exists - this runs server-side!
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    profile = data;
  }

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
