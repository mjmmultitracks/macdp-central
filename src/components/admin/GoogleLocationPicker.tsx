import React, { useState, useEffect, useRef } from 'react';
import { EventLocationDetails } from '../../types';
import {
  searchGooglePlaces,
  getGoogleMapsEmbedUrl,
  getGoogleMapsDirectionsUrl,
  toLocationDetails,
  PlaceSearchResult,
} from '../../services/googleMapsService';
import {
  MapPin,
  Search,
  Check,
  ExternalLink,
  X,
  Navigation,
  Building2,
  Sparkles,
  Map,
} from 'lucide-react';

interface GoogleLocationPickerProps {
  value: string;
  locationDetails?: EventLocationDetails;
  onChange: (address: string, details?: EventLocationDetails) => void;
}

export const GoogleLocationPicker: React.FC<GoogleLocationPickerProps> = ({
  value,
  locationDetails,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpenSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search places with debounce
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const places = await searchGooglePlaces(searchTerm);
        setResults(places);
        setIsOpenSuggestions(true);
      } catch (e) {
        console.error('Erro ao buscar locais:', e);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectPlace = (place: PlaceSearchResult) => {
    const details = toLocationDetails(place);
    setSearchTerm(place.fullAddress);
    setIsOpenSuggestions(false);
    onChange(place.fullAddress, details);
  };

  const handleManualBlur = () => {
    if (searchTerm !== value) {
      onChange(searchTerm, locationDetails);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    searchGooglePlaces(presetId).then((places) => {
      if (places.length > 0) {
        handleSelectPlace(places[0]);
      }
    });
  };

  const mapsEmbedUrl = getGoogleMapsEmbedUrl(
    value || 'Rua Lagoa Grande, 382, Manaus, AM',
    locationDetails?.latitude,
    locationDetails?.longitude
  );

  const mapsRouteUrl = getGoogleMapsDirectionsUrl(
    value || 'Rua Lagoa Grande, 382, Manaus, AM',
    locationDetails?.latitude,
    locationDetails?.longitude
  );

  return (
    <div ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {/* Search Input with Google Maps branding */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="var(--accent-gold)" />
            <span>Local do Evento (Google Maps API) *</span>
          </label>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Pesquisa integrada com autocompletar e mapas
          </span>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              color: isSearching ? 'var(--accent-gold)' : 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            required
            className="form-input"
            style={{ paddingLeft: '2.5rem', paddingRight: searchTerm ? '2.5rem' : '1rem' }}
            placeholder="Digite o endereço ou nome do local em Manaus (ex: Templo Sede, Arena da Amazônia...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpenSuggestions(true);
            }}
            onBlur={handleManualBlur}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setResults([]);
                onChange('', undefined);
              }}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Limpar endereço"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpenSuggestions && results.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10050,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.55)',
              marginTop: '0.35rem',
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                padding: '0.4rem 0.85rem',
                background: 'rgba(245, 158, 11, 0.08)',
                fontSize: '0.72rem',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Sugestões encontradas no Google Maps</span>
              <span>{results.length} locais</span>
            </div>

            {results.map((place) => (
              <div
                key={place.id}
                onMouseDown={() => handleSelectPlace(place)}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <MapPin size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {place.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {place.subtitle}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {place.fullAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Venue Presets */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Locais Frequentes:</span>
        <button
          type="button"
          onClick={() => handleSelectPreset('macdp_sede')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', gap: '0.3rem' }}
        >
          <Building2 size={12} color="var(--accent-gold)" />
          <span>Templo Sede (Canaranas)</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset('macdp_sitio_retiros')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', gap: '0.3rem' }}
        >
          <span>🌳 Sítio de Retiros</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset('arena_amazonia')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
        >
          <span>🏟️ Arena da Amazônia</span>
        </button>
      </div>

      {/* Interactive Google Map Preview */}
      {value && showMapPreview && (
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginTop: '0.25rem',
          }}
        >
          <div
            style={{
              padding: '0.45rem 0.85rem',
              background: 'rgba(11, 17, 32, 0.75)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.76rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
              <Map size={13} />
              <strong>Pré-visualização Interativa do Google Maps</strong>
            </div>
            <a
              href={mapsRouteUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--accent-gold-light)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <span>Abrir no Google Maps</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div style={{ height: '150px', width: '100%', position: 'relative' }}>
            <iframe
              title="Google Maps Location Preview"
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {locationDetails?.latitude && locationDetails?.longitude && (
            <div
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                📍 Coordenadas: {locationDetails.latitude.toFixed(5)}, {locationDetails.longitude.toFixed(5)}
              </span>
              {locationDetails.neighborhood && <span>Bairro: {locationDetails.neighborhood}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
