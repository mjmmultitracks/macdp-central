import React, { useState, useEffect } from 'react';
import {
  BIBLE_BOOKS,
  BibleBook,
  getBibleChapter,
  BibleChapterData,
  BibleVerse,
  speakBibleVerse,
  stopBibleSpeech,
  getTodayDevotional,
} from '../../services/bibleService';
import {
  BookOpen,
  Search,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Type,
  Sun,
  Moon,
  ListFilter,
  X,
} from 'lucide-react';

interface AppBibleViewProps {
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
  accentColor?: string;
}

export const AppBibleView: React.FC<AppBibleViewProps> = ({ onNotify, accentColor = 'var(--accent-gold)' }) => {
  // State
  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    // Default to Salmos
    return BIBLE_BOOKS.find((b) => b.id === 'sl') || BIBLE_BOOKS[0];
  });
  const [currentChapter, setCurrentChapter] = useState<number>(23);
  const [chapterData, setChapterData] = useState<BibleChapterData>(() =>
    getBibleChapter('sl', 23)
  );

  // Search & Navigation Modals
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [isChapterPickerOpen, setIsChapterPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestament, setSelectedTestament] = useState<'ALL' | 'AT' | 'NT'>('ALL');

  // Reader Settings
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);
  const [favoriteVerses, setFavoriteVerses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('macdp_bible_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const devotional = getTodayDevotional();

  // Update chapter data when book or chapter changes
  useEffect(() => {
    const data = getBibleChapter(selectedBook.id, currentChapter);
    setChapterData(data);
    setSelectedVerse(null);
    stopBibleSpeech();
    setIsSpeaking(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedBook, currentChapter]);

  // Clean speech when unmounting
  useEffect(() => {
    return () => {
      stopBibleSpeech();
    };
  }, []);

  // Filter books for picker
  const filteredBooks = BIBLE_BOOKS.filter((b) => {
    const matchesTestament = selectedTestament === 'ALL' || b.testament === selectedTestament;
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.abbr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  // Next / Previous Chapter Navigation
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter((c) => c - 1);
    } else {
      // Go to previous book if available
      const currentIndex = BIBLE_BOOKS.findIndex((b) => b.id === selectedBook.id);
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS[currentIndex - 1];
        setSelectedBook(prevBook);
        setCurrentChapter(prevBook.chapters);
      }
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < selectedBook.chapters) {
      setCurrentChapter((c) => c + 1);
    } else {
      // Go to next book
      const currentIndex = BIBLE_BOOKS.findIndex((b) => b.id === selectedBook.id);
      if (currentIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIndex + 1];
        setSelectedBook(nextBook);
        setCurrentChapter(1);
      }
    }
  };

  // Text-To-Speech
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopBibleSpeech();
      setIsSpeaking(false);
    } else {
      const allText = chapterData.verses.map((v) => `${v.number}. ${v.text}`).join(' ');
      const ref = `${selectedBook.name} capítulo ${currentChapter}`;
      speakBibleVerse(allText, ref);
      setIsSpeaking(true);
      onNotify('info', `Lendo em voz alta: ${ref}`);
    }
  };

  // Copy Verse
  const handleCopyVerse = (verse: BibleVerse) => {
    const textToCopy = `"${verse.text}" — ${selectedBook.name} ${currentChapter}:${verse.number} (Bíblia Sagrada)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerseNum(verse.number);
    onNotify('success', `Versículo copiado: ${selectedBook.abbr} ${currentChapter}:${verse.number}`);
    setTimeout(() => setCopiedVerseNum(null), 2000);
  };

  // Share Verse
  const handleShareVerse = (verse: BibleVerse) => {
    const textToShare = `"${verse.text}"\n\n📖 ${selectedBook.name} ${currentChapter}:${verse.number}\n📲 Ministério Apostólico Caçadores da Presença`;
    if (navigator.share) {
      navigator.share({
        title: `${selectedBook.name} ${currentChapter}:${verse.number}`,
        text: textToShare,
      }).catch(() => {});
    } else {
      handleCopyVerse(verse);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (verse: BibleVerse) => {
    const key = `${selectedBook.id}_${currentChapter}_${verse.number}`;
    let updated: string[];
    if (favoriteVerses.includes(key)) {
      updated = favoriteVerses.filter((k) => k !== key);
      onNotify('info', 'Versículo removido dos favoritos.');
    } else {
      updated = [...favoriteVerses, key];
      onNotify('success', 'Versículo salvo nos favoritos! ⭐');
    }
    setFavoriteVerses(updated);
    try {
      localStorage.setItem('macdp_bible_favorites', JSON.stringify(updated));
    } catch {}
  };

  const getFontSizeStyle = () => {
    switch (fontSize) {
      case 'sm':
        return { fontSize: '0.9rem', lineHeight: 1.6 };
      case 'lg':
        return { fontSize: '1.15rem', lineHeight: 1.85 };
      case 'xl':
        return { fontSize: '1.3rem', lineHeight: 2.0 };
      default:
        return { fontSize: '1.025rem', lineHeight: 1.75 };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      {/* Devocional do Dia Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(11, 17, 32, 0.8) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Versículo do Dia • {devotional.theme}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {devotional.reference}
          </span>
        </div>

        <p style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
          "{devotional.verse}"
        </p>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
          {devotional.message}
        </p>

        <button
          onClick={() => {
            const shareText = `"${devotional.verse}" — ${devotional.reference}\n\n${devotional.message}\n\n📲 Ministério Apostólico Caçadores da Presença`;
            if (navigator.share) {
              navigator.share({ title: 'Devocional da Presença', text: shareText }).catch(() => {});
            } else {
              navigator.clipboard.writeText(shareText);
              onNotify('success', 'Devocional copiado para o WhatsApp!');
            }
          }}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          <Share2 size={13} />
          <span>Compartilhar Devocional</span>
        </button>
      </div>

      {/* Barra de Controle de Leitura da Bíblia */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '18px',
          border: '1px solid var(--border-subtle)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          position: 'sticky',
          top: '64px',
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Seletor de Livro & Capítulo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setIsBookPickerOpen(true)}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BookOpen size={16} color="var(--accent-gold)" />
            <span>{selectedBook.name}</span>
          </button>

          <button
            onClick={() => setIsChapterPickerOpen(true)}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Cap. {currentChapter}
          </button>
        </div>

        {/* Ferramentas do Leitor: Áudio e Tamanho de Fonte */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Botão de Leitura por Voz */}
          <button
            onClick={handleToggleSpeak}
            title={isSpeaking ? 'Parar leitura' : 'Ouvir capítulo em áudio'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isSpeaking ? '#EF4444' : 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: isSpeaking ? '#FFFFFF' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Ajuste de Fonte */}
          <button
            onClick={() => {
              const sizes: ('sm' | 'base' | 'lg' | 'xl')[] = ['sm', 'base', 'lg', 'xl'];
              const nextIndex = (sizes.indexOf(fontSize) + 1) % sizes.length;
              setFontSize(sizes[nextIndex]);
            }}
            title="Alterar tamanho da fonte"
            style={{
              height: '38px',
              padding: '0 0.65rem',
              borderRadius: '10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Type size={15} />
            <span>{fontSize.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Leitor dos Versículos */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.08em' }}>
            {selectedBook.category} • {selectedBook.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'}
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>
            {selectedBook.name} {currentChapter}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Nova Versão Internacional (NVI)
          </span>
        </div>

        {/* Lista de Versículos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {chapterData.verses.map((verse) => {
            const isFav = favoriteVerses.includes(`${selectedBook.id}_${currentChapter}_${verse.number}`);
            const isSelected = selectedVerse?.number === verse.number;

            return (
              <div
                key={verse.number}
                onClick={() => setSelectedVerse(isSelected ? null : verse)}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  border: isSelected ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'var(--accent-gold)',
                      marginTop: '3px',
                      minWidth: '22px',
                    }}
                  >
                    {verse.number}
                  </span>

                  <p
                    style={{
                      margin: 0,
                      color: 'var(--text-primary)',
                      flex: 1,
                      ...getFontSizeStyle(),
                      fontFamily: '"Outfit", sans-serif',
                    }}
                  >
                    {verse.text}
                  </p>

                  {isFav && (
                    <Bookmark size={15} color="var(--accent-gold)" fill="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '5px' }} />
                  )}
                </div>

                {/* Barra Flutuante de Ações ao Tocar no Versículo */}
                {isSelected && (
                  <div
                    className="animate-page-enter"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px dashed rgba(245, 158, 11, 0.25)',
                      flexWrap: 'wrap',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleCopyVerse(verse)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      {copiedVerseNum === verse.number ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      <span>{copiedVerseNum === verse.number ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    <button
                      onClick={() => handleShareVerse(verse)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Share2 size={13} />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleToggleFavorite(verse)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Bookmark size={13} color={isFav ? 'var(--accent-gold)' : 'currentColor'} />
                      <span>{isFav ? 'Favoritado' : 'Favoritar'}</span>
                    </button>

                    <button
                      onClick={() => {
                        speakBibleVerse(verse.text, `${selectedBook.name} ${currentChapter}:${verse.number}`);
                        onNotify('info', `Reproduzindo v. ${verse.number}`);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Volume2 size={13} />
                      <span>Ouvir</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Paginação Anterior / Próximo Capítulo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={handlePrevChapter}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem', padding: '0.5rem 0.9rem' }}
          >
            <ChevronLeft size={16} />
            <span>Capítulo Anterior</span>
          </button>

          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {selectedBook.name} {currentChapter} de {selectedBook.chapters}
          </span>

          <button
            onClick={handleNextChapter}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem', padding: '0.5rem 0.9rem' }}
          >
            <span>Próximo Capítulo</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal de Escolha de Livros */}
      {isBookPickerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsBookPickerOpen(false)}
        >
          <div
            className="animate-page-enter"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Livros da Bíblia</h3>
              <button
                onClick={() => setIsBookPickerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Campo de Busca de Livro */}
            <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-tertiary)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar livro (ex: Salmos, João, Romanos)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {/* Filtro Testamento */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                {(['ALL', 'AT', 'NT'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTestament(t)}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: selectedTestament === t ? 700 : 500,
                      background: selectedTestament === t ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                      color: selectedTestament === t ? '#0B1120' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {t === 'ALL' ? 'Todos (66)' : t === 'AT' ? 'Antigo Testamento (39)' : 'Novo Testamento (27)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid dos Livros */}
            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {filteredBooks.map((book) => {
                  const isCur = book.id === selectedBook.id;
                  return (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book);
                        setCurrentChapter(1);
                        setIsBookPickerOpen(false);
                      }}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '12px',
                        border: isCur ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: isCur ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-tertiary)',
                        color: isCur ? 'var(--accent-gold)' : 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem' }}>{book.name}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {book.chapters} capítulos
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escolha de Capítulos */}
      {isChapterPickerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsChapterPickerOpen(false)}
        >
          <div
            className="animate-page-enter"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-subtle)',
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {selectedBook.name} • Escolha o Capítulo
              </h3>
              <button
                onClick={() => setIsChapterPickerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chNum) => {
                  const isCur = chNum === currentChapter;
                  return (
                    <button
                      key={chNum}
                      onClick={() => {
                        setCurrentChapter(chNum);
                        setIsChapterPickerOpen(false);
                      }}
                      style={{
                        height: '42px',
                        borderRadius: '10px',
                        border: isCur ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: isCur ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                        color: isCur ? '#0B1120' : 'var(--text-primary)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {chNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
