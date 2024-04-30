import {getIntBytes, toByteArray} from './helperFunctions';

export const MessageTypes = {
  TARGET_CRISPINESS: 0x01,
  READ_STATE: 0x02,
  CANCEL: 0x03,
  RESET: 0x04,
};

export const generateBleMessage = (messageType, payload) => {
  // Generate a message to send to the BLE device
  const messageTypeBytes = new Uint8Array(getIntBytes(messageType, 1));
  const payloadBytes = new Uint8Array([payload]);
  const packetPayload = new Uint8Array([...messageTypeBytes, ...payloadBytes]);
  console.log('messageTypeBytes', messageTypeBytes);
  console.log('payloadBytes', payloadBytes);
  // Convert unsigned int array to base64
  const packetPayloadBase64 = toByteArray(packetPayload);
  // const packetPayloadBase64 = Buffer.toJSON(String.fromCharCode.apply(null, packetPayload), 'base64');
  console.log('packetPayloadBase64', packetPayloadBase64);
  return packetPayloadBase64;
};

// payload options

export function sendTarget(target) {
  return {
    input: target,
    bytes: 1,
  };
}

export const sendCancel = {
  input: 0,
  bytes: 1,
};
