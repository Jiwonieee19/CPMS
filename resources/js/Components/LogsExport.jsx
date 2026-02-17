import { createContext, useCallback, useContext } from 'react'
import { useToast } from './ToastProvider'
import { jsPDF } from 'jspdf'

const LogsExportContext = createContext(null)

export const useLogsExport = () => {
    const context = useContext(LogsExportContext)
    if (!context) {
        throw new Error('useLogsExport must be used within LogsExportProvider')
    }
    return context
}

export default function LogsExportProvider({ children }) {
    const toast = useToast()

    const downloadLog = useCallback(async (logItem, logType) => {
        try {
            const response = await fetch(`/logs/${logItem.log_id ?? logItem.id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch log details')
            }

            const logData = await response.json()
            const log = logData.log || logItem

            const batchId = log.batch_id || logItem.batch_id
            const rawTask = logItem.task || log.task
            const shouldShowBatch = (logType === 'inventory' || logType === 'process') && batchId
            const displayTask = shouldShowBatch ? `${rawTask}: ${batchId}` : rawTask

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 20
            const contentWidth = pageWidth - (margin * 2)
            let yPosition = margin

            // Header - Company/System Title
            pdf.setFillColor(62, 39, 35) // #3E2723
            pdf.rect(0, 0, pageWidth, 40, 'F')

            pdf.setTextColor(229, 185, 23) // #E5B917
            pdf.setFontSize(24)
            pdf.setFont('helvetica', 'bold')
            pdf.text('CACAO PROCESSING', pageWidth / 2, 20, { align: 'center' })
            pdf.setFontSize(16)
            pdf.text('MANAGEMENT SYSTEM', pageWidth / 2, 30, { align: 'center' })

            yPosition = 55

            // Document Title
            pdf.setTextColor(62, 39, 35) // #3E2723
            pdf.setFontSize(18)
            pdf.setFont('helvetica', 'bold')
            pdf.text('SYSTEM LOG REPORT', pageWidth / 2, yPosition, { align: 'center' })

            yPosition += 15

            // Divider line
            pdf.setDrawColor(229, 185, 23) // #E5B917
            pdf.setLineWidth(0.5)
            pdf.line(margin, yPosition, pageWidth - margin, yPosition)

            yPosition += 10

            // Log Details Section
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(62, 39, 35)

            // Log ID
            pdf.text('Log ID:', margin, yPosition)
            pdf.setFont('helvetica', 'normal')
            pdf.text(log.id || logItem.id, margin + 45, yPosition)
            yPosition += 8

            // Type
            pdf.setFont('helvetica', 'bold')
            pdf.text('Log Type:', margin, yPosition)
            pdf.setFont('helvetica', 'normal')
            pdf.text((logType || '').toUpperCase(), margin + 45, yPosition)
            yPosition += 8

            // Task
            pdf.setFont('helvetica', 'bold')
            pdf.text('Task:', margin, yPosition)
            pdf.setFont('helvetica', 'normal')
            const taskLines = pdf.splitTextToSize(displayTask, contentWidth - 45)
            pdf.text(taskLines, margin + 45, yPosition)
            yPosition += (taskLines.length * 7) + 3

            // Date
            pdf.setFont('helvetica', 'bold')
            pdf.text('Date:', margin, yPosition)
            pdf.setFont('helvetica', 'normal')
            pdf.text(log.date || logItem.date, margin + 45, yPosition)
            yPosition += 8

            // Time Saved
            pdf.setFont('helvetica', 'bold')
            pdf.text('Time Saved:', margin, yPosition)
            pdf.setFont('helvetica', 'normal')
            pdf.text(log.timeSaved || logItem.timeSaved, margin + 45, yPosition)
            yPosition += 8

            // Batch ID (if applicable)
            if (batchId) {
                pdf.setFont('helvetica', 'bold')
                pdf.text('Batch ID:', margin, yPosition)
                pdf.setFont('helvetica', 'normal')
                pdf.text(batchId, margin + 45, yPosition)
                yPosition += 8
            }

            yPosition += 5

            // Divider line
            pdf.setDrawColor(229, 185, 23)
            pdf.setLineWidth(0.5)
            pdf.line(margin, yPosition, pageWidth - margin, yPosition)

            yPosition += 10

            // Details Section
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(12)
            pdf.text('LOG DETAILS:', margin, yPosition)
            yPosition += 8

            // Details box
            pdf.setFillColor(245, 245, 220) // #F5F5DC
            const detailsText = log.description || 'No additional details'
            const detailsLines = pdf.splitTextToSize(detailsText, contentWidth - 10)
            const boxHeight = Math.max((detailsLines.length * 7) + 10, 30)

            pdf.rect(margin, yPosition, contentWidth, boxHeight, 'F')
            pdf.setDrawColor(62, 39, 35)
            pdf.setLineWidth(0.3)
            pdf.rect(margin, yPosition, contentWidth, boxHeight, 'S')

            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(10)
            pdf.setTextColor(62, 39, 35)
            pdf.text(detailsLines, margin + 5, yPosition + 8)

            yPosition += boxHeight + 15

            // Footer
            const footerY = pageHeight - 20
            pdf.setDrawColor(229, 185, 23)
            pdf.setLineWidth(0.3)
            pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

            pdf.setFontSize(8)
            pdf.setTextColor(150, 150, 150)
            pdf.setFont('helvetica', 'italic')
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            pdf.text(`Generated on ${currentDate}`, pageWidth / 2, footerY, { align: 'center' })
            pdf.text('Cacao Processing Management System', pageWidth / 2, footerY + 5, { align: 'center' })

            // Save PDF
            pdf.save(`log_${log.id || logItem.id}_${new Date().toISOString().split('T')[0]}.pdf`)

            toast.success('Log downloaded as PDF successfully!')
        } catch (err) {
            console.error('Error downloading log:', err)
            toast.error('Failed to download log')
        }
    }, [toast])

    return (
        <LogsExportContext.Provider value={{ downloadLog }}>
            {children}
        </LogsExportContext.Provider>
    )
}
