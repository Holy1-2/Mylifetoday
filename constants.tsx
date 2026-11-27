import { Category, Language, Translations } from './types';

export const LANGUAGES: { code: Language; label: string; short: string; flag: string }[] = [
   { code: 'rw', label: 'Kinyarwanda', short: 'RW', flag: 'rw' },
   { code: 'en', label: 'English', short: 'EN', flag: 'gb' },
   { code: 'sw', label: 'Kiswahili', short: 'SW', flag: 'tz' },
   { code: 'fr', label: 'Français', short: 'FR', flag: 'fr' },
];

export const LOCALES: Record<Language, string> = {
   rw: 'rw-RW',
   en: 'en-US',
   sw: 'sw-KE',
   fr: 'fr-FR',
};

export const BRAND = {
   name: "Kubanan'Imana",
   short: "Kubanan'Imana",
   tagline: {
      rw: 'Muri Kristo Honyine',
      en: 'In christ alone',
      sw: 'Katika Kristo pekee',
      fr: 'En Jésus seul',
   } as Record<Language, string>,
   siteUrl: 'https://kubananimana.rw',
   email: 'amanitoprayhirwa@gmail.com',
};

export const TRANSLATIONS: Translations = {
   siteName: {
      rw: "Kubanan'Imana",
      en: "With God",
      sw: "Na mungu",
      fr: "Avec dieu",
   },
   tagline: {
      rw: 'Muri Kristo Honyine',
      en: 'In christ alone',
      sw: 'Katika Kristo pekee',
      fr: 'En Jésus seul',
   },
   categories: {
      [Category.DAILY_LIFE]: { rw: 'Ubuzima bwa buri munsi', en: 'Daily Life', sw: 'Maisha ya Kila Siku', fr: 'Vie Quotidienne' },
      [Category.MONEY_WORK]: { rw: 'Ubusonga n\'Akazi', en: 'Money & Work', sw: 'Fedha na Kazi', fr: 'Argent et Travail' },
      [Category.RELATIONSHIPS]: { rw: 'Imibanire', en: 'Relationships', sw: 'Mahusiano', fr: 'Relations' },
      [Category.MENTAL_HEALTH]: { rw: 'Intekerezo', en: 'Mental Health', sw: 'Afya ya Akili', fr: 'Santé Mentale' },
      [Category.TECH]: { rw: 'Ikoranabuhanga', en: 'Technology', sw: 'Teknolojia', fr: 'Technologie' },
      [Category.SOCIETY]: { rw: 'Umuryango', en: 'Society', sw: 'Jamii', fr: 'Société' },
      [Category.HOPE]: { rw: 'Ibyiringiro', en: 'Hope', sw: 'Tumaini', fr: 'Espoir' },
      [Category.HEALTH]: { rw: 'Amagara mazima', en: 'Health', sw: 'Afya', fr: 'Santé' },
      [Category.HISTORY]: { rw: 'Amateka', en: 'History', sw: 'Historia', fr: 'Histoire' },
      [Category.TESTIMONY]: { rw: 'Ubuhamya', en: 'Testimony', sw: 'Ushahidi', fr: 'Témoignage' },
   },
   ui: {
      /* ---------- Navigation & common ---------- */
      home: { rw: 'Ahabanza', en: 'Home', sw: 'Nyumbani', fr: 'Accueil' },
      media: { rw: 'Ibyigisho', en: 'Media', sw: 'Vyombo', fr: 'Médias' },
      search: { rw: 'Shakisha', en: 'Search', sw: 'Tafuta', fr: 'Rechercher' },
      verseOfDay: { rw: "Ijambo ry'umunsi", en: 'Verse of the Day', sw: 'Neno la Leo', fr: 'Verset du Jour' },
      journal: { rw: 'Urwibutso', en: 'My Journal', sw: 'Daftari Langu', fr: 'Mon Journal' },
      account: { rw: 'Konti', en: 'Account', sw: 'Akaunti', fr: 'Compte' },
      health: { rw: 'Amagara mazima', en: 'Health', sw: 'Afya', fr: 'Santé' },
      donate: { rw: 'Dushyigikire', en: 'Donate', sw: 'Changia', fr: 'Faire un don' },
      admin: { rw: 'Ubuyobozi', en: 'Admin', sw: 'Msimamizi', fr: 'Administration' },
      language: { rw: 'Ururimi', en: 'Language', sw: 'Lugha', fr: 'Langue' },
      readMore: { rw: 'Soma byose', en: 'Read more', sw: 'Soma zaidi', fr: 'Lire la suite' },
      loading: { rw: 'Birigutunganywa...', en: 'Loading...', sw: 'Inapakia...', fr: 'Chargement...' },
      error: { rw: 'Habaye ikibazo', en: 'Something went wrong', sw: 'Kuna hitilafu', fr: 'Une erreur est survenue' },
      retry: { rw: 'Ongera ugerageze ', en: 'Try again', sw: 'Jaribu tena', fr: 'Réessayer' },
      save: { rw: 'Bika', en: 'Save', sw: 'Hifadhi', fr: 'Enregistrer' },
      saved: { rw: 'Byabitswe', en: 'Saved', sw: 'Imehifadhiwa', fr: 'Enregistré' },
      saving: { rw: 'Birabikwa...', en: 'Saving...', sw: 'Inahifadhi...', fr: 'Enregistrement...' },
      remove: { rw: 'Kuraho', en: 'Remove', sw: 'Ondoa', fr: 'Retirer' },
      cancel: { rw: 'Hagarika', en: 'Cancel', sw: 'Ghairi', fr: 'Annuler' },
      close: { rw: 'Funga', en: 'Close', sw: 'Funga', fr: 'Fermer' },
      confirm: { rw: 'Emeza', en: 'Confirm', sw: 'Thibitisha', fr: 'Confirmer' },
      delete: { rw: 'Siba', en: 'Delete', sw: 'Futa', fr: 'Supprimer' },
      edit: { rw: 'Hindura', en: 'Edit', sw: 'Hariri', fr: 'Modifier' },
      back: { rw: 'Subira inyuma', en: 'Back', sw: 'Rudi', fr: 'Retour' },
      all: { rw: 'Byose', en: 'All', sw: 'Zote', fr: 'Tout' },
      optional: { rw: 'Si ngombwa', en: 'optional', sw: 'hiari', fr: 'facultatif' },
      copy: { rw: 'Koporora', en: 'Copy', sw: 'Nakili', fr: 'Copier' },
      copied: { rw: 'Byakoporowe', en: 'Copied', sw: 'Imenakiliwa', fr: 'Copié' },
      share: { rw: 'Sangiza', en: 'Share', sw: 'Shiriki', fr: 'Partager' },
      copyLink: { rw: 'Koporora link', en: 'Copy link', sw: 'Nakili kiungo', fr: 'Copier le lien' },
      linkCopied: { rw: 'Link yakokopowe', en: 'Link copied', sw: 'Kiungo kimenakiliwa', fr: 'Lien copié' },
      viewAll: { rw: 'Reba byose', en: 'View all', sw: 'Tazama zote', fr: 'Tout voir' },
      loadMore: { rw: 'Reba ibindi', en: 'Load more', sw: 'Pakia zaidi', fr: 'Charger plus' },
      allLoaded: { rw: 'Inkuru zose zaragaragaye', en: 'All articles loaded', sw: 'Makala zote zimepakiwa', fr: 'Tous les articles sont chargés' },
      quickCategories: { rw: 'Ibyiciro byihuse', en: 'Quick categories', sw: 'Kategoria za haraka', fr: 'Catégories rapides' },
      browseCategoriesSubtitle: {
         rw: 'Hitamo ikiciro ukunda utangire gusoma.',
         en: 'Pick a category you love and start reading.',
         sw: 'Chagua kategoria unayopenda na uanze kusoma.',
         fr: 'Choisissez une catégorie et commencez à lire.',
      },
      dailyBreadFeed: { rw: 'Ijambo rya buri munsi', en: 'Daily Bread Feed', sw: 'Neno la Kila Siku', fr: 'Pain Quotidien' },
      noResults: { rw: 'Nta cyabonetse', en: 'No results found', sw: 'Hakuna matokeo', fr: 'Aucun résultat' },
      today: { rw: 'Uyu munsi', en: 'Today', sw: 'Leo', fr: "Aujourd'hui" },
      pageNotFound: { rw: 'Iyi paji ntabwo ibonetse', en: 'Page not found', sw: 'Ukurasa haupatikani', fr: 'Page introuvable' },
      goHome: { rw: 'Subira ahabanza', en: 'Go home', sw: 'Rudi nyumbani', fr: "Retour à l'accueil" },

      /* ---------- Bible Quiz ---------- */
      
quiz: {
  rw: 'Isuzuma ry’Ubumenyi bwa Bibiliya',
  en: 'Bible Challenge',
  sw: 'Changamoto ya Biblia',
  fr: 'Défi Biblique'
},

quizReadyTitle: {
  rw: 'Usoma Bibiliya?',
  en: 'How well do you really know the Bible?',
  sw: 'Je, unaijua Biblia kwa undani kweli?',
  fr: 'Connaissez-vous vraiment bien la Bible ?'
},

quizReadyBody: {
  rw: 'Gerageza gusubiza ibibazo , bishingiye ku byo abantu bavuze, ibyabaye n’inyigisho zo muri Bibiliya.',
  en: 'You may have read the Bible many times, but how much do you actually remember? Test yourself with challenging questions about who said what, surprising events and hidden details. Can you get them all right?',
  sw: 'Huenda umesoma Biblia mara nyingi, lakini unakumbuka kiasi gani? Jipime kwa maswali magumu kuhusu nani alisema nini, matukio ya kushangaza na mambo ambayo wengi huyapuuza.',
  fr: 'Vous avez peut-être lu la Bible plusieurs fois, mais que retenez-vous vraiment ? Relevez le défi avec des questions difficiles sur les paroles, les événements surprenants et les détails souvent oubliés.'
},

quizReady: {
  rw: 'Reka mbigerageze!',
  en: 'Challenge me!',
  sw: 'Niko tayari kwa changamoto!',
  fr: 'Je relève le défi !'
},

quizLater: {
  rw: 'Nzagaruka nyuma',
  en: 'Maybe later',
  sw: 'Labda baadaye',
  fr: 'Peut-être plus tard'
},

quizCheck: {
  rw: 'Reba niba ari byo',
  en: 'Reveal my answer',
  sw: 'Angalia kama jibu ni sahihi',
  fr: 'Vérifier ma réponse'
},

quizCorrect: {
  rw: 'Wabikoze neza! ',
  en: 'Brilliant! You know your Scripture.',
  sw: 'Hongera! Unaifahamu Biblia vizuri.',
  fr: 'Excellent ! Vous connaissez bien les Écritures.'
},

quizWrong: {
  rw: 'Wegereje, ariko si cyo. Dore igisubizo nyacyo kandi umenye n’impamvu.',
  en: 'Not this time! Discover the correct answer and learn something new.',
  sw: 'Si sahihi wakati huu! Jifunze jibu sahihi na sababu yake.',
  fr: 'Pas cette fois ! Découvrez la bonne réponse et apprenez quelque chose de nouveau.'
},

quizCorrectAnswer: {
  rw: 'Igisubizo nyacyo',
  en: 'The right answer',
  sw: 'Jibu sahihi',
  fr: 'La bonne réponse'
},

quizExplanation: {
  rw: 'Menya impamvu n’aho byanditse',
  en: 'Discover the biblical explanation',
  sw: 'Jifunze maelezo ya kibiblia',
  fr: 'Comprendre l’explication biblique'
},

quizAnsweredBy: {
  rw: 'Abamaze kugerageza',
  en: 'People who took the challenge',
  sw: 'Walioshiriki changamoto',
  fr: 'Participants au défi'
},

quizFirst: {
  rw: 'Nta muntu uragerageza iki kibazo. Witeguye kugisubiza?',
  en: 'Nobody has dared to answer this one yet. Will you be the first?',
  sw: 'Bado hakuna aliyejaribu swali hili. Je, utakuwa wa kwanza?',
  fr: 'Personne n’a encore osé répondre. Serez-vous le premier ?'
},

quizNameLabel: {
  rw: 'Izina twakwita kuri uru rubuga',
  en: 'What should we call you?',
  sw: 'Tukuitaje?',
  fr: 'Comment souhaitez-vous être appelé ?'
},

quizNamePlaceholder: {
  rw: 'Andika izina uzagaragaraho',
  en: 'Enter your display name',
  sw: 'Andika jina lako',
  fr: 'Entrez votre nom affiché'
},

quizNameRequired: {
  rw: 'Andika izina kugira ngo dusangize abandi igisubizo cyawe.',
  en: 'Enter your name to share your answer.',
  sw: 'Tafadhali andika jina lako ili kushiriki jibu lako.',
  fr: 'Veuillez saisir votre nom pour partager votre réponse.'
},

quizAnother: {
  rw: 'Mpa ikindi kibazo!',
  en: 'Give me another challenge!',
  sw: 'Nipe changamoto nyingine!',
  fr: 'Proposez-moi un autre défi !'
},

quizOpen: {
  rw: 'Gerageza ibindi bibazo',
  en: 'Take more challenges',
  sw: 'Jaribu changamoto zaidi',
  fr: 'Relever d’autres défis'
},

quizPageSubtitle: {
  rw: 'Soma witonze, tekereza neza, maze ugerageze ubumenyi bwawe. Ibibazo bimwe bizagusaba gusubira muri Bibiliya kugira ngo ubone igisubizo.',
  en: 'Think carefully, recall the Scriptures and test your knowledge. Some questions may send you back to your Bible to find the answer.',
  sw: 'Fikiri kwa makini, kumbuka Maandiko na ujaribu maarifa yako. Baadhi ya maswali yatakufanya urudi kwenye Biblia kutafuta majibu.',
  fr: 'Réfléchissez attentivement, souvenez-vous des Écritures et testez vos connaissances. Certaines questions vous inviteront à rouvrir votre Bible.'
},

quizEmptyTitle: {
  rw: 'Ibibazo bishya biri gutegurwa!',
  en: 'New challenges are on the way!',
  sw: 'Changamoto mpya zinakuja!',
  fr: 'De nouveaux défis arrivent !'
},

quizEmptyBody: {
  rw: 'Turi gutegura ibibazo bizagufasha kongera gusoma no gusobanukirwa Bibiliya. Ongera uze vuba!',
  en: 'We are preparing thought-provoking Bible challenges to help you explore Scripture more deeply. Come back soon!',
  sw: 'Tunatayarisha maswali yatakayokusaidia kujifunza Biblia kwa undani zaidi. Rudi tena hivi karibuni!',
  fr: 'Nous préparons des défis bibliques pour vous aider à explorer les Écritures plus profondément. Revenez bientôt !'
},

quizScore: {
  rw: 'Amanota yawe',
  en: 'Your challenge score',
  sw: 'Alama zako',
  fr: 'Votre résultat'
},

quizAnswerCount: {
  rw: 'bamaze kugerageza',
  en: 'have taken the challenge',
  sw: 'wameshiriki',
  fr: 'ont participé'
},

quizNext: {
  rw: 'Komeza, ikindi kibazo kirategereje!',
  en: 'Keep going! Next challenge',
  sw: 'Endelea! Changamoto inayofuata',
  fr: 'Continuez ! Défi suivant'
},

quizContinuePage: {
  rw: 'Jya ku bibazo byose',
  en: 'Explore all Bible challenges',
  sw: 'Angalia changamoto zote',
  fr: 'Découvrir tous les défis bibliques'
},

quizNextShort: {
  rw: 'Ikibazo gikurikira',
  en: 'Next question',
  sw: 'Swali linalofuata',
  fr: 'Question suivante'
},

quizFinish: {
  rw: 'Rangiza quiz',
  en: 'Finish quiz',
  sw: 'Maliza jaribio',
  fr: 'Terminer le quiz'
},

quizResultsTitle: {
  rw: 'Ibisubizo byawe',
  en: 'Your results',
  sw: 'Matokeo yako',
  fr: 'Vos résultats'
},

quizYourAnswer: {
  rw: 'Igisubizo cyawe',
  en: 'Your answer',
  sw: 'Jibu lako',
  fr: 'Votre réponse'
},

quizAllDone: {
  rw: 'Urangije ibibazo byose! Ongera usome ibyo utabashije gusubiza neza, ukomeze gukura mu bumenyi bw’Ijambo ry’Imana.',
  en: 'You have completed every challenge! Revisit the questions you missed and keep growing in your understanding of Scripture.',
  sw: 'Umemaliza changamoto zote! Rudia maswali uliyokosea na uendelee kukua katika kulielewa Neno la Mungu.',
  fr: 'Vous avez terminé tous les défis ! Revoyez les questions manquées et continuez à approfondir votre connaissance des Écritures.'
},

quizCorrectShort: {
  rw: 'Wabimenye!',
  en: 'You got it!',
  sw: 'Umejibu vizuri!',
  fr: 'Bonne réponse !'
},

quizWrongShort: {
  rw: 'Ongera ugerageze',
  en: 'Not quite!',
  sw: 'Bado!',
  fr: 'Pas tout à fait !'
},
      /* ---------- Home ---------- */
      heroBadge: { rw: 'Ijambo rimwe ku munsi', en: 'One word, every day', sw: 'Neno moja, kila siku', fr: 'Une parole, chaque jour' },
      heroTitle: { rw: "Kubanan'Imana — Muri Kristo Honyine", en: "Kubanan'Imana — Muri Kristo Honyine", sw: "Kubanan'Imana — Muri Kristo Honyine", fr: "Kubanan'Imana — Muri Kristo Honyine" },
      heroSubtitle: {
         rw: 'Ibyigisho bigufi, isengesho n\'intambwe zifatika zo gukura mu kwizera.',
         en: 'Simple teachings, prayer and practical steps to grow in faith.',
         sw: 'Mafundisho rahisi, maombi na hatua za vitendo za kukua kwa imani.',
         fr: 'Enseignements simples, prière et étapes pratiques pour grandir dans la foi.',
      },
      latestArticles: { rw: 'Inkuru nshya', en: 'Latest articles', sw: 'Makala za hivi karibuni', fr: 'Derniers articles' },
      featured: { rw: 'Ibyatoranyijwe', en: 'Featured', sw: 'Zilizochaguliwa', fr: 'À la une' },
      trending: { rw: 'Ibyasomwe cyane', en: 'Trending', sw: 'Maarufu', fr: 'Tendances' },
      browseCategories: { rw: 'Shakisha mu byiciro', en: 'Browse by category', sw: 'Vinjari kwa kategoria', fr: 'Parcourir par catégorie' },
      allCategories: { rw: 'Ibyiciro byose', en: 'All categories', sw: 'Kategoria zote', fr: 'Toutes les catégories' },
      minRead: { rw: 'iminota {minutes} yo gusoma', en: 'min read', sw: 'dakika za kusoma', fr: 'min de lecture' },
      minReadOne: { rw: 'umunota 1 wo gusoma', en: 'min read', sw: 'dakika ya kusoma', fr: 'min de lecture' },
      byLabel: { rw: 'Na', en: 'By', sw: 'Na', fr: 'Par' },
      editorialDesk: { rw: 'Ibiro by\'ubwanditsi', en: 'Editorial Desk', sw: 'Ofisi ya Uhariri', fr: 'Rédaction' },
      newsletterTitle: { rw: 'Akira imirongo ya bibiliya buri cyumweru', en: 'Get a word every week', sw: 'Pokea neno kila wiki', fr: 'Recevez une parole chaque semaine' },
      newsletterSubtitle: {
         rw: 'Inyigisho nshya, amasengesho n\'ibitekerezo by\'ubuzima mu imeri yawe.',
         en: 'New teachings, prayers and wellbeing notes in your inbox.',
         sw: 'Mafundisho mapya, maombi na maelezo ya afya kwenye barua pepe yako.',
         fr: 'Nouveaux enseignements, prières et notes de bien-être dans votre boîte mail.',
      },
      subscribe: { rw: 'Iyandikishe', en: 'Subscribe', sw: 'Jiandikishe', fr: "S'abonner" },
      emailPlaceholder: { rw: 'Imeyili yawe', en: 'Your email', sw: 'Barua pepe yako', fr: 'Votre e-mail' },
      namePlaceholder: { rw: 'Amazina yawe', en: 'Your name', sw: 'Jina lako', fr: 'Votre nom' },
      emailRequired: { rw: 'Nyamuneka andika imeyili yawe.', en: 'Please enter your email.', sw: 'Tafadhali ingiza barua pepe yako.', fr: 'Veuillez saisir votre e-mail.' },
      emailInvalid: { rw: 'Banza wandike imeyili.', en: 'Please enter a valid email.', sw: 'Tafadhali ingiza barua pepe sahihi.', fr: 'Veuillez saisir un e-mail valide.' },
      subscribeSuccess: { rw: 'Murakoze kwiyandikisha!', en: 'Thank you for subscribing!', sw: 'Asante kwa kujiandikisha!', fr: 'Merci pour votre abonnement !' },
      subscribeAlready: { rw: 'Iyi imeyili yari yiyandikishije.', en: 'This email is already subscribed.', sw: 'Barua pepe hii tayari imesajiliwa.', fr: 'Cet e-mail est déjà abonné.' },
      subscribeFailed: { rw: 'Kwiyandikisha byanze. Ongera ugerageze.', en: 'Subscription failed. Please try again.', sw: 'Usajili umeshindikana. Tafadhali jaribu tena.', fr: "L'abonnement a échoué. Veuillez réessayer." },
      mediaHighlights: { rw: 'Amashusho n\'amajwi', en: 'Media highlights', sw: 'Vyakombo maalum', fr: 'Médias à la une' },
      exploreMedia: { rw: 'Reba icyigisho cyose', en: 'Explore all media', sw: 'Vinjari vyombo vyote', fr: 'Explorer tous les médias' },
      trendingArticles: { rw: 'Inkuru zasomwe cyane', en: 'Trending articles', sw: 'Makala zinazosomwa sana', fr: 'Articles les plus lus' },

      /* ---------- Article reading ---------- */
      publishedOn: { rw: 'Byasohotse', en: 'Published', sw: 'Ilichapishwa', fr: 'Publié' },
      situation: { rw: 'Uko ibintu biri', en: 'The situation', sw: 'Hali halisi', fr: 'La situation' },
      teaching: { rw: 'Icyigisho', en: 'The teaching', sw: 'Mafundisho', fr: "L'enseignement" },
      keyVerse: { rw: 'Isomo', en: 'Key Bible verse', sw: 'Mstari muhimu wa Biblia', fr: 'Verset biblique clé' },
      closingThought: { rw: 'Icyagufasha', en: 'Closing thought and prayer', sw: 'Wazo la mwisho na maombi', fr: 'Réflexion finale et prière' },
      practice: { rw: 'Intambwe ifatika', en: 'Practical step', sw: 'Hatua ya vitendo', fr: 'Étape pratique' },
      prayer: { rw: 'Isengesho', en: 'Prayer', sw: 'Maombi', fr: 'Prière' },
      healthSection: { rw: 'Ubuzima n\'imirire', en: 'Health & wellness', sw: 'Afya na ustawi', fr: 'Santé et bien-être' },
      healthHacks: { rw: 'Ibyo wakora', en: 'Health hacks', sw: 'Mbinu za afya', fr: 'Astuces santé' },
      herbalRemedies: { rw: 'Ibyo ukeneye', en: 'Herbal remedies', sw: 'Dawa za asili', fr: 'Remèdes naturels' },
      gallery: { rw: 'Amafoto', en: 'Gallery', sw: 'Picha', fr: 'Galerie' },
      audio: { rw: 'Amajwi', en: 'Audio', sw: 'Sauti', fr: 'Audio' },
      video: { rw: 'Video', en: 'Video', sw: 'Video', fr: 'Vidéo' },
      comments: { rw: 'Dusangize ibyo wize', en: 'Share What You Learned', sw: 'Tushirikishane Tulichojifunza', fr: 'Partageons ce que nous avons appris' },
      addYourThoughts: {
         rw: 'Ni iki wigiye muri ubu butumwa? Dusangize igitekerezo cyawe!',
         en: 'What did you take away from this message? Share your thoughts with us!',
         sw: 'Umejifunza nini kutokana na ujumbe huu? Tushirikishe mawazo yako!',
         fr: 'Qu’avez-vous retenu de ce message ? Partagez vos réflexions avec nous !',
      },
      commentsInvite: {
         rw: 'Ibyo wungutse bifite agaciro. Sangiza abandi isomo wakuye hano, baza ikibazo cyangwa utubwire uko ubu butumwa bwakugiriye akamaro.',
         en: 'Your experience matters. Share a lesson, ask a question, or tell us how this message inspired you.',
         sw: 'Uzoefu wako ni muhimu. Shiriki somo ulilojifunza, uliza swali au tueleze jinsi ujumbe huu ulivyokugusa.',
         fr: 'Votre expérience compte. Partagez une leçon, posez une question ou racontez comment ce message vous a inspiré.',
      },
      commentPlaceholder: {
         rw: 'Andika icyo wize, cyangwa igitekerezo cyawe...',
         en: 'Share what you learned, how this message spoke to you, or your personal perspective...',
         sw: 'Andika ulichojifunza, jinsi ujumbe huu ulivyokugusa, au maoni yako...',
         fr: 'Partagez ce que vous avez appris, ce que ce message vous inspire ou votre point de vue...',
      },
      postComment: {
         rw: 'Sangiza abandi igitekerezo cyawe',
         en: 'Share Your Thoughts',
         sw: 'Shiriki Mawazo Yako',
         fr: 'Partager mon avis',
      },
      postCommentShort: { rw: 'Sangiza', en: 'Share', sw: 'Shiriki', fr: 'Partager' },
      loadingComments: {
         rw: 'Turimo kureba ibyo abandi basangiye...',
         en: 'Bringing everyone’s thoughts together...',
         sw: 'Tunapakia mawazo ya wengine...',
         fr: 'Nous rassemblons les réflexions de chacun...',
      },
      noComments: {
         rw: 'Nta muntu urasangiza abandi icyo yigiye hano. Tangira ikiganiro! Igitekerezo cyawe gishobora no gufasha undi.',
         en: 'No one has shared their takeaway yet. Start the conversation! Your thoughts might encourage someone else.',
         sw: 'Bado hakuna aliyeshiriki alichojifunza. Anzisha mazungumzo! Mawazo yako yanaweza kumtia moyo mtu mwingine.',
         fr: 'Personne n’a encore partagé ce qu’il a retenu. Lancez la conversation ! Votre réflexion pourrait encourager quelqu’un.',
      },
      similarArticles: { rw: 'Inkuru zisa n\'iyi', en: 'Similar articles', sw: 'Makala zinazofanana', fr: 'Articles similaires' },
      saveArticle: { rw: 'Bika iyi nkuru', en: 'Save article', sw: 'Hifadhi makala', fr: "Enregistrer l'article" },
      articleSaved: { rw: 'Inkuru yabitswe', en: 'Article saved', sw: 'Makala imehifadhiwa', fr: 'Article enregistré' },
      saveToJournal: { rw: 'Bika mu rwibutso', en: 'Save to my journal', sw: 'Hifadhi kwenye daftari langu', fr: 'Enregistrer dans mon journal' },
      signInToSave: { rw: 'Injira kugira ngo ubike', en: 'Sign in to save', sw: 'Ingia ili kuhifadhi', fr: 'Connectez-vous pour enregistrer' },
      readingTime: { rw: 'Igihe cyo gusoma', en: 'Reading time', sw: 'Muda wa kusoma', fr: 'Temps de lecture' },
      shareOnWhatsApp: { rw: 'Sangiza kuri WhatsApp', en: 'Share on WhatsApp', sw: 'Shiriki kwa WhatsApp', fr: 'Partager sur WhatsApp' },
      shareOnFacebook: { rw: 'Sangiza kuri Facebook', en: 'Share on Facebook', sw: 'Shiriki kwa Facebook', fr: 'Partager sur Facebook' },
      shareOnX: { rw: 'Sangiza kuri X', en: 'Share on X', sw: 'Shiriki kwa X', fr: 'Partager sur X' },
      healthDisclaimerTitle: { rw: 'Icyitonderwa ku buzima', en: 'Health disclaimer', sw: 'Kanusho la afya', fr: 'Avertissement santé' },
      healthDisclaimer: {
         rw: 'Amakuru y\'ubuzima kuri uru rubuga  ntasimbura inama y\'umuganga.',
         en: 'Health information on this site is for education only and does not replace medical advice. Consult a qualified professional before changing any treatment.',
         sw: 'Taarifa za afya kwenye tovuti hii ni za kielimu tu na hazibadilishi ushauri wa daktari. Shauri mtaalamu kabla ya kubadilisha matibabu.',
         fr: "Les informations de santé de ce site sont éducatives et ne remplacent pas un avis médical. Consultez un professionnel avant de modifier un traitement.",
      },

      /* ---------- Search ---------- */
      searchTitle: { rw: 'Shakisha mu nkuru zose', en: 'Search every article', sw: 'Tafuta katika makala zote', fr: 'Rechercher dans tous les articles' },
      searchSubtitle: {
         rw: 'Andika ijambo, umurongo w\'umurongo cyangwa icyiciro.',
         en: 'Type a word, a Bible reference or a category.',
         sw: 'Andika neno, marejeo ya Biblia au kategoria.',
         fr: 'Tapez un mot, une référence biblique ou une catégorie.',
      },
      searchPlaceholder: { rw: 'Shakisha inkuru, amateka...', en: 'Search articles, topics...', sw: 'Tafuta makala, mada...', fr: 'Rechercher des articles...' },
      resultsFor: { rw: 'Ibisubizo kuri', en: 'Results for', sw: 'Matokeo ya', fr: 'Résultats pour' },
      searchEmptyHint: { rw: 'Gerageza ijambo ryoroshye cyangwa icyiciro.', en: 'Try a simpler word or a category.', sw: 'Jaribu neno rahisi au kategoria.', fr: 'Essayez un mot plus simple ou une catégorie.' },
      searching: { rw: 'Turashakisha...', en: 'Searching...', sw: 'Inatafuta...', fr: 'Recherche...' },
      newestFirst: { rw: 'Bishya mbere', en: 'Newest first', sw: 'Mpya kwanza', fr: "Plus récents d'abord" },
      clearSearch: { rw: 'Siba ibyo washakishije', en: 'Clear search', sw: 'Futa utafutaji', fr: 'Effacer la recherche' },
      resultCount: { rw: 'ibisubizo', en: 'results', sw: 'matokeo', fr: 'résultats' },

      /* ---------- Media ---------- */
      mediaTitle: { rw: 'Ibyigisho', en: 'Our media library', sw: 'Maktaba yetu ya vyombo', fr: 'Notre médiathèque' },
      mediaSubtitle: {
         rw: 'Videwo, amajwi, amafoto n\'amagambo y\'ubwenge — byose hamwe.',
         en: 'Videos, audio, images and quote cards — all in one place.',
         sw: 'Video, sauti, picha na kadi za maneno — mahali pamoja.',
         fr: 'Vidéos, audio, images et citations — au même endroit.',
      },
      mediaEmpty: { rw: 'Nta miyoboro irahari ubu.', en: 'No media published yet.', sw: 'Hakuna vyombo bado.', fr: 'Aucun média publié pour le moment.' },
      mediaSearch: { rw: 'Shakisha mu miyoboro...', en: 'Search videos, audio, images…', sw: 'Tafuta video, sauti, picha…', fr: 'Rechercher vidéos, audio, images…' },
      mediaNoResults: { rw: 'Nta kintu kibonetse', en: 'Nothing matches your search', sw: 'Hakuna kinacholingana', fr: 'Aucun résultat' },
      mediaNoResultsHint: {
         rw: 'Gerageza andi magambo cyangwa hindura icyiciro.',
         en: 'Try a different word or switch the filter.',
         sw: 'Jaribu neno lingine au badilisha kichujio.',
         fr: 'Essayez un autre mot ou changez le filtre.',
      },
      mediaItemsLabel: { rw: 'ibintu', en: 'items', sw: 'vitu', fr: 'éléments' },
      quote: { rw: 'Amagambo y\'ubwenge', en: 'Quote', sw: 'Neno', fr: 'Citation' },
      image: { rw: 'Ifoto', en: 'Image', sw: 'Picha', fr: 'Image' },
      youtube: { rw: 'YouTube', en: 'YouTube', sw: 'YouTube', fr: 'YouTube' },
      mediaCategories: { rw: 'Ibyiciro', en: 'Categories', sw: 'Kategoria', fr: 'Catégories' },
      mediaCat_teaching: { rw: 'Inyigisho', en: 'Teaching', sw: 'Mafundisho', fr: 'Enseignement' },
      mediaCat_testimony: { rw: 'Ubuhamya', en: 'Testimony', sw: 'Ushuhuda', fr: 'Témoignage' },
      mediaCat_worship: { rw: 'Kuramya', en: 'Worship', sw: 'Ibada', fr: 'Louange' },
      mediaCat_prayer: { rw: 'Isengesho', en: 'Prayer', sw: 'Maombi', fr: 'Prière' },
      mediaCat_health: { rw: 'Amagara mazima', en: 'Health', sw: 'Afya', fr: 'Santé' },
      mediaCat_family: { rw: 'Umuryango', en: 'Family', sw: 'Familia', fr: 'Famille' },
      mediaCat_money: { rw: 'Amafaranga', en: 'Stewardship', sw: 'Pesa na kazi', fr: 'Argent et travail' },
      mediaCat_youth: { rw: 'Urubyiruko', en: 'Youth', sw: 'Vijana', fr: 'Jeunesse' },
      mediaCat_conference: { rw: 'Inama', en: 'Conference', sw: 'Kongamano', fr: 'Conférence' },
      mediaCat_other: { rw: 'Ibindi', en: 'Other', sw: 'Nyingine', fr: 'Autre' },
      mediaLike: { rw: 'Kunda', en: 'Like', sw: 'Penda', fr: "J'aime" },
      mediaLiked: { rw: 'Wakunze', en: 'Liked', sw: 'Umependa', fr: 'Aimé' },
      mediaLikesLabel: { rw: 'abakunzi', en: 'likes', sw: 'wapendwa', fr: "mentions J'aime" },
      backToMedia: { rw: 'Subira ku byigisho', en: 'Back to media', sw: 'Rudi kwa vyombo', fr: 'Retour aux médias' },
      mediaNotFound: { rw: 'Iki kintu nticyabonetse', en: 'This media item was not found', sw: 'Kipengee hiki hakipatikani', fr: 'Ce média est introuvable' },
      mediaNotFoundHint: {
         rw: 'Wenda cyakuweho cyangwa nticyasohotse. Reba ibindi byigisho.',
         en: 'It may have been removed or not published yet. Browse the rest of the library.',
         sw: 'Huenda kimeondolewa au hakijachapishwa. Vinjari vyombo vingine.',
         fr: "Il a peut-être été retiré ou n'est pas encore publié. Parcourez le reste de la médiathèque.",
      },
      mediaDateLabel: { rw: 'Byashyizweho', en: 'Added', sw: 'Imeongezwa', fr: 'Ajouté' },
      mediaShare: { rw: 'Sangiza', en: 'Share', sw: 'Shiriki', fr: 'Partager' },
      mediaLinkCopied: { rw: 'Link yakoporowe', en: 'Link copied', sw: 'Kiungo kimenakiliwa', fr: 'Lien copié' },
      mediaReelHint: { rw: 'Kanda urebe, kunyereza ukurikire ibindi', en: 'Tap to play, swipe for more', sw: 'Gusa kutazama, telezesha kwa zaidi', fr: 'Touchez pour lire, balayez pour la suite' },
      mediaReelPrev: { rw: 'Ibibanza', en: 'Previous', sw: 'Iliyotangulia', fr: 'Précédent' },
      mediaReelNext: { rw: 'Ikurikira', en: 'Next', sw: 'Inayofuata', fr: 'Suivant' },
      scrollToTop: { rw: 'Subira hejuru', en: 'Back to top', sw: 'Rudi juu', fr: 'Haut de page' },
      scrollToBottom: { rw: 'Manuka hasi', en: 'Jump to bottom', sw: 'Shuka chini', fr: 'Bas de page' },

      /* ---------- Verse of the day ---------- */
      verseTitle: { rw: "Ijambo ry'umunsi", en: 'Verse of the Day', sw: 'Neno la Leo', fr: 'Verset du Jour' },
      verseSubtitle: {
         rw: 'Aya masomo ya bibiliya yatoranyirijwe  uyu munsi. Wayasangiza  abandi cyangwa ukayabika mu rwibutso rwawe.',
         en: 'A verse chosen for today. Save it, share it, or copy it.',
         sw: 'Neno lililochaguliwa leo. Hifadhi, shiriki au nakili.',
         fr: "Un verset choisi pour aujourd'hui. Enregistrez, partagez ou copiez.",
      },
      shareAsImage: { rw: 'Sangiza nk\'ifoto', en: 'Share as image', sw: 'Shiriki kama picha', fr: "Partager en image" },
      downloadImage: { rw: 'Kurura ifoto', en: 'Download image', sw: 'Pakua picha', fr: "Télécharger l'image" },
      creatingImage: { rw: 'Ifoto irikorwa...', en: 'Creating image...', sw: 'Picha inatengenezwa...', fr: "Création de l'image..." },
      copyVerse: { rw: 'Koporora ijambo', en: 'Copy verse', sw: 'Nakili neno', fr: 'Copier le verset' },
      saveVerse: { rw: 'Bika ijambo', en: 'Save verse', sw: 'Hifadhi neno', fr: 'Enregistrer le verset' },
      verseSaved: { rw: 'Ijambo ryabitswe mu nzibutso', en: 'Verse saved to your journal', sw: 'Neno limehifadhiwa kwenye daftari lako', fr: 'Verset enregistré dans votre journal' },
      previousVerses: { rw: 'Amagambo yahise', en: 'Previous verses', sw: 'Maneno yaliyopita', fr: 'Versets précédents' },
      verseEmptyTitle: { rw: "Nta jambo ry'umunsi uyu munsi", en: 'No verse of the day yet', sw: 'Hakuna neno la leo bado', fr: 'Pas encore de verset du jour' },
      verseEmptyHint: {
         rw: "Ijambo ry'umunsi rishyirwaho buri munsi. Subira uyu munsi cyangwa urebe amagambo yahise.",
         en: 'A new verse is published each day. Check back today or read the previous ones.',
         sw: 'Neno jipya huchapishwa kila siku. Rudi leo au soma yaliyopita.',
         fr: "Un nouveau verset est publié chaque jour. Revenez aujourd'hui ou lisez les précédents.",
      },

      /* ---------- Journal ---------- */
      journalTitle: { rw: 'Urwibutso rw\'umwuka', en: 'My Spiritual Journal', sw: 'Daftari Langu la Kiroho', fr: 'Mon Journal Spirituel' },
      journalSubtitle: {
         rw: 'Bika amagambo ya Bibiliya, andika ibitekerezo, kwibuka amasengesho yasubijwe n\'ibintu by\'ibanga.',
         en: 'Save Bible verses, write reflections, record answered prayers and keep private notes.',
         sw: 'Hifadhi mistari ya Biblia, andika tafakari, kumbuka maombi yaliyojibiwa na maelezo ya faragha.',
         fr: 'Enregistrez des versets, écrivez des réflexions, notez les prières exaucées et gardez des notes privées.',
      },
      reflections: { rw: 'Ibitekerezo', en: 'Reflections', sw: 'Tafakari', fr: 'Réflexions' },
      prayers: { rw: 'Amasengesho', en: 'Prayers', sw: 'Maombi', fr: 'Prières' },
      answered: { rw: 'Yasubijwe', en: 'Answered', sw: 'Yamejibiwa', fr: 'Exaucée' },
      notes: { rw: 'Inyandiko z\'ibanga', en: 'Private notes', sw: 'Maelezo ya faragha', fr: 'Notes privées' },
      savedArticles: { rw: 'Inkuru zabitswe', en: 'Saved articles', sw: 'Makala zilizohifadhiwa', fr: 'Articles enregistrés' },
      savedVerses: { rw: 'Amagambo yabitswe', en: 'Saved verses', sw: 'Mistari iliyohifadhiwa', fr: 'Versets enregistrés' },
      newReflection: { rw: 'Igitekerezo gishya', en: 'New reflection', sw: 'Tafakari mpya', fr: 'Nouvelle réflexion' },
      newPrayer: { rw: 'Isengesho rishya', en: 'New prayer', sw: 'Maombi mapya', fr: 'Nouvelle prière' },
      newNote: { rw: 'Inyandiko nshya', en: 'New note', sw: 'Maelezo mapya', fr: 'Nouvelle note' },
      entryTitle: { rw: 'Umutwe', en: 'Title', sw: 'Kichwa', fr: 'Titre' },
      entryText: { rw: 'Andika hano...', en: 'Write here...', sw: 'Andika hapa...', fr: 'Écrivez ici...' },
      verseReference: { rw: 'Umurongo wa Bibiliya', en: 'Bible reference', sw: 'Marejeo ya Biblia', fr: 'Référence biblique' },
      markAnswered: { rw: 'Yasubijwe', en: 'Mark answered', sw: 'Weka kama imejibiwa', fr: 'Marquer exaucée' },
      answeredBadge: { rw: 'Yasubijwe', en: 'Answered', sw: 'Imejibiwa', fr: 'Exaucée' },
      deleteEntry: { rw: 'Siba iyi nyandiko?', en: 'Delete this entry?', sw: 'Futa kumbukumbu hii?', fr: 'Supprimer cette entrée ?' },
      emptyJournal: { rw: 'Nta nyandiko ufite. Tangira wandike.', en: 'No entries yet. Start writing.', sw: 'Hakuna kumbukumbu. Anza kuandika.', fr: 'Aucune entrée. Commencez à écrire.' },
      emptySaved: { rw: 'Nta kintu wabika.', en: 'Nothing saved yet.', sw: 'Hakuna kilichohifadhiwa.', fr: 'Rien enregistré pour le moment.' },
      journalSignIn: { rw: 'Injira kugira ngo ukoreshe urwibutso rwawe', en: 'Sign in to open your journal', sw: 'Ingia kufungua daftari lako', fr: 'Connectez-vous pour ouvrir votre journal' },
      journalSignInText: {
         rw: 'Urwibutso rwawe ni rw\'ibanga kandi rurabikwa kuri konti yawe gusa.',
         en: 'Your journal is private and stored only on your account.',
         sw: 'Daftari lako ni la faragha na huhifadhiwa kwenye akaunti yako tu.',
         fr: 'Votre journal est privé et stocké uniquement sur votre compte.',
      },
      privateBadge: { rw: 'Ibanga', en: 'Private', sw: 'Faragha', fr: 'Privé' },
      entriesCount: { rw: 'inyandiko', en: 'entries', sw: 'kumbukumbu', fr: 'entrées' },

      /* ---------- Auth ---------- */
      signIn: { rw: 'Injira', en: 'Sign in', sw: 'Ingia', fr: 'Se connecter' },
      signUp: { rw: 'Fungura konti', en: 'Create account', sw: 'Fungua akaunti', fr: 'Créer un compte' },
      signOut: { rw: 'Sohoka', en: 'Sign out', sw: 'Toka', fr: 'Se déconnecter' },
      emailLabel: { rw: 'Imeyili', en: 'Email', sw: 'Barua pepe', fr: 'E-mail' },
      passwordLabel: { rw: 'Ijambo ry\'ibanga', en: 'Password', sw: 'Neno la siri', fr: 'Mot de passe' },
      confirmPasswordLabel: { rw: 'Emeza ijambo ry\'ibanga', en: 'Confirm password', sw: 'Thibitisha neno la siri', fr: 'Confirmer le mot de passe' },
      displayNameLabel: { rw: 'Amazina', en: 'Name', sw: 'Jina', fr: 'Nom' },
      signInTitle: { rw: 'Murakaza neza', en: 'Welcome back', sw: 'Karibu tena', fr: 'Bon retour' },
      signUpTitle: { rw: 'Fungura konti yawe', en: 'Create your account', sw: 'Fungua akaunti yako', fr: 'Créez votre compte' },
      signInSubtitle: { rw: 'Injira ubone urwibutso rwawe.', en: 'Sign in to reach your journal.', sw: 'Ingia kufikia daftari lako.', fr: 'Connectez-vous pour accéder à votre journal.' },
      signUpSubtitle: {
         rw: 'Konti ifasha kubika amagambo, ibitekerezo n\'amasengesho yawe.',
         en: 'An account keeps your verses, reflections and prayers together.',
         sw: 'Akaunti huhifadhi mistari, tafakari na maombi yako pamoja.',
         fr: 'Un compte rassemble vos versets, réflexions et prières.',
      },
      alreadyHaveAccount: { rw: 'Usanzwe ufite konti?', en: 'Already have an account?', sw: 'Tayari una akaunti?', fr: 'Vous avez déjà un compte ?' },
      noAccount: { rw: 'Nta konti ufite?', en: 'No account yet?', sw: 'Huna akaunti?', fr: "Pas encore de compte ?" },
      passwordMin: { rw: 'Ijambo ry\'ibanga rigomba kuba inyuguti 6 cyangwa zirenze.', en: 'Password must be at least 6 characters.', sw: 'Neno la siri liwe herufi 6 au zaidi.', fr: 'Le mot de passe doit contenir au moins 6 caractères.' },
      passwordMismatch: { rw: 'Amagambo y\'ibanga ntabwo ahura.', en: 'Passwords do not match.', sw: 'Maneno ya siri hayafanani.', fr: 'Les mots de passe ne correspondent pas.' },
      invalidCredentials: { rw: 'Imeyili cyangwa ijambo ry\'ibanga ntibyemewe.', en: 'Wrong email or password.', sw: 'Barua pepe au neno la siri si sahihi.', fr: 'E-mail ou mot de passe incorrect.' },
      emailInUse: { rw: 'Iyi imeyili isanzwe ikoreshwa.', en: 'This email is already in use.', sw: 'Barua pepe hii tayari inatumika.', fr: 'Cet e-mail est déjà utilisé.' },
      weakPassword: { rw: 'Ijambo ry\'ibanga ni imvugo nke.', en: 'That password is too weak.', sw: 'Neno la siri ni dhaifu sana.', fr: 'Ce mot de passe est trop faible.' },
      tooManyRequests: { rw: 'Wagerageje kenshi. Tegereza akanya.', en: 'Too many attempts. Please wait.', sw: 'Majaribio mengi. Tafadhali subiri.', fr: 'Trop de tentatives. Veuillez patienter.' },
      authGenericError: { rw: 'Ntibyakunze. Ongera ugerageze.', en: 'That did not work. Please try again.', sw: 'Haikufanikiwa. Tafadhali jaribu tena.', fr: "Cela n'a pas fonctionné. Veuillez réessayer." },
      accountTitle: { rw: 'Konti yawe', en: 'Your account', sw: 'Akaunti yako', fr: 'Votre compte' },
      accountSubtitle: { rw: 'Genzura amakuru yawe n\'ibyo wabika.', en: 'Manage your details and saved items.', sw: 'Simamia taarifa zako na vilivyohifadhiwa.', fr: 'Gérez vos informations et vos éléments enregistrés.' },
      memberSince: { rw: 'Umunyamuryango kuva', en: 'Member since', sw: 'Mwanachama tangu', fr: 'Membre depuis' },
      resetPassword: { rw: 'Guhindura ijambo ry\'ibanga', en: 'Reset password', sw: 'Weka upya neno la siri', fr: 'Réinitialiser le mot de passe' },
      resetSent: { rw: 'Twakohereje imeyili yo guhindura ijambo ry\'ibanga.', en: 'We sent you a password reset email.', sw: 'Tumekutumia barua pepe ya kubadilisha neno la siri.', fr: 'Nous vous avons envoyé un e-mail de réinitialisation.' },

      /* ---------- Donate & footer ---------- */
      donationHeader: { rw: 'Shyigikira {site}', en: 'Support {site}', sw: 'Saidia {site}', fr: 'Soutenir {site}' },
      donationDescription: {
         rw: 'Inkunga yawe ifasha gukodesha sever, kwishyura indangarubuga no kwagura ubukorwa kugira ngo  ubu butumwa bugere kuri benshi.',
         en: 'Your gift covers hosting, the domain and helps this message reach more people.',
         sw: 'Mchango wako hulipia hosting, domain na kufikisha ujumbe kwa watu wengi.',
         fr: "Votre don couvre l'hébergement, le domaine et aide ce message à atteindre plus de personnes.",
      },
      mobileMoneyLabel: { rw: 'Mobile Money (MoMo)', en: 'Mobile Money (MoMo)', sw: 'Mobile Money (MoMo)', fr: 'Mobile Money (MoMo)' },
      bankTransferLabel: { rw: 'Kohereza kuri banki', en: 'Bank transfer', sw: 'Uhamisho wa benki', fr: 'Virement bancaire' },
      donationPurposeLabel: { rw: 'Intego', en: 'Purpose', sw: 'Madhumuni', fr: 'Objet' },
      quickLinks: { rw: 'Link zihuse', en: 'Quick links', sw: 'Viungo vya haraka', fr: 'Liens rapides' },
      categories: { rw: 'Ibyiciro', en: 'Categories', sw: 'Kategoria', fr: 'Catégories' },
      network: { rw: 'Umuyoboro', en: 'Network', sw: 'Mtandao', fr: 'Réseau' },
      privacyTitle: { rw: 'Politiki y\'ibanga', en: 'Privacy Policy', sw: 'Sera ya Faragha', fr: 'Politique de confidentialité' },
      termsTitle: { rw: 'Amategeko yo gukoresha', en: 'Terms of Service', sw: 'Sheria za Huduma', fr: "Conditions d'utilisation" },
      rights: { rw: 'Uburenganzira bwose burafitwe.', en: 'All rights reserved.', sw: 'Haki zote zimehifadhiwa.', fr: 'Tous droits réservés.' },
      portfolio: { rw: 'Portfolio', en: 'Portfolio', sw: 'Portfolio', fr: 'Portfolio' },
      contactEditorial: { rw: 'Twandikire', en: 'Contact us', sw: 'Wasiliana nasi', fr: 'Contactez-nous' },
      joinWhatsApp: { rw: 'Injira mu WhatsApp', en: 'Join WhatsApp', sw: 'Jiunge na WhatsApp', fr: 'Rejoindre WhatsApp' },
      footerNote: {
         rw: 'Kwizera ,  ubuzima n\'ubwenge bishingiye kuri Bibiliya.',
         en: 'A space for faith, wellbeing and biblical wisdom.',
         sw: 'Nafasi ya imani, afya na hekima ya Biblia.',
         fr: 'Un espace de foi, de bien-être et de sagesse biblique.',
      },
   },
};

export const DONATION = {
   momoNumber: '+250795756252',
   momoName: 'HIRWA AMANI TOPRAY',
   bankName: 'Bank of Kigali',
   bankAccount: '4006112964359',
   purpose: 'Digital Ministry & Health Awareness',
};

export const SOCIAL_LINKS = {
   whatsapp: 'https://whatsapp.com/channel/0029VbCMYTyBadmitOpkBC15',
   facebook: 'https://www.facebook.com/profile.php?id=61559771027291',
   instagram: 'https://www.instagram.com/hirwa.topray/',
   email: BRAND.email,
};

const LAST_UPDATED = new Date().toLocaleDateString('en-US', {
   year: 'numeric',
   month: 'long',
   day: 'numeric',
});

export const LEGAL = {
   privacy: {
      en: `At ${BRAND.name}, we deeply respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use and safeguard the data you provide while using this platform.

1. Information We Collect
   - Email address for newsletter subscriptions and account creation
   - Journal entries you create (reflections, prayers, notes, saved verses and articles)
   - Comments and feedback you voluntarily provide
   - Anonymous usage statistics that help us improve the site

2. How We Use Your Information
   - To send you relevant spiritual and health content
   - To keep your private journal available across devices
   - To improve our editorial offerings
   - We never sell your data to third parties

3. Data Protection
   - We use industry-standard security measures
   - Data is stored securely on Google Firebase
   - Your journal is private and readable only by you

4. Your Rights
   - Access the personal data we hold about you
   - Request correction of inaccurate information
   - Request deletion of your data
   - Opt out of communications at any time

5. Cookies & Tracking
   - We use only essential cookies for core functionality
   - No invasive tracking or behavioural advertising

6. Children's Privacy
   - The platform is intended for users aged 13 and above
   - We do not knowingly collect data from children under 13

7. Changes to This Policy
   - We may update this policy from time to time
   - Continued use means you accept the updated policy

Questions? Write to ${BRAND.email}. Your trust is sacred to us.`,

      rw: `Kuri ${BRAND.name}, tubahiriza cyane ibanga ryawe kandi twiyemeje kurinda amakuru yawe bwite. Iyi Politiki y'Ibanga isobanura uko dukusanya, dukoresha kandi dukinga amakuru uduha igihe ukoresha uru rubuga.

1. Amakuru Dukusanya
   - Imeyili yo kwiyandikisha ku makuru no gufungura konti
   - Inyandiko ziri mu rwibusto (ibitekerezo, amasengesho, inyandiko, amagambo n'inkuru ubika)
   - Ibitekerezo n'ibisubizo utanga ku bushake
   - Imibare y'ikoreshwa itazwi ifasha kunoza urubuga

2. Uko Dukoresha Amakuru Yawe
   - Kukohereza ibyigisho by'ubwizigirwa n'ubuzima bikwiye
   - Kubika inzibutso rw'ibanga ku bikoresho byose
   - Kunoza serivisi zacu
   - Ntitugurisha amakuru yawe ku bantu b'ahandi

3. Kurinda Amakuru
   - Dukoresha uburyo bukomeye bwo kurinda amakuru
   - Amakuru abikwa neza kuri Google Firebase
   - Urwibutso rwawe ni ibanga kandi ni wowe wenyine ushobora kurusoma

4. Uburenganzira Bwawe
   - Kureba amakuru yawe dufite
   - Gusaba gukosora amakuru atari yo
   - Gusaba gusiba amakuru yawe
   - Kutazakira ubutumwa igihe icyo ari cyo

5. Amakuki
   - Dukoresha amakuki akenewe gusa
   - Nta gukurikirana amakuru yawe cyangwa kwamamaza bikabije

6. Ibanga ry'Abana
   - Urubuga rwagenewe abafite imyaka 13 n'ibirenzeho
   - Ntidukusanya amakuru ku bana bari munsi y'imyaka 13

7. Guhindura Iyi Politiki
   - Dushobora kuyihindura rimwe na rimwe
   - Gukomeza gukoresha bisobanura ko wemera impinduka

Ufite ikibazo? Twandikire kuri ${BRAND.email}. Icyizere cyawe ni icyubahiro kuri twe.`,

      sw: `Katika ${BRAND.name}, tunaheshimu sana faragha yako na tumejitolea kulinda taarifa zako binafsi. Sera hii inaeleza jinsi tunavyokusanya, kutumia na kulinda data unayotoa unapotumia jukwaa hili.

1. Taarifa Tunazokusanya
   - Barua pepe kwa ajili ya jarida na kufungua akaunti
   - Kumbukumbu za daftari lako (tafakari, maombi, maelezo, mistari na makala zilizohifadhiwa)
   - Maoni unayotoa kwa hiari
   - Takwimu zisizo na majina zinazotusaidia kuboresha tovuti

2. Jinsi Tunavyotumia Taarifa
   - Kukutumia maudhui ya kiroho na afya
   - Kuhifadhi daftari lako la faragha kwenye vifaa vyote
   - Kuboresha huduma zetu
   - Hatuuzi data yako kwa wahusika wengine

3. Ulinzi wa Data
   - Tunatumia hatua za usalama za kiwango cha juu
   - Data huhifadhiwa kwa usalama kwenye Google Firebase
   - Daftari lako ni la faragha na wewe pekee unaweza kuliona

4. Haki Zako
   - Kuona taarifa tunazokuwa nazo
   - Kuomba kusahihishwa kwa taarifa zisizo sahihi
   - Kuomba kufutwa kwa data yako
   - Kuacha kupokea mawasiliano wakati wowote

5. Kuki
   - Tunatumia kuki muhimu tu
   - Hakuna ufuatiliaji wa kuvuruga au matangazo ya tabia

6. Faragha ya Watoto
   - Jukwaa limekusudiwa watumiaji wenye umri wa miaka 13 na zaidi
   - Hatukusanyi data kutoka kwa watoto chini ya miaka 13

7. Mabadiliko ya Sera
   - Tunaweza kusasisha sera hii mara kwa mara
   - Kuendelea kutumia kunamaanisha unakubali mabadiliko

Una swali? Tuandikie ${BRAND.email}. Uaminifu wako ni mtakatifu kwetu.`,

      fr: `Chez ${BRAND.name}, nous respectons profondément votre vie privée et nous nous engageons à protéger vos informations personnelles. Cette politique explique comment nous collectons, utilisons et protégeons les données que vous fournissez sur cette plateforme.

1. Informations collectées
   - Adresse e-mail pour la newsletter et la création de compte
   - Entrées de votre journal (réflexions, prières, notes, versets et articles enregistrés)
   - Commentaires et retours que vous fournissez volontairement
   - Statistiques d'utilisation anonymes pour améliorer le site

2. Utilisation de vos informations
   - Vous envoyer du contenu spirituel et de santé pertinent
   - Conserver votre journal privé sur tous vos appareils
   - Améliorer nos services éditoriaux
   - Nous ne vendons jamais vos données à des tiers

3. Protection des données
   - Nous appliquons des mesures de sécurité conformes aux standards
   - Les données sont stockées en sécurité sur Google Firebase
   - Votre journal est privé et lisible uniquement par vous

4. Vos droits
   - Accéder aux données personnelles vous concernant
   - Demander la correction d'informations inexactes
   - Demander la suppression de vos données
   - Vous désabonner des communications à tout moment

5. Cookies
   - Nous utilisons uniquement des cookies essentiels
   - Aucun suivi invasif ni publicité comportementale

6. Confidentialité des enfants
   - La plateforme est destinée aux utilisateurs de 13 ans et plus
   - Nous ne collectons pas sciemment de données auprès d'enfants de moins de 13 ans

7. Modifications
   - Nous pouvons mettre à jour cette politique périodiquement
   - L'utilisation continue vaut acceptation

Des questions ? Écrivez à ${BRAND.email}. Votre confiance nous est sacrée.`,
   },

   terms: {
      en: `Terms of Service — ${BRAND.name}

Last updated: ${LAST_UPDATED}

Welcome! By accessing and using this platform you agree to these Terms of Service.

1. Acceptance of Terms
   - Using this website or its services means you accept these Terms.
   - If you disagree with any part, please stop using the platform.

2. Description of Service
   - ${BRAND.name} provides editorial content combining biblical wisdom, health insights and practical life guidance.
   - We may modify or discontinue services at any time.

3. User Responsibilities
   - Use the platform for lawful purposes only
   - Respect intellectual property rights
   - Do not post harmful, abusive or defamatory content
   - Keep comments respectful
   - Do not attempt to compromise platform security

4. Content Ownership
   - All editorial content belongs to ${BRAND.name}
   - Users retain rights to their comments and journal entries
   - By posting public content you grant us a non-exclusive licence to display it

5. Health Disclaimer
   - Health and wellness information is for education only
   - It is not a substitute for professional medical advice, diagnosis or treatment
   - Always consult a qualified healthcare professional

6. Spiritual Content
   - Our content reflects Christian biblical perspectives

7. Donations
   - Donations support the operation of this digital ministry


8. Accounts
   - You are responsible for keeping your password secure
   - We may suspend accounts that violate these Terms
   - You may request deletion of your account at any time

9. Limitation of Liability
   - We are not liable for indirect, incidental or consequential damages
   - Use the platform at your own risk

10. Changes to Terms
    - We may update these Terms periodically
    - Continued use after changes constitutes acceptance

11. Governing Law
    - These Terms are governed by applicable laws
    - Disputes will first be resolved through peaceful dialogue

12. Contact
    - Email: ${BRAND.email}
    - WhatsApp: ${SOCIAL_LINKS.whatsapp}
    - Response time: 2-3 business days

Thank you for being part of this community.`,

      rw: `Amategeko yo Gukoresha — ${BRAND.name}

Iheruka gusubirwamo: ${LAST_UPDATED}

Murakaza neza! Mukoresha uru rubuga, mwemera kubahiriza aya mategeko.

1. Kwemera Amategeko
   - Gukoresha urubuga cyangwa serivisi zacu bisobanura ko wemera aya mategeko.
   - Ntutemera igice runaka, reka gukoresha urubuga.

2. Ibyo Serivisi Zitanga
   - ${BRAND.name} itanga ibyigisho bishingiye ku bubasha bwa Bibiliya, ubuzima n'inama zifatika.
   - Dushobora guhindura cyangwa guhagarika serivisi igihe icyo ari cyo.

3. Inshingano z'Umukoresha
   - Koresha urubuga mu nzira zemewe n'amategeko gusa
   - Genzura uburenganzira bw'ibihangano
   - Ntutange ibitekerezo bibi, biteye akaga cyangwa bisebanya
   - Koresha imvugo nziza mu bitekerezo
   - Ntugerageze kwangiza umutekano w'urubuga

4. Uburenganzira bw'Ibirimo
   - Ibirimo byose by'ubwanditsi ni ibya ${BRAND.name}
   - Abakoresha bafite uburenganzira ku bitekerezo byabo n'inyandiko z'urwibutso rwabo
   - Utangaje ibirimo rusange, uduha uruhushya rwo kubigaragaza

5. Ibyerekeye Ubuzima
   
   - Amakuru y'ubuzima ntasimbura inama y'umuganga, gusuzuma cyangwa ubuvuzi
   - Baza umuganga w'inzobere buri gihe
  

6. Iby'Ubwizigirwa
   - Ibirimo byacu bishingiye ku myumvire ya Bibiliya ya gikristo

7. Inkunga
   - Inkunga ishyigikira umurimo wacu wwikoranabuhanga

8. Konti
   - Ushinzwe kurinda ijambo ry'ibanga ryawe
   - Dushobora guhagarika konti zica amategeko
   - Ushobora gusaba gusiba konti yawe igihe icyo ari cyo

9. Imbogamizi z'Ubwishingizi
   - Ntitwabazwa n'ibyangijwe bitaziguye cyangwa by'inyongera
   - Koresha urubuga ku nshingano zawe

10. Guhindura Amategeko
    - Dushobora kuyahindura rimwe na rimwe
    - Gukomeza gukoresha nyuma y'impinduka bisobanura ko wemera

11. Amategeko Akurikizwa
    - Aya mategeko akurikiza amategeko asanzwe
    - Ibibazo bikemurwa mbere mu biganiro by'amahoro

12. Aho Kutwandikira
    - Imeyili: ${BRAND.email}
    - WhatsApp: ${SOCIAL_LINKS.whatsapp}
    - Igihe cyo gusubiza: iminsi 2-3 y'akazi

Murakoze kuba mu muryango wacu.`,

      sw: `Sheria za Huduma — ${BRAND.name}

Ilisasishwa mwisho: ${LAST_UPDATED}

Karibu! Kwa kutumia jukwaa hili unakubali Sheria hizi.

1. Kukubali Sheria
   - Kutumia tovuti hii au huduma zake kunamaanisha unakubali Sheria hizi.
   - Usipokubaliana na sehemu yoyote, tafadhali acha kutumia jukwaa.

2. Maelezo ya Huduma
   - ${BRAND.name} inatoa maudhui yanayounganisha hekima ya Biblia, afya na mwongozo wa maisha.
   - Tunaweza kubadilisha au kusitisha huduma wakati wowote.

3. Majukumu ya Mtumiaji
   - Tumia jukwaa kwa madhumuni halali tu
   - Heshimu haki za miliki
   - Usichapishe maudhui yenye madhara, matusi au kashfa
   - Dumisha mazungumzo ya heshima
   - Usijaribu kudhoofisha usalama wa jukwaa

4. Umiliki wa Maudhui
   - Maudhui yote ya uhariri ni mali ya ${BRAND.name}
   - Watumiaji wanahifadhi haki za maoni na kumbukumbu zao
   - Kwa kuchapisha maudhui ya umma unatupa leseni ya kuyaonyesha

5. Kanusho la Afya
   - Taarifa za afya ni kwa elimu tu
   - Si mbadala wa ushauri, uchunguzi au matibabu ya kitaalamu
   - Shauri mtaalamu wa afya kila wakati
   - Hatuwajibiki kwa maamuzi ya afya kulingana na maudhui yetu

6. Maudhui ya Kiroho
   - Maudhui yetu yanaonyesha mitazamo ya Biblia ya Kikristo
   - Tunaheshimu imani mbalimbali huku tukishikamana na msimamo wetu

7. Michango
   - Michango inasaidia uendeshaji wa huduma hii ya kidijitali
   - Michango hairudishwi
   - Michango haihakikishi maudhui au huduma maalum

8. Akaunti
   - Unawajibika kulinda neno lako la siri
   - Tunaweza kusimamisha akaunti zinazovunja Sheria hizi
   - Unaweza kuomba kufutwa kwa akaunti yako wakati wowote

9. Kikomo cha Dhima
   - Hatuwajibiki kwa hasara zisizo za moja kwa moja
   - Tumia jukwaa kwa hatari yako mwenyewe

10. Mabadiliko ya Sheria
    - Tunaweza kusasisha Sheria hizi mara kwa mara
    - Kuendelea kutumia baada ya mabadiliko ni kukubali

11. Sheria Inayotawala
    - Sheria hizi zinaongozwa na sheria zinazotumika
    - Migogoro itatatuliwa kwa mazungumzo ya amani kwanza

12. Mawasiliano
    - Barua pepe: ${BRAND.email}
    - WhatsApp: ${SOCIAL_LINKS.whatsapp}
    - Muda wa kujibu: siku 2-3 za kazi

Asante kwa kuwa sehemu ya jumuiya hii.`,

      fr: `Conditions d'Utilisation — ${BRAND.name}

Dernière mise à jour : ${LAST_UPDATED}

Bienvenue ! En accédant et en utilisant cette plateforme, vous acceptez ces Conditions.

1. Acceptation des Conditions
   - Utiliser ce site ou ses services implique l'acceptation de ces Conditions.
   - Si vous n'êtes pas d'accord, veuillez cesser toute utilisation.

2. Description du Service
   - ${BRAND.name} fournit du contenu éditorial combinant sagesse biblique, santé et conseils de vie pratique.
   - Nous pouvons modifier ou interrompre les services à tout moment.

3. Responsabilités de l'Utilisateur
   - Utiliser la plateforme à des fins légales uniquement
   - Respecter les droits de propriété intellectuelle
   - Ne pas publier de contenu nuisible, abusif ou diffamatoire
   - Garder des commentaires respectueux
   - Ne pas tenter de compromettre la sécurité de la plateforme

4. Propriété du Contenu
   - Tout le contenu éditorial appartient à ${BRAND.name}
   - Les utilisateurs conservent les droits sur leurs commentaires et entrées de journal
   - En publiant du contenu public, vous nous accordez une licence non exclusive d'affichage

5. Avertissement Santé
   - Les informations de santé sont éducatives uniquement
   - Elles ne remplacent pas un avis médical, un diagnostic ou un traitement
   - Consultez toujours un professionnel de santé qualifié
   - Nous ne sommes pas responsables des décisions de santé prises sur la base de nos contenus

6. Contenu Spirituel
   - Notre contenu reflète les perspectives bibliques chrétiennes
   - Nous respectons les croyances diverses tout en restant fidèles à notre position éditoriale

7. Dons
   - Les dons soutiennent le fonctionnement de ce ministère numérique
   - Les dons ne sont pas remboursables
   - Les dons ne garantissent aucun contenu ou service spécifique

8. Comptes
   - Vous êtes responsable de la sécurité de votre mot de passe
   - Nous pouvons suspendre les comptes qui violent ces Conditions
   - Vous pouvez demander la suppression de votre compte à tout moment

9. Limitation de Responsabilité
   - Nous ne sommes pas responsables des dommages indirects ou consécutifs
   - Utilisez la plateforme à vos propres risques

10. Modifications
    - Nous pouvons mettre à jour ces Conditions périodiquement
    - L'utilisation continue après modification vaut acceptation

11. Droit Applicable
    - Ces Conditions sont régies par les lois applicables
    - Les différends seront d'abord résolus par un dialogue pacifique

12. Contact
    - E-mail : ${BRAND.email}
    - WhatsApp : ${SOCIAL_LINKS.whatsapp}
    - Délai de réponse : 2-3 jours ouvrables

Merci de faire partie de cette communauté.`,
   },
};
