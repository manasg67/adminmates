import { useEffect, useState } from "react"
import { Building2, Package, TrendingUp, Plus, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { VendorLayout } from "@/components/vendor/vendor-layout"
import { getVendorStats, type VendorStatsResponse } from "@/lib/api"

export default function VendorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<VendorStatsResponse['stats'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getVendorStats()
      setStats(response.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VendorLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your products and sales</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/vendor/add-product")}
              className="gap-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button
                onClick={() => navigate("/vendor/products")}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-violet-500 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalProducts || 0}</p>
                  </div>
                  <Package className="h-10 w-10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                </div>
              </button>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Active Products</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.active || 0}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Inactive Products</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.inactive || 0}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-slate-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pending Approval</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.pending || 0}</p>
                  </div>
                  <Clock className="h-10 w-10 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Approval Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats?.approved || 0}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats?.pending || 0}</p>
                  </div>
                  <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats?.rejected || 0}</p>
                  </div>
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate("/vendor/add-product")}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 hover:border-violet-500"
                >
                  <Plus className="h-6 w-6 text-violet-600" />
                  <span className="font-semibold">Add New Product</span>
                </Button>
                <Button
                  onClick={() => navigate("/vendor/products")}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 hover:border-violet-500"
                >
                  <Package className="h-6 w-6 text-violet-600" />
                  <span className="font-semibold">View All Products</span>
                </Button>
                <Button
                  onClick={fetchStats}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 hover:border-violet-500"
                >
                  <TrendingUp className="h-6 w-6 text-violet-600" />
                  <span className="font-semibold">Refresh Stats</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </VendorLayout>
  )
}
