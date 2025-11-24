export enum GamePhase {
  START_SCREEN = 'START_SCREEN',
  AIMING = 'AIMING', // User positioning the ball left/right
  POWER_ANGLE = 'POWER_ANGLE', // User setting power/direction
  ROLLING = 'ROLLING', // Physics simulation running
  TURN_END = 'TURN_END', // Calculating results of a throw
  GAME_OVER = 'GAME_OVER'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface PinEntity {
  id: number;
  position: Vector2;
  velocity: Vector2; // Added velocity for physics
  isDown: boolean;
  opacity: number; // For fading out animation
}

export interface FrameResult {
  frameNumber: number;
  throw1: number; // Pins knocked down in throw 1
  throw2: number; // Pins knocked down in throw 2 (if applicable)
  score: number; // Total score for the frame (including bonus)
  isComplete: boolean;
}

export interface GameConfig {
  maxFrames: number;
  maxThrowsPerFrame: number;
}