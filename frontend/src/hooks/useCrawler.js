import { useState } from 'react'
import axios from 'axios'

export function useCrawler() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [htmlContent, setHtmlContent] = useState('')

    const crawl = async (urlToCrawl) => {
        if (!urlToCrawl) return
        setLoading(true)
        setError(null)
        setData(null)

        try {
            const response = await axios.post('/crawl', { url: urlToCrawl })
            const result = response.data

            if (result.success) {
                setData(result)
                setHtmlContent(result.html)
                return result
            } else {
                setError(result.error || 'Failed to crawl URL')
                return null
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'An unexpected error occurred')
            return null
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setData(null)
        setUrl('')
        setHtmlContent('')
        setError(null)
    }

    return {
        url,
        setUrl,
        loading,
        data,
        error,
        htmlContent,
        setHtmlContent,
        crawl,
        reset,
        setData
    }
}
