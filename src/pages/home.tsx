import { Link } from "react-router-dom"
import { Shield, Building2, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Welcome to E-Commerce Platform
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your account type to continue
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6 hover:shadow-2xl transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Admin</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Manage the platform, users, and oversee operations
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link to="/login" className="w-full">
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button variant="outline" className="w-full h-11">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6 hover:shadow-2xl transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/20">
                <Building2 className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Vendor</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Sell products and manage your inventory
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link to="/login" className="w-full">
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button variant="outline" className="w-full h-11">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Companies Card */}
          <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6 hover:shadow-2xl transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500/20">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Companies</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Purchase products and manage your business needs
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link to="/login" className="w-full">
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button variant="outline" className="w-full h-11">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
