import { PlayerProfile, SGStoreState } from '../types/sg';

const STORAGE_KEY = 'sg_html5_portal_store_v2';

export const PLAYER_ACCENTS = [
  '#F59E0B',
  '#10B981',
  '#38BDF8',
  '#F43F5E',
  '#A78BFA',
];

export function createPlayerProfile(name: string, accentHex = PLAYER_ACCENTS[0]): PlayerProfile {
  return {
    id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim().slice(0, 22) || 'Creador',
    accentHex,
    createdAt: Date.now(),
    favorites: [],
    recentOrder: [],
  };
}

function getDefaultStore(): SGStoreState {
  const invitado: PlayerProfile = {
    id: 'player_invitado',
    name: 'Invitado',
    accentHex: PLAYER_ACCENTS[0],
    createdAt: Date.now(),
    favorites: [],
    recentOrder: [],
  };

  const sofia: PlayerProfile = {
    id: 'player_sofia',
    name: 'Sofía',
    accentHex: PLAYER_ACCENTS[1],
    createdAt: Date.now(),
    favorites: [],
    recentOrder: [],
  };

  const mateo: PlayerProfile = {
    id: 'player_mateo',
    name: 'Mateo',
    accentHex: PLAYER_ACCENTS[2],
    createdAt: Date.now(),
    favorites: [],
    recentOrder: [],
  };

  return {
    activePlayerId: invitado.id,
    players: [invitado, sofia, mateo],
    muted: false,
  };
}

export function loadSGStore(): SGStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStore();
    const parsed = JSON.parse(raw) as SGStoreState;
    if (!parsed || !Array.isArray(parsed.players) || parsed.players.length === 0) {
      return getDefaultStore();
    }
    return parsed;
  } catch {
    return getDefaultStore();
  }
}

export function saveSGStore(state: SGStoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

export function updatePlayerInStore(
  store: SGStoreState,
  playerId: string,
  updater: (p: PlayerProfile) => PlayerProfile
): SGStoreState {
  return {
    ...store,
    players: store.players.map((p) => (p.id === playerId ? updater(p) : p)),
  };
}
