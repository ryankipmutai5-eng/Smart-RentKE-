"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CreditCard, Send, Search, Download } from 'lucide-react'
import axios from 'axios'

export default function PaymentsPage() {
  const [tenants, setTenants] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tenantsRes, paymentsRes] = await Promise.all([
        axios.get('/api/tenants'),
        axios.get('/api/payments')
      ])
      setTenants(tenantsRes.data)
      setPayments(paymentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayment = async (tenantId: string, amount: number) => {
    setProcessingId(tenantId)
    try {
      const response = await axios.post('/api/payments/stk-push', { tenantId, amount })
      alert('STK Push initiated successfully!')
      fetchData()
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(error.response?.data?.error || 'Failed to initiate payment')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDownloadReceipt = (paymentId: string) => {
    window.open(`/api/payments/${paymentId}/receipt`, '_blank')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 text-sm">Collect rent and view transaction history.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Collect Rent</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant: any) => (
            <Card key={tenant.id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{tenant.name}</h3>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{tenant.house_number}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Amount: KES {tenant.rent_amount.toLocaleString()}</p>
              </div>
              <Button 
                onClick={() => handleRequestPayment(tenant.id, tenant.rent_amount)}
                disabled={processingId === tenant.id}
                className="w-full flex items-center justify-center"
              >
                {processingId === tenant.id ? (
                  "Processing..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Request Payment
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tenant</th>
                  <th className="px-6 py-3 font-semibold">House</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No payment records found.</td>
                  </tr>
                ) : (
                  payments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-6 py-4 font-medium text-gray-900">{payment.tenant.name}</td>
                      <td className="px-6 py-4 text-gray-600">{payment.tenant.house_number}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">KES {payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={payment.status as any}>{payment.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payment.status === 'successful' && (
                          <button 
                            onClick={() => handleDownloadReceipt(payment.id)}
                            className="text-emerald-600 hover:text-emerald-700 transition"
                            title="Download Receipt"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        )}
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
  )
}
