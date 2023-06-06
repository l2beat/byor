export function formatUnixTimestampMs(timestampMs: number): string {
  const date = new Date(timestampMs)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const year = date.getUTCFullYear()
  const month = months[date.getUTCMonth()]
  const day = `0${date.getUTCDate()}`.slice(-2)
  const hours = `0${date.getUTCHours()}`.slice(-2)
  const minutes = `0${date.getUTCMinutes()}`.slice(-2)
  const seconds = `0${date.getUTCSeconds()}`.slice(-2)

  return `${year} ${month} ${day} ${hours}:${minutes}:${seconds} (UTC)`
}

export function formatUnixTimestampMsOrDefault(
  timestampMs: number | null,
  defaultString: string,
): string {
  if (timestampMs) {
    return formatUnixTimestampMs(timestampMs)
  }

  return defaultString
}
