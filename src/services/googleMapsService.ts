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

// Popular and official MACDP locations in Manaus and metropolitan region for instant zero-latency search
const POPULAR_MANAUS_VENUES: PlaceSearchResult[] = [
  {
    id: 'chacara_paraiso_verde',
    title: 'Chácara Paraíso Verde (Retiros & Eventos)',
    subtitle: 'Estrada do Caldeirão (Ramal do Caldeirão), Iranduba - AM',
    fullAddress: 'Chácara Paraíso Verde, Estrada do Caldeirão, Iranduba - AM, 69405-000',
    neighborhood: 'Estrada do Caldeirão / Comunidade Santo Antônio',
    city: 'Iranduba',
    state: 'AM',
    latitude: -3.21338,
    longitude: -60.2232,
  },
  {
    id: 'ramal_caldeirao',
    title: 'Estrada / Ramal do Caldeirão',
    subtitle: 'Iranduba - AM (Acesso AM-070 / Manoel Urbano)',
    fullAddress: 'Estrada do Caldeirão (Ramal do Caldeirão), Iranduba - AM, 69405-000',
    neighborhood: 'Parque Caldeirão',
    city: 'Iranduba',
    state: 'AM',
    latitude: -3.21338,
    longitude: -60.2232,
  },
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

export function normalizeQuery(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Cria detalhes de localização a partir de qualquer endereço digitado livremente
 */
export function createCustomLocationResult(rawText: string): PlaceSearchResult {
  const clean = (rawText || '').trim();
  const norm = normalizeQuery(clean);

  const isIranduba = /iranduba|caldeir/.test(norm);
  const isManacapuru = /manacapuru/.test(norm);
  const isRioPreto = /rio preto/.test(norm);
  const isFigueiredo = /figueiredo/.test(norm);

  let city = 'Manaus';
  let lat = -3.038142;
  let lng = -60.003215;

  if (isIranduba) {
    city = 'Iranduba';
    lat = -3.21338;
    lng = -60.2232;
  } else if (isManacapuru) {
    city = 'Manacapuru';
    lat = -3.2997;
    lng = -60.6208;
  } else if (isRioPreto) {
    city = 'Rio Preto da Eva';
    lat = -2.6989;
    lng = -59.6997;
  } else if (isFigueiredo) {
    city = 'Presidente Figueiredo';
    lat = -2.0506;
    lng = -60.0256;
  }

  const parts = clean.split(',');
  const title = parts[0].trim() || 'Local do Evento';
  const subtitle = parts.length > 1 ? parts.slice(1).join(',').trim() : `${city} - AM`;

  return {
    id: `custom_${Date.now()}`,
    title,
    subtitle,
    fullAddress: clean,
    city,
    state: 'AM',
    latitude: lat,
    longitude: lng,
  };
}

/**
 * Searches places using Google Places query simulation with live Geocoding API
 */
export async function searchGooglePlaces(query: string): Promise<PlaceSearchResult[]> {
  const rawQuery = query.trim();
  if (!rawQuery) return [];

  const normQuery = normalizeQuery(rawQuery);
  // Remove termos conversacionais comuns como "fica na", "fica no", "fica em", etc.
  const cleanedQuery = normQuery
    .replace(/\b(fica na|fica no|fica em|localizado na|localizada na|localizado em|perto de|pr[oó]ximo a|em frente a)\b/gi, '')
    .replace(/[-–—,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const queryTokens = cleanedQuery.split(' ').filter((t) => t.length >= 3);

  // 1. Busca nos locais populares/frequentes locais com correspondência fonética e por tokens
  const localMatches = POPULAR_MANAUS_VENUES.filter((v) => {
    const vText = normalizeQuery(`${v.title} ${v.subtitle} ${v.fullAddress} ${v.neighborhood || ''} ${v.city}`);
    
    // Correspondência direta
    if (vText.includes(cleanedQuery) || vText.includes(normQuery)) return true;

    // Se a busca contiver palavras-chave essenciais
    if (queryTokens.length > 0) {
      const matchCount = queryTokens.filter((token) => vText.includes(token)).length;
      if (matchCount >= Math.min(2, queryTokens.length)) return true;
    }

    // Regras específicas para Chácara Paraíso Verde e Iranduba
    if (
      (normQuery.includes('paraiso') && normQuery.includes('verde')) ||
      (normQuery.includes('caldeir') && normQuery.includes('iranduba')) ||
      (normQuery.includes('chacara') && normQuery.includes('iranduba'))
    ) {
      if (v.id === 'chacara_paraiso_verde' || v.id === 'ramal_caldeirao') return true;
    }

    return false;
  });

  // 2. Consulta à API de Geocodificação OpenStreetMap / Nominatim com sanitização
  try {
    // Determina a melhor query de busca para a API
    let apiQuery = rawQuery
      .replace(/\b(fica na|fica no|fica em|localizado na|localizada na|perto de|pr[oó]ximo a)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const isIrandubaOrCaldeirao = /caldeir|iranduba/i.test(normalizeQuery(apiQuery));
    const isOtherCity = /manacapuru|rio preto|figueiredo|itacoatiara|careiro/i.test(normalizeQuery(apiQuery));

    let searchTarget = apiQuery;
    if (isIrandubaOrCaldeirao) {
      // No Amazonas a Estrada do Caldeirão é mapeada oficialmente como "Ramal do Caldeirão"
      searchTarget = apiQuery
        .replace(/estrada do caldeir[aã]o/gi, 'Ramal do Caldeirão')
        .replace(/ch[aá]cara para[ií]so verde,?/gi, '');
      if (!/iranduba/i.test(searchTarget)) {
        searchTarget = `${searchTarget}, Iranduba, Amazonas, Brasil`;
      } else if (!/brasil/i.test(searchTarget)) {
        searchTarget = `${searchTarget}, Amazonas, Brasil`;
      }
    } else if (!isOtherCity && !/manaus/i.test(apiQuery)) {
      searchTarget = `${apiQuery}, Manaus, Amazonas, Brasil`;
    }

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchTarget.trim()
    )}&addressdetails=1&limit=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

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
        const city = addr.city || addr.town || addr.municipality || 'Iranduba';
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

      if (merged.length > 0) {
        return merged.slice(0, 6);
      }
    }
  } catch (err) {
    console.warn('Busca online indisponível, utilizando correspondência local e inteligente:', err);
  }

  // Se nada foi encontrado online nem nos locais populares, retorna ao menos a opção personalizada correspondente
  if (localMatches.length === 0 && rawQuery.length >= 3) {
    return [createCustomLocationResult(rawQuery)];
  }

  return localMatches;
}

/**
 * Resolves or corrects coordinates if legacy/mismatched coordinates were supplied
 */
export function resolveLocationCoordinates(address: string, lat?: number, lng?: number): { lat: number; lng: number } {
  const normAddr = normalizeQuery(address || '');
  const isIrandubaOrCaldeirao = normAddr.includes('iranduba') || normAddr.includes('caldeir') || normAddr.includes('paraiso');

  // Se já tem coordenadas
  if (lat && lng) {
    // Se o endereço for Iranduba/Caldeirão mas as coordenadas forem do Templo Sede (Canaranas) por fallback antigo
    if (isIrandubaOrCaldeirao && Math.abs(lat - (-3.038142)) < 0.005) {
      return { lat: -3.21338, lng: -60.2232 };
    }
    return { lat, lng };
  }

  // Se não tem coordenadas, resolve via createCustomLocationResult
  const custom = createCustomLocationResult(address || '');
  return { lat: custom.latitude, lng: custom.longitude };
}

/**
 * Returns an interactive Google Maps embed URL
 */
export function getGoogleMapsEmbedUrl(address: string, lat?: number, lng?: number): string {
  const coords = resolveLocationCoordinates(address, lat, lng);
  if (coords.lat && coords.lng) {
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(address || 'Manaus, AM')}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Returns a direct Google Maps navigation / route URL
 */
export function getGoogleMapsDirectionsUrl(address: string, lat?: number, lng?: number): string {
  const coords = resolveLocationCoordinates(address, lat, lng);
  if (coords.lat && coords.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || 'Manaus, AM')}`;
}

/**
 * Converts a PlaceSearchResult into EventLocationDetails
 */
export function toLocationDetails(place: PlaceSearchResult): EventLocationDetails {
  const coords = resolveLocationCoordinates(place.fullAddress || place.title, place.latitude, place.longitude);
  return {
    placeName: place.title,
    formattedAddress: place.fullAddress,
    neighborhood: place.neighborhood,
    city: place.city,
    state: place.state,
    latitude: coords.lat,
    longitude: coords.lng,
    googleMapsUrl: getGoogleMapsDirectionsUrl(place.fullAddress, coords.lat, coords.lng),
  };
}

/**
 * Garante que os detalhes de localização estejam sempre preenchidos com coordenadas válidas
 */
export function ensureEventLocationDetails(location: string, details?: EventLocationDetails): EventLocationDetails {
  if (details) {
    const coords = resolveLocationCoordinates(
      details.formattedAddress || details.placeName || location,
      details.latitude,
      details.longitude
    );
    return {
      placeName: details.placeName || location,
      formattedAddress: details.formattedAddress || location,
      neighborhood: details.neighborhood,
      city: details.city || 'Manaus',
      state: details.state || 'AM',
      latitude: coords.lat,
      longitude: coords.lng,
      googleMapsUrl: details.googleMapsUrl || getGoogleMapsDirectionsUrl(details.formattedAddress || location, coords.lat, coords.lng),
    };
  }
  return toLocationDetails(createCustomLocationResult(location));
}


