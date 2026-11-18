import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Heart,
  Lock,
  NotebookPen,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import type { JournalEntry } from '../types';
import SEOHead from '../components/SEOHead';
import { BRAND } from '../constants';

type Tab = 'all' | 'reflection' | 'prayer' | 'note' | 'verses' | 'articles';
type EntryType = 'reflection' | 'prayer' | 'note';

const field =
  'w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black transition-colors';

const JournalPage = () => {
  const { lang, t, dateLabel } = useLanguage();
  const { user, loading } = useAuth();
  const journal = useJournal();
  const location = useLocation();

  const [tab, setTab] = useState<Tab>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState<EntryType>('reflection');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [reference, setReference] = useState('');
  const [answered, setAnswered] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (tab === 'all' || tab === 'verses' || tab === 'articles') return journal.entries;
    return journal.entries.filter((entry) => entry.type === tab);
  }, [journal.entries, tab]);

  const openComposer = (nextType: EntryType) => {
    setType(nextType);
    setEditingId(null);
    setTitle('');
    setText('');
    setReference('');
    setAnswered(false);
    setFormOpen(true);
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id || null);
    setType(entry.type);
    setTitle(entry.title || '');
    setText(entry.text || '');
    setReference(entry.reference || '');
    setAnswered(!!entry.answered);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setTitle('');
    setText('');
    setReference('');
    setAnswered(false);
  };

  const save = async () => {
    if (text.trim().length < 2) {
      toast.error(t('entryText'));
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await journal.editEntry(editingId, { title, text, reference, answered, type });
        toast.success(t('saved'));
      } else {
        await journal.createEntry({ type, title, text, reference, answered });
        toast.success(t('saved'));
      }
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: JournalEntry) => {
    if (!entry.id) return;
    if (!window.confirm(t('deleteEntry'))) return;
    await journal.removeEntry(entry.id);
  };

  const markAnswered = async (entry: JournalEntry) => {
    if (!entry.id) return;
    await journal.editEntry(entry.id, { answered: !entry.answered });
  };

  const copyVerse = async (referenceText: string, verseText: string) => {
    try {
      await navigator.clipboard.writeText(`“${verseText}” — ${referenceText}`);
      toast.success(t('copied'));
    } catch {
      toast.error(t('error'));
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'reflection', label: t('reflections') },
    { key: 'prayer', label: t('prayers') },
    { key: 'note', label: t('notes') },
    { key: 'verses', label: t('savedVerses') },
    { key: 'articles', label: t('savedArticles') },
  ];

  const chip = (active: boolean) =>
    `shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
      active ? 'bg-black border-black text-white' : 'bg-white border-black/10 hover:border-black'
    }`;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center text-sm text-gray-500">
        {t('loading')}
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEOHead lang={lang} title={`${t('journalTitle')} | ${BRAND.name}`} url={`${BRAND.siteUrl}/${lang}/journal`} />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center bg-[#1a1a1a] text-white">
            <Lock size={24} />
          </span>
          <h1 className="mt-5 text-3xl font-black uppercase tracking-tighter">{t('journalSignIn')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('journalSignInText')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={`/${lang}/signup`}
              state={{ from: location.pathname }}
              className="bg-[#1a1a1a] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black"
            >
              {t('signUp')}
            </Link>
            <Link
              to={`/${lang}/signin`}
              state={{ from: location.pathname }}
              className="border border-black/20 px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:border-black"
            >
              {t('signIn')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead lang={lang} title={`${t('journalTitle')} | ${BRAND.name}`} url={`${BRAND.siteUrl}/${lang}/journal`} />

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-3">
              {t('privateBadge')}
            </p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              {t('journalTitle')}
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">{t('journalSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => openComposer('reflection')}
            className="inline-flex items-center gap-2 bg-[#1a1a1a] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-colors"
          >
            <Plus size={14} />
            {t('newReflection')}
          </button>
        </div>

        <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {tabs.map((item) => (
            <button key={item.key} type="button" onClick={() => setTab(item.key)} className={chip(tab === item.key)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            {formOpen ? (
              <div className="border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black uppercase tracking-tight">
                    {editingId
                      ? t(type === 'prayer' ? 'prayers' : type === 'note' ? 'notes' : 'reflections')
                      : t(type === 'prayer' ? 'newPrayer' : type === 'note' ? 'newNote' : 'newReflection')}
                  </h2>
                  <button
                    type="button"
                    onClick={resetForm}
                    aria-label={t('close')}
                    className="p-2 text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-px bg-gray-200 border border-gray-200">
                  {(['reflection', 'prayer', 'note'] as EntryType[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        type === value ? 'bg-black text-white' : 'bg-white text-gray-500 hover:text-black'
                      }`}
                    >
                      {t(value === 'reflection' ? 'reflections' : value === 'prayer' ? 'prayers' : 'notes')}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${t('entryTitle')} (${t('optional')})`}
                  className={`${field} mt-3`}
                />

                {(type === 'prayer' || type === 'reflection') && (
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder={`${t('verseReference')} (${t('optional')})`}
                    className={`${field} mt-2`}
                  />
                )}

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder={t('entryText')}
                  className={`${field} mt-2 leading-relaxed resize-y`}
                />

                {type === 'prayer' && (
                  <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={answered}
                      onChange={(e) => setAnswered(e.target.checked)}
                      className="h-4 w-4 border-gray-300"
                    />
                    {t('markAnswered')}
                  </label>
                )}

                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="mt-4 w-full bg-[#1a1a1a] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black disabled:opacity-60 transition-colors"
                >
                  {saving ? t('saving') : t('save')}
                </button>
              </div>
            ) : (
              <div className="border border-black/10 bg-white p-5">
                <h2 className="text-lg font-black uppercase tracking-tight">{t('journalTitle')}</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {journal.entries.length} {t('entriesCount')} · {journal.savedVerses.length}{' '}
                  {t('savedVerses').toLowerCase()}
                </p>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => openComposer('reflection')}
                    className="flex items-center gap-2 border border-black/10 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-700 transition hover:border-black"
                  >
                    <NotebookPen size={14} className="text-red-600" />
                    {t('newReflection')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openComposer('prayer')}
                    className="flex items-center gap-2 border border-black/10 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-700 transition hover:border-black"
                  >
                    <Heart size={14} className="text-red-600" />
                    {t('newPrayer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openComposer('note')}
                    className="flex items-center gap-2 border border-black/10 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-700 transition hover:border-black"
                  >
                    <Lock size={14} className="text-red-600" />
                    {t('newNote')}
                  </button>
                </div>
                <p className="mt-4 flex items-center gap-1.5 bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 break-all">
                  <Lock size={11} className="shrink-0" />
                  {t('privateBadge')} · {user.email}
                </p>
              </div>
            )}
          </aside>

          <section>
            {tab === 'verses' ? (
              journal.savedVerses.length === 0 ? (
                <EmptyState label={t('emptySaved')} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {journal.savedVerses.map((saved) => {
                    const ref =
                      typeof saved.reference === 'string'
                        ? saved.reference
                        : saved.reference[lang] || saved.reference.rw;
                    const content =
                      typeof saved.text === 'string'
                        ? saved.text
                        : saved.text[lang] || saved.text.rw;
                    return (
                      <article
                        key={saved.id}
                        className="flex flex-col justify-between border border-black bg-[#1a1a1a] p-5 text-white"
                      >
                        <p className="font-serif text-lg leading-relaxed">“{content}”</p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                            {ref}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyVerse(ref, content)}
                              aria-label={t('copy')}
                              className="p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <Sparkles size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => journal.removeVerse(saved.id)}
                              aria-label={t('remove')}
                              className="p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )
            ) : tab === 'articles' ? (
              journal.savedArticles.length === 0 ? (
                <EmptyState label={t('emptySaved')} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {journal.savedArticles.map((saved) => (
                    <div key={saved.id} className="group overflow-hidden border border-black/10 bg-white">
                      <Link to={`/${lang}/articles/${saved.slug || saved.id}`} className="block">
                        <div className="aspect-video w-full overflow-hidden bg-black">
                          {saved.image ? (
                            <img
                              src={saved.image}
                              alt={saved.title || ''}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h3 className="line-clamp-2 font-bold font-serif leading-tight">{saved.title}</h3>
                          {saved.situation && (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{saved.situation}</p>
                          )}
                        </div>
                      </Link>
                      <div className="flex justify-end border-t border-gray-100 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => journal.removeArticle(saved.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Bookmark size={12} />
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filtered.length === 0 ? (
              <EmptyState label={t('emptyJournal')} />
            ) : (
              <div className="space-y-4">
                {filtered.map((entry) => (
                  <article key={entry.id} className="border border-black/10 bg-white p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 border border-black/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-gray-600">
                        {entry.type === 'prayer' ? (
                          <Heart size={11} className="text-red-600" />
                        ) : entry.type === 'note' ? (
                          <Lock size={11} className="text-red-600" />
                        ) : (
                          <BookOpen size={11} className="text-red-600" />
                        )}
                        {t(entry.type === 'prayer' ? 'prayers' : entry.type === 'note' ? 'notes' : 'reflections')}
                      </span>
                      {entry.answered && (
                        <span className="inline-flex items-center gap-1 bg-black px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                          <CheckCircle2 size={11} />
                          {t('answeredBadge')}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {dateLabel(entry.createdAt)}
                      </span>
                    </div>

                    {entry.title && (
                      <h3 className="mt-3 font-bold font-serif text-lg leading-tight">{entry.title}</h3>
                    )}
                    {entry.reference && (
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-red-600">
                        {entry.reference}
                      </p>
                    )}
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                      {entry.text}
                    </p>

                    <div className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-3">
                      {entry.type === 'prayer' && (
                        <button
                          type="button"
                          onClick={() => markAnswered(entry)}
                          className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 transition hover:bg-gray-50 hover:text-black"
                        >
                          <CheckCircle2 size={13} />
                          {t('markAnswered')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 transition hover:bg-gray-50 hover:text-black"
                      >
                        <Pencil size={13} />
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(entry)}
                        className="ml-auto inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                        {t('delete')}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="border border-dashed border-black/20 bg-white px-6 py-16 text-center">
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default JournalPage;
