import { createServerComponentClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { IconBuilding, IconSearch, IconStar } from "@tabler/icons-react"

export default async function LandingPage() {
  const supabase = await createServerComponentClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // User is authenticated, redirect to browse
    redirect('/browse')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header for non-authenticated users */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <IconBuilding className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold">stwd.io</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Find the Perfect
            <span className="text-primary"> Recording Studio</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover and book professional recording studios worldwide. 
            Connect with top-tier facilities and bring your creative vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="text-lg px-8">
                <IconSearch className="mr-2 h-5 w-5" />
                Browse Studios
              </Button>
            </Link>
            <Link href="/auth/login?signup=true">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <IconBuilding className="mr-2 h-5 w-5" />
                List Your Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose stwd.io?</h2>
            <p className="text-xl text-muted-foreground">
              The platform that connects musicians with professional recording studios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <IconSearch className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Easy Discovery</CardTitle>
                <CardDescription>
                  Find studios by location, price, equipment, and amenities with our advanced search filters
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <IconStar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Verified Quality</CardTitle>
                <CardDescription>
                  All studios are verified and reviewed by our community to ensure the highest standards
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <IconBuilding className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Direct Booking</CardTitle>
                <CardDescription>
                  Book directly with studio owners and manage your sessions through our integrated platform
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of musicians and studio owners on stwd.io
          </p>
          <Link href="/auth/login?signup=true">
            <Button size="lg" className="text-lg px-8">
              Join stwd.io Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <IconBuilding className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">stwd.io</span>
          </div>
          <p className="text-muted-foreground">
            © 2025 stwd.io. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}