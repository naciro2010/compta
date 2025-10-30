/**
 * Base de connaissances pour le chat assistant
 * Contient les informations sur l'utilisation de l'app et la réglementation comptable marocaine
 */

export interface KnowledgeItem {
  id: string;
  category: 'usage' | 'legal' | 'tax' | 'warning' | 'best-practice';
  question: string;
  answer: string;
  keywords: string[];
  tags: string[];
  priority: number; // Pour le ranking des résultats
}

export const knowledgeBase: KnowledgeItem[] = [
  // UTILISATION DE L'APPLICATION
  {
    id: 'usage-01',
    category: 'usage',
    question: 'Comment créer une facture ?',
    answer: 'Pour créer une facture : 1) Allez dans le menu "Factures" dans la barre latérale, 2) Cliquez sur le bouton "Nouvelle facture", 3) Sélectionnez un client existant ou créez-en un nouveau, 4) Ajoutez les lignes de produits/services avec quantités et prix, 5) La TVA sera calculée automatiquement selon le taux applicable, 6) Enregistrez en tant que brouillon ou validez directement la facture.',
    keywords: ['facture', 'créer', 'nouvelle', 'invoice', 'comment faire'],
    tags: ['facturation', 'débutant'],
    priority: 10,
  },
  {
    id: 'usage-02',
    category: 'usage',
    question: 'Comment gérer les clients et fournisseurs ?',
    answer: 'Allez dans le menu "Clients" ou "Fournisseurs" pour gérer vos tiers. Vous pouvez ajouter leurs informations complètes (nom, adresse, ICE, RC, IF), définir des conditions de paiement par défaut, et consulter l\'historique de toutes les transactions. Les informations saisies seront automatiquement utilisées lors de la création de factures ou devis.',
    keywords: ['client', 'fournisseur', 'tiers', 'customers', 'suppliers', 'gérer'],
    tags: ['clients', 'fournisseurs', 'débutant'],
    priority: 9,
  },
  {
    id: 'usage-03',
    category: 'usage',
    question: 'Comment faire un devis ?',
    answer: 'Dans le menu "Devis", cliquez sur "Nouveau devis". La procédure est similaire à une facture : sélectionnez le client, ajoutez les lignes, et enregistrez. Vous pouvez ensuite convertir un devis accepté en facture en un clic. Les devis ont leur propre numérotation personnalisable dans les paramètres.',
    keywords: ['devis', 'quote', 'proposition', 'offre', 'créer'],
    tags: ['devis', 'commercial'],
    priority: 8,
  },
  {
    id: 'usage-04',
    category: 'usage',
    question: 'Comment suivre ma trésorerie ?',
    answer: 'Le module "Trésorerie" vous permet de suivre vos comptes bancaires et caisse. Vous pouvez enregistrer les encaissements et décaissements, effectuer des rapprochements bancaires, et visualiser votre solde en temps réel. Les paiements de factures peuvent être enregistrés directement depuis l\'interface des factures.',
    keywords: ['trésorerie', 'banque', 'bank', 'solde', 'paiement', 'encaissement'],
    tags: ['trésorerie', 'finance'],
    priority: 9,
  },
  {
    id: 'usage-05',
    category: 'usage',
    question: 'Comment générer les états financiers ?',
    answer: 'Dans "États Financiers", vous pouvez générer automatiquement le Bilan, le CPC (Compte de Produits et Charges), et les autres états conformes au CGNC. Ces états sont générés à partir des écritures du grand livre. Assurez-vous que toutes vos écritures sont validées avant de générer les états.',
    keywords: ['états financiers', 'bilan', 'cpc', 'financial statements', 'rapports'],
    tags: ['reporting', 'états financiers'],
    priority: 7,
  },
  {
    id: 'usage-06',
    category: 'usage',
    question: 'Comment personnaliser la numérotation des factures ?',
    answer: 'Allez dans "Paramètres" puis "Numérotation". Vous pouvez définir des formats personnalisés pour les factures, devis, et autres documents. Le format peut inclure des préfixes, l\'année, le mois, et un compteur séquentiel. Exemple : FAC-2025-0001',
    keywords: ['numérotation', 'format', 'numéro facture', 'personnaliser', 'paramètres'],
    tags: ['paramètres', 'personnalisation'],
    priority: 6,
  },
  {
    id: 'usage-07',
    category: 'usage',
    question: 'Comment exporter mes données ?',
    answer: 'L\'application permet d\'exporter vos données en plusieurs formats : PDF pour les factures et états financiers, Excel pour les tableaux et analyses, et des formats spécifiques comme SIMPL-TVA pour les déclarations fiscales. Les boutons d\'export sont disponibles dans chaque module concerné.',
    keywords: ['export', 'exporter', 'pdf', 'excel', 'données', 'télécharger'],
    tags: ['export', 'données'],
    priority: 7,
  },

  // ASPECTS LÉGAUX - COMPTABILITÉ MAROC
  {
    id: 'legal-01',
    category: 'legal',
    question: 'Qu\'est-ce que le CGNC ?',
    answer: 'Le Code Général de Normalisation Comptable (CGNC) est le référentiel comptable officiel au Maroc. Adopté en 1992, il définit les principes comptables, le plan de comptes, les méthodes d\'évaluation, et les états de synthèse obligatoires. Toutes les entreprises marocaines doivent tenir leur comptabilité conformément au CGNC.',
    keywords: ['cgnc', 'code général', 'normalisation', 'référentiel', 'qu\'est-ce que'],
    tags: ['cgnc', 'réglementation'],
    priority: 10,
  },
  {
    id: 'legal-02',
    category: 'legal',
    question: 'Quels sont les livres comptables obligatoires au Maroc ?',
    answer: 'Selon le Code de Commerce marocain, toute entreprise doit tenir : 1) Le Livre Journal (enregistrement chronologique des opérations), 2) Le Grand Livre (comptes individuels), 3) Le Livre d\'inventaire (états de synthèse annuels). Ces livres doivent être cotés et paraphés par le tribunal de commerce ou conservés sous forme électronique sécurisée.',
    keywords: ['livres comptables', 'obligatoires', 'journal', 'grand livre', 'inventaire'],
    tags: ['obligation', 'livres'],
    priority: 9,
  },
  {
    id: 'legal-03',
    category: 'legal',
    question: 'Quelle est la durée de conservation des documents comptables ?',
    answer: 'Au Maroc, les documents comptables doivent être conservés pendant 10 ans. Cela inclut les factures, les pièces justificatives, les livres comptables, et les états de synthèse. Cette obligation s\'applique aussi bien aux documents papier qu\'électroniques. Le non-respect peut entraîner des sanctions fiscales et pénales.',
    keywords: ['conservation', 'durée', 'archive', '10 ans', 'documents'],
    tags: ['archivage', 'obligation'],
    priority: 8,
  },
  {
    id: 'legal-04',
    category: 'legal',
    question: 'Qu\'est-ce que l\'ICE ?',
    answer: 'L\'Identifiant Commun de l\'Entreprise (ICE) est un numéro unique attribué à chaque entreprise marocaine. Il remplace progressivement les anciens identifiants (RC, IF, CNSS, etc.). L\'ICE doit obligatoirement figurer sur tous les documents commerciaux et fiscaux (factures, devis, déclarations). Il comporte 15 chiffres.',
    keywords: ['ice', 'identifiant', 'numéro entreprise', 'obligatoire'],
    tags: ['ice', 'identification'],
    priority: 9,
  },
  {
    id: 'legal-05',
    category: 'legal',
    question: 'Quels sont les états de synthèse obligatoires selon le CGNC ?',
    answer: 'Le CGNC impose 5 états de synthèse annuels : 1) Le Bilan (BL), 2) Le Compte de Produits et Charges (CPC), 3) L\'État des Soldes de Gestion (ESG), 4) Le Tableau de Financement (TF), 5) L\'État des Informations Complémentaires (ETIC). Ces états doivent être établis à la clôture de chaque exercice comptable.',
    keywords: ['états de synthèse', 'bilan', 'cpc', 'esg', 'tableau financement', 'etic'],
    tags: ['états financiers', 'obligation', 'cgnc'],
    priority: 8,
  },

  // TVA ET FISCALITÉ
  {
    id: 'tax-01',
    category: 'tax',
    question: 'Quels sont les taux de TVA au Maroc ?',
    answer: 'Les taux de TVA au Maroc sont : 20% (taux normal), 14% (énergie, transport), 10% (hôtellerie, restauration, services financiers), 7% (eau, produits pharmaceutiques, certains produits alimentaires), et 0% (exportations, certains produits de base). Certaines opérations sont exonérées sans droit à déduction.',
    keywords: ['tva', 'taux', '20%', '14%', '10%', '7%', 'taxe'],
    tags: ['tva', 'fiscalité', 'taux'],
    priority: 10,
  },
  {
    id: 'tax-02',
    category: 'tax',
    question: 'Quelle est la date limite de déclaration de TVA ?',
    answer: 'La déclaration de TVA doit être déposée avant la fin du mois suivant : - Pour le régime mensuel : avant le dernier jour du mois suivant (ex: TVA de janvier à déclarer avant fin février), - Pour le régime trimestriel : avant la fin du mois suivant le trimestre. Le paiement doit accompagner la déclaration. Un retard entraîne des pénalités de 10% + 5% de majoration.',
    keywords: ['tva', 'déclaration', 'date limite', 'échéance', 'délai'],
    tags: ['tva', 'délais', 'déclaration'],
    priority: 9,
  },
  {
    id: 'tax-03',
    category: 'tax',
    question: 'Comment fonctionne la TVA déductible ?',
    answer: 'La TVA déductible est la TVA que vous avez payée sur vos achats professionnels. Elle vient en diminution de la TVA collectée sur vos ventes. Pour être déductible, la TVA doit : 1) Figurer sur une facture régulière, 2) Être liée à une opération imposable, 3) Être payée (sauf exceptions). La déduction se fait généralement le mois suivant l\'acquisition.',
    keywords: ['tva déductible', 'récupération', 'achats', 'déduction'],
    tags: ['tva', 'déduction'],
    priority: 8,
  },
  {
    id: 'tax-04',
    category: 'tax',
    question: 'Qu\'est-ce que SIMPL-TVA ?',
    answer: 'SIMPL-TVA est le système en ligne de la DGI (Direction Générale des Impôts) pour télédéclarer et télépayer la TVA. Toutes les entreprises assujetties doivent utiliser ce système. La déclaration se fait via un fichier XML généré selon un format spécifique. L\'application peut exporter vos données au format SIMPL-TVA.',
    keywords: ['simpl-tva', 'simpl', 'télédéclaration', 'dgi', 'en ligne'],
    tags: ['tva', 'déclaration', 'digital'],
    priority: 8,
  },
  {
    id: 'tax-05',
    category: 'tax',
    question: 'Quand suis-je obligé de facturer avec TVA ?',
    answer: 'Vous devez facturer avec TVA si : 1) Votre CA annuel dépasse 500 000 MAD (seuil d\'assujettissement obligatoire), 2) Vous avez opté volontairement pour l\'assujettissement, 3) Vous exercez certaines activités obligatoirement assujetties (import, professions libérales, etc.). En dessous de 500 000 MAD, vous pouvez rester hors TVA ou opter pour l\'assujettissement.',
    keywords: ['obligation tva', 'seuil', 'assujettissement', '500000', 'chiffre affaires'],
    tags: ['tva', 'obligation'],
    priority: 9,
  },

  // WARNINGS ET BONNES PRATIQUES
  {
    id: 'warning-01',
    category: 'warning',
    question: 'Quelles sont les mentions obligatoires sur une facture au Maroc ?',
    answer: '⚠️ ATTENTION : Une facture doit obligatoirement comporter : 1) Numéro séquentiel unique, 2) Date d\'émission, 3) Identité complète et ICE du vendeur, 4) Identité et ICE de l\'acheteur (si assujetti), 5) Désignation précise des produits/services, 6) Prix HT, taux et montant de TVA, prix TTC, 7) Conditions de paiement. L\'absence de ces mentions peut rendre la facture non valable fiscalement.',
    keywords: ['facture', 'mentions obligatoires', 'ice', 'numéro', 'conformité'],
    tags: ['facturation', 'conformité', 'warning'],
    priority: 10,
  },
  {
    id: 'warning-02',
    category: 'warning',
    question: 'Que risque-t-on en cas de comptabilité irrégulière ?',
    answer: '⚠️ RISQUES : Une comptabilité non conforme au CGNC expose à : 1) Rejet de comptabilité par l\'administration fiscale avec taxation d\'office, 2) Majoration de 15% sur les droits rappelés, 3) Amendes pouvant aller jusqu\'à 50 000 MAD, 4) Responsabilité pénale en cas de fraude avérée. Il est crucial de tenir une comptabilité rigoureuse et de conserver toutes les pièces justificatives.',
    keywords: ['risques', 'sanction', 'amende', 'taxation', 'fraude', 'contrôle'],
    tags: ['risques', 'sanctions', 'warning'],
    priority: 9,
  },
  {
    id: 'warning-03',
    category: 'warning',
    question: 'Puis-je modifier une facture déjà validée ?',
    answer: '⚠️ IMPORTANT : Une facture validée et comptabilisée ne peut pas être modifiée ou supprimée. En cas d\'erreur, vous devez établir : 1) Une facture d\'avoir pour annuler (totalement ou partiellement), 2) Puis une nouvelle facture correcte si nécessaire. Toute modification directe d\'une facture déjà transmise est une irrégularité fiscale grave. Conservez la traçabilité de toutes les opérations.',
    keywords: ['modifier facture', 'annulation', 'avoir', 'erreur', 'correction'],
    tags: ['facturation', 'conformité', 'warning'],
    priority: 8,
  },
  {
    id: 'warning-04',
    category: 'warning',
    question: 'Quelles sont les erreurs courantes à éviter en comptabilité ?',
    answer: '⚠️ ERREURS À ÉVITER : 1) Mélanger comptes professionnels et personnels, 2) Ne pas conserver les justificatifs (factures, tickets), 3) Enregistrer des opérations sans pièce justificative, 4) Ne pas faire de rapprochement bancaire régulier, 5) Omettre certaines écritures (stocks, amortissements), 6) Déclarer la TVA en retard, 7) Ne pas sauvegarder régulièrement les données comptables.',
    keywords: ['erreurs', 'éviter', 'erreurs courantes', 'bonnes pratiques', 'attention'],
    tags: ['best-practice', 'warning'],
    priority: 8,
  },

  // BONNES PRATIQUES
  {
    id: 'best-01',
    category: 'best-practice',
    question: 'À quelle fréquence dois-je saisir mes écritures comptables ?',
    answer: '📋 BONNE PRATIQUE : Il est recommandé de saisir vos écritures comptables au moins une fois par semaine, voire quotidiennement pour les entreprises à forte activité. Cela permet de : 1) Avoir une vision en temps réel de votre situation, 2) Détecter rapidement les anomalies, 3) Faciliter les clôtures mensuelles et annuelles, 4) Éviter l\'accumulation de travail. Ne jamais attendre la fin du mois ou pire, la fin de l\'année.',
    keywords: ['fréquence', 'saisie', 'régularité', 'quand saisir', 'quotidien'],
    tags: ['best-practice', 'organisation'],
    priority: 7,
  },
  {
    id: 'best-02',
    category: 'best-practice',
    question: 'Comment bien organiser mes pièces justificatives ?',
    answer: '📋 CONSEIL : Organisez vos pièces justificatives par : 1) Type (achats, ventes, banque, caisse), 2) Ordre chronologique, 3) Numérotation séquentielle. Utilisez des classeurs ou un système de GED (Gestion Électronique de Documents). Scannez systématiquement les documents papier pour avoir une copie numérique. Marquez chaque pièce avec son numéro d\'écriture comptable pour faciliter les rapprochements.',
    keywords: ['organisation', 'classement', 'pièces', 'justificatifs', 'archivage'],
    tags: ['best-practice', 'organisation'],
    priority: 6,
  },
  {
    id: 'best-03',
    category: 'best-practice',
    question: 'Comment me préparer pour un contrôle fiscal ?',
    answer: '📋 PRÉPARATION : Pour être prêt en cas de contrôle fiscal : 1) Tenez une comptabilité régulière et à jour, 2) Conservez TOUS les justificatifs (10 ans minimum), 3) Classez vos documents de façon logique et accessible, 4) Assurez la cohérence entre comptabilité et déclarations fiscales, 5) Documentez les opérations inhabituelles, 6) Effectuez des contrôles de cohérence réguliers, 7) Sauvegardez vos données comptables de façon sécurisée.',
    keywords: ['contrôle fiscal', 'préparation', 'audit', 'vérification', 'inspection'],
    tags: ['best-practice', 'fiscal'],
    priority: 7,
  },
  {
    id: 'best-04',
    category: 'best-practice',
    question: 'Dois-je faire appel à un expert-comptable ?',
    answer: '📋 RECOMMANDATION : Bien que l\'application facilite la gestion comptable, il est fortement recommandé de consulter un expert-comptable au moins pour : 1) La révision et validation des comptes annuels, 2) L\'établissement de la liasse fiscale, 3) Les opérations complexes (fusion, apports, réévaluation), 4) L\'optimisation fiscale légale, 5) La mise en conformité avec la réglementation. Un expert-comptable reste votre meilleur allié pour sécuriser votre comptabilité.',
    keywords: ['expert-comptable', 'comptable', 'conseil', 'aide', 'professionnel'],
    tags: ['best-practice', 'conseil'],
    priority: 7,
  },

  // QUESTIONS TECHNIQUES APP
  {
    id: 'usage-08',
    category: 'usage',
    question: 'Mes données sont-elles sauvegardées automatiquement ?',
    answer: 'Oui, l\'application sauvegarde automatiquement vos données localement dans votre navigateur. Cependant, il est fortement recommandé d\'effectuer régulièrement des exports de vos données (via les fonctions d\'export disponibles dans chaque module) pour avoir des sauvegardes externes. Pensez à sauvegarder avant toute opération importante.',
    keywords: ['sauvegarde', 'backup', 'données', 'automatique', 'sécurité'],
    tags: ['sauvegarde', 'sécurité'],
    priority: 8,
  },
  {
    id: 'usage-09',
    category: 'usage',
    question: 'Comment changer la langue de l\'interface ?',
    answer: 'Vous pouvez changer la langue de l\'interface en utilisant le sélecteur de langue situé dans la barre de navigation. L\'application est disponible en Français, Arabe et Anglais. Le changement de langue est immédiat et affecte tous les menus et libellés de l\'interface.',
    keywords: ['langue', 'language', 'arabe', 'français', 'anglais', 'traduction'],
    tags: ['paramètres', 'langue'],
    priority: 6,
  },
  {
    id: 'usage-10',
    category: 'usage',
    question: 'Comment suivre les factures impayées ?',
    answer: 'Le module "Factures" propose une section "Factures en retard" qui liste automatiquement toutes les factures dont la date d\'échéance est dépassée. Vous pouvez y voir le montant total des impayés, les détails par client, et envoyer des relances. Un tableau de bord visuel vous aide à suivre l\'évolution des paiements.',
    keywords: ['impayé', 'retard', 'relance', 'échéance', 'suivi paiement'],
    tags: ['facturation', 'recouvrement'],
    priority: 8,
  },

  // COMPTABILITÉ AVANCÉE
  {
    id: 'legal-06',
    category: 'legal',
    question: 'Comment comptabiliser les immobilisations ?',
    answer: 'Les immobilisations doivent être enregistrées à leur coût d\'acquisition (prix d\'achat + frais accessoires) dans les comptes de classe 2 du CGNC. Elles font l\'objet d\'amortissements annuels selon leur durée d\'utilité (mobilier: 10 ans, matériel: 5-10 ans, véhicules: 5 ans, bâtiments: 20-25 ans). L\'amortissement est une charge calculée qui réduit la valeur de l\'immobilisation au bilan.',
    keywords: ['immobilisation', 'amortissement', 'actif', 'investissement', 'durée'],
    tags: ['comptabilité', 'immobilisations'],
    priority: 6,
  },
  {
    id: 'legal-07',
    category: 'legal',
    question: 'Qu\'est-ce que le principe de la partie double ?',
    answer: 'Le principe de la partie double est fondamental en comptabilité : chaque opération est enregistrée deux fois, au débit d\'un compte et au crédit d\'un autre compte, pour un montant égal. Exemple : un achat de 1000 MAD = débit du compte "Achats" 1000 + crédit du compte "Banque" 1000. Ce principe assure l\'équilibre comptable et permet de vérifier la cohérence des écritures.',
    keywords: ['partie double', 'débit', 'crédit', 'principe comptable', 'écriture'],
    tags: ['comptabilité', 'principes'],
    priority: 7,
  },
  {
    id: 'tax-06',
    category: 'tax',
    question: 'Qu\'est-ce que l\'IS (Impôt sur les Sociétés) ?',
    answer: 'L\'IS est l\'impôt sur les bénéfices des sociétés au Maroc. Le taux normal est de 20% (depuis 2023) pour les sociétés avec un bénéfice supérieur à 100 millions MAD, et 26-31% pour les autres selon le bénéfice. Les entreprises doivent effectuer 4 acomptes provisionnels (avant fin mars, juin, septembre, décembre) puis la régularisation annuelle avant le 31 mars de l\'année N+1.',
    keywords: ['is', 'impôt sociétés', 'bénéfice', 'taux', 'acomptes'],
    tags: ['fiscalité', 'is'],
    priority: 7,
  },
  {
    id: 'tax-07',
    category: 'tax',
    question: 'Qu\'est-ce que la retenue à la source ?',
    answer: 'La retenue à la source est un prélèvement fiscal effectué directement lors du paiement de certaines prestations : honoraires (30%), loyers (10%), prestations de services (10%), rémunérations versées aux non-résidents (10% à 30%). L\'entreprise qui paie devient collecteur d\'impôt et doit reverser les sommes retenues à la DGI dans le mois suivant, accompagnées d\'une déclaration.',
    keywords: ['retenue à la source', 'honoraires', 'prélèvement', 'prestation', 'taux'],
    tags: ['fiscalité', 'retenue source'],
    priority: 6,
  },

  // INFORMATIONS DE CONTACT
  {
    id: 'contact-01',
    category: 'usage',
    question: 'Comment contacter le support MizanPro ?',
    answer: 'Vous pouvez nous contacter de plusieurs façons :\n📧 Email: support@mizanpro.ma\n📞 Téléphone: +212 537-68-68-68\n📍 Adresse: Hay Riad, Rabat, Maroc\n\nNotre équipe support est disponible du lundi au vendredi de 9h à 18h, et le samedi de 9h à 13h.',
    keywords: ['contact', 'support', 'aide', 'assistance', 'contacter', 'joindre', 'email', 'téléphone', 'adresse'],
    tags: ['contact', 'support'],
    priority: 10,
  },
  {
    id: 'contact-02',
    category: 'usage',
    question: 'Quel est l\'email de support ?',
    answer: 'Notre adresse email de support est : support@mizanpro.ma\n\nPour les questions commerciales, vous pouvez aussi nous écrire à : contact@mizanpro.ma\n\nNous répondons généralement sous 24h ouvrées.',
    keywords: ['email', 'mail', 'adresse mail', 'support', 'contact'],
    tags: ['contact', 'email'],
    priority: 9,
  },
  {
    id: 'contact-03',
    category: 'usage',
    question: 'Quel est le numéro de téléphone de MizanPro ?',
    answer: 'Vous pouvez nous appeler au : +212 537-68-68-68\n\nNos horaires d\'accueil téléphonique :\n- Lundi à Vendredi : 9h00 - 18h00\n- Samedi : 9h00 - 13h00\n- Dimanche : Fermé',
    keywords: ['téléphone', 'numéro', 'appeler', 'contact', 'phone'],
    tags: ['contact', 'téléphone'],
    priority: 9,
  },
  {
    id: 'contact-04',
    category: 'usage',
    question: 'Où se trouvent les bureaux de MizanPro ?',
    answer: 'Nos bureaux sont situés à :\n📍 Hay Riad, Rabat, Maroc\n\nHay Riad est le quartier des affaires de Rabat, facilement accessible.\n\nNous accueillons les visites sur rendez-vous uniquement. Pour prendre rendez-vous, contactez-nous par téléphone au +212 537-68-68-68 ou par email à contact@mizanpro.ma',
    keywords: ['adresse', 'bureaux', 'localisation', 'où', 'rabat', 'hay riad', 'visite'],
    tags: ['contact', 'localisation'],
    priority: 8,
  },
  {
    id: 'contact-05',
    category: 'usage',
    question: 'Quels sont les horaires du support ?',
    answer: 'Notre équipe support est disponible aux horaires suivants :\n\n🕐 Lundi - Vendredi : 9h00 - 18h00\n🕐 Samedi : 9h00 - 13h00\n🚫 Dimanche : Fermé\n\nNotre chatbot intelligent est quant à lui disponible 24h/24 et 7j/7 pour répondre à vos questions.',
    keywords: ['horaires', 'heures', 'ouverture', 'disponibilité', 'quand'],
    tags: ['contact', 'horaires'],
    priority: 7,
  },
];

/**
 * Fonction de recherche dans la base de connaissances
 */
export function searchKnowledge(query: string, limit: number = 5): KnowledgeItem[] {
  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  // Score chaque élément de la base
  const scored = knowledgeBase.map(item => {
    let score = 0;
    const searchableText = `${item.question} ${item.answer} ${item.keywords.join(' ')} ${item.tags.join(' ')}`.toLowerCase();

    // Recherche des termes
    searchTerms.forEach(term => {
      if (item.question.toLowerCase().includes(term)) {
        score += 10; // Bonus si dans la question
      }
      if (item.keywords.some(k => k.includes(term))) {
        score += 5; // Bonus si dans les mots-clés
      }
      if (searchableText.includes(term)) {
        score += 2; // Score de base si trouvé
      }
    });

    // Ajoute la priorité de l'item
    score += item.priority;

    return { item, score };
  });

  // Filtre les résultats avec un score > 0 et trie par score décroissant
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.item);
}

/**
 * Obtenir des suggestions de questions
 */
export function getSuggestedQuestions(category?: KnowledgeItem['category']): string[] {
  const filtered = category
    ? knowledgeBase.filter(item => item.category === category)
    : knowledgeBase;

  return filtered
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6)
    .map(item => item.question);
}

/**
 * Obtenir une réponse par ID
 */
export function getAnswerById(id: string): KnowledgeItem | undefined {
  return knowledgeBase.find(item => item.id === id);
}
