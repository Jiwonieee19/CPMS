import { createContext, useCallback, useContext } from 'react'
import { useToast } from './ToastProvider'

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

            let content = `LOG ID: ${log.id || logItem.id}\n`
            content += `TYPE: ${(logType || '').toUpperCase()}\n`
            content += `TASK: ${displayTask}\n`
            content += `DATE: ${log.date || logItem.date}\n`
            content += `TIME SAVED: ${log.timeSaved || logItem.timeSaved}\n`
            if (batchId) {
                content += `BATCH ID: ${batchId}\n`
            }
            content += `\nDETAILS:\n${log.description || 'No additional details'}\n`

            const blob = new Blob([content], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `log_${log.id || logItem.id}_${new Date().toISOString().split('T')[0]}.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
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
