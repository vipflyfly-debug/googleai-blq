export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 700;

export const LANE_COLOR = '#d9a65e';
export const GUTTER_COLOR = '#1f2937';

// Increased by ~15% (12 -> 14, 8 -> 9.5)
export const BALL_RADIUS = 14;
export const PIN_RADIUS = 9.5;

export const MAX_FRAMES = 3;

// Physics settings
export const FRICTION = 0.985;
export const VELOCITY_THRESHOLD = 0.1;
export const BOUNCE_FACTOR = 0.5;

// Pin Layout Configuration (Triangle)
// Coordinates relative to canvas width/height
export const PIN_START_Y = 150;
export const PIN_SPACING_X = 30; // Increased spacing for larger pins
export const PIN_SPACING_Y = 26; // Increased spacing for larger pins

// New Boundaries for the Ball (Red Lines)
// The ball must stay between these X coordinates
export const PLAY_AREA_MIN_X = 80;
export const PLAY_AREA_MAX_X = 320;