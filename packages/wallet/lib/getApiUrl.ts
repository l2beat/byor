export function getApiUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://byor-l2beat.fly.dev'
  }

  return 'http://localhost:3000'
}
