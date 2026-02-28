"use client"

import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  FileText,
  BarChart3,
  Users,
  ShoppingCart,
  Bell,
  Lock,
  TrendingDown,
  ArrowRight,
  Menu,
  X,
  Zap,
  Package,
  Briefcase,
  Building,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const features = [
  {
    icon: CheckCircle2,
    title: "Assigned Vendors Only",
    description: "Work exclusively with pre-vetted, company-approved providers.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    title: "Centralized Billing",
    description: "Standard pricing, unified invoices, and SLA-backed execution.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Lock,
    title: "Prepaid & Postpaid",
    description: "Recharge wallet or use a 15-day credit cycle—your choice.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description: "Email and dashboard alerts for orders, deliveries, and budgets.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: ShoppingCart,
    title: "Inventory & Consumption",
    description: "Live inventory tracking for office supplies across locations with reorder thresholds.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "RFQ & Tendering",
    description: "Request quotes for new contracts, compare L1/L2/L3 automatically.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Briefcase,
    title: "Approval Workflow",
    description: "Maker-Checker-Approver levels, amount-based rules, and full audit history.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Freelance Admin Consultation",
    description: "On-demand experts for audits, setup, vendor onboarding, and policy standardization.",
    color: "from-teal-500 to-cyan-500",
  },
]

const clientFeatures = [
  {
    icon: Lock,
    title: "Login",
    description: "Access with official company email; role-based permissions for teams.",
  },
  {
    icon: ShoppingCart,
    title: "Order Placement",
    description: "Add to cart from catalog, raise custom requests, or place quick reorders.",
  },
  {
    icon: FileText,
    title: "Request a Quote (RFQ)",
    description: "Create RFQs for new contracts, attach specs/BOQ, and collect multiple bids.",
  },
  {
    icon: BarChart3,
    title: "Quote Comparison",
    description: "Auto-rank L1/L2/L3 with side-by-side comparison and variance highlights.",
  },
  {
    icon: CheckCircle2,
    title: "Approval Workflow",
    description: "Maker-Checker-Approver levels, amount thresholds, remarks trail, and audit log.",
  },
  {
    icon: Lock,
    title: "Payments",
    description: "Prepaid wallet or 15-day postpaid; GST-compliant invoicing.",
  },
]

const savings = [
  { item: "Office Stationery (Monthly Bulk)", original: "₹18,500", saved: "₹14,800", saving: "₹3,700" },
  { item: "Chair Repairs (10 units)", original: "₹7,000", saved: "₹5,200", saving: "₹1,800" },
  { item: "Pest Control AMC (Monthly)", original: "₹9,000", saved: "₹6,500", saving: "₹2,500" },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/30 bg-white/95 backdrop-blur-xl dark:border-slate-800/30 dark:bg-slate-950/95 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-violet-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50" />
              <span className="text-2xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Admin Mates</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Button
                onClick={() => navigate("/login")}
                className="bg-linear-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-500/30 font-semibold"
              >
                Get Started
              </Button>
            </div>
            <button
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
              <a
                href="#features"
                className="block px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="block px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Benefits
              </a>
              <a
                href="#savings"
                className="block px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Savings
              </a>
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-linear-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 font-semibold"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 md:py-32 lg:py-40">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 dark:bg-blue-600/30 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 dark:bg-purple-600/30 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">✨ The All-in-One Procurement Platform</p>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight drop-shadow-lg">
              Simplify Your Office Procurement
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              One unified platform for office supplies, AMC, and vendor management. Pre-negotiated rates, centralized billing, real-time tracking, and approval workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700 gap-2 text-lg px-8 py-7 shadow-2xl shadow-blue-600/30 font-semibold rounded-xl font-black"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 dark:hover:bg-white/5 text-lg px-8 py-7 font-semibold rounded-xl backdrop-blur-sm font-black"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Admin Mates */}
      <section id="features" className="relative py-20 md:py-28 bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-600/10 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Why Admin Mates?
            </h2>
            <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to streamline office procurement and save time and money
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/80 p-8 shadow-lg hover:shadow-2xl hover:border-blue-400/30 dark:hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-transparent dark:from-blue-600/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${feature.color} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-40 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Who It's For
            </h2>
            <p className="text-xl text-slate-300">Perfect for teams of all sizes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Admin & Facility Teams",
                description: "Standardize requisitions, SLAs, and documentation across your organization.",
                icon: Users,
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Procurement Managers",
                description: "Pre-negotiated pricing and vendor accountability with detailed tracking.",
                icon: Briefcase,
                color: "from-purple-500 to-indigo-500"
              },
              {
                title: "Mid to Large Corporates",
                description: "Multi-location control with unified dashboards and consolidated reporting.",
                icon: Building,
                color: "from-indigo-500 to-blue-500"
              },
            ].map((item, idx) => {
              const ItemIcon = item.icon
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${item.color} mb-4 shadow-lg`}>
                    <ItemIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-10 shadow-lg hover:border-blue-500/30 transition">
            <h3 className="text-2xl font-bold text-white mb-8">
              What You Can Manage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Package, text: "Office Utilities & Supplies" },
                { icon: Zap, text: "AMC (Annual Maintenance)" },
                { icon: Briefcase, text: "Repairs & Maintenance" },
              ].map((item, idx) => {
                const ItemIcon = item.icon
                return (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-700/40 transition">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-500 flex-shrink-0 shadow-lg">
                      <ItemIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Client Features */}
      <section id="benefits" className="relative py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Powerful Client Features
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything your team needs to manage orders, approvals, and payments seamlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clientFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 dark:from-slate-800/50 to-blue-50/50 dark:to-slate-900/50 p-8 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 dark:hover:border-blue-500/30"
                >
                  <div className="relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Multi-Location Reporting */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Unified Dashboard & Reporting
            </h2>
            <p className="text-xl text-slate-300">Multi-location control in one place</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { icon: BarChart3, title: "Consolidated Reports", desc: "One-click monthly spend across all branches." },
                { icon: Package, title: "Location Breakdown", desc: "Track orders, consumption, and AMC per floor." },
                { icon: Lock, title: "Budget Control", desc: "Complete visibility for admin & finance teams." },
              ].map((item, idx) => {
                const ItemIcon = item.icon
                return (
                  <div key={idx} className="flex gap-4 items-start p-6 rounded-xl bg-slate-800/50 dark:bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800/70 transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex-shrink-0 shadow-lg">
                      <ItemIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-10 shadow-lg hover:border-blue-500/30 transition">
              <h3 className="text-3xl font-black text-white mb-4">
                Unified Admin Dashboard
              </h3>
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                Forget juggling multiple systems and sheets. Get complete visibility into your procurement operations with our centralized dashboard that consolidates data from all locations.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-slate-200">Real-time analytics and insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-slate-200">Customizable reports and exports</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-slate-200">Multi-level approval tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Savings */}
      <section id="savings" className="relative py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              See Your Savings
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Upload your recent invoices and discover how much you can save with Admin Mates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                Sample Savings Potential
              </h3>
              <div className="space-y-4">
                {savings.map((item) => (
                  <div
                    key={item.item}
                    className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 dark:from-slate-800/50 to-blue-50/50 dark:to-slate-900/50 p-6 shadow-md hover:shadow-lg transition-all hover:border-blue-500/50 dark:hover:border-blue-500/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">{item.item}</p>
                      <span className="inline-block px-3 py-1 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg">
                        Save {item.saving}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400 line-through text-sm">{item.original}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.saved}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
                <p className="text-lg font-black">
                  💰 Total Potential Saving: <span className="text-2xl">₹8,000+</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 dark:from-slate-800/50 to-blue-50/50 dark:to-slate-900/50 p-12 shadow-md flex flex-col items-center justify-center text-center hover:shadow-lg transition hover:border-blue-500/50 dark:hover:border-blue-500/30">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg mb-6">
                <TrendingDown className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                Upload & Get Your Report
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg">
                Send PDF/Images of your invoices securely. We'll analyze and send you a detailed savings report.
              </p>
              <Button
                className="bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg font-semibold rounded-xl px-8 py-6 text-lg"
              >
                Upload Invoice
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Differently */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              How We Work Differently
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">What sets Admin Mates apart</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Pre‑negotiated Rates",
                description: "No price volatility or hidden markups.",
                icon: Zap,
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "Vendors Pay",
                description: "You don't bear commissions — vendors do.",
                icon: DollarSign,
                color: "from-indigo-500 to-indigo-600"
              },
              {
                title: "SLA‑Driven",
                description: "On‑time delivery, no delay penalties.",
                icon: CheckCircle2,
                color: "from-blue-600 to-indigo-600"
              },
              {
                title: "One Platform",
                description: "Consolidation reduces admin overhead.",
                icon: Package,
                color: "from-indigo-600 to-blue-600"
              },
            ].map((item, idx) => {
              const ItemIcon = item.icon
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 dark:from-slate-800/50 to-blue-50/50 dark:to-slate-900/50 p-6 shadow-md hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all text-center hover:-translate-y-1"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${item.color} mx-auto mb-4 shadow-lg`}>
                    <ItemIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 p-12 md:p-16 text-center text-white shadow-2xl shadow-purple-500/30 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Ready to Transform Your Procurement?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join hundreds of companies saving time and money with Admin Mates
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => navigate("/login")}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-slate-100 gap-2 text-lg px-8 py-7 font-black shadow-xl rounded-xl"
                >
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p className="mb-4">© 2026 Admin Mates. All rights reserved.</p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
