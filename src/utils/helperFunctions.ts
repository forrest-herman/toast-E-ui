export function formatTime(duration_sec: Number) {
  // Hours, minutes and seconds
  const hrs = Math.floor(duration_sec / 3600);
  const mins = Math.floor((duration_sec % 3600) / 60);
  const secs = Math.floor(duration_sec % 60);

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = '';

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }
  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;

  return ret;
}
