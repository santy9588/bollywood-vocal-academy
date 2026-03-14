export interface SubjectData {
  id: bigint;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  syllabus: string[];
  price: number;
}

export const SUBJECTS: SubjectData[] = [
  {
    id: 1n,
    name: "English",
    tagline: "Master the Global Language",
    description:
      "Build fluency with structured lessons covering vocabulary, grammar, writing, and spoken English with IELTS/TOEFL preparation.",
    icon: "📖",
    color: "oklch(0.35 0.12 255)",
    bgColor: "oklch(0.93 0.05 255)",
    syllabus: [
      "Vocabulary building & word power",
      "Grammar fundamentals & sentence structure",
      "Reading comprehension strategies",
      "Writing skills — essays & emails",
      "Spoken English & pronunciation",
      "IELTS / TOEFL exam preparation",
    ],
    price: 499,
  },
  {
    id: 2n,
    name: "Singing",
    tagline: "Unlock Your Voice",
    description:
      "From voice warm-ups to Ragas and Bollywood techniques — a complete vocal training journey for aspiring singers.",
    icon: "🎵",
    color: "oklch(0.55 0.18 340)",
    bgColor: "oklch(0.95 0.05 340)",
    syllabus: [
      "Voice warm-ups & breathing exercises",
      "Sur & Taal basics",
      "Ragas introduction & practice",
      "Bollywood singing techniques",
      "Stage performance & confidence",
      "Advanced vocal training",
    ],
    price: 499,
  },
  {
    id: 3n,
    name: "Computer",
    tagline: "Digital Skills for the Modern World",
    description:
      "From MS Office basics to Python programming and cybersecurity — practical computer skills for every career path.",
    icon: "💻",
    color: "oklch(0.45 0.15 200)",
    bgColor: "oklch(0.93 0.05 200)",
    syllabus: [
      "MS Office basics — Word, Excel, PowerPoint",
      "Internet & email usage",
      "Tally & accounting software",
      "Python programming introduction",
      "Web design basics",
      "Cybersecurity awareness",
    ],
    price: 499,
  },
  {
    id: 4n,
    name: "Government Exam Prep",
    tagline: "Crack the Competitive Exams",
    description:
      "Comprehensive preparation for SSC, UPSC, banking and other government examinations with mock tests and previous papers.",
    icon: "🏛️",
    color: "oklch(0.55 0.15 80)",
    bgColor: "oklch(0.95 0.05 80)",
    syllabus: [
      "General Knowledge & Current Affairs",
      "Reasoning & Aptitude",
      "Quantitative Mathematics",
      "English Grammar for exams",
      "Previous year papers analysis",
      "Mock test practice & time management",
    ],
    price: 499,
  },
];

export function getSubjectById(id: bigint): SubjectData | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getSubjectByName(name: string): SubjectData | undefined {
  return SUBJECTS.find((s) => s.name.toLowerCase() === name.toLowerCase());
}
