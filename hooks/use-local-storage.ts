import { useState, useEffect, useCallback } from 'react'
import { debounce } from '@/lib/utils'

interface SavedRequest {
  id: string
  method: string
  url: string
  headers: Array<{ key: string; value: string }>
  body: string
  timestamp: number
}

const STORAGE_KEY = 'api-tester-history'
const MAX_HISTORY_ITEMS = 10

export function useLocalStorage() {
  const [requests, setRequests] = useState<SavedRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load requests from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setRequests(Array.isArray(parsed) ? parsed : [])
      }
    } catch (err) {
      console.error('Failed to load requests from localStorage:', err)
      setError('Failed to load saved requests')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced save function to prevent excessive localStorage writes
  const debouncedSave = useCallback(
    debounce((requestsToSave: SavedRequest[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requestsToSave))
      } catch (err) {
        console.error('Failed to save requests to localStorage:', err)
        setError('Failed to save request')
      }
    }, 300),
    []
  )

  const saveRequest = useCallback((
    request: Omit<SavedRequest, 'id' | 'timestamp'>
  ) => {
    try {
      const newRequest: SavedRequest = {
        ...request,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }

      const updatedRequests = [newRequest, ...requests.slice(0, MAX_HISTORY_ITEMS - 1)]
      setRequests(updatedRequests)
      debouncedSave(updatedRequests)
      setError(null)
      
      return newRequest
    } catch (err) {
      console.error('Failed to save request:', err)
      setError('Failed to save request')
      return null
    }
  }, [requests, debouncedSave])

  const deleteRequest = useCallback((id: string) => {
    try {
      const updatedRequests = requests.filter(req => req.id !== id)
      setRequests(updatedRequests)
      debouncedSave(updatedRequests)
      setError(null)
    } catch (err) {
      console.error('Failed to delete request:', err)
      setError('Failed to delete request')
    }
  }, [requests, debouncedSave])

  const clearHistory = useCallback(() => {
    try {
      setRequests([])
      localStorage.removeItem(STORAGE_KEY)
      setError(null)
    } catch (err) {
      console.error('Failed to clear history:', err)
      setError('Failed to clear history')
    }
  }, [])

  return {
    requests,
    isLoading,
    error,
    saveRequest,
    deleteRequest,
    clearHistory,
  }
}

export type { SavedRequest }