import { EventLocationDetails } from '../types';

export interface PlaceSearchResult {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  neighborhood?: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

// Popular and official MACDP locations in Manaus for instant zero-latency search
const POPULAR_MANAUS_VENUES: PlaceSearchResult[] = [
  {
    id: 'macdp_sede',
    title: 'Templo Sede MACDP (Igreja Central)',
    subtitle: 'Rua Lagoa Grande, 382 - Conj. Canaranas - Cidade Nova',
    fullAddress: 'Rua Lagoa Grande, 382 - Conj. Canaranas - Cidade Nova, Manaus - AM, 69098-000',
    neighborhood: 'Canaranas / Cidade Nova',
    city: 'Manaus',
    state: 'AM',
    latitude: -3.038142,
    longitude: -60.003215,
  },
  {
    id: 'macdp_patio',
    title: 'Pátio Externo & Estacionamento MACDP',
    subtitle: 'Rua Lagoa Grande, 382 - Ações Sociais & Eventos Comunitários',
    fullAddress: 'Rua Lagoa Grande, 382 - Cidade Nova, Manaus - AM',
    neighborhood: 'Canaranas',
    city: 'Manaus',
    state: 'AM',
    latitude: -3.038142,
    longitude: -60.003215,
  },
  {
    id: 'macdp_sitio_retiros',
    title: 'Sítio Recanto da Bênção (Acampamentos & Retiros)',
    subtitle: 'Rodovia BR-174, Km 28 - Manaus / AM',
    fullAddress: 'Rodovia BR-174, Km 28 - Zona Rural, Manaus - AM',
    neighborhood: 'Zona Rural / BR-174',
    city: 'Manaus',
    state: 'AM',
    latitude: -2.85412,
    longitude: -60.01524,
  },
  {
    id: 'arena_amazonia',
    title: 'Arena da Amazônia / Sambódromo',
    subtitle: 'Av. Constantino Nery, Flores - Grandes Cruzadas & Congressos',
    fullAddress: 'Av. Constantino Nery, Flores, Manaus - AM, 69050-001',
    neighborhood: 'Flores',
    city: 'Manaus',
    state: 'AM',
    latitude: -3.0831,
    longitude: -60.0281,
  },
  {
    id: 'studio_5',
    title: 'Studio 5 Centro de Convenções',
    subtitle: 'Av. Rodrigo Otávio, 3555 - Distrito Industrial',
    fullAddress: 'Av. Rodrigo Otávio, 3555 - Distrito Industrial I, Manaus - AM',
    neighborhood: 'Distrito Industrial',
    city: 'Manaus',
    state: 'AM',
    latitude: -3.1251,
    longitude: -59.9882,
  },
  {
    id: 'ponta_negra',
    title: 'Complexo Turístico Ponta Negra (Anfiteatro)',
    subtitle: 'Av. Coronel Teixeira, Ponta Negra - Vigílias & Clamores ao Ar Livre',
    fullAddress: 'Av. Coronel Teixeira, Ponta Negra, Manaus - AM',
    neighborhood: 'Ponta Negra',
    city: 'Manaus',
    state: 'AM',
    latitude: -3.0645,
    longitude: -60.1031,
  },
];

/**
 * Searches places using Google Places query simulation with live Geocoding API
 */
export async function searchGooglePlaces(query: string): Promise<PlaceSearchResult[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // 1. Search in local popular venue cache first
  const localMatches = POPULAR_MANAUS_VENUES.filter(
    (v) =>
      v.title.toLowerCase().includes(cleanQuery) ||
      v.subtitle.toLowerCase().includes(cleanQuery) ||
      v.fullAddress.toLowerCase().includes(cleanQuery) ||
      (v.neighborhood && v.neighborhood.toLowerCase().includes(cleanQuery))
  );

  // 2. Fetch from OpenStreetMap/Google Geocoding API for any Brazilian address
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.includes('Manaus') ? query : `${query}, Manaus, Amazonas, Brasil`
    )}&addressdetails=1&limit=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const onlineResults: PlaceSearchResult[] = (data || []).map((item: any, idx: number) => {
        const addr = item.address || {};
        const road = addr.road || addr.street || '';
        const houseNumber = addr.house_number ? `, ${addr.house_number}` : '';
        const suburb = addr.suburb || addr.neighbourhood || addr.city_district || '';
        const city = addr.city || addr.town || addr.municipality || 'Manaus';
        const state = addr.state || 'AM';

        const title = item.name || `${road}${houseNumber}` || item.display_name.split(',')[0];
        const subtitle = suburb ? `${suburb}, ${city} - ${state}` : `${city} - ${state}`;

        return {
          id: `osm_${item.place_id || idx}_${Date.now()}`,
          title,
          subtitle,
          fullAddress: item.display_name,
          neighborhood: suburb,
          city,
          state,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        };
      });

      // Merge results avoiding duplicates
      const merged = [...localMatches];
      for (const onl of onlineResults) {
        if (!merged.some((m) => Math.abs(m.latitude - onl.latitude) < 0.001 && Math.abs(m.longitude - onl.longitude) < 0.001)) {
          merged.push(onl);
        }
      }
      return merged.slice(0, 6);
    }
  } catch (err) {
    // Return local results if offline
    console.warn('Busca online indisponível, retornando resultados locais:', err);
  }

  return localMatches;
}

/**
 * Returns an interactive Google Maps embed URL
 */
export function getGoogleMapsEmbedUrl(address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Returns a direct Google Maps navigation / route URL
 */
export function getGoogleMapsDirectionsUrl(address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/**
 * Converts a PlaceSearchResult into EventLocationDetails
 */
export function toLocationDetails(place: PlaceSearchResult): EventLocationDetails {
  return {
    placeName: place.title,
    formattedAddress: place.fullAddress,
    neighborhood: place.neighborhood,
    city: place.city,
    state: place.state,
    latitude: place.latitude,
    longitude: place.longitude,
    googleMapsUrl: getGoogleMapsDirectionsUrl(place.fullAddress, place.latitude, place.longitude),
  };
}
