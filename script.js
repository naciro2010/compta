const personas = [
  {
    id: "dirigeant",
    name: "Dirigeant(e) TPE/PME",
    quote: "Je veux piloter mon cash et anticiper mes obligations fiscales.",
    objectives: [
      "Vision consolidée du cash et des encaissements à 90 jours",
      "Alertes sur TVA/IS/IR et obligations réglementaires",
      "Suivi simple des factures clients et relances"
    ],
    painPoints: [
      "Données éclatées entre Excel, banques et cabinet",
      "Manque de visibilité temps réel sur la trésorerie",
      "Difficulté à comprendre les indicateurs comptables"
    ],
    success: [
      "Tableaux de bord cash in/out en un clic",
      "Alertes automatisées avant échéances fiscales",
      "Exports prêts pour l'auditeur ou le banquier"
    ],
    focusEpics: ["B", "D", "H", "L"],
    color: "#2D7FF9"
  },
  {
    id: "comptable",
    name: "Comptable interne",
    quote: "Je dois produire les journaux sans erreur et clôturer dans les délais.",
    objectives: [
      "Saisie rapide avec contrôles automatiques",
      "Lettrage fiable et clôture sécurisée",
      "Gestion des écritures analytiques et multi-exercices"
    ],
    painPoints: [
      "Double saisie et imports manuels chronophages",
      "Lettrage complexe sur volume important",
      "Peu d'automatisation pour la clôture"
    ],
    success: [
      "Saisie guidée avec règles automatiques",
      "Lettrage auto sur 5000 lignes avec suivi",
      "Check-list de clôture avec verrouillages"
    ],
    focusEpics: ["A", "B", "C", "F", "I"],
    color: "#00A37A"
  },
  {
    id: "expert",
    name: "Cabinet / Expert-comptable",
    quote: "Je gère plusieurs dossiers et dois sécuriser la conformité Maroc.",
    objectives: [
      "Multi-sociétés, contrôle et révision",
      "Production des déclarations SIMPL et liasses",
      "Collaboration fluide avec les clients"
    ],
    painPoints: [
      "Plans comptables clients hétérogènes",
      "Collecte de pièces et justificatifs non centralisée",
      "Suivi des échéances TVA/IS manuel"
    ],
    success: [
      "Templates CGNC par secteur importables",
      "Exports EDI prêts pour SIMPL",
      "Audit trail et rôles collaborateurs"
    ],
    focusEpics: ["A", "B", "F", "J", "M"],
    color: "#8B5CF6"
  },
  {
    id: "rh",
    name: "Responsable RH / Paie",
    quote: "Je prépare les bulletins et bordereaux CNSS sans ressaisie.",
    objectives: [
      "Paramétrage flexible des rubriques",
      "Calculs fiables net/brut et écritures comptables",
      "Exports Damancom et archivage"
    ],
    painPoints: [
      "Mise à jour manuelle des taux et barèmes",
      "Export CNSS laborieux",
      "Peu de lien avec la comptabilité générale"
    ],
    success: [
      "Moteur de paie paramétrable",
      "Exports CNSS automatisés",
      "Journal de paie synchronisé compta"
    ],
    focusEpics: ["G", "J", "H"],
    color: "#F97316"
  },
  {
    id: "auditeur",
    name: "Auditeur",
    quote: "Je contrôle et exporte les données sans impacter l’exploitation.",
    objectives: [
      "Accès lecture seule sécurisé",
      "Exports fiables (balance, journaux, liasses)",
      "Traçabilité complète des actions"
    ],
    painPoints: [
      "Accès tardif ou incomplet aux pièces",
      "Incohérences dans les historiques",
      "Absence d'audit trail centralisé"
    ],
    success: [
      "Portail audit avec exports certifiés",
      "Journal d’audit consultable",
      "Séparation stricte des droits"
    ],
    focusEpics: ["H", "J", "N"],
    color: "#E11D48"
  }
];

const epics = [
  {
    id: "A",
    title: "Onboarding & Paramétrage Maroc",
    description:
      "Mettre une société en production en respectant le cadre légal marocain (ICE, IF, RC, TVA).",
    priority: "Must",
    personas: ["comptable", "expert"],
    capacities: [
      {
        title: "Création société (ICE, IF, RC, TP, régime TVA, langues FR/AR, devise MAD)",
        priority: "Must"
      },
      {
        title: "Import du plan CGNC pré-paramétré + variantes sectorielles",
        priority: "Must"
      },
      {
        title: "Personnalisation du chart of accounts avec verrouillage sur exercices clos",
        priority: "Should"
      },
      {
        title: "Gestion des séries et numérotation légales des pièces",
        priority: "Should"
      },
      {
        title: "Paramètres fiscaux marocains configurables (taux, périodicités, échéanciers)",
        priority: "Must"
      }
    ],
    stories: [
      {
        code: "A1",
        title:
          "En tant qu’Admin, je crée une société avec ICE/IF/RC et choisis le régime TVA pour le calcul des échéances",
        persona: "Admin",
        acceptance: [
          "Contrôles de format ICE/IF/RC marocains",
          "Choix périodicité TVA → génération d’un calendrier automatique",
          "Fiche société complète prête à exploiter"
        ],
        priority: "Must"
      },
      {
        code: "A2",
        title:
          "En tant que Comptable, j’importe le plan CGNC et mes comptes analytiques",
        persona: "Comptable",
        acceptance: [
          "Import CSV/XLSX avec mapping proposé",
          "Détection de doublons et verrouillage des comptes systèmes",
          "Export de contrôle : balance nulle à l’ouverture"
        ],
        priority: "Must"
      }
    ]
  },
  {
    id: "B",
    title: "Écritures, journaux, lettrage, clôture",
    description:
      "Automatiser la tenue comptable, le lettrage massif et sécuriser la clôture annuelle.",
    priority: "Must",
    personas: ["comptable", "expert"],
    capacities: [
      { title: "Saisie guidée multi-journaux avec validation temps réel", priority: "Must" },
      { title: "Règles d’auto-comptabilisation basées sur mots-clés et tiers", priority: "Must" },
      { title: "Lettrage automatique/manuel avec scoring", priority: "Must" },
      { title: "Processus de clôture avec contrôles et verrouillage", priority: "Must" },
      { title: "Grand livre, journaux et balance conformes CGNC", priority: "Must" }
    ],
    stories: [
      {
        code: "B1",
        title:
          "Je saisis une facture fournisseur et l’app affecte automatiquement les comptes TVA/dépense",
        persona: "Comptable",
        acceptance: [
          "Pré-saisie par tiers et contrôles débit=crédit",
          "Date dans une période ouverte",
          "TVA cohérente selon règles marocaines"
        ],
        priority: "Must"
      },
      {
        code: "B2",
        title: "Je lance un lettrage auto sur 5000 lignes (score ≥ 0,9)",
        persona: "Comptable",
        acceptance: [
          "Matching par montants/échéances/références",
          "Journal des lettrages consultable",
          "Possibilité d’annuler (undo)"
        ],
        priority: "Must"
      },
      {
        code: "B3",
        title: "Je clôture l’exercice",
        persona: "Comptable",
        acceptance: [
          "Check-list : écritures non validées, journaux non imprimés, comptes non lettrés",
          "Génération automatique des A-nouveaux",
          "Verrouillage de l’exercice"
        ],
        priority: "Must"
      }
    ]
  },
  {
    id: "C",
    title: "Banque & rapprochement",
    description: "Automatiser l’intégration des relevés bancaires et accélérer le rapprochement.",
    priority: "Must",
    personas: ["comptable", "dirigeant"],
    capacities: [
      { title: "Imports OFX/CSV/MT940/camt.053", priority: "Must" },
      { title: "Règles d’affectation semi-automatiques", priority: "Must" },
      { title: "Rapprochement automatique avec tolérance et split", priority: "Must" },
      { title: "Rapprochement manuel assisté", priority: "Must" },
      { title: "Gestion des écarts et écritures d’ajustement", priority: "Must" }
    ],
    stories: [
      {
        code: "C1",
        title: "J’importe un relevé et 90 % des lignes sont rapprochées automatiquement",
        persona: "Comptable",
        acceptance: [
          "Matching par montant/date/référence",
          "Journal des rapprochements",
          "Gestion des exceptions"
        ],
        priority: "Must"
      }
    ]
  },
  {
    id: "D",
    title: "Ventes & facturation",
    description:
      "Digitaliser le cycle devis → facture et préparer la facturation électronique DGI.",
    priority: "Must",
    personas: ["dirigeant", "comptable"],
    capacities: [
      { title: "Workflow devis, bons de livraison, factures et avoirs", priority: "Must" },
      { title: "Séries par établissement et numérotation légale", priority: "Must" },
      { title: "Pré-comptabilisation immédiate à la validation", priority: "Must" },
      { title: "Préparation paquet e-facture (PDF + XML) pour DGI", priority: "Should" },
      { title: "Passerelle SGFÉ configurable", priority: "Should" }
    ],
    stories: [
      {
        code: "D1",
        title:
          "Je génère une facture conforme et la plateforme prépare le paquet e-facture",
        persona: "Commercial",
        acceptance: [
          "Gestion des séries/verrouillage",
          "PDF tamponné + XML préparé",
          "Statut \"prêt à émettre\""
        ],
        priority: "Should"
      }
    ]
  },
  {
    id: "E",
    title: "Achats & fournisseurs",
    description: "Simplifier les achats, le suivi fournisseurs et l’OCR des factures.",
    priority: "Must",
    personas: ["comptable", "dirigeant"],
    capacities: [
      { title: "Commandes, réceptions, factures et avoirs", priority: "Must" },
      { title: "Échéanciers, relances et pénalités", priority: "Must" },
      { title: "Workflow validation à deux niveaux", priority: "Must" },
      { title: "OCR factures PDF/images avec extraction TVA/ICE", priority: "Should" }
    ],
    stories: [
      {
        code: "E1",
        title: "J’upload une facture PDF et l’OCR renseigne automatiquement les champs",
        persona: "Comptable",
        acceptance: [
          "Précision ≥ 95 % sur totaux",
          "Contrôles des champs obligatoires",
          "Validation en un clic"
        ],
        priority: "Should"
      }
    ]
  },
  {
    id: "F",
    title: "TVA & fiscalité (DGI / SIMPL)",
    description:
      "Garantir la conformité fiscale marocaine : TVA, IS, IR et liasses.",
    priority: "Must",
    personas: ["comptable", "expert"],
    capacities: [
      { title: "Calcul TVA collectée/déductible avec options prorata", priority: "Must" },
      { title: "Déclaration TVA imprimable + fichier SIMPL-EDI", priority: "Must" },
      { title: "Gestion IS (acomptes, solde) avec exports SIMPL-IS", priority: "Must" },
      { title: "IR BNC : base exportable vers SIMPL", priority: "Should" },
      { title: "Liasse fiscale et mapping CGNC", priority: "Must" }
    ],
    stories: [
      {
        code: "F1",
        title: "Je génère la déclaration TVA avec annexes et fichier SIMPL-TVA",
        persona: "Comptable",
        acceptance: [
          "Contrôles de cohérence (sommes/périodes)",
          "Export conforme au schéma",
          "Journal d’horodatage"
        ],
        priority: "Must"
      },
      {
        code: "F2",
        title: "Je prépare l’IS (acomptes) et exporte le fichier SIMPL-IS",
        persona: "Comptable",
        acceptance: [
          "Calcul des bases et échéanciers",
          "Export EDI prêt à téléverser",
          "Guide d’import automatique"
        ],
        priority: "Must"
      }
    ]
  },
  {
    id: "G",
    title: "Paie & CNSS",
    description: "Industrialiser la paie marocaine avec exports CNSS/Damancom.",
    priority: "Should",
    personas: ["rh", "comptable"],
    capacities: [
      { title: "Paramétrage rubriques et taux/assiettes", priority: "Should" },
      { title: "Calcul des bulletins et écritures comptables", priority: "Should" },
      { title: "Exports CNSS/Damancom (bordereaux, DS)", priority: "Should" }
    ],
    stories: [
      {
        code: "G1",
        title: "Je calcule la paie et j’exporte le bordereau CNSS",
        persona: "RH",
        acceptance: [
          "Contrôle net = brut – retenues",
          "Export structuré pour Damancom",
          "Archivage automatique"
        ],
        priority: "Should"
      }
    ]
  },
  {
    id: "H",
    title: "Reporting & états financiers",
    description: "Fournir des tableaux de bord cash et états financiers bilingues.",
    priority: "Must",
    personas: ["dirigeant", "auditeur", "expert"],
    capacities: [
      { title: "Bilan, CPC, SIG, trésorerie, échéanciers", priority: "Must" },
      { title: "Tableaux de bord cash/ventes/TVA due", priority: "Must" },
      { title: "Gabarits PDF/Excel bilingues FR/AR", priority: "Must" },
      { title: "Espace lecture seule pour auditeurs", priority: "Must" }
    ],
    stories: [
      {
        code: "H1",
        title: "Je visualise cash-in/out 90 jours et alertes TVA/IS",
        persona: "Dirigeant",
        acceptance: [
          "Latence < 2 s (p95)",
          "Filtres multi-sociétés",
          "Alertes contextualisées"
        ],
        priority: "Must"
      }
    ]
  },
  {
    id: "I",
    title: "Analytique (axes, centres de coûts)",
    description: "Suivre la performance par centres de coûts et axes analytiques.",
    priority: "Should",
    personas: ["comptable", "dirigeant"],
    capacities: [
      { title: "Jusqu’à 3 axes analytiques paramétrables", priority: "Should" },
      { title: "Répartition automatique des écritures", priority: "Should" },
      { title: "Reporting multi-axes", priority: "Should" }
    ],
    stories: []
  },
  {
    id: "J",
    title: "Sécurité, rôles & audit",
    description: "Sécuriser l’accès, tracer les actions et respecter la loi 09-08.",
    priority: "Must",
    personas: ["dirigeant", "expert", "auditeur", "rh"],
    capacities: [
      { title: "Rôles Admin, Comptable, Collaborateur, Dirigeant, Auditeur", priority: "Must" },
      { title: "Journal d’audit complet", priority: "Must" },
      { title: "MFA, SSO (OIDC) et politiques de mot de passe", priority: "Should" },
      { title: "Conformité CNDP / loi 09-08 (registre, consentements)", priority: "Must" }
    ],
    stories: []
  },
  {
    id: "K",
    title: "Intégrations & automatisation",
    description: "Connecter les systèmes tiers et automatiser les flux comptables.",
    priority: "Should",
    personas: ["dirigeant", "comptable"],
    capacities: [
      { title: "Connecteurs banques/CRM/e-commerce", priority: "Should" },
      { title: "API publique REST + webhooks", priority: "Should" },
      { title: "Moteur de règles if/then pour auto-compta", priority: "Should" }
    ],
    stories: []
  },
  {
    id: "L",
    title: "UX, accessibilité, multilingue",
    description: "Assurer une expérience fluide FR/AR, responsive et desktop/cloud.",
    priority: "Must",
    personas: ["dirigeant", "comptable", "expert", "rh", "auditeur"],
    capacities: [
      { title: "Interface responsive FR (Must) et AR (Should)", priority: "Must" },
      { title: "Mode sombre/clair et raccourcis clavier", priority: "Should" },
      { title: "Recherche globale et pagination rapide", priority: "Must" },
      { title: "Packaging desktop (Electron) + PWA cloud", priority: "Should" }
    ],
    stories: []
  },
  {
    id: "M",
    title: "Migration & imports",
    description: "Faciliter l’onboarding avec des imports depuis solutions existantes.",
    priority: "Must",
    personas: ["expert", "comptable"],
    capacities: [
      { title: "Import balance d’ouverture, tiers, écritures CSV/XLSX", priority: "Must" },
      { title: "Modèles pour Sage/CIEL/Odoo/EBP", priority: "Must" },
      { title: "Contrôles de cohérence post-import", priority: "Must" }
    ],
    stories: []
  },
  {
    id: "N",
    title: "Aide & support",
    description: "Accompagner les utilisateurs avec guides intégrés et feedback in-app.",
    priority: "Should",
    personas: ["dirigeant", "auditeur", "comptable"],
    capacities: [
      { title: "Guide interactif et checklist clôture/TVA", priority: "Should" },
      { title: "Centre d’aide contextualisé", priority: "Should" },
      { title: "Collecte de feedback in-app", priority: "Should" }
    ],
    stories: []
  }
];

const personaMap = Object.fromEntries(personas.map((persona) => [persona.id, persona]));

const personaGrid = document.querySelector("#persona-grid");
const personaDetail = document.querySelector("#persona-detail");
const epicGrid = document.querySelector("#epic-grid");
const backlogBoard = document.querySelector("#backlog-board");
const roadmapContainer = document.querySelector("#roadmap");
const toggleShouldButton = document.querySelector("#toggle-should");
const filterButtons = document.querySelectorAll(".filter-btn");
const ctaPersona = document.querySelector("#cta-persona");
const ctaBacklog = document.querySelector("#cta-backlog");

let activePersona = null;
let priorityFilter = "all";
let showShould = false;

const createChip = (label, color = null) => {
  const span = document.createElement("span");
  span.className = "chip";
  span.textContent = label;
  if (color) {
    span.style.setProperty("--chip-color", color);
  }
  return span;
};

const renderPersonas = () => {
  personaGrid.innerHTML = "";

  personas.forEach((persona) => {
    const card = document.createElement("article");
    card.className = "persona-card";
    if (activePersona === persona.id) {
      card.classList.add("is-active");
    }

    const header = document.createElement("header");
    header.className = "persona-card__header";
    header.style.borderColor = persona.color;

    const title = document.createElement("h3");
    title.textContent = persona.name;

    const subtitle = document.createElement("p");
    subtitle.className = "persona-card__quote";
    subtitle.textContent = persona.quote;

    header.appendChild(title);
    header.appendChild(subtitle);

    const focusRow = document.createElement("div");
    focusRow.className = "persona-card__focus";
    persona.focusEpics.forEach((epicId) => {
      const chip = createChip(`Épic ${epicId}`);
      chip.dataset.epic = epicId;
      focusRow.appendChild(chip);
    });

    card.appendChild(header);
    card.appendChild(focusRow);

    card.addEventListener("click", () => {
      activePersona = activePersona === persona.id ? null : persona.id;
      renderPersonas();
      renderPersonaDetail();
      renderEpics();
    });

    personaGrid.appendChild(card);
  });
};

const renderPersonaDetail = () => {
  personaDetail.innerHTML = "";

  if (!activePersona) {
    personaDetail.innerHTML =
      '<p class="placeholder">Sélectionnez un persona pour afficher ses objectifs et irritants.</p>';
    return;
  }

  const persona = personaMap[activePersona];

  const header = document.createElement("div");
  header.className = "persona-detail__header";

  const title = document.createElement("h3");
  title.textContent = persona.name;

  const badge = createChip("Persona actif");
  badge.classList.add("chip--solid");
  badge.style.setProperty("--chip-color", persona.color);

  header.appendChild(title);
  header.appendChild(badge);

  const createList = (label, items) => {
    const wrapper = document.createElement("div");
    wrapper.className = "persona-detail__block";

    const heading = document.createElement("h4");
    heading.textContent = label;
    wrapper.appendChild(heading);

    const list = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    wrapper.appendChild(list);
    return wrapper;
  };

  personaDetail.appendChild(header);
  personaDetail.appendChild(createList("Objectifs", persona.objectives));
  personaDetail.appendChild(createList("Irritants", persona.painPoints));
  personaDetail.appendChild(createList("Définition du succès", persona.success));
};

const renderStory = (story) => {
  const detail = document.createElement("details");
  detail.className = "story";
  if (story.priority === "Must") {
    detail.open = true;
  }

  const summary = document.createElement("summary");
  summary.innerHTML = `
    <span class="story__code">${story.code}</span>
    <span class="story__title">${story.title}</span>
    <span class="badge badge--${story.priority.toLowerCase()}">${story.priority}</span>
  `;
  detail.appendChild(summary);

  const personaLine = document.createElement("p");
  personaLine.className = "story__persona";
  personaLine.textContent = `Persona ciblé : ${story.persona}`;
  detail.appendChild(personaLine);

  const list = document.createElement("ul");
  story.acceptance.forEach((ac) => {
    const li = document.createElement("li");
    li.textContent = ac;
    list.appendChild(li);
  });
  detail.appendChild(list);

  return detail;
};

const renderEpics = () => {
  epicGrid.innerHTML = "";

  epics.forEach((epic) => {
    const matchesPriority =
      priorityFilter === "all" || epic.capacities.some((cap) => cap.priority === priorityFilter);
    const matchesPersona = !activePersona || epic.personas.includes(activePersona);

    if (!matchesPriority || !matchesPersona) {
      return;
    }

    const card = document.createElement("article");
    card.className = "epic-card";
    if (activePersona && epic.personas.includes(activePersona)) {
      card.classList.add("is-highlighted");
    }

    const header = document.createElement("header");
    header.className = "epic-card__header";

    const title = document.createElement("h3");
    title.innerHTML = `<span class="epic-card__id">Épic ${epic.id}</span> ${epic.title}`;

    const priorityBadge = document.createElement("span");
    priorityBadge.className = `badge badge--${epic.priority.toLowerCase()}`;
    priorityBadge.textContent = epic.priority;

    header.appendChild(title);
    header.appendChild(priorityBadge);

    const description = document.createElement("p");
    description.className = "epic-card__description";
    description.textContent = epic.description;

    const personaRow = document.createElement("div");
    personaRow.className = "epic-card__personas";
    epic.personas.forEach((personaId) => {
      const persona = personaMap[personaId];
      const chip = createChip(persona.name, persona.color);
      personaRow.appendChild(chip);
    });

    const capacityList = document.createElement("ul");
    capacityList.className = "epic-card__capacities";
    epic.capacities.forEach((cap) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${cap.title}</span>
        <span class="badge badge--${cap.priority.toLowerCase()}">${cap.priority}</span>
      `;
      capacityList.appendChild(li);
    });

    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(personaRow);
    card.appendChild(capacityList);

    if (epic.stories.length) {
      const storiesWrapper = document.createElement("div");
      storiesWrapper.className = "epic-card__stories";
      epic.stories.forEach((story) => storiesWrapper.appendChild(renderStory(story)));
      card.appendChild(storiesWrapper);
    }

    epicGrid.appendChild(card);
  });

  if (!epicGrid.children.length) {
    epicGrid.innerHTML =
      '<p class="placeholder">Aucun épic ne correspond aux filtres sélectionnés. Essayez d’élargir votre recherche.</p>';
  }
};

const backlogColumns = {
  Must: {
    title: "Phase V1 — Must",
    description: "Fondations réglementaires et automatisation comptable",
    items: []
  },
  Should: {
    title: "Phase V1.1 — Should",
    description: "Améliorations productivité, e-facture et analytique",
    items: []
  }
};

epics.forEach((epic) => {
  epic.capacities.forEach((cap) => {
    backlogColumns[cap.priority].items.push({
      epicId: epic.id,
      epicTitle: epic.title,
      title: cap.title
    });
  });
});

const renderBacklog = () => {
  backlogBoard.innerHTML = "";

  Object.entries(backlogColumns).forEach(([priority, column]) => {
    if (priority === "Should" && !showShould) {
      return;
    }

    const columnEl = document.createElement("div");
    columnEl.className = "backlog-column";

    const header = document.createElement("div");
    header.className = "backlog-column__header";

    const title = document.createElement("h3");
    title.textContent = column.title;

    const badge = document.createElement("span");
    badge.className = `badge badge--${priority.toLowerCase()}`;
    badge.textContent = column.items.length;

    header.appendChild(title);
    header.appendChild(badge);

    const description = document.createElement("p");
    description.textContent = column.description;

    const list = document.createElement("ul");
    list.className = "backlog-column__list";

    column.items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="backlog-item__title">${item.title}</span>
        <span class="backlog-item__meta">Épic ${item.epicId}</span>
      `;
      list.appendChild(li);
    });

    columnEl.appendChild(header);
    columnEl.appendChild(description);
    columnEl.appendChild(list);
    backlogBoard.appendChild(columnEl);
  });
};

const roadmap = [
  {
    phase: "T1",
    year: "2025",
    focus: "Go-live réglementaire",
    epics: ["A", "B", "C", "F", "L", "M"],
    highlights: [
      "Onboarding Maroc complet (ICE, CGNC, imports)",
      "Tenue comptable automatisée et rapprochement bancaire",
      "TVA et déclarations SIMPL prêtes à l’emploi"
    ]
  },
  {
    phase: "T2",
    year: "2025",
    focus: "Productivité & facturation",
    epics: ["D", "E", "H", "J"],
    highlights: [
      "Cycle ventes/achats digitalisé avec workflows",
      "Reporting cash & rôle auditeur",
      "Sécurité avancée et audit trail"
    ]
  },
  {
    phase: "T3",
    year: "2025",
    focus: "Extensions métiers",
    epics: ["G", "I", "K", "N"],
    highlights: [
      "Moteur de paie et analytique",
      "Connecteurs API + automatisations",
      "Centre d’aide in-app et feedback"
    ]
  }
];

const renderRoadmap = () => {
  roadmapContainer.innerHTML = "";

  roadmap.forEach((step) => {
    const card = document.createElement("article");
    card.className = "roadmap-card";

    const header = document.createElement("header");
    header.className = "roadmap-card__header";

    const phase = document.createElement("span");
    phase.className = "roadmap-card__phase";
    phase.textContent = `${step.phase} ${step.year}`;

    const focus = document.createElement("h3");
    focus.textContent = step.focus;

    header.appendChild(phase);
    header.appendChild(focus);

    const epicRow = document.createElement("div");
    epicRow.className = "roadmap-card__epics";
    step.epics.forEach((epicId) => {
      const chip = createChip(`Épic ${epicId}`);
      epicRow.appendChild(chip);
    });

    const list = document.createElement("ul");
    step.highlights.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    card.appendChild(header);
    card.appendChild(epicRow);
    card.appendChild(list);
    roadmapContainer.appendChild(card);
  });
};

const updateStats = () => {
  const mustCount = backlogColumns.Must.items.length;
  const shouldCount = backlogColumns.Should.items.length;
  document.querySelector("#stat-must").textContent = mustCount;
  document.querySelector("#stat-should").textContent = shouldCount;
  document.querySelector("#stat-personas").textContent = personas.length;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("is-active"));
    button.classList.add("is-active");
    priorityFilter = button.dataset.priority;
    renderEpics();
  });
});

toggleShouldButton.addEventListener("click", () => {
  showShould = !showShould;
  toggleShouldButton.textContent = showShould ? "Masquer les Should" : "Afficher les Should";
  renderBacklog();
});

ctaPersona.addEventListener("click", () => {
  document.querySelector("#personas").scrollIntoView({ behavior: "smooth" });
});

ctaBacklog.addEventListener("click", () => {
  priorityFilter = "Must";
  filterButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.priority === "Must");
  });
  renderEpics();
  document.querySelector("#epics").scrollIntoView({ behavior: "smooth" });
});

renderPersonas();
renderPersonaDetail();
renderEpics();
renderBacklog();
renderRoadmap();
updateStats();
