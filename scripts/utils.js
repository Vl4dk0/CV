export function prettyPrintTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleString("en-GB");
}

export function prettyPrintDuration(sec) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  // only show hours if > 0
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function isMobile() {
  const userAgent = navigator.userAgent;
  if (/Mobi|Android/i.test(userAgent)) {
    return true;
  } else if (/Tablet|iPad/i.test(userAgent)) {
    return true;
  }
  return false;
}
