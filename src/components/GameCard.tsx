import React from 'react';
import { Code2, Gamepad2, Pencil, Play, Star, Trash2 } from 'lucide-react';
import { PublishedGame } from '../types/sg';
import { GameArtwork } from './GameArtwork';

interface GameCardProps {
  game: PublishedGame;
  isOwner: boolean;
  isFavorite: boolean;
  onPlay: (id: string) => void;
  onEdit: (game: PublishedGame) => void;
  onDelete: (game: PublishedGame) => void;
  onToggleFavorite: (id: string) => void;
}

const SOURCE_LABEL: Record<PublishedGame['sourceType'], string> = {
  file: 'Archivo HTML5',
  code: 'Código HTML5',
  url: 'Enlace web',
};

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isOwner,
  isFavorite,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131A26] transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/[0.16]">
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#0B111C]">
        {game.coverDataUrl ? (
          <GameArtwork
            src={game.coverDataUrl}
            alt={`Portada de ${game.title}`}
            title={game.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="relative flex h-full w-full flex-col justify-between p-5"
            style={{
              background: `radial-gradient(circle at 85% 20%, ${game.coverAccent}26, transparent 55%), linear-gradient(145deg, #131B29 0%, #0B1019 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <Gamepad2 className="h-6 w-6" style={{ color: game.coverAccent }} aria-hidden="true" />
              <Code2 className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-400">{game.category}</div>
              <div className="font-display text-xl font-bold text-slate-100 line-clamp-2">
                {game.title}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-snug text-slate-50 truncate">
              {game.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(game)}
                    aria-label={`Editar ${game.title}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(game)}
                    aria-label={`Eliminar ${game.title}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onToggleFavorite(game.id)}
                aria-label={isFavorite ? `Quitar ${game.title} de favoritos` : `Guardar ${game.title} en favoritos`}
                className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                  isFavorite
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                }`}
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">{game.category}</span>
            <span aria-hidden="true">·</span>
            <span>Por {game.authorName}</span>
            <span aria-hidden="true">·</span>
            <span>{SOURCE_LABEL[game.sourceType]}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{game.playCount} partidas</span>
          </div>

          <p className="text-sm leading-relaxed text-slate-300 line-clamp-2">
            {game.description || 'Juego HTML5 publicado por la comunidad de SG.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onPlay(game.id)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Play className="h-4 w-4" aria-hidden="true" /> Jugar ahora
        </button>
      </div>
    </article>
  );
};
