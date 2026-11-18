/** Lançamentos do ministério de louvor (Caçadores da Presença Music).
 *  Para adicionar um lançamento novo, inclua um item no topo da lista. */
export interface MusicRelease {
  id: string;
  title: string;
  /** Data de lançamento no formato AAAA-MM-DD */
  date: string;
  /** Capa quadrada, ex.: '/images/music/nome-da-capa.jpg' */
  coverUrl?: string;
  /** Link para ouvir (YouTube, Spotify, Deezer...) */
  url: string;
  /** Nome da plataforma exibido no botão, ex.: 'YouTube' */
  platform?: string;
}

export const MUSIC_RELEASES: MusicRelease[] = [];

/** WhatsApp para convites: (92) 98450-9989 */
export const MUSIC_WHATSAPP_NUMBER = '5592984509989';
export const MUSIC_INVITE_MESSAGE =
  'Olá! Gostaria de convidar o Caçadores da Presença Music para um evento.';
