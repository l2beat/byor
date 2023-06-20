export function formatTimeDifferenceFromNow(timestamp: number) {
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - timestamp;

  // Convert time difference to seconds, minutes, hours, days
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return seconds + ' sec ago';
  } else if (minutes < 60) {
    return minutes + ' min ago';
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : hours + ' hours ago';
  } else {
    return days === 1 ? '1 day ago' : hours + ' days ago';
  }
}
