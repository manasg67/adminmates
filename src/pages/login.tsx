import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {  Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, getDashboardPath } from "@/lib/api"

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for pending approval message from signup
  useEffect(() => {
    const pendingMessage = localStorage.getItem('pendingApprovalMessage');
    if (pendingMessage) {
      setSuccessMessage(pendingMessage);
      localStorage.removeItem('pendingApprovalMessage');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response.success && response.data.user) {
        // Redirect based on user role
        const dashboardPath = getDashboardPath(response.data.user.role);
        navigate(dashboardPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        

        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>


          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
