export interface FantasyScenario {
  id: string;
  title: string;
  category: 'romantic' | 'bold' | 'creative';
  description: string;
  setting: string;
  mood: string;
  instructions: string[];
  rules?: string[];
  variations?: string[];
}

export const fantasyScenarios: FantasyScenario[] = [
  // Romantic & Sensual Scenarios
  {
    id: "private-chef",
    title: "Private Chef Surprise",
    category: "romantic",
    description: "One of you prepares a meal wearing only an apron. The other arrives home to a dimly lit dining room. Dessert is not on the plate.",
    setting: "Kitchen and dining room",
    mood: "Sensual and playful",
    instructions: [
      "Chef: Prepare a simple but delicious meal",
      "Set the dining room with candles and soft music",
      "Wear only an apron while cooking",
      "Greet your partner with a kiss and wine",
      "Feed each other during dinner",
      "Let the real dessert be each other"
    ],
    rules: ["No phones or distractions", "Take your time with each course"],
    variations: ["Breakfast version", "Picnic style on the floor", "Blindfolded tasting"]
  },
  {
    id: "rainy-night",
    title: "Rainy Night Candle Ritual",
    category: "romantic",
    description: "The power is 'out,' and candles fill the room. You're stuck together with just a blanket, wine, and hands exploring under soft shadows.",
    setting: "Living room by candlelight",
    mood: "Intimate and cozy",
    instructions: [
      "Turn off all electric lights",
      "Fill the room with candles",
      "Share one large blanket",
      "Have wine or tea ready",
      "Start with just talking and touching",
      "Let the atmosphere guide you"
    ],
    rules: ["No electric lights", "Stay under the shared blanket"],
    variations: ["Add massage oils", "Include soft music", "Write love notes by candlelight"]
  },
  {
    id: "massage-game",
    title: "The Massage Game",
    category: "romantic",
    description: "One partner is 'the client,' the other is the sensual masseuse. There's a menu: oils, pressure points, and optional 'extra services.'",
    setting: "Bedroom with soft lighting",
    mood: "Relaxing and sensual",
    instructions: [
      "Create a 'spa menu' with different massage options",
      "Set up oils, towels, and relaxing music",
      "Client undresses and lies down",
      "Masseuse follows the 'menu' requests",
      "Start with innocent massage",
      "Let it naturally become more intimate"
    ],
    rules: ["Client can request anything on the menu", "Masseuse controls the pace"],
    variations: ["Switch roles halfway", "Add hot stones or ice", "Include sensual oils"]
  },

  // Bold & Erotic Scenarios
  {
    id: "hotel-encounter",
    title: "Hotel Encounter",
    category: "bold",
    description: "You don't know each other. You've been flirting all day via secret messages. You meet in a hotel bar, pretending to be strangers... and go up to the room.",
    setting: "Hotel bar and room",
    mood: "Mysterious and passionate",
    instructions: [
      "Create fake identities and backstories",
      "Text each other flirty messages during the day",
      "Meet at a hotel bar as 'strangers'",
      "Flirt and get to know your 'new' personas",
      "One of you suggests going to the room",
      "Maintain the roleplay throughout"
    ],
    rules: ["Stay in character", "No using real names", "Build tension slowly"],
    variations: ["Different characters each time", "Meet in different locations", "Add accents or costumes"]
  },
  {
    id: "power-play",
    title: "Power Play (Safe Dom/Sub)",
    category: "bold",
    description: "One wears a blindfold, the other takes control. Boundaries are agreed beforehand. There's teasing, command, surrender… and a word that stops everything.",
    setting: "Bedroom with preparations",
    mood: "Intense and trusting",
    instructions: [
      "Discuss boundaries and safe words beforehand",
      "One partner is blindfolded",
      "The other takes complete control",
      "Use commands and gentle dominance",
      "Focus on sensation and anticipation",
      "Check in with each other regularly"
    ],
    rules: ["Respect all boundaries", "Use safe words", "Aftercare is important"],
    variations: ["Switch roles", "Add restraints", "Include sensory play"]
  },
  {
    id: "watch-me",
    title: "Watch Me / Let Me Watch",
    category: "bold",
    description: "You give a sensual performance — slow undress, touch, maybe pleasure — while your partner watches, seated and forbidden to move or touch.",
    setting: "Bedroom with good lighting",
    mood: "Exhibitionist and voyeuristic",
    instructions: [
      "Set up a comfortable chair for the watcher",
      "Performer chooses music and lighting",
      "Start with slow, teasing movements",
      "Maintain eye contact throughout",
      "Watcher can only observe, not touch",
      "End when the performer decides"
    ],
    rules: ["Watcher cannot move or touch", "Performer controls everything"],
    variations: ["Switch roles", "Add costumes", "Include props or toys"]
  },

  // Creative & Fantasy-Based
  {
    id: "masquerade-manor",
    title: "Masquerade Manor",
    category: "creative",
    description: "A formal party at a mysterious mansion. You wear masks. You only reveal your identities after you've secretly touched, teased, and tempted.",
    setting: "Formal living space",
    mood: "Elegant and mysterious",
    instructions: [
      "Dress formally and wear masks",
      "Create a party atmosphere with music",
      "Pretend to be at a grand masquerade",
      "Flirt as masked strangers",
      "Touch and tease without revealing identities",
      "Remove masks only at the climax"
    ],
    rules: ["Keep masks on until the end", "Speak in different voices"],
    variations: ["Different historical periods", "Add other 'guests' (imaginary)", "Include dancing"]
  },
  {
    id: "stranger-public",
    title: "Stranger in Public",
    category: "creative",
    description: "One of you leaves the house early. Later that day, you 'bump into' each other in a café or bookstore and pretend you've never met. It ends in whispers and kisses behind closed doors.",
    setting: "Public place then private",
    mood: "Spontaneous and exciting",
    instructions: [
      "Plan to meet at a public location",
      "Pretend you don't know each other",
      "One approaches the other naturally",
      "Build chemistry as 'strangers'",
      "Suggest going somewhere private",
      "Maintain the fantasy until home"
    ],
    rules: ["Act like complete strangers", "Build attraction naturally"],
    variations: ["Different meeting locations", "Different personalities", "Add time constraints"]
  },
  {
    id: "captured-explorer",
    title: "Captured Explorer",
    category: "creative",
    description: "One of you is the 'explorer,' caught in enemy territory. The other is a seductive interrogator who uses pleasure and patience to extract answers.",
    setting: "Any room set as 'interrogation'",
    mood: "Playful and dramatic",
    instructions: [
      "Create a backstory for the explorer's mission",
      "Set up the room as an interrogation space",
      "Explorer is 'captured' and questioned",
      "Interrogator uses seduction over force",
      "Create secrets to be 'extracted'",
      "Let the roles blur as attraction grows"
    ],
    rules: ["Stay in character", "Use seduction, not actual force"],
    variations: ["Different time periods", "Switch roles", "Add costumes or props"]
  }
];

export const scenarioSettings = [
  "Hotel room", "Beach house", "Forest cabin", "Rooftop terrace", "Library", 
  "Art gallery", "Wine cellar", "Garden gazebo", "Mountain lodge", "City apartment"
];

export const scenarioRoles = [
  "Stranger", "Boss/Employee", "Client/Service provider", "Artist/Muse", 
  "Teacher/Student", "Royalty/Commoner", "Spy/Target", "Photographer/Model",
  "Doctor/Patient", "Traveler/Local"
];

export const scenarioRules = [
  "No talking allowed", "Eyes must stay closed", "Only touch with hands",
  "Must whisper everything", "Take turns leading", "Time limit of 30 minutes",
  "Only communicate through touch", "Must maintain eye contact", 
  "No removing clothes immediately", "Must ask permission for everything"
];