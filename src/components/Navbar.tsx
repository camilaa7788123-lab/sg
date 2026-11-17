import React from 'react';
import { PlayerProfile, PortalRoute } from '../types/sg';

interface NavbarProps {
  activeRoute: PortalRoute;
  inGame: boolean;
  activePlayer: PlayerProfile;
  onNavigate: (route: PortalRoute) => void;
  onOpenPlayerModal: () => void;
}

const NAV_ITEMS: Array<{ id: PortalRoute; label: string }> = [
  { id: 'catalog', label: 'Catálogo' },
  { id: 'publish', label: 'Publicar' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'guide', label: 'Guía' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeRoute,
  inGame,
  activePlayer,
  onNavigate,
  onOpenPlayerModal,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0B0F17]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className="font-display text-2xl font-extrabold tracking-tight text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          SG
        </button>

        {/* Zone 2: 4 single-line text links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = !inGame && activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-slate-50'
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-white/25'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenPlayerModal}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="max-w-[140px] truncate">Jugador: {activePlayer.name}</span>
          </button>
        </div>
      </div>

      {/* Compact mobile nav row */}
      <nav className="flex md:hidden items-center justify-between gap-2 border-t border-white/[0.06] px-6 py-2.5 text-xs font-medium overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = !inGame && activeRoute === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
