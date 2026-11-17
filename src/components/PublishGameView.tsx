import React, { useRef, useState } from 'react';
import { ArrowLeft, Code2, Eye, FileCode, Globe, ImagePlus, Play, Upload, X } from 'lucide-react';
import { COVER_ACCENTS, STARTER_HTML5_TEMPLATE } from '../data/gamesCatalog';
import {
  GameAspectRatio,
  GameCategory,
  Html5SourceType,
  PlayerProfile,
  PublishedGame,
} from '../types/sg';

interface PublishGameViewProps {
  activePlayer: PlayerProfile;
  editingGame?: PublishedGame | null;
  onPublish: (game: PublishedGame) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: GameCategory[] = ['Acción', 'Arcade', 'Aventura', 'Estrategia', 'Puzles', 'Otros'];
const ASPECT_RATIOS: Array<{ value: GameAspectRatio; label: string }> = [
  { value: '16:9', label: '16:9 Panorámico' },
  { value: '4:3', label: '4:3 Clásico' },
  { value: '1:1', label: '1:1 Cuadrado' },
  { value: '9:16', label: '9:16 Vertical' },
];

async function resizeCoverImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetW = 640;
        const targetH = 480;
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        const scale = Math.max(targetW / img.width, targetH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (targetW - w) / 2, (targetH - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
}

export const PublishGameView: React.FC<PublishGameViewProps> = ({
  activePlayer,
  editingGame,
  onPublish,
  onCancel,
}) => {
  const [title, setTitle] = useState(editingGame?.title ?? '');
  const [category, setCategory] = useState<GameCategory>(editingGame?.category ?? 'Arcade');
  const [authorName, setAuthorName] = useState(editingGame?.authorName ?? activePlayer.name);
  const [description, setDescription] = useState(editingGame?.description ?? '');
  const [controlsSummary, setControlsSummary] = useState(
    editingGame?.controlsSummary ?? 'Ratón o teclado según las indicaciones del juego'
  );
  const [sourceType, setSourceType] = useState<Html5SourceType>(editingGame?.sourceType ?? 'file');
  const [htmlContent, setHtmlContent] = useState(editingGame?.htmlContent ?? '');
  const [fileName, setFileName] = useState(editingGame?.fileName ?? '');
  const [gameUrl, setGameUrl] = useState(editingGame?.gameUrl ?? '');
  const [aspectRatio, setAspectRatio] = useState<GameAspectRatio>(editingGame?.aspectRatio ?? '16:9');
  const [coverDataUrl, setCoverDataUrl] = useState<string | undefined>(editingGame?.coverDataUrl);
  const [coverAccent, setCoverAccent] = useState<string>(
    editingGame?.coverAccent ?? COVER_ACCENTS[0]
  );

  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const htmlInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const handleHtmlFileChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      setErrorMsg('Selecciona un archivo HTML5 válido (.html o .htm).');
      return;
    }
    try {
      const text = await file.text();
      setHtmlContent(text);
      setFileName(file.name);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.(html|htm)$/i, '').replace(/[-_]+/g, ' '));
      }
      setErrorMsg('');
    } catch {
      setErrorMsg('No se pudo leer el archivo seleccionado.');
    }
  };

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('La portada debe ser una imagen (PNG, JPG o WebP).');
      return;
    }
    try {
      const dataUrl = await resizeCoverImage(file);
      setCoverDataUrl(dataUrl);
      setErrorMsg('');
    } catch {
      setErrorMsg('No se pudo cargar la imagen de portada.');
    }
  };

  const validateSource = (): string | null => {
    if (!title.trim()) return 'Escribe un título para tu juego.';
    if (sourceType === 'file') {
      if (!htmlContent.trim()) return 'Sube un archivo .html con tu juego.';
    } else if (sourceType === 'code') {
      if (!htmlContent.trim()) return 'Pega el código HTML5 de tu juego.';
    } else if (sourceType === 'url') {
      const trimmed = gameUrl.trim();
      if (!trimmed) return 'Introduce la URL HTTPS donde está alojado tu juego HTML5.';
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          return 'La URL debe empezar por https:// o http://.';
        }
      } catch {
        return 'Introduce una URL válida (por ejemplo: https://...).';
      }
    }
    return null;
  };

  const handlePreview = () => {
    const err = validateSource();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    setPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateSource();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const now = Date.now();
      const game: PublishedGame = {
        id: editingGame?.id ?? `game_${now}_${Math.random().toString(36).slice(2, 7)}`,
        title: title.trim(),
        category,
        authorId: editingGame?.authorId ?? activePlayer.id,
        authorName: authorName.trim() || activePlayer.name,
        description: description.trim(),
        controlsSummary: controlsSummary.trim() || 'Ratón o teclado según las indicaciones del juego',
        sourceType,
        htmlContent: sourceType === 'url' ? undefined : htmlContent,
        fileName: sourceType === 'file' ? fileName : undefined,
        gameUrl: sourceType === 'url' ? gameUrl.trim() : undefined,
        aspectRatio,
        coverDataUrl,
        coverAccent,
        playCount: editingGame?.playCount ?? 0,
        createdAt: editingGame?.createdAt ?? now,
        updatedAt: now,
      };
      await onPublish(game);
    } catch {
      setErrorMsg('Ocurrió un error al guardar el juego en el navegador.');
    } finally {
      setSubmitting(false);
    }
  };

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '4:3'
      ? 'aspect-[4/3]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-w-[460px]'
      : 'aspect-[9/16] max-w-[340px]';

  return (
    <section className="mx-auto max-w-[1160px] px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Volver al catálogo
          </button>
          <h1 className="font-display text-3xl font-bold text-slate-50">
            {editingGame ? `Editar: ${editingGame.title}` : 'Publicar juego HTML5'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8 items-start">
        {/* Left: Form */}
        <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#131A26] p-6 sm:p-7">
          {errorMsg && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Source Mode Tabs */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-100">
              1. Fuente del juego HTML5
            </label>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/[0.08] bg-[#0B111C] p-1.5">
              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                  sourceType === 'file' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Subir .html
              </button>
              <button
                type="button"
                onClick={() => setSourceType('code')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                  sourceType === 'code' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" aria-hidden="true" /> Pegar código
              </button>
              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                  sourceType === 'url' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Enlace URL
              </button>
            </div>

            {sourceType === 'file' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleHtmlFileChange(e.dataTransfer.files?.[0]);
                }}
                className="rounded-xl border border-dashed border-white/20 bg-[#0B111C] p-6 text-center space-y-3"
              >
                <input
                  ref={htmlInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={(e) => handleHtmlFileChange(e.target.files?.[0])}
                  className="hidden"
                />
                <FileCode className="mx-auto h-8 w-8 text-amber-400" aria-hidden="true" />
                {fileName ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100">{fileName}</p>
                    <p className="text-xs text-slate-400 tabular-nums">
                      {(new Blob([htmlContent]).size / 1024).toFixed(1)} KB cargados
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">
                    Arrastra tu archivo <span className="font-mono text-amber-300">.html</span> aquí o selecciónalo desde tu equipo.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => htmlInputRef.current?.click()}
                  className="rounded-lg border border-white/15 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700 cursor-pointer"
                >
                  {fileName ? 'Cambiar archivo' : 'Elegir archivo .html'}
                </button>
              </div>
            )}

            {sourceType === 'code' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Pega un documento HTML5 completo (HTML, CSS y JavaScript).
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHtmlContent(STARTER_HTML5_TEMPLATE);
                      if (!title.trim()) setTitle('Objetivo Dorado');
                    }}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    Cargar plantilla HTML5 de ejemplo
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="<!DOCTYPE html><html>...</html>"
                  className="w-full rounded-xl border border-white/10 bg-[#0B111C] p-3.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

            {sourceType === 'url' && (
              <div className="space-y-1.5">
                <input
                  type="url"
                  value={gameUrl}
                  onChange={(e) => setGameUrl(e.target.value)}
                  placeholder="https://tusitio.com/mi-juego/index.html"
                  className="w-full rounded-xl border border-white/10 bg-[#0B111C] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
                />
                <p className="text-xs text-slate-400">
                  Asegúrate de que el servidor permita mostrarse dentro de un marco embebido (<span className="font-mono">iframe</span>).
                </p>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.08]">
            <div className="space-y-1.5">
              <label htmlFor="game-title" className="block text-xs font-semibold text-slate-300">
                Título del juego *
              </label>
              <input
                id="game-title"
                type="text"
                maxLength={60}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Saltos Espaciales"
                className="w-full rounded-xl border border-white/10 bg-[#0B111C] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="game-author" className="block text-xs font-semibold text-slate-300">
                Autor / Creador
              </label>
              <input
                id="game-author"
                type="text"
                maxLength={32}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B111C] px-3.5 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="game-category" className="block text-xs font-semibold text-slate-300">
                Categoría
              </label>
              <select
                id="game-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as GameCategory)}
                className="w-full rounded-xl border border-white/10 bg-[#0B111C] px-3.5 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="game-aspect" className="block text-xs font-semibold text-slate-300">
                Formato de pantalla
              </label>
              <select
                id="game-aspect"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as GameAspectRatio)}
                className="w-full rounded-xl border border-white/10 bg-[#0B111C] px-3.5 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar.value} value={ar.value}>
                    {ar.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="game-desc" className="block text-xs font-semibold text-slate-300">
              Descripción breve
            </label>
            <textarea
              id="game-desc"
              rows={2}
              maxLength={220}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica de qué trata tu juego en una o dos frases..."
              className="w-full rounded-xl border border-white/10 bg-[#0B111C] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="game-controls" className="block text-xs font-semibold text-slate-300">
              Controles
            </label>
            <input
              id="game-controls"
              type="text"
              maxLength={120}
              value={controlsSummary}
              onChange={(e) => setControlsSummary(e.target.value)}
              placeholder="Ej. Flechas para mover · Espacio para saltar"
              className="w-full rounded-xl border border-white/10 bg-[#0B111C] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#0B111C] px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-white/30 cursor-pointer"
            >
              <Eye className="h-4 w-4 text-amber-400" aria-hidden="true" /> Probar juego
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {submitting
                ? 'Guardando...'
                : editingGame
                ? 'Guardar cambios'
                : 'Publicar en SG'}
            </button>
          </div>
        </div>

        {/* Right: Cover Customization & Card Preview */}
        <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#131A26] p-6">
          <div className="space-y-1">
            <h2 className="font-display text-base font-semibold text-slate-100">
              Portada en el catálogo
            </h2>
            <p className="text-xs text-slate-400">
              Sube una captura o elige un color de acento para la tarjeta.
            </p>
          </div>

          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B111C]">
            {coverDataUrl ? (
              <img src={coverDataUrl} alt="Vista previa de portada" className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full flex-col justify-between p-5"
                style={{
                  background: `radial-gradient(circle at 85% 20%, ${coverAccent}26, transparent 55%), linear-gradient(145deg, #131B29 0%, #0B1019 100%)`,
                }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: coverAccent }} />
                <div>
                  <div className="text-xs text-slate-400">{category}</div>
                  <div className="font-display text-xl font-bold text-slate-100 line-clamp-2">
                    {title.trim() || 'Título de tu juego'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverUpload(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B111C] px-3 py-2 text-xs font-medium text-slate-200 hover:border-white/30 cursor-pointer"
            >
              <ImagePlus className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              {coverDataUrl ? 'Cambiar imagen' : 'Subir portada'}
            </button>
            {coverDataUrl && (
              <button
                type="button"
                onClick={() => setCoverDataUrl(undefined)}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                Quitar imagen
              </button>
            )}
          </div>

          {!coverDataUrl && (
            <div className="space-y-2 pt-1">
              <span className="block text-xs text-slate-400">Color de acento:</span>
              <div className="flex items-center gap-2">
                {COVER_ACCENTS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setCoverAccent(hex)}
                    aria-label={`Acento ${hex}`}
                    className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                      coverAccent === hex
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#131A26]'
                        : ''
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#131A26] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-50">
                Vista previa: {title || 'Sin título'}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Cerrar vista previa"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={`mx-auto w-full overflow-hidden rounded-xl border border-white/10 bg-black ${aspectClass}`}>
              {sourceType === 'url' ? (
                <iframe
                  title={`Vista previa ${title}`}
                  src={gameUrl}
                  sandbox="allow-scripts allow-pointer-lock allow-forms allow-same-origin"
                  className="h-full w-full border-0"
                />
              ) : (
                <iframe
                  title={`Vista previa ${title}`}
                  srcDoc={htmlContent}
                  sandbox="allow-scripts allow-pointer-lock allow-forms"
                  className="h-full w-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
