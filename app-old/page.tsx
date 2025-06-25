import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Mic, Headphones, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Professional Recording Studios
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Discover And Book World-Class Recording Studios For Your Next Project. From Intimate Vocal Booths To Full
            Orchestral Spaces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/browse">Browse Studios</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-black text-white border-gray-700 hover:bg-gray-900"
            >
              <Link href="/list-studio">List Your Studio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-950/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Stwd.io?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6 text-center">
                <Music className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
                <p className="text-gray-400">Access To Industry-Standard Equipment And Acoustically Treated Spaces.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6 text-center">
                <Mic className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">Verified Studios</h3>
                <p className="text-gray-400">All Studios Are Verified And Reviewed By Our Community Of Creators.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6 text-center">
                <Headphones className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-400">Simple, Transparent Booking Process With Instant Confirmation.</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-xl font-semibold mb-2">Community</h3>
                <p className="text-gray-400">Connect With Other Creators And Industry Professionals.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready To Create?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join Thousands Of Creators Who Trust Stwd.io For Their Recording Needs.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/browse">Start Browsing</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
