import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { jsPDF } from 'jspdf'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        tenant: true,
        landlord: true
      }
    })

    if (!payment || payment.status !== 'successful') {
      return NextResponse.json({ error: 'Payment not found or not successful' }, { status: 404 })
    }

    const doc = new jsPDF()

    // Add content to PDF
    doc.setFontSize(22)
    doc.text('RENT RECEIPT', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Receipt No: ${payment.id}`, 20, 40)
    doc.text(`Date: ${new Date(payment.paid_at!).toLocaleDateString()}`, 20, 50)
    
    doc.line(20, 60, 190, 60)
    
    doc.text('Landlord:', 20, 70)
    doc.text(payment.landlord.name, 60, 70)
    
    doc.text('Tenant:', 20, 80)
    doc.text(payment.tenant.name, 60, 80)
    
    doc.text('House No:', 20, 90)
    doc.text(payment.tenant.house_number, 60, 90)
    
    doc.line(20, 100, 190, 100)
    
    doc.setFontSize(14)
    doc.text('Amount Paid:', 20, 115)
    doc.text(`KES ${payment.amount.toLocaleString()}`, 60, 115)
    
    doc.setFontSize(10)
    doc.text('Thank you for your payment.', 105, 140, { align: 'center' })
    
    if (payment.payhero_reference) {
      doc.text(`MPESA Reference: ${payment.payhero_reference}`, 105, 150, { align: 'center' })
    }

    const pdfOutput = doc.output('arraybuffer')

    return new Response(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${payment.id}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 })
  }
}
