import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react"
import { Header } from "@/components/header"

export default function CompaniesDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-foreground">Company Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage your purchases and business needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">89</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">$23,456</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <Package className="h-10 w-10 text-orange-500" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Contracts</p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Company Features</h2>
          <p className="text-muted-foreground">Company dashboard content goes here...</p>
        </div>
      </main>
    </div>
  )
}
