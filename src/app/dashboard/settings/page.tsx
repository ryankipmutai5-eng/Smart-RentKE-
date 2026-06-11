"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings as SettingsIcon, Shield, MessageSquare, Building } from 'lucide-react'
import axios from 'axios'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    payhero_api_key: '',
    payhero_merchant_id: '',
    whatsapp_api_token: '',
    whatsapp_instance_id: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings')
      if (response.data) {
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          payhero_api_key: response.data.payhero_api_key || '',
          payhero_merchant_id: response.data.payhero_merchant_id || '',
          whatsapp_api_token: response.data.whatsapp_api_token || '',
          whatsapp_instance_id: response.data.whatsapp_instance_id || ''
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.post('/api/settings', formData)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading settings...</p>

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm">Configure your business and integration details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile */}
        <Card className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
            <Building className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Business Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Payhero Credentials */}
        <Card className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Payhero M-PESA Integration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <Input 
                type="password"
                value={formData.payhero_api_key}
                onChange={e => setFormData({...formData, payhero_api_key: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID / Shortcode</label>
              <Input 
                value={formData.payhero_merchant_id}
                onChange={e => setFormData({...formData, payhero_merchant_id: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* WhatsApp Credentials */}
        <Card className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">WhatsApp Notification (Evolution API)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
              <Input 
                type="password"
                value={formData.whatsapp_api_token}
                onChange={e => setFormData({...formData, whatsapp_api_token: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instance ID</label>
              <Input 
                value={formData.whatsapp_instance_id}
                onChange={e => setFormData({...formData, whatsapp_instance_id: e.target.value})}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
