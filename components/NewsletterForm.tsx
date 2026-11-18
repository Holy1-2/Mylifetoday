import { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { addSubscription } from '../services/firebaseService';
import { useLanguage } from '../contexts/LanguageContext';

interface NewsletterFormProps {
  compact?: boolean;
}

const NewsletterForm = ({ compact = false }: NewsletterFormProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clean = email.trim();
    if (!clean) {
      toast.error(t('emailRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      toast.error(t('emailInvalid'));
      return;
    }
    setBusy(true);
    try {
      await addSubscription(clean, name);
      toast.success(t('subscribeSuccess'));
      setEmail('');
      setName('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (/already subscribed/i.test(message)) toast(t('subscribeAlready'), { icon: '✓' });
      else toast.error(t('subscribeFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? 'space-y-2' : 'space-y-3'}>
      {!compact && (
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            aria-label={t('emailPlaceholder')}
            className="w-full border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-black"
          />
        </div>
      )}
      {compact && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          aria-label={t('emailPlaceholder')}
          className="w-full rounded-none border border-white/20 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white"
        />
      )}
      {!compact && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${t('namePlaceholder')} (${t('optional')})`}
          aria-label={t('namePlaceholder')}
          className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
        />
      )}
      <button
        type="submit"
        disabled={busy}
        className={`w-full px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition disabled:opacity-60 ${
          compact
            ? 'bg-white text-black hover:bg-red-600 hover:text-white'
            : 'bg-black text-white hover:bg-red-600'
        }`}
      >
        {busy ? t('loading') : t('subscribe')}
      </button>
    </form>
  );
};

export default NewsletterForm;
