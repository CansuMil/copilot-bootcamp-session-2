import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';
import { server, resetItems } from './mocks/server';

// Polyfill TextEncoder for jsdom
global.TextEncoder = require('util').TextEncoder;
if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class {
    constructor() {}
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  };
}

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

beforeEach(() => {
  resetItems();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
