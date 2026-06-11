export const landingImages = {
  hero: '/images/landing/hero-career-signal-map.webp',
  productCollage: '/images/landing/product-mockup-collage.webp',
  cvAnalysis: '/images/landing/cv-analysis-illustration.webp',
  matching: '/images/landing/ai-matching-illustration.webp',
  careerAssistant: '/images/landing/career-assistant-illustration.webp',
  companyDashboard: '/images/landing/company-dashboard-illustration.webp',
  mobileApp: '/images/landing/mobile-app-mockup.webp',
  agents: '/images/landing/agents-orchestration.webp',
  rag: '/images/landing/rag-knowledge-insights.webp',
  motivationLetter: '/images/landing/motivation-letter-generator.webp',
  background: '/images/landing/abstract-ai-background.webp',
  divider: '/images/landing/section-divider-wave.webp',
  cta: '/images/landing/cta-opportunity-bridge.webp',
  problemSolution: '/images/landing/problem-solution.webp',
  studentJourney: '/images/landing/student-journey.webp',
  companyJourney: '/images/landing/company-journey.webp',
  explainableAi: '/images/landing/explainable-ai.webp',
  icons: {
    cv: '/images/landing/icon-cv-analysis.png',
    matching: '/images/landing/icon-smart-matching.png',
    motivation: '/images/landing/icon-motivation-letter.png',
    career: '/images/landing/icon-career-assistant.png',
    ranking: '/images/landing/icon-candidate-ranking.png',
    rag: '/images/landing/icon-rag-knowledge.png',
  },
};

export const navLinks = [
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Parcours', href: '#journeys' },
  { label: 'IA', href: '#ai' },
  { label: 'Produit', href: '#product' },
  { label: 'Contact', href: '#contact' },
];

export const heroSignals = ['Analyse CV', 'Matching IA', 'Classement candidat', 'Assistant carriere'];

export const skillBadges = ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AI'];

export const problemPoints = [
  'Les etudiants ne savent pas toujours quelles offres cibler.',
  'Les recruteurs recoivent des candidatures difficiles a comparer.',
  'Les competences reelles ne sont pas toujours visibles rapidement.',
];

export const solutionPoints = [
  'Analyse les CV et extrait les competences utiles.',
  'Comprend les offres et leurs criteres techniques.',
  'Calcule une compatibilite avec un score explicable.',
  'Propose des pistes de progression sans inventer le profil.',
];

export const features = [
  {
    title: 'Analyse CV intelligente',
    text: 'Extraction des competences, formation, experience et objectifs depuis le CV etudiant.',
    icon: landingImages.icons.cv,
    image: landingImages.cvAnalysis,
  },
  {
    title: 'Matching IA',
    text: 'Comparaison entre profil etudiant et offre de stage avec score explicable.',
    icon: landingImages.icons.matching,
    image: landingImages.matching,
  },
  {
    title: 'Recommandations personnalisees',
    text: 'Les etudiants decouvrent les offres les plus pertinentes selon leurs competences.',
    icon: landingImages.icons.rag,
    image: landingImages.matching,
  },
  {
    title: 'Lettre de motivation generee',
    text: 'Generation d une lettre adaptee a l offre sans inventer de competences.',
    icon: landingImages.icons.motivation,
    image: landingImages.motivationLetter,
  },
  {
    title: 'Assistant carriere',
    text: 'Conseils personnalises pour transformer les ecarts de competences en plan d action.',
    icon: landingImages.icons.career,
    image: landingImages.careerAssistant,
  },
  {
    title: 'Classement IA des candidats',
    text: 'Les entreprises consultent les candidats classes selon leur compatibilite avec l offre.',
    icon: landingImages.icons.ranking,
    image: landingImages.companyDashboard,
  },
  {
    title: 'RAG Knowledge Insights',
    text: 'Les reponses peuvent s appuyer sur des documents indexes et contextualises.',
    icon: landingImages.icons.rag,
    image: landingImages.rag,
  },
  {
    title: 'Experience mobile',
    text: 'Une continuite mobile pour suivre les offres et candidatures.',
    icon: landingImages.icons.cv,
    image: landingImages.mobileApp,
  },
];

export const studentSteps = [
  'Importer son CV',
  'Recevoir des offres recommandees',
  'Postuler avec une lettre personnalisee',
  'Suivre ses candidatures',
  'Progresser avec l assistant carriere',
];

export const companySteps = [
  'Creer une offre',
  'Recevoir des candidatures',
  'Comparer les profils',
  'Consulter le classement IA',
  'Mettre a jour les statuts',
];

export const workflowSteps = [
  'L etudiant importe son CV',
  'L IA extrait les competences',
  'Les offres sont analysees',
  'Le matching calcule un score',
  'L etudiant postule',
  'L entreprise consulte le classement',
];

export const aiBlocks = [
  {
    title: 'Agents specialises',
    text: 'CV Analysis Agent, Matching Agent, Motivation Letter Agent et Career Assistant Agent prennent chacun une responsabilite claire.',
  },
  {
    title: 'Orchestration',
    text: 'Les etapes sont coordonnees pour produire une reponse utile, lisible et reliee au contexte.',
  },
  {
    title: 'RAG contextualise',
    text: 'Les documents indexes enrichissent les conseils et limitent les reponses hors contexte.',
  },
  {
    title: 'IA explicable',
    text: 'Chaque score peut etre accompagne de competences detectees, communes et a travailler.',
  },
];

export const productHighlights = [
  'Dashboard etudiant',
  'Offres recommandees',
  'Assistant carriere',
  'Dashboard entreprise',
  'Classement IA',
  'Experience mobile',
];

export const impactCards = [
  {
    title: 'Pour les etudiants',
    points: ['Mieux cibler les offres', 'Comprendre ses points forts', 'Identifier les competences a travailler', 'Suivre ses candidatures'],
  },
  {
    title: 'Pour les entreprises',
    points: ['Structurer la reception des candidatures', 'Comparer plus rapidement les profils', 'Visualiser les competences correspondantes', 'Garder une decision humaine'],
  },
  {
    title: 'Pour le projet',
    points: ['Architecture full-stack', 'IA specialisee', 'RAG', 'Frontend web et future application mobile'],
  },
];
