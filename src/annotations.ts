import type { ToolAnnotations } from '@modelcontextprotocol/server';

// Tool annotation presets. MCP clients use these hints to decide what to ask
// approval for, so all four are always set rather than left to client defaults.
//
//   READ         reads from Spotify
//   WRITE        changes playback, the queue or the library, reversibly
//   DESTRUCTIVE  deletes, or overwrites what was there

export const READ = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const satisfies ToolAnnotations;

export const WRITE = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
} as const satisfies ToolAnnotations;

export const DESTRUCTIVE = {
  ...WRITE,
  destructiveHint: true,
} as const satisfies ToolAnnotations;
