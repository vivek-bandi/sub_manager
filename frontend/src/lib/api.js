const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}
