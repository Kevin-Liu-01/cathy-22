export interface FlyingImage {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  endX: number;
  endY: number;
  endW: number;
  endH: number;
}

export interface FlyoutState {
  image: FlyingImage;
  centered: boolean;
  fading: boolean;
}

export interface TileInfo {
  rect: DOMRect;
  naturalWidth: number;
  naturalHeight: number;
}
