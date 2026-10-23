// Options shared by the UI and the API.

export const ASPECTS = {
  square: { label: "Square", size: "1024x1024" },
  landscape: { label: "Landscape", size: "1536x1024" },
  portrait: { label: "Portrait", size: "1024x1536" },
} as const;

export type Aspect = keyof typeof ASPECTS;

export const MAX_VARIATIONS = 4;
export const MAX_REQUEST_LENGTH = 1000;
