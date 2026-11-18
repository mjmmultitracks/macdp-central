/** Produtos da lojinha da MACDP. Para adicionar um livro, inclua um item na lista. */
export interface StoreFormat {
  id: string;
  label: string;
  price: number;
  /** physical = precisa de retirada/entrega; digital = enviado por e-mail e WhatsApp */
  kind: 'physical' | 'digital';
}

export interface StoreProduct {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  cover: string;
  description: string;
  details?: string;
  formats: StoreFormat[];
}

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'dorot',
    title: 'DOROT',
    subtitle: 'A Continuidade Profética — Uma Geração Levantando Gerações',
    author: 'Pr. Oziel Gomes Maduro',
    cover: '/images/store/dorot-capa.jpg',
    description:
      'Edição literária das mensagens da Conferência Profética Caçadores da Presença 2026. Uma abertura e onze mensagens sobre o chamado de Deus para levantar gerações, com base em Salmos 145:4.',
    details: '55 páginas · Edição 2026',
    formats: [
      { id: 'impresso', label: 'Impresso', price: 39.9, kind: 'physical' },
      { id: 'pdf', label: 'Digital (PDF)', price: 19.9, kind: 'digital' },
    ],
  },
];

/** WhatsApp da secretaria: (92) 98450-9989 */
export const STORE_WHATSAPP_NUMBER = '5592984509989';
