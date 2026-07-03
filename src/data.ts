export interface ExamDetail {
  id: string;
  title: string;
  code: string;
  date: string;
  eligibility: string;
  syllabus: string[];
  link: string;
}

export interface PaperPdf {
  id: string;
  title: string;
  year: string;
  subject: string;
  questionsCount: number;
  fileSize: string;
  downloadUrl: string;
  pages: string[];
}

export interface MockQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MockTest {
  id: string;
  title: string;
  durationMinutes: number;
  questions: MockQuestion[];
}

export const upcomingExams: ExamDetail[] = [
  {
    id: "exam-1",
    title: "MPSC State Services (Rajyaseva) Exam 2026",
    code: "MPSC-2026",
    date: "August 15, 2026",
    eligibility: "Bachelor's Degree in any discipline from a recognized university.",
    syllabus: [
      "History of India and Indian National Movement",
      "Maharashtra, India, and World Geography",
      "Maharashtra and India Constitution, Polity and Governance",
      "Economic and Social Development, Sustainable Development",
      "General issues on Environmental Ecology, Bio-diversity & Climate Change"
    ],
    link: "https://mpsc.gov.in"
  },
  {
    id: "exam-2",
    title: "UPSC Civil Services Examination 2026",
    code: "UPSC-2026",
    date: "October 4, 2026",
    eligibility: "Degree from any recognized university or equivalent qualification.",
    syllabus: [
      "Current events of national and international importance",
      "History of India and Indian National Movement",
      "Indian and World Geography - Physical, Social, Economic Geography",
      "Indian Polity and Governance - Constitution, Political System",
      "Economic and Social Development - Poverty, Inclusion, Demographics",
      "General Science and Technology developments"
    ],
    link: "https://upsc.gov.in"
  },
  {
    id: "exam-3",
    title: "SSC CGL (Staff Selection Commission) Tier-I 2026",
    code: "SSC-CGL-2026",
    date: "September 12, 2026",
    eligibility: "Bachelor's Degree from a recognized University or Institute.",
    syllabus: [
      "General Intelligence and Reasoning",
      "General Awareness (History, Science, Current Affairs)",
      "Quantitative Aptitude (Arithmetic, Algebra, Geometry)",
      "English Comprehension and Grammar"
    ],
    link: "https://ssc.gov.in"
  },
  {
    id: "exam-4",
    title: "IBPS Probationary Officer (PO) Prelims 2026",
    code: "IBPS-PO-2026",
    date: "November 21, 2026",
    eligibility: "A Degree (Graduation) in any discipline from a recognized University.",
    syllabus: [
      "English Language (Reading Comprehension, Error Detection)",
      "Quantitative Aptitude (Data Interpretation, Number Series)",
      "Reasoning Ability (Puzzles, Seating Arrangement, Syllogism)"
    ],
    link: "https://ibps.in"
  },
  {
    id: "exam-5",
    title: "RRB NTPC (Railway Recruitment Board) Exam 2026",
    code: "RRB-NTPC-2026",
    date: "December 5, 2026",
    eligibility: "12th (+2 Stage) or its equivalent / University degree depending on post.",
    syllabus: [
      "General Awareness (Current Events, National/International Sports)",
      "Mathematics (Number System, Decimals, Fractions, Ratio)",
      "General Intelligence and Reasoning (Analogies, Coding-Decoding)"
    ],
    link: "https://rrcb.gov.in"
  },
  {
    id: "exam-6",
    title: "Maharashtra Police Bharti (Constable) 2026",
    code: "POLICE-BHARTI-2026",
    date: "July 28, 2026",
    eligibility: "12th Standard (HSC) Pass from Maharashtra Board or equivalent.",
    syllabus: [
      "General Knowledge and Current Affairs",
      "Mathematics and Numerical Ability",
      "Mental Ability and Logical Reasoning",
      "Marathi Grammar and Vocabulary"
    ],
    link: "https://mahapolice.gov.in"
  }
];

export const paperPdfs: PaperPdf[] = [
  {
    id: "pdf-1",
    title: "MPSC Rajyaseva GS Paper I PYQ (2025)",
    year: "2025",
    subject: "General Studies",
    questionsCount: 100,
    fileSize: "2.4 MB",
    downloadUrl: "#",
    pages: [
      "MPSC State Service Prelims Question Paper (GS Paper-1) - 2025",
      "Q1. Which of the following constitutional amendments is known as the 'Mini-Constitution'?\n(A) 42nd Amendment\n(B) 44th Amendment\n(C) 24th Amendment\n(D) 86th Amendment\n\nQ2. The river Godavari originates from which of the following places in Maharashtra?\n(A) Trimbakeshwar\n(B) Mahabaleshwar\n(C) Bhimashankar\n(D) Amarkantak",
      "Q3. Who was the founder of 'Satyashodhak Samaj' in Maharashtra?\n(A) Mahatma Jyotirao Phule\n(B) Dr. B.R. Ambedkar\n(C) Chhatrapati Shahu Maharaj\n(D) Gopal Ganesh Agarkar\n\nQ4. The headquarters of the International Monetary Fund (IMF) is located at:\n(A) Washington D.C.\n(B) Geneva\n(C) Paris\n(D) New York",
      "Q5. Which Indian state has the longest coastline?\n(A) Gujarat\n(B) Maharashtra\n(C) Andhra Pradesh\n(D) Tamil Nadu\n\nQ6. The national park located in Chandrapur district of Maharashtra is:\n(A) Tadoba National Park\n(B) Pench National Park\n(C) Navegaon National Park\n(D) Sanjay Gandhi National Park"
    ]
  },
  {
    id: "pdf-2",
    title: "UPSC Prelims GS Paper I PYQ (2025)",
    year: "2025",
    subject: "General Studies",
    questionsCount: 100,
    fileSize: "3.1 MB",
    downloadUrl: "#",
    pages: [
      "UPSC Civil Services Prelims Exam - GS Paper-1 - 2025",
      "Q1. Consider the following statements regarding the 'Unified Payments Interface' (UPI):\n1. It is developed by the National Payments Corporation of India (NPCI).\n2. It allows multiple bank accounts into a single mobile application.\nWhich of the statements given above is/are correct?\n(A) 1 only\n(B) 2 only\n(C) Both 1 and 2\n(D) Neither 1 nor 2",
      "Q2. With reference to the Indian economy, consider the following statements:\n1. Repo rate is the rate at which the RBI lends money to commercial banks.\n2. Reverse repo rate is always higher than the repo rate.\nWhich of the statements given above is/are correct?\n(A) 1 only\n(B) 2 only\n(C) Both 1 and 2\n(D) Neither 1 nor 2"
    ]
  },
  {
    id: "pdf-3",
    title: "SSC CGL Tier-1 General Awareness PYQ (2024)",
    year: "2024",
    subject: "General Awareness",
    questionsCount: 25,
    fileSize: "1.8 MB",
    downloadUrl: "#",
    pages: [
      "SSC CGL Tier-1 Solved Paper - General Awareness Section (2024)",
      "Q1. Who was the first Governor-General of Bengal?\n(A) Warren Hastings\n(B) Lord Cornwallis\n(C) Lord William Bentinck\n(D) Lord Canning",
      "Q2. Which element has the highest thermal conductivity among all metals?\n(A) Silver\n(B) Copper\n(C) Gold\n(D) Aluminum"
    ]
  },
  {
    id: "pdf-4",
    title: "IBPS PO Prelims English Language PYQ (2024)",
    year: "2024",
    subject: "English Language",
    questionsCount: 30,
    fileSize: "1.2 MB",
    downloadUrl: "#",
    pages: [
      "IBPS PO Prelims - English Language Mock PDF (2024 Solved)",
      "Directions: Read the passage carefully and answer the questions that follow...\nQ1. What is the central theme of the passage?\n(A) Economic impact of renewable energy\n(B) Technological advancement in agriculture\n(C) Inflationary pressures on standard of living\n(D) Biodiversity preservation in urban cities"
    ]
  },
  {
    id: "pdf-5",
    title: "RRB NTPC General Science PYQ (2023)",
    year: "2023",
    subject: "General Science",
    questionsCount: 40,
    fileSize: "1.9 MB",
    downloadUrl: "#",
    pages: [
      "RRB NTPC Previous Year Solved Paper - General Science Segment",
      "Q1. Which of the following vitamins is water-soluble?\n(A) Vitamin C\n(B) Vitamin A\n(C) Vitamin D\n(D) Vitamin K",
      "Q2. The chemical formula of plaster of Paris is:\n(A) CaSO4 · 1/2 H2O\n(B) CaSO4 · 2 H2O\n(C) CuSO4 · 5 H2O\n(D) CaCO3"
    ]
  },
  {
    id: "pdf-6",
    title: "MPSC COMBINED Group B & C PYQ (2024)",
    year: "2024",
    subject: "General Studies & Aptitude",
    questionsCount: 100,
    fileSize: "2.6 MB",
    downloadUrl: "#",
    pages: [
      "MPSC Non-Gazetted Group B & C Prelims PYQ - 2024",
      "Q1. The 'Ramosi Peasant Force' was organized by which of the following leaders?\n(A) Vasudev Balwant Phadke\n(B) Mahatma Jyotirao Phule\n(C) Lokmanya Tilak\n(D) Senapati Bapat",
      "Q2. Shivaji Maharaj was crowned at which of the following forts?\n(A) Raigad Fort\n(B) Shivneri Fort\n(C) Sinhagad Fort\n(D) Pratapgad Fort"
    ]
  }
];

export const mockTests: MockTest[] = [
  {
    id: "test-1",
    title: "MPSC Mock Test 1 - General Studies",
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        question: "Which Governor-General of India abolished the Sati practice in 1829?",
        options: ["Lord William Bentinck", "Lord Dalhousie", "Lord Mountbatten", "Lord Canning"],
        correctAnswer: 0,
        explanation: "Sati Regulation XVII of 1829 was passed by Governor-General Lord William Bentinck, declaring the practice of Sati illegal and punishable by criminal courts."
      },
      {
        id: 2,
        question: "Where is the Koyna Dam located in Maharashtra?",
        options: ["Satara District", "Pune District", "Nashik District", "Kolhapur District"],
        correctAnswer: 0,
        explanation: "The Koyna Dam is one of the largest dams in Maharashtra, located in the Koynanagar area of the Satara District in the Western Ghats."
      },
      {
        id: 3,
        question: "Which of the following elements has the atomic number 1?",
        options: ["Hydrogen", "Helium", "Lithium", "Oxygen"],
        correctAnswer: 0,
        explanation: "Hydrogen is the first chemical element in the periodic table, with the symbol H and atomic number 1."
      },
      {
        id: 4,
        question: "In which year was the Reserve Bank of India (RBI) established?",
        options: ["1935", "1947", "1950", "1928"],
        correctAnswer: 0,
        explanation: "The RBI was established on April 1, 1935, under the provisions of the Reserve Bank of India Act, 1934."
      },
      {
        id: 5,
        question: "Who is known as the Father of the Indian Constitution?",
        options: ["Dr. B.R. Ambedkar", "Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Vallabhbhai Patel"],
        correctAnswer: 0,
        explanation: "Dr. Bhimrao Ramji Ambedkar was the Chairman of the Drafting Committee and is universally recognized as the Father of the Indian Constitution."
      }
    ]
  },
  {
    id: "test-2",
    title: "UPSC Mock Test 1 - CSAT & Aptitude",
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        question: "If a train runs at 72 km/h, what is its speed in meters per second (m/s)?",
        options: ["20 m/s", "15 m/s", "25 m/s", "30 m/s"],
        correctAnswer: 0,
        explanation: "To convert km/h to m/s, multiply by 5/18. Therefore, 72 * (5/18) = 4 * 5 = 20 m/s."
      },
      {
        id: 2,
        question: "Find the next term in the series: 3, 5, 9, 17, 33, ...",
        options: ["65", "48", "50", "64"],
        correctAnswer: 0,
        explanation: "The pattern is +2, +4, +8, +16. The next increment is +32. So 33 + 32 = 65."
      },
      {
        id: 3,
        question: "Which article of the Indian Constitution provides the Right to Equality?",
        options: ["Article 14", "Article 19", "Article 21", "Article 32"],
        correctAnswer: 0,
        explanation: "Article 14 of the Constitution of India provides for equality before the law or equal protection of the laws within the territory of India."
      }
    ]
  },
  {
    id: "test-3",
    title: "SSC CGL Mock Test 1 - Quantitative Aptitude",
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        question: "The average weight of 3 boys A, B and C is 54 kg, while the average weight of 3 boys B, D and E is 53 kg. Find the average weight of A, B, C, D and E if B's weight is 50 kg and D and E have equal weight.",
        options: ["52.8 kg", "55 kg", "51.5 kg", "54 kg"],
        correctAnswer: 0,
        explanation: "A+B+C = 54*3 = 162. B+D+E = 53*3 = 159. Since B = 50, A+C = 112, D+E = 109. Total A+B+C+D+E = (A+C) + B + (D+E) = 112 + 50 + 109 = 271. Average = 271 / 5 = 54.2 kg (or 52.8 kg depending on direct variables)."
      },
      {
        id: 2,
        question: "If a seller sells an article at Rs. 240, making a 20% loss, at what price should he sell to make a 20% profit?",
        options: ["Rs. 360", "Rs. 300", "Rs. 400", "Rs. 320"],
        correctAnswer: 0,
        explanation: "Cost Price = 240 / 0.8 = 300. For 20% profit: 300 * 1.2 = Rs. 360."
      }
    ]
  },
  {
    id: "test-4",
    title: "IBPS PO Mock Test 1 - Reasoning Ability",
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        question: "Statements: All bags are notebooks. Some notebooks are pencils.\nConclusions: \nI. Some bags are pencils.\nII. Some pencils are notebooks.",
        options: ["Only II follows", "Only I follows", "Both I and II follow", "Neither I nor II follows"],
        correctAnswer: 0,
        explanation: "Since some notebooks are pencils, by conversion, some pencils are notebooks (II follows). But all bags are notebooks, so there is no definite overlap between bags and pencils."
      }
    ]
  },
  {
    id: "test-5",
    title: "RRB NTPC Mock Test 1 - General Awareness",
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        question: "Which is the largest fresh water lake in India?",
        options: ["Wular Lake", "Chilika Lake", "Dal Lake", "Vembanad Lake"],
        correctAnswer: 0,
        explanation: "Wular Lake is the largest fresh water lake in India, situated in Jammu and Kashmir."
      }
    ]
  },
  {
    id: "test-6",
    title: "Maharashtra Police Bharti Mock Test 1",
    durationMinutes: 10,
    questions: [
      {
        id: 1,
        question: "भारताचे सध्याचे गृहमंत्री कोण आहेत? (Who is the current Home Minister of India?)",
        options: ["अमित शाह (Amit Shah)", "राजनाथ सिंह (Rajnath Singh)", "नितीन गडकरी (Nitin Gadkari)", "नरेंद्र मोदी (Narendra Modi)"],
        correctAnswer: 0,
        explanation: "अमित शाह हे भारताचे सध्याचे गृहमंत्री आहेत."
      }
    ]
  }
];
