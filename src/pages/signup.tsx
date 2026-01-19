"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Mail, Lock, User, Building2, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signup, getDashboardPath } from "@/lib/api"

type Role = 'admin' | 'vendor' | 'company' | null;

export default function SignupPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Map 'company' to 'companies' for API if needed, or check what the API expects
      const apiRole = selectedRole === 'company' ? 'company' : selectedRole;
      
      const response = await signup({
        name,
        email,
        password,
        role: apiRole as 'admin' | 'vendor' | 'company',
      });

      if (response.success && response.data.user) {
        // Redirect based on user role
        const dashboardPath = getDashboardPath(response.data.user.role);
        navigate(dashboardPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h1>
            <p className="text-muted-foreground">Join us and start your journey</p>
          </div>

          {!selectedRole ? (
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">Choose your account type</Label>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className="group relative flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">Admin Account</h3>
                    <p className="text-sm text-muted-foreground">Manage the platform and operations</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("vendor")}
                  className="group relative flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">Vendor Account</h3>
                    <p className="text-sm text-muted-foreground">Sell products and manage inventory</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("company")}
                  className="group relative flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary bg-card hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">Company Account</h3>
                    <p className="text-sm text-muted-foreground">Purchase products for your business</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2">
                  {selectedRole === "admin" ? (
                    <Shield className="h-5 w-5 text-primary" />
                  ) : selectedRole === "vendor" ? (
                    <Building2 className="h-5 w-5 text-accent" />
                  ) : (
                    <Users className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {selectedRole === "admin" ? "Admin Account" : selectedRole === "vendor" ? "Vendor Account" : "Company Account"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Change
                </button>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    {selectedRole === "vendor" || selectedRole === "company" ? "Business/Company name" : "Full name"}
                  </Label>
                  <div className="relative">
                    {selectedRole === "vendor" ? (
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    ) : selectedRole === "company" ? (
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    ) : (
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    )}
                    <Input
                      id="name"
                      type="text"
                      placeholder={selectedRole === "vendor" || selectedRole === "company" ? "Enter business/company name" : "Enter your name"}
                      className="pl-10 h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10 h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with a mix of letters and numbers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                    required
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </>
          )}

          {selectedRole && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-border hover:bg-muted transition-colors bg-transparent"
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-border hover:bg-muted transition-colors bg-transparent"
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
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
