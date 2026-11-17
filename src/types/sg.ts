export type GameCategory = 'Acción' | 'Arcade' | 'Aventura' | 'Estrategia' | 'Puzles' | 'Otros';

export type PortalRoute = 'catalog' | 'publish' | 'favorites' | 'guide';

export type Html5SourceType = 'file' | 'code' | 'url';

export type GameAspectRatio = '16:9' | '4:3' | '1:1' | '9:16';

export interface PublishedGame {
  id: string;
  title: string;
  category: GameCategory;
  authorId: string;
  authorName: string;
  description: string;
  controlsSummary: string;
  sourceType: Html5SourceType;
  htmlContent?: string;
  fileName?: string;
  gameUrl?: string;
  aspectRatio: GameAspectRatio;
  coverDataUrl?: string;
  coverAccent: string;
  playCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  accentHex: string;
  createdAt: number;
  favorites: string[];
  recentOrder: string[];
}

export interface SGStoreState {
  activePlayerId: string;
  players: PlayerProfile[];
  muted: boolean;
}
