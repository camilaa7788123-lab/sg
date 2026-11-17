import React, { useRef, useState } from 'react';
import { ArrowLeft, Maximize2, Pencil, RotateCcw, Star } from 'lucide-react';
import { GameAspectRatio, PlayerProfile, PublishedGame } from '../types/sg';

interface GameStageProps {
  game: PublishedGame;
  player: PlayerProfile;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onEdit: (game: PublishedGame) => void;
  onBack: () => void;
}

export const GameStage: React.FC<GameStageProps> = ({
  game,
  player,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onBack,
}) => {
  const [runKey, setRunKey] = useState(0);
  const [aspect, setAspect] = useState<GameAspectRatio>(game.aspectRatio);
  const frameWrapRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const isOwner = game.authorId === player.id;

  const handleFullscreen = () => {
    const el = frameWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  const aspectClass =
    aspect === '16:9'
      ? 'aspect-video w-full'
      : aspect === '4:3'
      ? 'aspect-[4/3] max-w-[820px] w-full mx-auto'
      : aspect === '1:1'
      ? 'aspect-square max-w-[600px] w-full mx-auto'
      : 'aspect-[9/16] max-w-[400px] w-full mx-auto';

  return (
    <section className="mx-auto max-w-[1160px] px-6 py-8 space-y-6">
      {/* Stage Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Volver al catálogo
          </button>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50">
              {game.title}
            </h1>
            <span className="text-xs text-slate-400">
              Por {game.authorName} · {game.category} ·{' '}
              <span className="tabular-nums">{game.playCount} partidas</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Relación de aspecto"
            value={aspect}
            onChange={(e) => setAspect(e.target.value as GameAspectRatio)}
            className="rounded-xl border border-white/10 bg-[#131A26] px-3 py-2 text-xs font-medium text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">1:1</option>
            <option value="9:16">9:16</option>
          </select>

          <button
            type="button"
            onClick={() => setRunKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131A26] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-white/25 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reiniciar
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131A26] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-white/25 whitespace-nowrap cursor-pointer"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> Pantalla completa
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(game.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              isFavorite
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                : 'border-white/10 bg-[#131A26] text-slate-300 hover:border-white/25'
            }`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isFavorite ? 'En favoritos' : 'Favorito'}
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => onEdit(game)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131A26] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-amber-400/40 cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Editar
            </button>
          )}
        </div>
      </div>

      {/* Sandboxed HTML5 Iframe Viewport */}
      <div
        ref={frameWrapRef}
        className={`overflow-hidden rounded-2xl border border-white/[0.1] bg-black ${aspectClass}`}
      >
        {game.sourceType === 'url' ? (
          <iframe
            key={runKey}
            ref={iframeRef}
            title={game.title}
            src={game.gameUrl}
            sandbox="allow-scripts allow-pointer-lock allow-forms allow-same-origin"
            onLoad={() => iframeRef.current?.focus()}
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <iframe
            key={runKey}
            ref={iframeRef}
            title={game.title}
            srcDoc={game.htmlContent || ''}
            sandbox="allow-scripts allow-pointer-lock allow-forms"
            onLoad={() => iframeRef.current?.focus()}
            allowFullScreen
            className="h-full w-full border-0"
          />
        )}
      </div>

      {/* Info & Controls Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-white/[0.06] bg-[#131A26]/70 px-5 py-4 text-xs text-slate-400">
        <div>
          <span className="font-semibold text-slate-200">Controles: </span>
          <span>{game.controlsSummary}</span>
        </div>
        <div className="md:text-right">
          Haz clic dentro del área de juego para enfocar el teclado o el puntero.
        </div>
      </div>
    </section>
  );
};
