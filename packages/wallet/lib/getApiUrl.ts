export function getApiUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://byor-api.l2beat.com'
  }

  return 'http://localhost:3000'
}
