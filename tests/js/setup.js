import { vi } from "vitest";

// Mock window.fetch for SVG loading.
global.fetch = vi.fn().mockResolvedValue({
	ok: true,
	text: () => Promise.resolve("<svg></svg>"),
});

// Provide minimal clipboard support.
Object.assign(global.navigator, {
	clipboard: {
		writeText: vi.fn().mockResolvedValue(undefined),
	},
});

// Prevent prompt dialogs from blocking tests.
global.window.prompt = vi.fn();

