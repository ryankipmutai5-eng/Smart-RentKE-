"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Phone, Home as HouseIcon } from 'lucide-react'
import axios from 'axios'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    phone: '254',
    house_number: '',
    rent_amount: '',
    due_date: '1'
  })

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/tenants')
      setTenants(response.data)
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/tenants', formData)
      setIsModalOpen(false)
      setFormData({ name: '', phone: '254', house_number: '', rent_amount: '', due_date: '1' })
      fetchTenants()
    } catch (error) {
      console.error('Error creating tenant:', error)
      alert('Failed to create tenant')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 text-sm">Manage your tenant list and contact details.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <Card className="flex items-center px-4 py-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search by name or house number..." 
          className="flex-1 border-none focus:ring-0 text-sm py-2"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading tenants...</p>
        ) : tenants.length === 0 ? (
          <p>No tenants found. Add your first tenant to get started.</p>
        ) : (
          tenants.map((tenant: any) => (
            <Card key={tenant.id} className="hover:border-emerald-200 transition group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">{tenant.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{tenant.house_number}</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-full">
                  <HouseIcon className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {tenant.phone}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-medium text-gray-900">KES {tenant.rent_amount.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">Due: Day {tenant.due_date}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold mb-4">Add New Tenant</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Kamau" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (M-PESA)</label>
                <Input 
                  required
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="2547XXXXXXXX" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                  <Input 
                    required
                    value={formData.house_number} 
                    onChange={e => setFormData({...formData, house_number: e.target.value})}
                    placeholder="e.g. A1" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount</label>
                  <Input 
                    required
                    type="number"
                    value={formData.rent_amount} 
                    onChange={e => setFormData({...formData, rent_amount: e.target.value})}
                    placeholder="15000" 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Tenant</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
