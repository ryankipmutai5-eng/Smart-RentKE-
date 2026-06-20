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
  const [properties, setProperties] = useState([])
  const [units, setUnits] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '254',
    email: '',
    property_id: '',
    unit_id: '',
    rent_amount: '',
    deposit_amount: '0',
    due_date: '1',
    start_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchTenants()
  }, [])

  useEffect(() => {
    if (isModalOpen) {
      fetchProperties()
    }
  }, [isModalOpen])

  useEffect(() => {
    if (formData.property_id) {
      fetchUnits(formData.property_id)
    } else {
      setUnits([])
    }
  }, [formData.property_id])

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/tenant-profiles')
      setTenants(response.data)
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties')
      setProperties(response.data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const fetchUnits = async (propertyId: string) => {
    try {
      const response = await axios.get(`/api/properties/${propertyId}/units`)
      // Only show vacant units
      setUnits(response.data.filter((u: any) => u.status === 'vacant'))
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const handleUnitChange = (unitId: string) => {
    const selectedUnit = units.find((u: any) => u.id === unitId) as any
    setFormData({
      ...formData,
      unit_id: unitId,
      rent_amount: selectedUnit ? selectedUnit.rent_amount.toString() : '',
      deposit_amount: selectedUnit ? (selectedUnit.deposit_amount || 0).toString() : '0'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/tenants/onboard', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        property_id: formData.property_id,
        unit_id: formData.unit_id,
        rent_amount: Number(formData.rent_amount),
        deposit_amount: Number(formData.deposit_amount),
        due_day: Number(formData.due_date),
        start_date: formData.start_date
      })
      setIsModalOpen(false)
      setFormData({ 
        name: '', 
        phone: '254', 
        email: '',
        property_id: '',
        unit_id: '',
        rent_amount: '', 
        deposit_amount: '0',
        due_date: '1',
        start_date: new Date().toISOString().split('T')[0]
      })
      fetchTenants()
    } catch (error: any) {
      console.error('Error onboarding tenant:', error)
      alert(error.response?.data?.error || 'Failed to onboard tenant')
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
          tenants.map((tenant: any) => {
            const activeLease = tenant.leases?.[0]
            return (
              <Card key={tenant.id} className="hover:border-emerald-200 transition group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">{tenant.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {activeLease ? activeLease.unit.unit_number : 'No Unit Assigned'}
                    </p>
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
                    <span className="font-medium text-gray-900">
                      KES {activeLease ? Number(activeLease.rent_amount).toLocaleString() : '0'}
                    </span>
                    {activeLease && (
                      <span className="text-xs text-gray-500">Due: Day {activeLease.due_day}</span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. john@example.com" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <select 
                    required
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.property_id}
                    onChange={e => setFormData({...formData, property_id: e.target.value, unit_id: ''})}
                  >
                    <option value="">Select Property</option>
                    {properties.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select 
                    required
                    disabled={!formData.property_id}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
                    value={formData.unit_id}
                    onChange={e => handleUnitChange(e.target.value)}
                  >
                    <option value="">Select Unit</option>
                    {units.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.unit_number} (KES {u.rent_amount})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input 
                    required
                    type="date"
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Day (1-28)</label>
                  <Input 
                    required
                    type="number"
                    min="1"
                    max="28"
                    value={formData.due_date} 
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount</label>
                  <Input 
                    required
                    type="number"
                    value={formData.rent_amount} 
                    onChange={e => setFormData({...formData, rent_amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
                  <Input 
                    required
                    type="number"
                    value={formData.deposit_amount} 
                    onChange={e => setFormData({...formData, deposit_amount: e.target.value})}
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
