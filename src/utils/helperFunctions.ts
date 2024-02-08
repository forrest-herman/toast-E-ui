import {Buffer} from 'buffer';

export function formatTime(duration_sec: number) {
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

export function numberToBytes(num: number) {
  const binary = num.toString(2);
  const paddedBinary = binary.padStart(Math.ceil(binary.length / 8) * 8, '0');
  const bytes = paddedBinary.match(/.{1,8}/g);
  const decimalBytes = bytes.map(byte => parseInt(byte, 2));
  return decimalBytes;
}

export function toBase64(input) {
  return Buffer.from(input, 'utf-8').toString('base64');
}
export function toByteArray(input) {
  return Buffer.from(input).toJSON().data;
}

/**
 * Convert integer to byte array
 * @param value integer value
 * @param count byte length
 * @returns byte array
 */
export function getIntBytes(value, count) {
  var bytes = [];

  for (let i = 0; i < count; i++) {
    bytes[i] = value & (255);
    value = value >> 8
  }
  return bytes
}