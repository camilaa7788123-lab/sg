import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Upload, Users } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { GameStage } from './components/GameStage';
import { PlayerModal } from './components/PlayerModal';
import { PublishGameView } from './components/PublishGameView';
import { GuideView } from './components/GuideView';
import { GameArtwork } from './components/GameArtwork';
import { CATEGORY_FILTERS, HERO_ARCADE_IMAGE } from './data/gamesCatalog';
import { GameCategory, PortalRoute, PublishedGame } from './types/sg';
import { deletePublishedGame, getAllPublishedGames, savePublishedGame } from './utils/gamesDb';
import {
  createPlayerProfile,
  loadSGStore,
  saveSGStore,
  updatePlayerInStore,
} from './utils/storage';

type SortMode = 'recent' | 'played' | 'alpha';

export default function App() {
  const [store, setStore] = useState(loadSGStore);
  const [publishedGames, setPublishedGames] = useState<PublishedGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [route, setRoute] = useState<PortalRoute>('catalog');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<PublishedGame | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'Todos' | GameCategory>('Todos');
  const [onlyMine, setOnlyMine] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [playerModalOpen, setPlayerModalOpen] = useState(false);

  const activePlayer = useMemo(
    () => store.players.find((p) => p.id === store.activePlayerId) || store.players[0],
    [store.activePlayerId, store.players]
  );

  useEffect(() => {
    saveSGStore(store);
  }, [store]);

  useEffect(() => {
    let active = true;
    getAllPublishedGames()
      .then((list) => {
        if (active) setPublishedGames(list);
      })
      .finally(() => {
        if (active) setLoadingGames(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleNavigate = (nextRoute: PortalRoute) => {
    setActiveGameId(null);
    if (nextRoute !== 'publish') {
      setEditingGame(null);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenGame = async (gameId: string) => {
    const target = publishedGames.find((g) => g.id === gameId);
    if (!target) return;

    const updated: PublishedGame = {
      ...target,
      playCount: target.playCount + 1,
    };
    setPublishedGames((prev) => prev.map((g) => (g.id === gameId ? updated : g)));
    savePublishedGame(updated).catch(() => {});

    setStore((prev) =>
      updatePlayerInStore(prev, activePlayer.id, (p) => ({
        ...p,
        recentOrder: [gameId, ...p.recentOrder.filter((id) => id !== gameId)].slice(0, 12),
      }))
    );

    setActiveGameId(gameId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishGame = async (game: PublishedGame) => {
    await savePublishedGame(game);
    setPublishedGames((prev) => {
      const exists = prev.some((g) => g.id === game.id);
      if (exists) return prev.map((g) => (g.id === game.id ? game : g));
      return [game, ...prev];
    });
    setEditingGame(null);
    setRoute('catalog');
    setActiveGameId(game.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGame = async (game: PublishedGame) => {
    await deletePublishedGame(game.id);
    setPublishedGames((prev) => prev.filter((g) => g.id !== game.id));
    if (activeGameId === game.id) setActiveGameId(null);
  };

  const handleStartEdit = (game: PublishedGame) => {
    setActiveGameId(null);
    setEditingGame(game);
    setRoute('publish');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (gameId: string) => {
    setStore((prev) =>
      updatePlayerInStore(prev, activePlayer.id, (p) => {
        const exists = p.favorites.includes(gameId);
        return {
          ...p,
          favorites: exists
            ? p.favorites.filter((id) => id !== gameId)
            : [...p.favorites, gameId],
        };
      })
    );
  };

  const handleCreatePlayer = (name: string, accentHex: string) => {
    const created = createPlayerProfile(name, accentHex);
    setStore((prev) => ({
      ...prev,
      activePlayerId: created.id,
      players: [...prev.players, created],
    }));
    setPlayerModalOpen(false);
  };

  const handleDeletePlayer = (id: string) => {
    setStore((prev) => {
      if (prev.players.length <= 1) return prev;
      const remaining = prev.players.filter((p) => p.id !== id);
      return {
        ...prev,
        activePlayerId: prev.activePlayerId === id ? remaining[0].id : prev.activePlayerId,
        players: remaining,
      };
    });
  };

  const activeGame = activeGameId
    ? publishedGames.find((g) => g.id === activeGameId) || null
    : null;

  const totalPlays = publishedGames.reduce((sum, g) => sum + g.playCount, 0);
  const myPublishedCount = publishedGames.filter((g) => g.authorId === activePlayer.id).length;

  const visibleGames = useMemo(() => {
    const base =
      route === 'favorites'
        ? publishedGames.filter((g) => activePlayer.favorites.includes(g.id))
        : publishedGames;

    const filtered = base.filter((g) => {
      if (onlyMine && g.authorId !== activePlayer.id) return false;
      const catOk = categoryFilter === 'Todos' || g.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const queryOk =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.authorName.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
      return catOk && queryOk;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'played') return b.playCount - a.playCount;
      if (sortMode === 'alpha') return a.title.localeCompare(b.title, 'es');
      return b.createdAt - a.createdAt;
    });
  }, [activePlayer.favorites, activePlayer.id, categoryFilter, onlyMine, publishedGames, route, searchQuery, sortMode]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      <Navbar
        activeRoute={route}
        inGame={Boolean(activeGame)}
        activePlayer={activePlayer}
        onNavigate={handleNavigate}
        onOpenPlayerModal={() => setPlayerModalOpen(true)}
      />

      <main className="flex-1">
        {activeGame ? (
          <GameStage
            game={activeGame}
            player={activePlayer}
            isFavorite={activePlayer.favorites.includes(activeGame.id)}
            onToggleFavorite={handleToggleFavorite}
            onEdit={handleStartEdit}
            onBack={() => setActiveGameId(null)}
          />
        ) : route === 'publish' ? (
          <PublishGameView
            activePlayer={activePlayer}
            editingGame={editingGame}
            onPublish={handlePublishGame}
            onCancel={() => {
              setEditingGame(null);
              setRoute('catalog');
            }}
          />
        ) : route === 'guide' ? (
          <GuideView
            onGoPublish={() => handleNavigate('publish')}
            onGoCatalog={() => handleNavigate('catalog')}
          />
        ) : (
          <div className="mx-auto max-w-[1280px] px-6 py-10 space-y-12">
            {/* Hero Spotlight */}
            {route === 'catalog' && (
              <section className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
                  <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#131A26] p-8 sm:p-10 space-y-8">
                    <div className="space-y-4">
                      <p className="text-xs font-medium text-amber-400">
                        Portal HTML5 SG · Sesión de {activePlayer.name}
                      </p>
                      <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50 leading-[1.08] text-balance max-w-xl">
                        Publica tu juego HTML5 y compártelo al instante.
                      </h1>
                      <p className="text-base text-slate-300 leading-relaxed max-w-lg">
                        Sube tu archivo <span className="font-mono text-slate-200">.html</span>, pega código directo o enlaza una build web. Cada persona publica con su perfil y todos pueden jugar desde el navegador.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleNavigate('publish')}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Upload className="h-4 w-4" aria-hidden="true" /> Publicar juego HTML5
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlayerModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B111C] px-5 py-3 text-sm font-medium text-slate-200 hover:border-white/25 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Users className="h-4 w-4 text-amber-400" aria-hidden="true" /> Cambiar jugador
                      </button>
                    </div>
                  </div>

                  <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131A26]">
                    <GameArtwork
                      src={HERO_ARCADE_IMAGE}
                      alt="Estudio digital de publicación de juegos HTML5 SG"
                      title="SG HTML5"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0F17]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="font-display text-lg font-bold text-slate-50">
                        Creado por la comunidad en HTML5
                      </div>
                      <div className="text-xs text-slate-300">
                        Compatible con Canvas, WebGL, Godot, Phaser, Construct y GDevelop
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-column Summary Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-[#131A26]">
                  <button
                    type="button"
                    onClick={() => setPlayerModalOpen(true)}
                    className="flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs text-slate-400">Jugador activo</div>
                      <div className="font-display text-lg font-bold text-slate-50 truncate max-w-[160px]">
                        {activePlayer.name}
                      </div>
                    </div>
                    <Users className="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
                  </button>

                  <div className="px-5 py-4">
                    <div className="text-xs text-slate-400">Juegos publicados</div>
                    <div className="font-mono text-xl font-bold text-slate-50 tabular-nums">
                      {publishedGames.length}
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <div className="text-xs text-slate-400">Tus publicaciones</div>
                    <div className="font-mono text-xl font-bold text-amber-400 tabular-nums">
                      {myPublishedCount}
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <div className="text-xs text-slate-400">Partidas totales</div>
                    <div className="font-mono text-xl font-bold text-slate-50 tabular-nums">
                      {totalPlays}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Catalog / Favorites */}
            <section className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-50">
                    {route === 'favorites'
                      ? `Favoritos de ${activePlayer.name}`
                      : 'Juegos publicados'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {route === 'favorites'
                      ? 'Juegos HTML5 guardados con estrella en tu perfil.'
                      : 'Explora los juegos HTML5 publicados o sube el tuyo propio.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#131A26] px-3 py-2 text-xs font-medium text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyMine}
                      onChange={(e) => setOnlyMine(e.target.checked)}
                      className="h-3.5 w-3.5 accent-amber-500"
                    />
                    Solo mis juegos
                  </label>

                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por título o autor..."
                      className="w-56 rounded-xl border border-white/10 bg-[#131A26] py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <select
                    aria-label="Ordenar juegos"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="rounded-xl border border-white/10 bg-[#131A26] px-3 py-2 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="played">Más jugados</option>
                    <option value="alpha">Alfabético (A–Z)</option>
                  </select>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#131A26] p-1.5 w-fit">
                {CATEGORY_FILTERS.map((cat) => {
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Games Grid or Empty State */}
              {loadingGames ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#131A26] p-12 text-center text-sm text-slate-400">
                  Cargando juegos publicados...
                </div>
              ) : visibleGames.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#131A26] p-12 text-center space-y-4">
                  <h3 className="font-display text-xl font-bold text-slate-100">
                    {publishedGames.length === 0
                      ? 'Todavía no hay juegos HTML5 publicados'
                      : route === 'favorites'
                      ? 'No tienes juegos en favoritos'
                      : 'No hay resultados con esos filtros'}
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-slate-400">
                    {publishedGames.length === 0
                      ? 'Sube tu primer archivo .html, pega código HTML5 o enlaza un juego web para inaugurarlo en el catálogo de SG.'
                      : 'Prueba quitando algún filtro o publica un nuevo juego HTML5.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleNavigate('publish')}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" /> Publicar juego HTML5
                    </button>
                    {publishedGames.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryFilter('Todos');
                          setSearchQuery('');
                          setOnlyMine(false);
                          setRoute('catalog');
                        }}
                        className="rounded-xl border border-white/10 bg-[#0B111C] px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-white/25 cursor-pointer"
                      >
                        Restablecer filtros
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isOwner={game.authorId === activePlayer.id}
                      isFavorite={activePlayer.favorites.includes(game.id)}
                      onPlay={handleOpenGame}
                      onEdit={handleStartEdit}
                      onDelete={handleDeleteGame}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.08] bg-[#0B0F17] py-6">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 text-xs text-slate-500">
          <span>SG · Plataforma abierta de juegos HTML5</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigate('catalog')}
              className="hover:text-slate-300 cursor-pointer"
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('publish')}
              className="hover:text-slate-300 cursor-pointer"
            >
              Publicar
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('guide')}
              className="hover:text-slate-300 cursor-pointer"
            >
              Guía
            </button>
          </div>
        </div>
      </footer>

      <PlayerModal
        isOpen={playerModalOpen}
        players={store.players}
        publishedGames={publishedGames}
        activePlayerId={activePlayer.id}
        onSelectPlayer={(id) => setStore((s) => ({ ...s, activePlayerId: id }))}
        onCreatePlayer={handleCreatePlayer}
        onDeletePlayer={handleDeletePlayer}
        onClose={() => setPlayerModalOpen(false)}
      />
    </div>
  );
}
