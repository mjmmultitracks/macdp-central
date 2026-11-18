/** Lançamentos do ministério de louvor (Caçadores da Presença Music).
 *  Para adicionar um lançamento novo, inclua um item no topo da lista. */
export interface MusicRelease {
  id: string;
  title: string;
  /** Data de lançamento no formato AAAA-MM-DD */
  date: string;
  /** Imagem de capa (miniatura do vídeo ou arte própria) */
  coverUrl?: string;
  /** Link para ouvir (YouTube, Spotify, Deezer...) */
  url: string;
  /** Nome da plataforma exibido no botão, ex.: 'YouTube' */
  platform?: string;
}

const yt = (id: string) => ({
  url: `https://www.youtube.com/watch?v=${id}`,
  // Miniatura oficial do vídeo no YouTube
  coverUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  platform: 'YouTube',
});

export const MUSIC_RELEASES: MusicRelease[] = [
  { id: 'de-geracao-em-geracao', title: 'De Geração em Geração', date: '2026-10-29', ...yt('hVZgmPFTYao') },
  { id: 'mil-graus', title: 'Mil Graus (Ao Vivo)', date: '2026-08-26', ...yt('qXPXWteLffE') },
  { id: 'ninguem-e-como-tu', title: 'Ninguém é como Tu (Ao Vivo)', date: '2026-02-15', ...yt('R9HOQYltUn0') },
  { id: 'por-amor', title: 'Por Amor', date: '2025-06-15', ...yt('osXdYVH4cGo') },
  { id: 'estamos-de-pe', title: 'Estamos de Pé (Ao Vivo)', date: '2024-11-17', ...yt('XXv6gEXWq8s') },
  { id: 'rodeado', title: 'Rodeado', date: '2023-11-30', ...yt('rM76Lkh-U6k') },
];

/** WhatsApp para convites: (92) 98450-9989 */
export const MUSIC_WHATSAPP_NUMBER = '5592984509989';
export const MUSIC_INVITE_MESSAGE =
  'Olá! Gostaria de convidar o Caçadores da Presença Music para um evento.';
