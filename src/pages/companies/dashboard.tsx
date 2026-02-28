import { useState, useEffect } from "react"
import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { getCompanyDashboard } from "@/lib/api"

export default function CompaniesDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const response = await getCompanyDashboard()
        setDashboardData(response.data || response)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <CompanyLayout>
        <div className="p-8">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </CompanyLayout>
    )
  }

  if (error) {
    return (
      <CompanyLayout>
        <div className="p-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </CompanyLayout>
    )
  }

  return (
    <CompanyLayout>
      <div className="p-8">
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
                <p className="text-2xl font-bold text-foreground">{dashboardData?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Branches</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData?.totalBranches || 0}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData?.totalEmployees || 0}</p>
              </div>
              <Package className="h-10 w-10 text-orange-500" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="text-2xl font-bold text-foreground capitalize">{dashboardData?.role || '-'}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Company Features</h2>
          <p className="text-muted-foreground">Company dashboard content goes here...</p>
        </div>
      </div>
    </CompanyLayout>
  )
}
