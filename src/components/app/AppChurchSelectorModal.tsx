import React, { useState, useMemo } from 'react';
import { ChurchProfile } from '../../types';
import {
  getChurchCatalog,
  getSelectedChurchId,
  setSelectedChurchId,
} from '../../services/churchCatalogService';
import {
  Search,
  MapPin,
  CheckCircle2,
  Sparkles,
  Building2,
  X,
  Radio,
  ExternalLink,
  QrCode,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';

interface AppChurchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChurch?: (church: ChurchProfile) => void;
  canClose?: boolean; // Se for o primeiro acesso obrigatório, canClose pode ser false
}

export const AppChurchSelectorModal: React.FC<AppChurchSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectChurch,
  canClose = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [activeChurchId, setActiveChurchId] = useState<string>(() => getSelectedChurchId());
  const [quickCode, setQuickCode] = useState('');
  const [quickCodeError, setQuickCodeError] = useState('');

  const catalog = useMemo(() => getChurchCatalog(), [isOpen]);

  // Unique cities for quick filter
  const cities = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set);
  }, [catalog]);

  // Filtered churches
  const filteredChurches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalog.filter((c) => {
      const matchCity =
        selectedCityFilter === 'all' ||
        c.city.toLowerCase() === selectedCityFilter.toLowerCase();

      if (!matchCity) return false;
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.neighborhood?.toLowerCase().includes(q) ||
        c.pastorPresident?.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    });
  }, [catalog, searchQuery, selectedCityFilter]);

  if (!isOpen) return null;

  const handlePickChurch = (church: ChurchProfile) => {
    setSelectedChurchId(church.id);
    setActiveChurchId(church.id);
    if (onSelectChurch) {
      onSelectChurch(church);
    }
    onClose();
  };

  const handleApplyQuickCode = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickCodeError('');
    const code = quickCode.trim().toLowerCase();
    if (!code) return;

    const found = catalog.find(
      (c) => c.id.toLowerCase() === code || c.slug.toLowerCase() === code
    );
    if (found) {
      handlePickChurch(found);
    } else {
      setQuickCodeError('Congregação não encontrada com este código. Tente pesquisar pelo nome abaixo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="relative p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900">
          {canClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Encontre sua Igreja
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Selecione sua congregação para carregar cultos, células e mídias
              </p>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, pastor, bairro ou cidade..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* City Chips */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCityFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCityFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              Todas as Cidades
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCityFilter(city)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCityFilter === city
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Content / Church List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredChurches.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-300">Nenhuma igreja encontrada</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Tente buscar por termos mais simples, como &quot;Manaus&quot;, &quot;MACDP&quot; ou o nome do bairro.
              </p>
            </div>
          ) : (
            filteredChurches.map((church) => {
              const isSelected = church.id === activeChurchId;
              return (
                <div
                  key={church.id}
                  onClick={() => handlePickChurch(church)}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Logo */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={church.logoUrl || '/icon-192.png'}
                        alt={church.shortName}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon-192.png';
                        }}
                      />
                      {church.isLiveNow && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-slate-900"></span>
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
                          {church.shortName}
                        </h3>
                        {church.isVerified && (
                          <span title="Igreja Oficial Verificada" className="inline-flex">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          </span>
                        )}
                        {church.isLiveNow && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5 animate-pulse" /> Ao Vivo
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 truncate mt-0.5">{church.name}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          {church.neighborhood ? `${church.neighborhood}, ` : ''}
                          {church.city} - {church.state}
                        </span>
                        {church.pastorPresident && (
                          <span className="flex items-center gap-1 text-slate-500 hidden sm:flex">
                            <User className="w-3.5 h-3.5" />
                            {church.pastorPresident}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center justify-end sm:flex-shrink-0">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selecionada
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-all group-hover:border-amber-500/40"
                      >
                        Acessar
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Quick Code / QR section */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Tem o código da congregação?</span>
            </div>
            <form onSubmit={handleApplyQuickCode} className="flex gap-2">
              <input
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Ex: macdp-central, macdp-norte..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
              >
                Entrar
              </button>
            </form>
            {quickCodeError && (
              <p className="text-[11px] text-red-400 mt-1.5">{quickCodeError}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>O app memorizará sua congregação automaticamente.</span>
          {canClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white underline font-medium"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
