"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreditCard, Users, Clock, AlertCircle } from "lucide-react";
import axios from 'axios'

export default function Home() {
  const [stats, setStats] = useState([
    { name: 'Total Collected', value: 'KES 0', icon: CreditCard, color: 'text-emerald-600' },
    { name: 'Pending This Month', value: 'KES 0', icon: Clock, color: 'text-yellow-600' },
    { name: 'Overdue / Debt', value: 'KES 0', icon: AlertCircle, color: 'text-red-600' },
    { name: 'Total Tenants', value: '0', icon: Users, color: 'text-blue-600' },
  ])
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats')
      const { stats: dashboardStats, recentPayments: payments } = response.data

      setStats([
        { name: 'Total Collected', value: `KES ${dashboardStats.totalCollected.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600' },
        { name: 'Pending This Month', value: `KES ${dashboardStats.pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-yellow-600' },
        { name: 'Overdue / Debt', value: `KES ${dashboardStats.overdueAmount.toLocaleString()}`, icon: AlertCircle, color: 'text-red-600' },
        { name: 'Total Tenants', value: dashboardStats.totalTenants.toString(), icon: Users, color: 'text-blue-600' },
      ])

      setRecentPayments(payments)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm">Welcome back, here is your property overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="flex items-center space-x-4">
            <div className={stat.color}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Payments Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          <button className="text-emerald-600 text-sm font-medium hover:underline">View all</button>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tenant</th>
                  <th className="px-6 py-3 font-semibold">House</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent payments.</td>
                  </tr>
                ) : (
                  recentPayments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-6 py-4 font-medium text-gray-900">{payment.tenant_name}</td>
                      <td className="px-6 py-4 text-gray-600">{payment.house_number}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">KES {payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={payment.status as any}>{payment.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
