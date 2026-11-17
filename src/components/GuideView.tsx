import React from 'react';

interface GuideViewProps {
  onGoPublish: () => void;
  onGoCatalog: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onGoPublish, onGoCatalog }) => {
  return (
    <section className="mx-auto max-w-[1040px] px-6 py-12 space-y-12">
      <div className="space-y-3 max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-50 text-balance">
          Publicar juegos HTML5 en SG
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          SG funciona como una sala abierta donde cualquier creador puede subir o enlazar sus propios juegos HTML5 y compartirlos en el catálogo local para que todos puedan jugarlos al instante.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-white/[0.08] py-8">
        <div className="space-y-2">
          <div className="font-display text-lg font-semibold text-amber-400">01. Elige tu formato</div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Sube un archivo <span className="font-mono text-slate-200">.html</span> único (exportado desde Godot, Construct, GDevelop, Phaser o Canvas), pega el código directamente o enlaza una URL HTTPS.
          </p>
        </div>
        <div className="space-y-2">
          <div className="font-display text-lg font-semibold text-amber-400">02. Configura la ficha</div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Añade título, categoría, controles recomendados, relación de aspecto (<span className="font-mono text-slate-200">16:9</span>, <span className="font-mono text-slate-200">4:3</span>, <span className="font-mono text-slate-200">1:1</span> o <span className="font-mono text-slate-200">9:16</span>) y una portada opcional.
          </p>
        </div>
        <div className="space-y-2">
          <div className="font-display text-lg font-semibold text-amber-400">03. Prueba y publica</div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Verifica que tu juego responde bien en el reproductor integrado antes de publicarlo. Podrás editarlo o eliminarlo en cualquier momento desde tu perfil.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#131A26] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <h2 className="font-display text-xl font-bold text-slate-50">
            ¿Tienes listo un archivo o prototipo HTML5?
          </h2>
          <p className="text-sm text-slate-400">
            También puedes cargar una plantilla básica de Canvas dentro del editor si quieres probar cómo se ve publicado al momento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onGoPublish}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Publicar juego
          </button>
          <button
            type="button"
            onClick={onGoCatalog}
            className="rounded-xl border border-white/10 bg-[#0B111C] px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-white/25 transition-colors cursor-pointer"
          >
            Ver catálogo
          </button>
        </div>
      </div>
    </section>
  );
};
