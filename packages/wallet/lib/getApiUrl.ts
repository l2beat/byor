export function getApiUrl(): string {
    if (process.env.NODE_ENV === 'production') {
        return 'http://api.byor.l2beat.com:3000'
    }

    return 'http://localhost:3000'
}
