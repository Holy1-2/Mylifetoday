import { useState } from 'react';
import { Check, Copy, Heart, Landmark, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { BRAND, DONATION, LEGAL, SOCIAL_LINKS } from '../constants';
import SEOHead from '../components/SEOHead';

interface StaticPageProps {
  kind: 'donate' | 'privacy' | 'terms';
}

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t('copied'));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(t('error'));
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 border border-black/20 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-700 transition hover:border-black"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {label}
    </button>
  );
};

const StaticPage = ({ kind }: StaticPageProps) => {
  const { lang, t } = useLanguage();

  if (kind === 'donate') {
    return (
      <>
        <SEOHead
          lang={lang}
          title={`${t('donate')} | ${BRAND.name}`}
          description={t('donationDescription')}
          url={`${BRAND.siteUrl}/${lang}/donate`}
        />
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
            <Heart size={13} />
            {t('donate')}
          </span>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter">
            {t('donationHeader').replace('{site}', BRAND.name)}
          </h1>
          <p className="mt-3 max-w-xl text-gray-600">{t('donationDescription')}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-black/10 bg-white p-6">
              <Smartphone size={18} className="text-red-600" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t('mobileMoneyLabel')}
              </p>
              <p className="mt-2 text-xl font-black tracking-tight">{DONATION.momoNumber}</p>
              <p className="mt-1 text-sm text-gray-600">{DONATION.momoName}</p>
              <div className="mt-4">
                <CopyButton value={DONATION.momoNumber} label={t('copy')} />
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6">
              <Landmark size={18} className="text-red-600" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t('bankTransferLabel')}
              </p>
              <p className="mt-2 text-xl font-black tracking-tight">{DONATION.bankAccount}</p>
              <p className="mt-1 text-sm text-gray-600">{DONATION.bankName}</p>
              <div className="mt-4">
                <CopyButton value={DONATION.bankAccount} label={t('copy')} />
              </div>
            </div>
          </div>

          <div className="mt-4 bg-[#1a1a1a] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
              {t('donationPurposeLabel')}
            </p>
            <p className="mt-2 text-sm text-gray-300">{DONATION.purpose}</p>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              className="mt-4 inline-flex text-sm text-gray-400 underline-offset-4 hover:text-white hover:underline break-all"
            >
              {SOCIAL_LINKS.email}
            </a>
          </div>
        </div>
      </>
    );
  }

  const isPrivacy = kind === 'privacy';
  const title = isPrivacy ? t('privacyTitle') : t('termsTitle');
  const content = isPrivacy ? LEGAL.privacy[lang] : LEGAL.terms[lang];

  return (
    <>
      <SEOHead
        lang={lang}
        title={`${title} | ${BRAND.name}`}
        description={`${title} — ${BRAND.name}`}
        url={`${BRAND.siteUrl}/${lang}/${kind}`}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-black uppercase tracking-tighter">{title}</h1>
        <div className="article-body mt-6 whitespace-pre-line text-[15px] leading-[1.9] text-gray-700">
          {content}
        </div>
      </div>
    </>
  );
};

export default StaticPage;
