import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Code, Users, CheckCircle, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AuthStarter</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-sm font-medium hover:text-primary transition-colors">
              Docs
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">
            Authentication API for <span className="text-primary">Developers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Deploy auth in minutes, not months. Complete authentication service with JWT, magic links, 
            and multi-tenant support. Built for developers who want simplicity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="#docs">
              <Button size="lg" variant="outline" className="px-8">
                View Documentation
              </Button>
            </Link>
          </div>
          
          {/* Code Example */}
          <div className="bg-slate-900 text-green-400 p-6 rounded-lg text-left font-mono text-sm max-w-2xl mx-auto">
            <div className="text-slate-400 mb-2"># Register your app</div>
            <div>curl -X POST https://authstarter.com/api/apps/register \</div>
            <div className="ml-4">-H "Content-Type: application/json" \</div>
            <div className="ml-4">-d '{"name": "My App", "domain": "https://myapp.com"}'</div>
            <div className="text-slate-400 mt-4 mb-2"># Use your API key</div>
            <div>curl -X POST https://authstarter.com/api/auth/login \</div>
            <div className="ml-4">-H "X-API-Key: your-api-key" \</div>
            <div className="ml-4">-d '{"email": "user@example.com", "password": "password"}'</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for authentication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>🔐 Secure</CardTitle>
                <CardDescription>
                  JWT tokens, bcrypt hashing, rate limiting, and CORS protection built-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    bcrypt with 12 salt rounds
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Rate limiting (5000 req/15min)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    CORS protection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>⚡ Fast</CardTitle>
                <CardDescription>
                  Lightning-fast responses with optimized database queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {"<"} 100ms response time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Optimized PostgreSQL queries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Global CDN deployment
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-primary mb-2" />
                <CardTitle>🎯 Simple</CardTitle>
                <CardDescription>
                  5-minute setup with comprehensive documentation and examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    One-click Railway deploy
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    REST API with examples
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Magic link authentication
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple, transparent pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">forever</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Up to 1,000 users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    10,000 API calls/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Email support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Community access
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Pro</CardTitle>
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <CardDescription>For growing applications</CardDescription>
                <div className="text-3xl font-bold">$29</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Up to 10,000 users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    100,000 API calls/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom domains
                  </li>
                </ul>
                <Button className="w-full mt-6">Start Pro Trial</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large-scale applications</CardDescription>
                <div className="text-3xl font-bold">Custom</div>
                <div className="text-sm text-muted-foreground">contact us</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited API calls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    24/7 phone support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    On-premise deployment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Custom integrations
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AuthStarter</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Authentication API for developers who want simplicity and security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/docs" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/status" className="text-muted-foreground hover:text-foreground">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AuthStarter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
