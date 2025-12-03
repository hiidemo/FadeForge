export interface GradientSettings {
  angle: number; // 0 to 360
  startPoint: number; // 0 to 100%
  endPoint: number; // 0 to 100%
  invert: boolean;
  type: 'linear' | 'radial';
}

export interface ImageSize {
  width: number;
  height: number;
}
