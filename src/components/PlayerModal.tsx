import React, { useState } from 'react';
import { Check, Trash2, UserPlus, X } from 'lucide-react';
import { PlayerProfile, PublishedGame } from '../types/sg';
import { PLAYER_ACCENTS } from '../utils/storage';

interface PlayerModalProps {
  isOpen: boolean;
  players: PlayerProfile[];
  publishedGames: PublishedGame[];
  activePlayerId: string;
  onSelectPlayer: (id: string) => void;
  onCreatePlayer: (name: string, accentHex: string) => void;
  onDeletePlayer: (id: string) => void;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  players,
  publishedGames,
  activePlayerId,
  onSelectPlayer,
  onCreatePlayer,
  onDeletePlayer,
  onClose,
}) => {
  const [newName, setNewName] = useState('');
  const [selectedAccent, setSelectedAccent] = useState(PLAYER_ACCENTS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreatePlayer(trimmed, selectedAccent);
    setNewName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#131A26] p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="player-modal-title" className="font-display text-xl font-bold text-slate-50">
              Perfiles de jugador y creador
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Cada persona publica sus juegos HTML5 bajo su nombre y conserva sus favoritos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {players.map((p) => {
            const isActive = p.id === activePlayerId;
            const authoredCount = publishedGames.filter((g) => g.authorId === p.id).length;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                  isActive
                    ? 'border-amber-400/60 bg-amber-400/10'
                    : 'border-white/[0.08] bg-[#0B111C] hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlayer(p.id);
                    onClose();
                  }}
                  className="flex flex-1 items-center gap-3 text-left cursor-pointer"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-slate-950"
                    style={{ backgroundColor: p.accentHex }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-100 truncate">{p.name}</div>
                    <div className="text-xs text-slate-400 tabular-nums">
                      {authoredCount} {authoredCount === 1 ? 'juego publicado' : 'juegos publicados'} ·{' '}
                      {p.favorites.length} favoritos
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1.5">
                  {isActive && <Check className="h-4 w-4 text-amber-400" aria-hidden="true" />}
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeletePlayer(p.id)}
                      aria-label={`Eliminar perfil ${p.name}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/[0.08] pt-5 space-y-3">
          <label htmlFor="new-player-name" className="block text-xs font-semibold text-slate-300">
            Añadir nuevo jugador
          </label>
          <div className="flex gap-2">
            <input
              id="new-player-name"
              type="text"
              maxLength={22}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Lucía, Carlos..."
              className="flex-1 rounded-xl border border-white/10 bg-[#0B111C] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40 whitespace-nowrap"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" /> Crear
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 mr-1">Color:</span>
            {PLAYER_ACCENTS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setSelectedAccent(hex)}
                aria-label={`Seleccionar color ${hex}`}
                className={`h-6 w-6 rounded-full transition-transform ${
                  selectedAccent === hex ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#131A26]' : ''
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
