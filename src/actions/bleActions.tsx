// Toast-E Service
export const TOAST_E_SERVICE_UUID = '00000023-710e-4a5b-8d75-3e5b444bc3cf';
export const TOAST_E_CHAR_UUID = '00000021-710e-4a5b-8d75-3e5b444bc3cf';

// Timer Service
export const TIMER_SERVICE_UUID = '00000011-710e-4a5b-8d75-3e5b444bc3cf';
export const GET_TIME_CHAR_UUID = '00000012-710e-4a5b-8d75-3e5b444bc3cf';
export const CANCEL_CHAR_UUID = '00000013-710e-4a5b-8d75-3e5b444bc3cf';

export const TARGET_CRISP_CHAR_UUID = '00000022-710e-4a5b-8d75-3e5b444bc3cf';

// State Service
export const STATE_SERVICE_UUID = '00000032-710e-4a5b-8d75-3e5b444bc3cf';
export const STATE_CHAR_UUID = '00000031-710e-4a5b-8d75-3e5b444bc3cf';

// Testing Temperature Service
export const THERMOMETER_SERVICE_UUID = '00000001-710e-4a5b-8d75-3e5b444bc3cf';
export const TEMP_CHAR_UUID = '00000002-710e-4a5b-8d75-3e5b444bc3cf';

// TODO: maybe just 2 services, one for writes and one for notifications?

let value = {
  characteristics: [
    {
      characteristic: '2a50',
      isNotifying: false,
      properties: [Object],
      service: '180a',
    },
    {
      characteristic: '00000002-710e-4a5b-8d75-3e5b444bc3cf',
      descriptors: [Array],
      isNotifying: false,
      properties: [Object],
      service: '00000001-710e-4a5b-8d75-3e5b444bc3cf',
    },
    {
      characteristic: '00000003-710e-4a5b-8d75-3e5b444bc3cf',
      descriptors: [Array],
      isNotifying: false,
      properties: [Object],
      service: '00000001-710e-4a5b-8d75-3e5b444bc3cf',
    },
    {
      characteristic: '00000031-710e-4a5b-8d75-3e5b444bc3cf',
      descriptors: [Array],
      isNotifying: false,
      properties: [Object],
      service: '00000032-710e-4a5b-8d75-3e5b444bc3cf',
    },
    {
      characteristic: '00000012-710e-4a5b-8d75-3e5b444bc3cf',
      descriptors: [Array],
      isNotifying: false,
      properties: [Object],
      service: '00000011-710e-4a5b-8d75-3e5b444bc3cf',
    },
    {
      characteristic: '00000013-710e-4a5b-8d75-3e5b444bc3cf',
      isNotifying: false,
      properties: [Object],
      service: '00000011-710e-4a5b-8d75-3e5b444bc3cf',
    },
    {
      characteristic: '00000021-710e-4a5b-8d75-3e5b444bc3cf',
      descriptors: [Array],
      isNotifying: false,
      properties: [Object],
      service: '00000023-710e-4a5b-8d75-3e5b444bc3cf',
    },
    {
      characteristic: '00000022-710e-4a5b-8d75-3e5b444bc3cf',
      descriptors: [Array],
      isNotifying: false,
      properties: [Object],
      service: '00000023-710e-4a5b-8d75-3e5b444bc3cf',
    },
  ],
  services: [
    {uuid: '180a'},
    {uuid: '00000001-710e-4a5b-8d75-3e5b444bc3cf'},
    {uuid: '00000032-710e-4a5b-8d75-3e5b444bc3cf'},
    {uuid: '00000011-710e-4a5b-8d75-3e5b444bc3cf'},
    {uuid: '00000023-710e-4a5b-8d75-3e5b444bc3cf'},
  ],
};
