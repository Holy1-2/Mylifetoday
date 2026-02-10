import { Category, Article, Translations, Language, DonationStats } from './types';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'sw', label: 'Swahili' },
  { code: 'fr', label: 'Français' },
];

export const INITIAL_DONATION_STATS: DonationStats = {
  current: 45000,
  goal: 100000
};

export const TRANSLATIONS: Translations = {
  siteName: {
    en: 'The Providence',
    rw: 'Kubana n\'Imana',
    sw: 'Maisha ya Leo',
    fr: 'La Providence',
  },
  tagline: {
    en: 'Editorial Faith, Life & Health',
    rw: 'Kuba muri kristo',
    sw: 'Hekima na Afya katika Mungu',
    fr: 'Foi, Vie et Santé Editoriale',
  },
  categories: {
    [Category.DAILY_LIFE]: { en: 'Daily Life', rw: 'Ubuzima bwa buri munsi', sw: 'Maisha ya Kila Siku', fr: 'Vie Quotidienne' },
    [Category.MONEY_WORK]: { en: 'Economy', rw: 'Amafaranga', sw: 'Uchumi', fr: 'Économie' },
    [Category.RELATIONSHIPS]: { en: 'Relationships', rw: 'Imibanire', sw: 'Mahusiano', fr: 'Relations' },
    [Category.MENTAL_HEALTH]: { en: 'Mind', rw: 'Umutwe', sw: 'Akili', fr: 'Mental' },
    [Category.TECH]: { en: 'Technology', rw: 'Ikoranabuhanga', sw: 'Teknolojia', fr: 'Technologie' },
    [Category.SOCIETY]: { en: 'Society', rw: 'Umuryango', sw: 'Jamii', fr: 'Société' },
    [Category.HOPE]: { en: 'Hope', rw: 'Ibyiringiro', sw: 'Tumaini', fr: 'Espoir' },
    [Category.HEALTH]: { en: 'Health', rw: 'Ubuzima', sw: 'Afya', fr: 'Santé' },
  },
  ui: {
    readMore: { en: 'Read Full Story', rw: 'Soma byose', sw: 'Soma Zaidi', fr: 'Lire la Suite' },
    latestArticles: { en: 'Trending Insights', rw: 'Inyigisho zigezweho', sw: 'Maarifa Mapya', fr: 'Dernières Analyses' },
    searchPlaceholder: { en: 'Find topics...', rw: 'Shaka ibintu...', sw: 'Tafuta mada...', fr: 'Chercher...' },
    share: { en: 'Share', rw: 'Sangiza', sw: 'Shiriki', fr: 'Partager' },
    comments: { en: 'Discourse', rw: 'Ibitekerezo', sw: 'Maoni', fr: 'Commentaires' },
    healthSection: { en: 'Health & Wellness', rw: 'Ubuzima n\'Imirire', sw: 'Afya na Ustawi', fr: 'Santé et Bien-être' },
    donate: { en: 'Support Our Mission', rw: 'Shyigikira umurimo', sw: 'Changia Huduma', fr: 'Soutenir notre mission' },
    donationGoal: { en: 'Digital Ministry Goal', rw: 'Intego y\'umurimo', sw: 'Lengo la Huduma', fr: 'Objectif du Ministère' },
    copy: { en: 'Copy Account', rw: 'Kora kopi', sw: 'Nakili Akaunti', fr: 'Copier le compte' },
    copied: { en: 'Copied!', rw: 'Byakopye!', sw: 'Imenakiliwa!', fr: 'Copié !' },
    subscribe: { en: 'Subscribe', rw: 'Iyandikishe', sw: 'Jiandikishe', fr: 'S\'abonner' },
    postComment: { en: 'Post Comment', rw: 'Tanga icyo wibaza', sw: 'Tuma Maoni', fr: 'Poster le commentaire' },
    joinWhatsApp: { en: 'Join WhatsApp Group', rw: 'Injira mu itsinda rya WhatsApp', sw: 'Jiunge na WhatsApp', fr: 'Rejoindre WhatsApp' },
    privacyTitle: { en: 'Privacy Policy', rw: 'Politiki y\'Ubwisanzure', sw: 'Sera ya Faragha', fr: 'Politique de confidentialité' },
    termsTitle: { en: 'Terms of Service', rw: 'Amategeko yo Gukoresha', sw: 'Sheria za Huduma', fr: 'Conditions d\'utilisation' },
    home: { en: 'Home', rw: 'Ahabanza', sw: 'Nyumbani', fr: 'Accueil' },
    health: { en: 'Health', rw: 'Ubuzima', sw: 'Afya', fr: 'Santé' },
    search: { en: 'Search', rw: 'Shaka', sw: 'Tafuta', fr: 'Rechercher' },
    admin: { en: 'Admin', rw: 'Umuyobozi', sw: 'Msimamizi', fr: 'Administration' }
  }
};

export const DONATION = {
  momoNumber: '+250788123456',
  momoName: 'TOPRAY Network',
  bankName: 'Bank of Kigali',
  bankAccount: '0001122334455',
  purpose: 'Digital Ministry & Health Awareness'
};

export const SOCIAL_LINKS = {
  whatsapp: 'https://chat.whatsapp.com/yourgroup',
  facebook: 'https://facebook.com/yourpage',
  instagram: 'https://instagram.com/yourprofile',
  email: 'contact@theprovidence.org'
};

export const LEGAL = {
  privacy: {
    en: `At The Providence, we deeply respect your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard the data you provide while using our platform.

1. Information We Collect:
   - Email addresses for newsletter subscriptions
   - Comments and feedback you voluntarily provide
   - Anonymous usage statistics to improve our services

2. How We Use Your Information:
   - To send you relevant spiritual and health content
   - To improve our editorial offerings
   - To respond to your inquiries
   - Never for commercial sale to third parties

3. Data Protection:
   - We implement industry-standard security measures
   - Your data is stored securely on Firebase servers
   - We retain information only as long as necessary

4. Your Rights:
   - Access the personal data we hold about you
   - Request correction of inaccurate information
   - Request deletion of your data (with exceptions for legal obligations)
   - Opt-out of communications at any time

5. Cookies & Tracking:
   - We use minimal cookies for essential functionality
   - No invasive tracking or behavioral advertising

6. Children's Privacy:
   - Our platform is intended for users aged 13 and above
   - We do not knowingly collect data from children under 13

7. Changes to This Policy:
   - We may update this policy periodically
   - Continued use constitutes acceptance of changes

Contact us for any privacy concerns. Your trust is sacred to us.`,
    
    rw: `Ku Providence, dukunda kubahiriza ubwisanzure bwawe kandi dushishikaye kurinda amakuru yawe. Iyi Politiki y'Ubwisanzure isobanura uko dukusanya, dukoresha, kandi dukinga amakuru waduhaye utekereza.

1. Amakuru Dukusanya:
   - Imeli zo kwandikisha mu itangazo
   - Ibitekerezo n'ibisubizo waduha ubwishingizi
   - Imibare y'uko ukoresha serivisi zacu (ibitangazwa)

2. Uko Dukoresha Amakuru Yawe:
   - Kukohereza ibyigisho n'ibyubuzima biri kumurongo
   - Kunoza serivisi zacu
   - Gusubiza ibibazo byawe
   - Ntabwo tuzabigurisha abandi

3. Kurinda Amakuru:
   - Dukoresha uburyo bwo kurinda amakuru
   - Amakuru yawe arashinzwe neza kuri Firebase
   - Turabiguma gusa ibyo birakwiye

4. Ubutaka Bwawe:
   - Kureba amakuru yawe adufite
   - Gusaba gukosora amakuru atari yo
   - Gusaba gusiba amakuru yawe (hakiri ibisabwa n'amategeko)
   - Kwanga amakuru ku buryo ari bwo bwose

5. Amakuki & Kukurikirana:
   - Dukoresha amakuki make gusa kugirango dukore neza
   - Nta kukurikirana gihana cyangwa itangazo rikoreshwa

6. Ubwisanzure bw'Abana:
   - Urubuga rwacu rwateguriwe abakoresha bafite imyaka 13 n'ibirenzeho
   - Ntidukusanya amakuru ku bana bafite imyaka 13 nta cyo bazi

7. Guhindura Iyi Politiki:
   - Dushobora kuyihindura rimwe na rimwe
   - Ukomeje gukoresha bishyigikira guhinduka

Twandikire iyo ufite ibibazo by'ubwisanzure. Ukwizera kwawe ni icyubahiro.`,
    
    sw: `Katika Providence, tunathamini faragha yako na tumekusudia kulinda taarifa zako binafsi. Sera hii ya Faragha inaelezea jinsi tunavyokusanya, kutumia, na kulinda data unayotoa unapotumia jukwaa letu.

1. Taarifa Tunazokusanya:
   - Anwani za barua pepe kwa usajili wa jarida
   - Maoni na maoni unayotoa kwa hiari
   - Takwimu za matumizi ya bila majina kuboresha huduma zetu

2. Jinsi Tunavyotumia Taarifa Zako:
   - Kukutumia maudhui ya kiroho na afya
   - Kuboresha tovuti yetu
   - Kujibu maswali yako
   - Kamwe sio kwa uuzaji wa kibiashara kwa wengine

3. Ulinzi wa Data:
   - Tunatumia hatua za usalama za kiwango cha tasnia
   - Data yako inahifadhiwa kwa usalama kwenye seva za Firebase
   - Tunahifadhi taarifa kwa muda mrefu tu iwezekanavyo

4. Haki Zako:
   - Kupata data yako binafsi tunayokuwa nayo
   - Kuomba kusahihishwa kwa taarifa zisizo sahihi
   - Kuomba kufutwa kwa data yako (isipokuwa kwa majukumu ya kisheria)
   - Kujiondoa kwenye mawasiliano wakati wowote

5. Kuki & Ufuatiliaji:
   - Tunatumia kuki chache kwa utendaji muhimu
   - Hakuna ufuatiliaji wa kuvuruga au matangazo ya tabia

6. Faragha ya Watoto:
   - Jukwaa letu limekusudiwa kwa watumiaji wenye umri wa miaka 13 na zaidi
   - Hatukusanyi data kutoka kwa watoto chini ya miaka 13 kwa makusudi

7. Mabadiliko ya Sera Hii:
   - Tunaweza kusasisha sera hii mara kwa mara
   - Kuendelea kutumia kunakubali mabadiliko

Wasiliana nasi kwa maswali yoyote ya faragha. Uaminifu wako ni takatifu kwetu.`,
    
    fr: `Chez The Providence, nous respectons profondément votre vie privée et nous nous engageons à protéger vos informations personnelles. Cette Politique de Confidentialité décrit comment nous collectons, utilisons et protégeons les données que vous fournissez lors de l'utilisation de notre plateforme.

1. Informations que nous collectons:
   - Adresses e-mail pour les abonnements à la newsletter
   - Commentaires et retours que vous fournissez volontairement
   - Statistiques d'utilisation anonymes pour améliorer nos services

2. Comment nous utilisons vos informations:
   - Pour vous envoyer du contenu spirituel et de santé pertinent
   - Pour améliorer nos offres éditoriales
   - Pour répondre à vos demandes
   - Jamais pour la vente commerciale à des tiers

3. Protection des données:
   - Nous mettons en œuvre des mesures de sécurité conformes aux normes de l'industrie
   - Vos données sont stockées en toute sécurité sur les serveurs Firebase
   - Nous conservons les informations uniquement aussi longtemps que nécessaire

4. Vos droits:
   - Accéder aux données personnelles que nous détenons sur vous
   - Demander la correction d'informations inexactes
   - Demander la suppression de vos données (avec exceptions pour obligations légales)
   - Vous désabonner des communications à tout moment

5. Cookies et suivi:
   - Nous utilisons des cookies minimaux pour les fonctionnalités essentielles
   - Pas de suivi invasif ni de publicité comportementale

6. Confidentialité des enfants:
   - Notre plateforme est destinée aux utilisateurs âgés de 13 ans et plus
   - Nous ne collectons pas sciemment de données auprès d'enfants de moins de 13 ans

7. Modifications de cette politique:
   - Nous pouvons mettre à jour cette politique périodiquement
   - L'utilisation continue constitue l'acceptation des changements

Contactez-nous pour toute préoccupation concernant la confidentialité. Votre confiance nous est sacrée.`
  },
  
  terms: {
    en: `Terms of Service for The Providence Digital Network

Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Welcome to The Providence! By accessing and using our platform, you agree to be bound by these Terms of Service.

1. Acceptance of Terms
   - By using our website, mobile applications, or services, you accept these Terms.
   - If you disagree with any part, please discontinue use immediately.

2. Description of Service
   - The Providence provides editorial content combining Biblical wisdom, health insights, and practical life guidance.
   - We reserve the right to modify or discontinue services at any time.

3. User Responsibilities
   - Use the platform for lawful purposes only
   - Respect intellectual property rights
   - Do not post harmful, abusive, or defamatory content
   - Maintain respectful discourse in comments
   - Do not attempt to compromise platform security

4. Content Ownership
   - All editorial content is owned by The Providence Digital Network
   - Users retain rights to their comments and contributions
   - By posting content, you grant us a non-exclusive license to display it

5. Health Disclaimer
   - Health and wellness information is for educational purposes only
   - Not a substitute for professional medical advice, diagnosis, or treatment
   - Always consult healthcare professionals for medical concerns
   - We are not liable for health decisions made based on our content

6. Spiritual Content
   - Our faith-based content reflects Christian Biblical perspectives
   - We respect diverse beliefs but remain committed to our editorial stance
   - Content may not align with all religious interpretations

7. Donation Terms
   - Donations support our digital ministry operations
   - All donations are non-refundable
   - We provide regular transparency reports on fund usage
   - Donations do not guarantee specific content or services

8. Account Termination
   - We may terminate accounts violating these Terms
   - Users may request account deletion at any time
   - Some content may remain for legal or operational reasons

9. Limitation of Liability
   - We are not liable for indirect, incidental, or consequential damages
   - We make no warranties about content accuracy or completeness
   - Use the platform at your own risk

10. Changes to Terms
    - We may update these Terms periodically
    - Continued use after changes constitutes acceptance
    - We will notify users of significant changes

11. Governing Law
    - These Terms are governed by applicable laws
    - Disputes will be resolved through peaceful dialogue first

12. Contact Information
    - For questions: contact@theprovidence.org
    - WhatsApp: ${SOCIAL_LINKS.whatsapp}
    - Response time: 2-3 business days

Thank you for being part of our community. Together, we build a space of wisdom, health, and faith.`,
    
    rw: `Amategeko yo Gukoresha Urubuga rwa Providence

Iheruka Gusubirwamo: ${new Date().toLocaleDateString('rw-RW', { year: 'numeric', month: 'long', day: 'numeric' })}

Murakaza neza kuri Providence! Mukoresha urubuga rwacu, mwemera kubahiriza aya mategeko.

1. Kwemera Amategeko
   - Ukoresha urubuga, porogaramu, cyangwa serivisi zacu, wemeye aya mategeko.
   - Utemera icyo ari cyo cyose, reka gukoresha ako kanya.

2. Ibyo Serivisi Zacu Zitanga
   - Providence itanga ibyigisho by'ubuhanuzi, ubuzima, n'inama z'ubuzima.
   - Dufite uburenganzira bwo guhindura cyangwa guhagarika serivisi igihe icyo ari cyo.

3. Inshingano z'Umukoresha
   - Koresha urubuga mu nzego z'amategeko gusa
   - Heza uburenganzira bw'ibigize ubuhanzi
   - Ntukandikirane ibitekereza bibi cyangwa bigira inabi
   - Koresha imvugo nziza mu bitekerezo
   - Ntugerageze kurimbura umutekano w'urubuga

4. Uburenganzira bw'Ibirimo
   - Byose biri kuri Providence ni ibyacu
   - Abakoresha bafite uburenganzira ku bitekerezo byabo
   - Ukandika ibintu, uduha uruhushya rwo kubigaragaza

5. Ibyerekeye Ubuzima
   - Amakuru y'ubuzima ni ay'uburezi gusa
   - Ntabwo ari inzira yo kwivuza
   - Saba inama ku baganga buri gihe
   - Ntitwabazwa n'ibyemezo by'ubuzima byakozwe hakurikijwe ibyacu

6. Iby'Ubwizigirwa
   - Ibiri kuri Providence birangwa n'ubwizigirwa bwa Bibiliya
   - Tubahiriza ibyemezo byose ariko turacyakomeje ku byacu
   - Ibiri hano bishobora kutahura n'ibindi byemezo

7. Amategeko y'Umutungo
   - Imitungo itanga ubufasha mu mirimo yacu
   - Imitungo ntabwo isubizwa
   - Turaba inkuru z'uko imitungo ikoreshwa
   - Imitungo ntabwo itanga icyizere cy'ibyo uzabona

8. Gukoma Konti
   - Dushobora gukoma konti zikora ibitaza amategeko
   - Umukoresha asaba gukoma konti ye igihe icyo ari cyo
   - Ibimwe bishobora gusigara biteganyijwe n'amategeko

9. Imbabazi
   - Ntitwabazwa n'ibyangiritse biturimo
   - Ntidusaba ko ibyacu ari byo byose
   - Ukoresha urubuga wibagirwa ko wariwe

10. Guhindura Amategeko
    - Dushobora kuyahindura rimwe na rimwe
    - Ukomeje gukoresha nyuma y'ibihinduka bishyigikira
    - Tuzababwira ibihindura by'ingenzi

11. Amategeko Akurikizwa
    - Aya mategeko akurikiza amategeko ashyirwaho
    - Amakimbirane agarurwa mu mvugo mbere

12. Amakuru yo Kutwandikira
    - Ibibazo: contact@theprovidence.org
    - WhatsApp: ${SOCIAL_LINKS.whatsapp}
    - Isaha yo gusubiza: iminsi 2-3 y'akazi

Murakoze kuba mu muryango wacu. Hamwe, dushyiraho ahantu h'ubwenge, ubuzima n'ukwizera.`,
    
    sw: `Sheria za Huduma za Mtandao wa Digital wa Providence

Ilisasishwa Mwisho: ${new Date().toLocaleDateString('sw-KE', { year: 'numeric', month: 'long', day: 'numeric' })}

Karibu kwenye Providence! Kwa kutumia jukwaa letu, unakubali kuzingatia Sheria hizi za Huduma.

1. Kukubali Sheria
   - Kwa kutumia tovuti, programu, au huduma zetu, unakubali Sheria hizi.
   - Ukikataa sehemu yoyote, tafadhali acha kutumia mara moja.

2. Maelezo ya Huduma
   - Providence inatoa maudhui ya kiuhakika yanayounganisha hekima ya Biblia, maelezo ya afya, na mwongozo wa vitendo wa maisha.
   - Tunahifadhi haki ya kurekebisha au kusitisha huduma wakati wowote.

3. Majukumu ya Mtumiaji
   - Tumia jukwaa kwa madhumuni halali tu
   - Heshima haki za kisanaa
   - Usichapishie maudhui yenye madhara, matukano, au kashifa
   - Dumisha mazungumzo ya heshima katika maoni
   - Usijaribu kudhoofisha usalama wa jukwaa

4. Umiliki wa Maudhui
   - Maudhui yote ya kiuhakika ni mali ya Mtandao wa Digital wa Providence
   - Watumiaji wanahifadhi haki za maoni na michango yao
   - Kwa kuchapisha maudhui, unatupa leseni isiyo ya kipekee ya kuionyesha

5. Kata ya Afya
   - Taarifa za afya na ustawi ni kwa madhumuni ya kielimu tu
   - Sio mbadala ya ushauri wa matibabu, utambuzi, au matibabu
   - Shauri wataalamu wa afya kila wakati kwa maswala ya kimatibabu
   - Hatuwajibiki kwa maamuzi ya afya yanayotolewa kulingana na maudhui yetu

6. Maudhui ya Kiroho
   - Maudhui yetu ya msingi wa imani yanaonyesha mitazamo ya Kikristo ya Biblia
   - Tunaheshimu imani mbalimbali lakini tunaendelea kushikamana na msimamo wetu wa kiuhakika
   - Maudhui yanaweza kusawazishwa na tafsiri zote za kidini

7. Sheria za Michango
   - Michango inasaidia operesheni za huduma yetu ya kidijitali
   - Michango yote hairudishwi
   - Tunatoa ripoti za uwazi mara kwa mara juu ya matumizi ya fedha
   - Michango haihakikishi maudhui au huduma maalum

8. Kukomesha Akaunti
   - Tunaweza kukomesha akaunti zinazokiuka Sheria hizi
   - Watumiaji wanaweza kuomba kufutwa kwa akaunti wakati wowote
   - Baadhi ya maudhui yanaweza kubaki kwa sababu za kisheria au za kiutendaji

9. Upungufu wa Wajibu
   - Hatuwajibiki kwa uharibifu usio wa moja kwa moja, wa bahati mbaya, au wa matokeo
   - Hatutoa hakikisho lolote kuhusu usahihi au ukamilifu wa maudhui
   - Tumia jukwaa kwa hatari yako mwenyewe

10. Mabadiliko ya Sheria
    - Tunaweza kusasisha Sheria hizi mara kwa mara
    - Kuendelea kutumia baada ya mabadiliko kunamaanisha kukubali
    - Tutawataarifu watumiaji kuhusu mabadiliko muhimu

11. Sheria Inayotawala
    - Sheria hizi zinatawaliwa na sheria zinazotumika
    - Migogoro itatatuliwa kwa mazungumzo ya amani kwanza

12. Maelezo ya Mawasiliano
    - Kwa maswali: contact@theprovidence.org
    - WhatsApp: ${SOCIAL_LINKS.whatsapp}
    - Muda wa kujibu: siku 2-3 za kazi

Asante kwa kuwa sehemu ya jumuiya yetu. Pamoja, tunaunda nafasi ya hekima, afya na imani.`,
    
    fr: `Conditions d'Utilisation du Réseau Numérique The Providence

Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}

Bienvenue sur The Providence ! En accédant et en utilisant notre plateforme, vous acceptez d'être lié par ces Conditions d'Utilisation.

1. Acceptation des Conditions
   - En utilisant notre site web, applications mobiles ou services, vous acceptez ces Conditions.
   - Si vous n'êtes pas d'accord avec une partie, veuillez cesser immédiatement toute utilisation.

2. Description du Service
   - The Providence fournit du contenu éditorial combinant sagesse biblique, conseils de santé et guide de vie pratique.
   - Nous nous réservons le droit de modifier ou d'interrompre les services à tout moment.

3. Responsabilités de l'Utilisateur
   - Utiliser la plateforme uniquement à des fins légales
   - Respecter les droits de propriété intellectuelle
   - Ne pas publier de contenu nuisible, abusif ou diffamatoire
   - Maintenir un discours respectueux dans les commentaires
   - Ne pas tenter de compromettre la sécurité de la plateforme

4. Propriété du Contenu
   - Tout le contenu éditorial appartient à The Providence Digital Network
   - Les utilisateurs conservent les droits sur leurs commentaires et contributions
   - En publiant du contenu, vous nous accordez une licence non exclusive pour l'afficher

5. Avertissement sur la Santé
   - Les informations sur la santé et le bien-être sont à des fins éducatives uniquement
   - Ne remplace pas les conseils, diagnostics ou traitements médicaux professionnels
   - Consultez toujours des professionnels de santé pour les problèmes médicaux
   - Nous ne sommes pas responsables des décisions de santé basées sur notre contenu

6. Contenu Spirituel
   - Notre contenu basé sur la foi reflète les perspectives bibliques chrétiennes
   - Nous respectons les croyances diverses mais restons engagés dans notre position éditoriale
   - Le contenu peut ne pas s'aligner sur toutes les interprétations religieuses

7. Conditions des Dons
   - Les dons soutiennent les opérations de notre ministère numérique
   - Tous les dons sont non remboursables
   - Nous fournissons des rapports réguliers de transparence sur l'utilisation des fonds
   - Les dons ne garantissent pas de contenu ou services spécifiques

8. Résiliation du Compte
   - Nous pouvons résilier les comptes violant ces Conditions
   - Les utilisateurs peuvent demander la suppression de leur compte à tout moment
   - Certains contenus peuvent rester pour des raisons légales ou opérationnelles

9. Limitation de Responsabilité
   - Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs
   - Nous ne faisons aucune garantie sur l'exactitude ou l'exhaustivité du contenu
   - Utilisez la plateforme à vos propres risques

10. Modifications des Conditions
    - Nous pouvons mettre à jour ces Conditions périodiquement
    - L'utilisation continue après les modifications constitue l'acceptation
    - Nous informerons les utilisateurs des changements significatifs

11. Droit Applicable
    - Ces Conditions sont régies par les lois applicables
    - Les différends seront résolus d'abord par le dialogue pacifique

12. Informations de Contact
    - Pour les questions : contact@theprovidence.org
    - WhatsApp : ${SOCIAL_LINKS.whatsapp}
    - Délai de réponse : 2-3 jours ouvrables

Merci de faire partie de notre communauté. Ensemble, nous construisons un espace de sagesse, de santé et de foi.`
  }
};

const baseArticles: Article[] = [
  {
    id: 'h1',
    category: Category.HEALTH,
    date: 'Oct 26, 2024',
    editor: 'Dr. Jean Uwizeye',
    editorBio: 'Specialist in nutrition and herbal medicine with 15 years of clinical practice.',
    tags: ['Health', 'Natural', 'Diet'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000',
    title: {
      en: 'The Biblical Diet: Foods for Longevity',
      rw: 'Imirire ya Bibiliya n\'Ubuzima burambye',
      sw: 'Chakula cha Biblia na Maisha Marefu',
      fr: 'Le Régime Biblique : Aliments pour la Longévité'
    },
    situation: {
      en: 'Modern processed foods are causing a rise in lifestyle diseases. Returning to natural, God-given foods is essential.',
      rw: 'Ibiryo bitunganyirizwa mu nganda biri guteza indwara nyinshi. Gusubira ku biryo karemano ni ingenzi.',
      sw: 'Vyakula vya kisasa vinasababisha magonjwa mengi. Kurudi kwenye vyakula vya asili ni muhimu.',
      fr: 'Les aliments transformés modernes provoquent une augmentation des maladies de civilisation.'
    },
    verse: {
      en: 'Genesis 1:29 - Then God said, "I give you every seed-bearing plant on the face of the whole earth..."',
      rw: 'Itangiriro 1:29 - Imana iravuga iti "Dore mbahaye imimero yose yera imbuto..."',
      sw: 'Mwanzo 1:29 - Mungu akasema, "Tazama, nimewapa kila mmea uzaao mbegu..."',
      fr: 'Genèse 1:29 - Et Dieu dit: "Voici, je vous donne toute herbe portant de la semence..." '
    },
    teaching: {
      en: 'Our bodies are temples. Nourishing them with whole grains, honey, and fresh plants reflects stewardship of Gods gift.',
      rw: 'Imibiri yacu ni insengero. Kuyigaburira neza bitanga icyubahiro Imana.',
      sw: 'Miili yetu ni hekalu la Mungu. Kuilisha vizuri ni wajibu wetu.',
      fr: 'Nos corps sont des temples. Les nourrir correctement est un acte d\'intendance.'
    },
    practice: {
      en: 'Replace one processed snack today with an apple or a handful of nuts.',
      rw: 'Kura ibiryo bifunze ushyireho imbuto uyu munsi.',
      sw: 'Badilisha chakula cha kusindika kwa matunda leo.',
      fr: 'Remplacez une collation transformée par un fruit aujourd\'hui.'
    },
    prayer: {
      en: 'Lord, help me to honor You by taking care of the body You gave me.',
      rw: 'Mwami mfasha guha icyubahiro umubiri wanjye ubinyuze mu mirire.',
      sw: 'Bwana, nisaidie kuuheshimu mwili wangu kwa kula vizuri.',
      fr: 'Seigneur, aide-moi à t\'honorer en prenant soin de mon corps.'
    },
    healthHacks: ['Drink water with lemon every morning', 'Walk 30 mins after dinner', 'Limit refined sugar'],
    herbalRemedies: ['Ginger tea for digestion', 'Garlic for immune support', 'Honey and Cinnamon for cough'],
    comments: [{ id: '1', author: 'Marie', text: 'This changed my diet completely!', date: 'Oct 27, 2024' }]
  },
  {
    id: '1',
    category: Category.DAILY_LIFE,
    date: 'Oct 24, 2024',
    editor: 'Elias Niyitegeka',
    tags: ['Stress', 'Faith', 'Mental Health'],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000',
    title: {
      en: 'Finding Peace in a Stressful Season',
      rw: 'Kubona amahoro mu bihe bigoye',
      sw: 'Kupata Amani katika Majira ya Msongo wa Mawazo',
      fr: 'Trouver la Paix dans une Saison Stressante'
    },
    situation: {
      en: 'Life feels overwhelming with endless bills and work pressure. Many believers struggle to find rest.',
      rw: 'Ubuzima burasa naho buremereye kubera inshingano nyinshi. Abemera benshi ntibaruhuka.',
      sw: 'Maisha yanahisi kulemea kwa bili zisizoisha na shinikizo la kazi.',
      fr: 'La vie semble accablante avec des factures interminables et la pression du travail.'
    },
    verse: {
      en: 'Philippians 4:6-7 - Do not be anxious about anything...',
      rw: 'Abafilipi 4:6-7 - Ntimukagire icyo mwiganyira...',
      sw: 'Wafilipi 4:6-7 - Msijisumbue kwa neno lo lote...',
      fr: 'Philippiens 4:6-7 - Ne vous inquiétez de rien...'
    },
    teaching: {
      en: 'God invites us to trade our anxiety for His supernatural peace through prayer and total reliance on His providence.',
      rw: 'Imana iduhamagarira guhara imihangayiko yacu tukayakira amahoro yayo binyuze mu masengesho.',
      sw: 'Mungu anatualika kubadilisha wasiwasi wetu kwa amani yake ya ajabu kupitia maombi.',
      fr: 'Dieu nous invite à échanger notre anxiété contre sa paix surnaturelle par la prière.'
    },
    practice: {
      en: 'Spend 5 minutes in silence today, listing 3 things you are grateful for.',
      rw: 'Fata iminota 5 utuje, wandike ibintu 3 ushimira Imana.',
      sw: 'Tumia dakika 5 kwa utulivu leo, ukiorodhesha vitu 3 unavyoshukuru.',
      fr: 'Passez 5 minutes en silence aujourd\'hui, en listant 3 choses pour lesquelles vous êtes reconnaissant.'
    },
    prayer: {
      en: 'Lord, give me the strength to trust You with my worries.',
      rw: 'Mwami, mpa imbaraga zo kukwizera mu byo ntekereza byose.',
      sw: 'Bwana, nipe nguvu ya kukuamini kwa wasiwasi wangu.',
      fr: 'Seigneur, donne-moi la force de Te faire confiance pour mes soucis.'
    }
  }
];

export const MOCK_ARTICLES: Article[] = Array.from({ length: 30 }).map((_, i) => ({
  ...baseArticles[i % 2],
  id: `${i + 1}`,
  date: `Oct ${24 - Math.floor(i / 3)}, 2024`,
  image: `https://picsum.photos/seed/${i + 100}/1200/800`
}));