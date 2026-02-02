import { Building2, Package, TrendingUp, DollarSign, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { VendorLayout } from "@/components/vendor/vendor-layout"

export default function VendorDashboard() {
  const navigate = useNavigate()

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate("/vendor/products")}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-violet-500 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">124</p>
              </div>
              <Package className="h-10 w-10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
            </div>
          </button>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">$45,678</p>
              </div>
              <DollarSign className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Orders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">234</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">$12,345</p>
              </div>
              <DollarSign className="h-10 w-10 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Vendor Features</h2>
          <p className="text-slate-600 dark:text-slate-400">Vendor dashboard content goes here...</p>
        </div>
      </div>
    </VendorLayout>
  )
}
