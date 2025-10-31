
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Debug: Log fetch implementation to ensure MSW can patch it
// eslint-disable-next-line no-console
if (global.fetch) {
	const fetchStr = global.fetch.toString();
	// Warn if fetch is polyfilled (e.g., by whatwg-fetch or cross-fetch)
	if (fetchStr.includes('[native code]')) {
		console.log('Test fetch implementation: native');
	} else {
		console.warn('Test fetch implementation is NOT native! This may break MSW interception.');
		console.warn(fetchStr);
	}
} else {
	console.warn('No global fetch found in test environment!');
}

// Remove any fetch polyfill before MSW setup
delete global.fetch;

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
global.TextEncoder = require('util').TextEncoder;

const server = setupServer(
	// GET /api/items handler (match any origin)
	rest.get(/.*\/api\/items$/, (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json([
				{ id: 1, name: 'Test Item 1', description: 'Desc 1', completed: 0, due_date: '2026-01-01', priority: 'high', created_at: '2023-01-01T00:00:00.000Z' },
				{ id: 2, name: 'Test Item 2', description: 'Desc 2', completed: 1, due_date: '2026-01-02', priority: 'medium', created_at: '2023-01-02T00:00:00.000Z' },
			])
		);
	}),

	// POST /api/items handler (match any origin)
	rest.post(/.*\/api\/items$/, (req, res, ctx) => {
		const { name, description, due_date, priority } = req.body;
		if (!name || name.trim() === '') {
			return res(
				ctx.status(400),
				ctx.json({ error: 'Item name is required' })
			);
		}
		return res(
			ctx.status(201),
			ctx.json({
				id: 3,
				name,
				description,
				due_date,
				priority,
				completed: 0,
				created_at: new Date().toISOString(),
			})
		);
	}),

	// PUT /api/items/:id handler (match any origin)
	rest.put(/.*\/api\/items\/\d+$/, (req, res, ctx) => {
		const idMatch = req.url.pathname.match(/(\d+)$/);
		const id = idMatch ? idMatch[1] : '1';
		const { completed } = req.body;
		return res(
			ctx.status(200),
			ctx.json({
				id: Number(id),
				name: `Test Item ${id}`,
				description: `Desc ${id}`,
				due_date: `2026-01-0${id}`,
				priority: id === '1' ? 'high' : 'medium',
				completed,
				created_at: '2023-01-01T00:00:00.000Z',
			})
		);
	})
);

// Export for test files to override handlers
export { server, rest };

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
// Polyfill fetch only if still undefined after MSW setup
if (typeof global.fetch === 'undefined') {
	// eslint-disable-next-line no-console
	console.warn('Polyfilling fetch with whatwg-fetch after MSW setup.');
	require('whatwg-fetch');
}
// Do NOT polyfill fetch here. MSW will patch fetch for tests. If you need fetch in node, use MSW's setupServer and handlers in your test files.
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