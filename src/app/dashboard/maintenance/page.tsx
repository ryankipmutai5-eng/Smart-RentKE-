"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Wrench, Plus, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import axios from 'axios'

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [units, setUnits] = useState([])
  const [formData, setFormData] = useState({
    unit_id: '',
    description: '',
    priority: 'medium'
  })

  useEffect(() => {
    fetchTickets()
    fetchUnits()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/maintenance-tickets')
      setTickets(response.data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      // Need all units to assign tickets
      const propertiesRes = await axios.get('/api/properties')
      const allUnits: any[] = []
      for (const prop of propertiesRes.data) {
        const unitsRes = await axios.get(`/api/properties/${prop.id}/units`)
        allUnits.push(...unitsRes.data.map((u: any) => ({ ...u, propertyName: prop.name })))
      }
      setUnits(allUnits)
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/maintenance-tickets', formData)
      setIsModalOpen(false)
      setFormData({ unit_id: '', description: '', priority: 'medium' })
      fetchTickets()
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket')
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await axios.put(`/api/maintenance-tickets/${id}`, { status: 'resolved' })
      fetchTickets()
    } catch (error) {
      console.error('Error resolving ticket:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in-progress': return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'resolved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600 text-sm">Track and manage repair requests.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No maintenance tickets found.</p>
          </Card>
        ) : (
          tickets.map((ticket: any) => (
            <Card key={ticket.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1">{getStatusIcon(ticket.status)}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-medium text-gray-500">{ticket.ticket_number}</span>
                    <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                      {ticket.priority}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 mt-1">{ticket.description}</h3>
                  <p className="text-sm text-gray-600">
                    Unit: {ticket.unit?.unit_number || 'General'} - {ticket.unit?.property?.name || ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {ticket.status !== 'resolved' && (
                  <Button variant="outline" size="sm" onClick={() => handleResolve(ticket.id)}>
                    Mark Resolved
                  </Button>
                )}
                <Badge variant={ticket.status === 'resolved' ? 'success' : 'pending'}>
                  {ticket.status}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <Card className="max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Create Maintenance Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (Optional)</label>
                <select 
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.unit_id}
                  onChange={e => setFormData({...formData, unit_id: e.target.value})}
                >
                  <option value="">General / Common Area</option>
                  {units.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.propertyName} - {u.unit_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Ticket</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
