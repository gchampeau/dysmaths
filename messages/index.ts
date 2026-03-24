import type {AppLocale} from "@/i18n/routing";

type Messages = {
  Metadata: {
    title: string;
    description: string;
  };
  Workbook: {
    document: {
      defaultTitle: string;
      defaultFullName: string;
      defaultClass: string;
      defaultDate: string;
    };
    colors: Record<"ink" | "orange" | "blue" | "green" | "pink", string>;
    highlights: Record<"yellow" | "green" | "blue" | "pink", string>;
    sheetStyles: Record<"seyes" | "largeGrid" | "smallGrid" | "lined" | "blank", string>;
    geometryTools: Record<"point" | "segment" | "line" | "ray" | "circle" | "compass" | "measure" | "protractor", {label: string; hint: string}>;
    structuredTools: Record<"fraction" | "addition" | "subtraction" | "multiplication" | "division" | "power" | "root", {label: string; hint: string}>;
    shortcutGroups: Record<"essentials" | "geometry" | "highSchool" | "variables", string>;
    shortcuts: Record<"equal" | "neq" | "lt" | "gt" | "leq" | "geq" | "minus" | "times" | "div" | "lbracket" | "rbracket" | "percent" | "pi" | "angle" | "parallel" | "perpendicular" | "degree" | "sum" | "integral" | "scriptX" | "scriptY" | "scriptZ", string>;
    toolbar: {
      closeTools: string;
      geometry: string;
      geometryGroup: string;
      structuredOperations: string;
      graduatedLine: string;
      insertionTools: string;
      commonSymbols: string;
      commonSymbolShortcuts: string;
      highSchoolTools: string;
      highSchoolShortcuts: string;
      formatting: string;
      bold: string;
      italic: string;
      underline: string;
      decrease: string;
      increase: string;
      highlighter: string;
      chooseHighlighter: string;
      freehand: string;
      advancedTools: string;
      selection: string;
      delete: string;
      creditPrefix: string;
      tools: string;
      undo: string;
      redo: string;
      exportPdfLoading: string;
      exportPngLoading: string;
      preparingPrint: string;
      print: string;
      sheetStyle: string;
      newDocument: string;
      language: string;
      settings: string;
      install: string;
      installHelp: string;
    };
    geometryHelper: {
      idle: string;
      protractorFirstSide: string;
      protractorVertex: string;
      protractorSecondSide: string;
      compassCenter: string;
      compassRadius: string;
      compassArc: string;
      measureSecondPoint: string;
      finishShape: string;
      measureTwoPoints: string;
      placePoint: string;
      placeCircleCenter: string;
      placeFirstPoint: string;
    };
    canvas: {
      insertHint: string;
      writeHere: string;
      emptyTextBox: string;
      align: string;
      settings: string;
      closeSettings: string;
      closeMenu: string;
      highlightColor: string;
      pointName: string;
      segmentLength: string;
      circleRadius: string;
    };
    modal: {
      guidedBlock: string;
      guidedBlockHelper: string;
      graduatedLine: string;
      graduatedLineHelper: string;
      graduatedLinePresets: string;
      cancel: string;
      insert: string;
      save: string;
      preview: string;
      confirmation: string;
      createNewDocument: string;
      createNewDocumentHelper: string;
      confirmNew: string;
    };
    modalFields: {
      numerator: string;
      denominator: string;
      note: string;
      divisor: string;
      quotient: string;
      dividendAndWork: string;
      firstTerm: string;
      secondTerm: string;
      result: string;
      carryTop: string;
      carryMiddle: string;
      carryBottom: string;
      base: string;
      exponent: string;
      radicand: string;
      startAt: string;
      sections: string;
      fractionNotePlaceholder: string;
      divisionNotePlaceholder: string;
      additionNotePlaceholder: string;
      subtractionNotePlaceholder: string;
      multiplicationNotePlaceholder: string;
      powerNotePlaceholder: string;
      rootNotePlaceholder: string;
    };
    inlineEditor: {
      strike: string;
      clickCell: string;
    };
    blockTitles: Record<"fraction" | "addition" | "subtraction" | "multiplication" | "division" | "power" | "root" | "default", string>;
    profile: {
      selectProfile: string;
      noProfile: string;
      createProfile: string;
      editProfile: string;
      deleteProfile: string;
      deleteProfileConfirm: string;
      firstName: string;
      lastName: string;
      className: string;
      preferredSheetStyle: string;
      preferredMode: string;
      middleSchool: string;
      highSchool: string;
      save: string;
      cancel: string;
      switcherHint: string;
      visibleFields: string;
      showName: string;
      showClass: string;
      showDate: string;
      highlightOnHover: string;
    };
  };
};

const en: Messages = {
  Metadata: {
    title: "Dysmaths - easier math writing for students with dysgraphia and dyspraxia",
    description: "An application designed to help middle and high school students write, save and print their math work."
  },
  Workbook: {
    document: {
      defaultTitle: "My math assignment",
      defaultFullName: "Full name:",
      defaultClass: "Class:",
      defaultDate: "Date:"
    },
    colors: {
      ink: "Ink",
      orange: "Orange",
      blue: "Blue",
      green: "Green",
      pink: "Pink"
    },
    highlights: {
      yellow: "Yellow",
      green: "Green",
      blue: "Blue",
      pink: "Pink"
    },
    sheetStyles: {
      seyes: "Seyes lines",
      largeGrid: "Large grid",
      smallGrid: "Small grid",
      lined: "Ruled paper",
      blank: "Blank paper"
    },
    geometryTools: {
      point: {label: "Point", hint: "Place a point"},
      segment: {label: "Segment", hint: "Draw a segment"},
      line: {label: "Line", hint: "Draw a line"},
      ray: {label: "Ray", hint: "Draw a ray"},
      circle: {label: "Circle", hint: "Draw a circle"},
      compass: {label: "Compass", hint: "Draw a circle with a remembered opening"},
      measure: {label: "Ruler", hint: "Measure a distance"},
      protractor: {label: "Protractor", hint: "Measure an angle"}
    },
    structuredTools: {
      fraction: {label: "Written fraction", hint: "Written fraction"},
      addition: {label: "Written addition", hint: "Written addition"},
      subtraction: {label: "Written subtraction", hint: "Written subtraction"},
      multiplication: {label: "Written multiplication", hint: "Written multiplication"},
      division: {label: "Written division", hint: "Written division"},
      power: {label: "Power", hint: "Power"},
      root: {label: "Root", hint: "Radicand and result"}
    },
    shortcutGroups: {
      essentials: "Essentials",
      geometry: "Geometry",
      highSchool: "High school",
      variables: "Variables"
    },
    shortcuts: {
      equal: "Add =",
      neq: "Add ≠",
      lt: "Less than",
      gt: "Greater than",
      leq: "Less than or equal to",
      geq: "Greater than or equal to",
      minus: "Subtract",
      times: "Multiply",
      div: "Divide",
      lbracket: "Opening bracket",
      rbracket: "Closing bracket",
      percent: "Percentage",
      pi: "Pi",
      angle: "Angle",
      parallel: "Parallel",
      perpendicular: "Perpendicular",
      degree: "Degree",
      sum: "Sum",
      integral: "Integral",
      scriptX: "Script x",
      scriptY: "Script y",
      scriptZ: "Script z"
    },
    toolbar: {
      closeTools: "Close tools",
      geometry: "Geometry",
      geometryGroup: "Geometry tools",
      structuredOperations: "Written operations",
      graduatedLine: "Graduated line",
      insertionTools: "Insertion tools",
      commonSymbols: "Common symbols",
      commonSymbolShortcuts: "Common symbol shortcuts",
      highSchoolTools: "High school tools",
      highSchoolShortcuts: "High school shortcuts",
      formatting: "Formatting",
      bold: "Bold",
      italic: "Italic",
      underline: "Underline",
      decrease: "Decrease",
      increase: "Increase",
      highlighter: "Highlighter",
      chooseHighlighter: "Choose a highlighter color",
      freehand: "Freehand drawing",
      advancedTools: "Advanced tools",
      selection: "Selection",
      delete: "Delete",
      creditPrefix: "Designed by",
      tools: "Tools",
      undo: "Undo",
      redo: "Redo",
      exportPdfLoading: "Creating PDF...",
      exportPngLoading: "Creating PNG...",
      preparingPrint: "Preparing...",
      print: "Print",
      sheetStyle: "Sheet style",
      newDocument: "New",
      language: "Language",
      settings: "Settings",
      install: "Install",
      installHelp: "Use the install icon in the address bar or your browser menu to install the app on this device."
    },
    geometryHelper: {
      idle: "Draw precise figures while preserving the sheet scale for printing.",
      protractorFirstSide: "Click a point on the first side of the angle.",
      protractorVertex: "Then click the vertex of the angle.",
      protractorSecondSide: "Click a point on the second side to lock the measure.",
      compassCenter: "Click the center of the circle.",
      compassRadius: "Move the pointer to adjust the opening, then click to start the arc.",
      compassArc: "Move the pointer to enlarge or reduce the arc, then click to finish it.",
      measureSecondPoint: "Click a second point to lock the measurement.",
      finishShape: "Click a second time to finish the shape.",
      measureTwoPoints: "Click two points to measure a distance without creating an object.",
      placePoint: "Click the sheet to place a point.",
      placeCircleCenter: "Click the sheet to place the center of the circle.",
      placeFirstPoint: "Click the sheet to place the first point."
    },
    canvas: {
      insertHint: "Click or tap the sheet to place {item}.",
      writeHere: "Write here",
      emptyTextBox: "Text box",
      align: "Align",
      settings: "Settings",
      closeSettings: "Close settings",
      closeMenu: "Close menu",
      highlightColor: "Highlight {color}",
      pointName: "Point name",
      segmentLength: "Length (mm)",
      circleRadius: "Radius (mm)"
    },
    modal: {
      guidedBlock: "Guided block",
      guidedBlockHelper: "Prepare the block, then place it freely on the sheet.",
      graduatedLine: "Graduated line",
      graduatedLineHelper: "Draw a line, then choose how many sections to divide it into.",
      graduatedLinePresets: "Quick choices",
      cancel: "Cancel",
      insert: "Insert",
      save: "Save",
      preview: "Preview",
      confirmation: "Confirmation",
      createNewDocument: "Create a new document?",
      createNewDocumentHelper: "The current sheet will be cleared and replaced with a new assignment.",
      confirmNew: "New"
    },
    modalFields: {
      numerator: "Numerator",
      denominator: "Denominator",
      note: "Instruction or note",
      divisor: "Divisor",
      quotient: "Quotient",
      dividendAndWork: "Dividend and working",
      firstTerm: "First term",
      secondTerm: "Second term",
      result: "Result",
      carryTop: "Top carry",
      carryMiddle: "Middle carry",
      carryBottom: "Bottom carry",
      base: "Base",
      exponent: "Exponent",
      radicand: "Radicand",
      startAt: "Start at",
      sections: "Sections",
      fractionNotePlaceholder: "I simplify the fraction",
      divisionNotePlaceholder: "I check with 35 × 7",
      additionNotePlaceholder: "I write the addition",
      subtractionNotePlaceholder: "I write the subtraction",
      multiplicationNotePlaceholder: "I write the multiplication",
      powerNotePlaceholder: "Square, cube, power n",
      rootNotePlaceholder: "Square root"
    },
    inlineEditor: {
      strike: "Strike through",
      clickCell: "Click a cell"
    },
    blockTitles: {
      fraction: "Written fraction",
      addition: "Written addition",
      subtraction: "Written subtraction",
      multiplication: "Written multiplication",
      division: "Written division",
      power: "Power",
      root: "Root",
      default: "Block"
    },
    profile: {
      selectProfile: "Profile",
      noProfile: "No profile",
      createProfile: "New profile",
      editProfile: "Edit",
      deleteProfile: "Delete",
      deleteProfileConfirm: "Delete this profile?",
      firstName: "First name",
      lastName: "Last name",
      className: "Class",
      preferredSheetStyle: "Sheet style",
      preferredMode: "Level",
      middleSchool: "Middle school",
      highSchool: "High school",
      save: "Save",
      cancel: "Cancel",
      switcherHint: "Select user profile. Edit profiles in settings.",
      visibleFields: "Visible on all pages",
      showName: "Name",
      showClass: "Class",
      showDate: "Date",
      highlightOnHover: "Highlight elements on hover"
    }
  }
};

const fr: Messages = {
  Metadata: {
    title: "Dysmaths - l'écriture mathématique facile pour les dysgraphiques et dyspraxiques",
    description: "Une application pensée pour aider les collégiens et lycéens à rédiger, sauvegarder et imprimer leurs formules mathématiques."
  },
  Workbook: {
    document: {
      defaultTitle: "Mon devoir de maths",
      defaultFullName: "Nom et prénom :",
      defaultClass: "Classe :",
      defaultDate: "Date :"
    },
    colors: {
      ink: "Encre",
      orange: "Orange",
      blue: "Bleu",
      green: "Vert",
      pink: "Rose"
    },
    highlights: {
      yellow: "Jaune",
      green: "Vert",
      blue: "Bleu",
      pink: "Rose"
    },
    sheetStyles: {
      seyes: "Lignes Seyes",
      largeGrid: "Grands carreaux",
      smallGrid: "Petits carreaux",
      lined: "Feuille lignée",
      blank: "Feuille blanche"
    },
    geometryTools: {
      point: {label: "Point", hint: "Placer un point"},
      segment: {label: "Segment", hint: "Tracer un segment"},
      line: {label: "Droite", hint: "Tracer une droite"},
      ray: {label: "Demi-droite", hint: "Tracer une demi-droite"},
      circle: {label: "Cercle", hint: "Tracer un cercle"},
      compass: {label: "Compas", hint: "Tracer un cercle avec ouverture mémorisée"},
      measure: {label: "Règle", hint: "Mesurer une distance"},
      protractor: {label: "Rapporteur", hint: "Mesurer un angle"}
    },
    structuredTools: {
      fraction: {label: "Fraction posée", hint: "Fraction posée"},
      addition: {label: "Addition posée", hint: "Addition posée"},
      subtraction: {label: "Soustraction posée", hint: "Soustraction posée"},
      multiplication: {label: "Multiplication posée", hint: "Multiplication posée"},
      division: {label: "Division posée", hint: "Division posée"},
      power: {label: "Puissance", hint: "Puissance"},
      root: {label: "Racine", hint: "Radicande et résultat"}
    },
    shortcutGroups: {
      essentials: "Essentiels",
      geometry: "Géométrie",
      highSchool: "Lycée",
      variables: "Variables"
    },
    shortcuts: {
      equal: "Ajoute =",
      neq: "Ajoute ≠",
      lt: "Inférieur à",
      gt: "Supérieur à",
      leq: "Inférieur ou égal",
      geq: "Supérieur ou égal",
      minus: "Soustraire",
      times: "Multiplier",
      div: "Diviser",
      lbracket: "Crochet ouvrant",
      rbracket: "Crochet fermant",
      percent: "Pourcentage",
      pi: "Pi",
      angle: "Angle",
      parallel: "Parallèle",
      perpendicular: "Perpendiculaire",
      degree: "Degré",
      sum: "Somme",
      integral: "Intégrale",
      scriptX: "x script",
      scriptY: "y script",
      scriptZ: "z script"
    },
    toolbar: {
      closeTools: "Fermer les outils",
      geometry: "Géométrie",
      geometryGroup: "Outils de géométrie",
      structuredOperations: "Opérations posées",
      graduatedLine: "Droite graduée",
      insertionTools: "Outils d'insertion",
      commonSymbols: "Symboles courants",
      commonSymbolShortcuts: "Raccourcis symboles courants",
      highSchoolTools: "Outils lycée",
      highSchoolShortcuts: "Raccourcis lycée",
      formatting: "Mise en forme",
      bold: "Gras",
      italic: "Italique",
      underline: "Souligné",
      decrease: "Réduire",
      increase: "Agrandir",
      highlighter: "Stabilo",
      chooseHighlighter: "Choisir une couleur de stabilo",
      freehand: "Dessin libre",
      advancedTools: "Outils avancés",
      selection: "Sélection",
      delete: "Supprimer",
      creditPrefix: "Conçu par",
      tools: "Outils",
      undo: "Annuler",
      redo: "Refaire",
      exportPdfLoading: "Création PDF...",
      exportPngLoading: "Création PNG...",
      preparingPrint: "Préparation...",
      print: "Imprimer",
      sheetStyle: "Style de feuille",
      newDocument: "Nouveau",
      language: "Langue",
      settings: "Paramètres",
      install: "Installer",
      installHelp: "Utilise l’icône d’installation dans la barre d’adresse ou le menu du navigateur pour installer l’app sur cet appareil."
    },
    geometryHelper: {
      idle: "Trace des figures précises en gardant l’échelle de la feuille pour l’impression.",
      protractorFirstSide: "Clique un point sur le premier côté de l’angle.",
      protractorVertex: "Clique ensuite le sommet de l’angle.",
      protractorSecondSide: "Clique un point sur le second côté pour figer la mesure.",
      compassCenter: "Clique le centre du cercle.",
      compassRadius: "Déplace la souris pour régler l’ouverture, puis clique pour commencer l’arc.",
      compassArc: "Déplace la souris pour agrandir ou réduire l’arc, puis clique pour le terminer.",
      measureSecondPoint: "Clique un second point pour figer la mesure.",
      finishShape: "Clique une seconde fois pour terminer la figure.",
      measureTwoPoints: "Clique deux points pour mesurer une distance sans créer d’objet.",
      placePoint: "Clique la feuille pour placer un point.",
      placeCircleCenter: "Clique la feuille pour placer le centre du cercle.",
      placeFirstPoint: "Clique la feuille pour placer le premier point."
    },
    canvas: {
      insertHint: "Clique ou touche la feuille pour placer {item}.",
      writeHere: "Écris ici",
      emptyTextBox: "Zone de texte",
      align: "Aligner",
      settings: "Réglages",
      closeSettings: "Fermer les réglages",
      closeMenu: "Fermer le menu",
      highlightColor: "Surlignage {color}",
      pointName: "Nom du point",
      segmentLength: "Longueur (mm)",
      circleRadius: "Rayon (mm)"
    },
    modal: {
      guidedBlock: "Bloc guidé",
      guidedBlockHelper: "Prépare le bloc, puis place-le librement sur la feuille.",
      graduatedLine: "Droite graduée",
      graduatedLineHelper: "Trace une droite, puis choisis en combien de sections la diviser.",
      graduatedLinePresets: "Choix rapides",
      cancel: "Annuler",
      insert: "Insérer",
      save: "Enregistrer",
      preview: "Aperçu",
      confirmation: "Confirmation",
      createNewDocument: "Créer un nouveau document ?",
      createNewDocumentHelper: "La feuille actuelle sera effacée et remplacée par un nouveau devoir.",
      confirmNew: "Nouveau"
    },
    modalFields: {
      numerator: "Numérateur",
      denominator: "Dénominateur",
      note: "Consigne ou remarque",
      divisor: "Diviseur",
      quotient: "Quotient",
      dividendAndWork: "Dividende et calculs",
      firstTerm: "Premier terme",
      secondTerm: "Deuxième terme",
      result: "Résultat",
      carryTop: "Retenue haut",
      carryMiddle: "Retenue milieu",
      carryBottom: "Retenue bas",
      base: "Base",
      exponent: "Exposant",
      radicand: "Radicande",
      startAt: "Commencer à",
      sections: "Nombre de sections",
      fractionNotePlaceholder: "Je simplifie la fraction",
      divisionNotePlaceholder: "Je vérifie avec 35 × 7",
      additionNotePlaceholder: "Je pose l'addition",
      subtractionNotePlaceholder: "Je pose la soustraction",
      multiplicationNotePlaceholder: "Je pose la multiplication",
      powerNotePlaceholder: "Carré, cube, puissance n",
      rootNotePlaceholder: "Racine carrée"
    },
    inlineEditor: {
      strike: "Barrer",
      clickCell: "Clique une case"
    },
    blockTitles: {
      fraction: "Fraction posée",
      addition: "Addition posée",
      subtraction: "Soustraction posée",
      multiplication: "Multiplication posée",
      division: "Division posée",
      power: "Puissance",
      root: "Racine",
      default: "Bloc"
    },
    profile: {
      selectProfile: "Profil",
      noProfile: "Aucun profil",
      createProfile: "Nouveau profil",
      editProfile: "Modifier",
      deleteProfile: "Supprimer",
      deleteProfileConfirm: "Supprimer ce profil ?",
      firstName: "Prénom",
      lastName: "Nom",
      className: "Classe",
      preferredSheetStyle: "Style de feuille",
      preferredMode: "Niveau",
      middleSchool: "Collège",
      highSchool: "Lycée",
      save: "Enregistrer",
      cancel: "Annuler",
      switcherHint: "Sélection du profil utilisateur. Modifier les profils dans les paramètres.",
      visibleFields: "Visible sur toutes les pages",
      showName: "Nom",
      showClass: "Classe",
      showDate: "Date",
      highlightOnHover: "Encadrer les éléments au survol"
    }
  }
};

const es: Messages = {
  Metadata: {
    title: "Dysmaths - escritura matemática más fácil para estudiantes con disgrafía y dispraxia",
    description: "Una aplicación pensada para ayudar a estudiantes de secundaria y bachillerato a redactar, guardar e imprimir su trabajo de matemáticas."
  },
  Workbook: {
    document: {
      defaultTitle: "Mi tarea de matemáticas",
      defaultFullName: "Nombre y apellidos:",
      defaultClass: "Clase:",
      defaultDate: "Fecha:"
    },
    colors: {
      ink: "Tinta",
      orange: "Naranja",
      blue: "Azul",
      green: "Verde",
      pink: "Rosa"
    },
    highlights: {
      yellow: "Amarillo",
      green: "Verde",
      blue: "Azul",
      pink: "Rosa"
    },
    sheetStyles: {
      seyes: "Líneas Seyes",
      largeGrid: "Cuadrícula grande",
      smallGrid: "Cuadrícula pequeña",
      lined: "Hoja rayada",
      blank: "Hoja en blanco"
    },
    geometryTools: {
      point: {label: "Punto", hint: "Colocar un punto"},
      segment: {label: "Segmento", hint: "Trazar un segmento"},
      line: {label: "Recta", hint: "Trazar una recta"},
      ray: {label: "Semirrecta", hint: "Trazar una semirrecta"},
      circle: {label: "Círculo", hint: "Trazar un círculo"},
      compass: {label: "Compás", hint: "Trazar un círculo con apertura memorizada"},
      measure: {label: "Regla", hint: "Medir una distancia"},
      protractor: {label: "Transportador", hint: "Medir un ángulo"}
    },
    structuredTools: {
      fraction: {label: "Fracción escrita", hint: "Fracción escrita"},
      addition: {label: "Suma escrita", hint: "Suma escrita"},
      subtraction: {label: "Resta escrita", hint: "Resta escrita"},
      multiplication: {label: "Multiplicación escrita", hint: "Multiplicación escrita"},
      division: {label: "División escrita", hint: "División escrita"},
      power: {label: "Potencia", hint: "Potencia"},
      root: {label: "Raíz", hint: "Radicando y resultado"}
    },
    shortcutGroups: {
      essentials: "Esenciales",
      geometry: "Geometría",
      highSchool: "Bachillerato",
      variables: "Variables"
    },
    shortcuts: {
      equal: "Añadir =",
      neq: "Añadir ≠",
      lt: "Menor que",
      gt: "Mayor que",
      leq: "Menor o igual que",
      geq: "Mayor o igual que",
      minus: "Restar",
      times: "Multiplicar",
      div: "Dividir",
      lbracket: "Corchete de apertura",
      rbracket: "Corchete de cierre",
      percent: "Porcentaje",
      pi: "Pi",
      angle: "Ángulo",
      parallel: "Paralelo",
      perpendicular: "Perpendicular",
      degree: "Grado",
      sum: "Suma",
      integral: "Integral",
      scriptX: "x script",
      scriptY: "y script",
      scriptZ: "z script"
    },
    toolbar: {
      closeTools: "Cerrar herramientas",
      geometry: "Geometría",
      geometryGroup: "Herramientas de geometría",
      structuredOperations: "Operaciones escritas",
      graduatedLine: "Recta graduada",
      insertionTools: "Herramientas de inserción",
      commonSymbols: "Símbolos frecuentes",
      commonSymbolShortcuts: "Atajos de símbolos frecuentes",
      highSchoolTools: "Herramientas de bachillerato",
      highSchoolShortcuts: "Atajos de bachillerato",
      formatting: "Formato",
      bold: "Negrita",
      italic: "Cursiva",
      underline: "Subrayado",
      decrease: "Reducir",
      increase: "Aumentar",
      highlighter: "Resaltador",
      chooseHighlighter: "Elegir un color de resaltador",
      freehand: "Dibujo libre",
      advancedTools: "Herramientas avanzadas",
      selection: "Selección",
      delete: "Eliminar",
      creditPrefix: "Diseñado por",
      tools: "Herramientas",
      undo: "Deshacer",
      redo: "Rehacer",
      exportPdfLoading: "Creando PDF...",
      exportPngLoading: "Creando PNG...",
      preparingPrint: "Preparando...",
      print: "Imprimir",
      sheetStyle: "Tipo de hoja",
      newDocument: "Nuevo",
      language: "Idioma",
      settings: "Ajustes",
      install: "Instalar",
      installHelp: "Usa el icono de instalación de la barra de direcciones o el menú del navegador para instalar la app en este dispositivo."
    },
    geometryHelper: {
      idle: "Traza figuras precisas manteniendo la escala de la hoja para la impresión.",
      protractorFirstSide: "Haz clic en un punto del primer lado del ángulo.",
      protractorVertex: "Luego haz clic en el vértice del ángulo.",
      protractorSecondSide: "Haz clic en un punto del segundo lado para fijar la medida.",
      compassCenter: "Haz clic en el centro del círculo.",
      compassRadius: "Mueve el cursor para ajustar la apertura y haz clic para iniciar el arco.",
      compassArc: "Mueve el cursor para ampliar o reducir el arco y haz clic para terminarlo.",
      measureSecondPoint: "Haz clic en un segundo punto para fijar la medida.",
      finishShape: "Haz clic una segunda vez para terminar la figura.",
      measureTwoPoints: "Haz clic en dos puntos para medir una distancia sin crear un objeto.",
      placePoint: "Haz clic en la hoja para colocar un punto.",
      placeCircleCenter: "Haz clic en la hoja para colocar el centro del círculo.",
      placeFirstPoint: "Haz clic en la hoja para colocar el primer punto."
    },
    canvas: {
      insertHint: "Haz clic o toca la hoja para colocar {item}.",
      writeHere: "Escribe aquí",
      emptyTextBox: "Cuadro de texto",
      align: "Alinear",
      settings: "Ajustes",
      closeSettings: "Cerrar ajustes",
      closeMenu: "Cerrar menú",
      highlightColor: "Resaltado {color}",
      pointName: "Nombre del punto",
      segmentLength: "Longitud (mm)",
      circleRadius: "Radio (mm)"
    },
    modal: {
      guidedBlock: "Bloque guiado",
      guidedBlockHelper: "Prepara el bloque y luego colócalo libremente sobre la hoja.",
      graduatedLine: "Recta graduada",
      graduatedLineHelper: "Traza una recta y elige en cuántas secciones dividirla.",
      graduatedLinePresets: "Opciones rápidas",
      cancel: "Cancelar",
      insert: "Insertar",
      save: "Guardar",
      preview: "Vista previa",
      confirmation: "Confirmación",
      createNewDocument: "¿Crear un documento nuevo?",
      createNewDocumentHelper: "La hoja actual se borrará y será reemplazada por una nueva tarea.",
      confirmNew: "Nuevo"
    },
    modalFields: {
      numerator: "Numerador",
      denominator: "Denominador",
      note: "Instrucción o nota",
      divisor: "Divisor",
      quotient: "Cociente",
      dividendAndWork: "Dividendo y cálculos",
      firstTerm: "Primer término",
      secondTerm: "Segundo término",
      result: "Resultado",
      carryTop: "Llevada superior",
      carryMiddle: "Llevada central",
      carryBottom: "Llevada inferior",
      base: "Base",
      exponent: "Exponente",
      radicand: "Radicando",
      startAt: "Empezar en",
      sections: "Secciones",
      fractionNotePlaceholder: "Simplifico la fracción",
      divisionNotePlaceholder: "Compruebo con 35 × 7",
      additionNotePlaceholder: "Escribo la suma",
      subtractionNotePlaceholder: "Escribo la resta",
      multiplicationNotePlaceholder: "Escribo la multiplicación",
      powerNotePlaceholder: "Cuadrado, cubo, potencia n",
      rootNotePlaceholder: "Raíz cuadrada"
    },
    inlineEditor: {
      strike: "Tachar",
      clickCell: "Haz clic en una celda"
    },
    blockTitles: {
      fraction: "Fracción escrita",
      addition: "Suma escrita",
      subtraction: "Resta escrita",
      multiplication: "Multiplicación escrita",
      division: "División escrita",
      power: "Potencia",
      root: "Raíz",
      default: "Bloque"
    },
    profile: {
      selectProfile: "Perfil",
      noProfile: "Sin perfil",
      createProfile: "Nuevo perfil",
      editProfile: "Editar",
      deleteProfile: "Eliminar",
      deleteProfileConfirm: "¿Eliminar este perfil?",
      firstName: "Nombre",
      lastName: "Apellidos",
      className: "Clase",
      preferredSheetStyle: "Tipo de hoja",
      preferredMode: "Nivel",
      middleSchool: "Secundaria",
      highSchool: "Bachillerato",
      save: "Guardar",
      cancel: "Cancelar",
      switcherHint: "Selección del perfil de usuario. Editar perfiles en los ajustes.",
      visibleFields: "Visible en todas las páginas",
      showName: "Nombre",
      showClass: "Clase",
      showDate: "Fecha",
      highlightOnHover: "Resaltar elementos al pasar el ratón"
    }
  }
};

export const messagesByLocale: Record<AppLocale, Messages> = {
  en,
  fr,
  es
};

export type AppMessages = Messages;
