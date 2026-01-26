"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {  Mail, Lock, User, Building2, Users, Shield } from "lucide-react"
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
  const [gstNumber, setGstNumber] = useState("");
  const [panCard, setPanCard] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
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

    // Validate GST, PAN Card and Company Location for vendor and company
    if (selectedRole === 'vendor' || selectedRole === 'company') {
      if (!gstNumber || gstNumber.length !== 15) {
        setError("Please enter a valid 15-character GST number");
        return;
      }
      if (!panCard || panCard.length !== 12) {
        setError("Please enter a valid 12-character PAN Card number");
        return;
      }
      if (!companyLocation || companyLocation.trim() === '') {
        setError("Please enter company location");
        return;
      }
    }

    setIsLoading(true);

    try {
      const signupData: any = {
        name,
        email,
        password,
        role: selectedRole,
      };

      // Add GST, PAN Card and Company Location for vendor and company roles
      if (selectedRole === 'vendor' || selectedRole === 'company') {
        signupData.gstNumber = gstNumber;
        signupData.panCard = panCard;
        signupData.companyLocation = companyLocation;
      }

      const response = await signup(signupData);

      if (response.success && response.data.user) {
        // Check if user needs approval
        if (response.data.user.approvalStatus === 'pending') {
          // Show success message for pending approval
          setError("");
          // Store message to show on login page
          localStorage.setItem('pendingApprovalMessage', response.message || 'Your account is pending approval. You can login once approved by admin.');
          // Redirect to login page
          navigate('/');
        } else {
          // Redirect based on user role for approved users
          const dashboardPath = getDashboardPath(response.data.user.role);
          navigate(dashboardPath);
        }
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

                {/* GST and Aadhar fields for vendor and company */}
                {(selectedRole === 'vendor' || selectedRole === 'company') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber" className="text-sm font-medium text-foreground">
                        GST Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="gstNumber"
                          type="text"
                          placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                          className="h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          required
                          disabled={isLoading}
                          maxLength={15}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter 15-character GST identification number
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panCard" className="text-sm font-medium text-foreground">
                        PAN Card Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="panCard"
                          type="text"
                          placeholder="Enter 12-character PAN Card number"
                          className="h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                          value={panCard}
                          onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                          required
                          disabled={isLoading}
                          maxLength={12}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter 12-character PAN Card number
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyLocation" className="text-sm font-medium text-foreground">
                        Company Location
                      </Label>
                      <div className="relative">
                        <Input
                          id="companyLocation"
                          type="text"
                          placeholder="Enter company location (e.g., Mumbai)"
                          className="h-11 bg-input border-border focus:ring-2 focus:ring-ring"
                          value={companyLocation}
                          onChange={(e) => setCompanyLocation(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter the city or location of your company
                      </p>
                    </div>
                  </>
                )}

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
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
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