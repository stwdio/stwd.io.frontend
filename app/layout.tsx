import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { RouteGuard } from "@/components/auth/route-guard";
import { ClientLayout } from "@/components/client-layout";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { createServerComponentClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "stwd.io - Professional Recording Studios",
  description: "Book professional recording studios worldwide",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
  let professionalRoles = [];
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    profile = profileData;
    
    // 4. If profile exists, fetch their professional roles
    if (profile) {
      const { data: rolesData } = await supabase
        .from('profile_roles')
        .select(`
          role_id,
          role:roles(*)
        `)
        .eq('profile_id', profile.id);
      
      if (rolesData) {
        professionalRoles = rolesData;
      }
    }
  }

  // 5. Pass the resolved data to the client-side AuthProvider
  // 6. Wrap with ReactQueryProvider for optimal caching
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        <ReactQueryProvider>
          <AuthProvider initialUser={user} initialProfile={profile} initialRoles={professionalRoles}>
            <RouteGuard>
              <ClientLayout>
                {children}
              </ClientLayout>
            </RouteGuard>
            <Toaster />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
