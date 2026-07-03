export interface ExamDetail {
  id: string;
  title: string;
  code: string;
  date: string;
  eligibility: string;
  syllabus: string[];
  link: string;
  category: "UPSC" | "MPSC" | "Railway Exams" | "SSC Exams" | "Banking Exams" | "Defence Exams" | "Clerk Exams" | "State Exams" | "Private Exams";
  isUpcoming: boolean;
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
  category: "UPSC" | "MPSC" | "Railway Exams" | "SSC Exams" | "Banking Exams" | "Defence Exams" | "Clerk Exams" | "State Exams" | "Private Exams";
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
  category: "UPSC" | "MPSC" | "Railway Exams" | "SSC Exams" | "Banking Exams" | "Defence Exams" | "Clerk Exams" | "State Exams" | "Private Exams";
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
    link: "https://mpsc.gov.in",
    category: "MPSC",
    isUpcoming: true
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
    link: "https://upsc.gov.in",
    category: "UPSC",
    isUpcoming: true
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
    link: "https://ssc.gov.in",
    category: "SSC Exams",
    isUpcoming: true
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
    link: "https://ibps.in",
    category: "Banking Exams",
    isUpcoming: true
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
    link: "https://rrcb.gov.in",
    category: "Railway Exams",
    isUpcoming: true
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
    link: "https://mahapolice.gov.in",
    category: "Defence Exams",
    isUpcoming: true
  },
  {
    id: "exam-7",
    title: "NDA & NA (I) Examination 2026",
    code: "UPSC-NDA-2026",
    date: "September 20, 2026",
    eligibility: "12th Class pass of the 10+2 pattern of School Education or equivalent.",
    syllabus: [
      "Mathematics (Algebra, Trigonometry, Calculus, Statistics)",
      "General Ability Test (English Vocabulary, Physics, Chemistry, History)"
    ],
    link: "https://upsc.gov.in",
    category: "Defence Exams",
    isUpcoming: true
  },
  {
    id: "exam-8",
    title: "SBI Junior Associates (Clerk) Exam 2026",
    code: "SBI-CLERK-2026",
    date: "October 18, 2026",
    eligibility: "Graduation in any discipline from a recognized University.",
    syllabus: [
      "Numerical Ability (Simplification, Profit & Loss, Percentages)",
      "English Language (Cloze Test, Fillers, Sentence Correction)",
      "Reasoning Ability (Alpha-Numeric Series, Blood Relations)"
    ],
    link: "https://sbi.co.in",
    category: "Clerk Exams",
    isUpcoming: true
  },
  {
    id: "exam-9",
    title: "Maharashtra Talathi Bharti 2026",
    code: "TALATHI-BHARTI-2026",
    date: "November 14, 2026",
    eligibility: "Graduate degree from any recognized university.",
    syllabus: [
      "Marathi Language & Grammar",
      "English Vocabulary & Comprehension",
      "General Knowledge & Current Affairs of Maharashtra",
      "Intellectual Test & Simple Arithmetic"
    ],
    link: "https://mahabhumi.gov.in",
    category: "State Exams",
    isUpcoming: true
  },
  {
    id: "exam-10",
    title: "TCS National Qualifier Test (NQT) Cognitive & IT 2026",
    code: "TCS-NQT-2026",
    date: "August 30, 2026",
    eligibility: "Pre-final or Final year students of BE/BTech/ME/MTech/MCA/MSc.",
    syllabus: [
      "Numerical Ability (Mathematical reasoning, statistics)",
      "Verbal Ability (Reading comprehension, sentence completion)",
      "Reasoning Ability (Logical puzzles, coding-decoding)",
      "Programming Logic (C, C++, Java, Python fundamentals)"
    ],
    link: "https://nextstep.tcs.com",
    category: "Private Exams",
    isUpcoming: false
  },
  {
    id: "exam-11",
    title: "Infosys Certification & Technical Assessment 2026",
    code: "INFY-CERT-2026",
    date: "September 5, 2026",
    eligibility: "Bachelor or Master of Engineering, Technology, or Computer Application.",
    syllabus: [
      "Java / Python hands-on programming challenges",
      "Object-Oriented Programming (OOPs) concepts",
      "Database Management Systems & SQL Queries",
      "Data Structures and Algorithm Complexity"
    ],
    link: "https://www.infosys.com/careers/",
    category: "Private Exams",
    isUpcoming: false
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
    ],
    category: "MPSC"
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
    ],
    category: "UPSC"
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
    ],
    category: "SSC Exams"
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
    ],
    category: "Banking Exams"
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
    ],
    category: "Railway Exams"
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
    ],
    category: "MPSC"
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
    ],
    category: "MPSC"
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
    ],
    category: "UPSC"
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
    ],
    category: "SSC Exams"
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
    ],
    category: "Banking Exams"
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
    ],
    category: "Railway Exams"
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
    ],
    category: "Defence Exams"
  }
];

export interface JobAlert {
  id: string;
  title: string;
  category: "Government" | "Private";
  organization: string;
  postName: string;
  vacancies: string;
  salary: string;
  lastDate: string;
  qualification: string;
  link: string;
  details: string;
}

export const jobAlerts: JobAlert[] = [
  {
    id: "job-1",
    title: "MPSC State Services Recruitment 2026",
    category: "Government",
    organization: "Maharashtra Public Service Commission (MPSC)",
    postName: "Deputy Collector, DYSP, Tehsildar & Class A/B Officers",
    vacancies: "513 Posts",
    salary: "₹56,100 - ₹1,77,500/month (Level 15)",
    lastDate: "July 30, 2026",
    qualification: "Graduate degree in any stream from a recognized university.",
    link: "https://mpsc.gov.in",
    details: "MPSC has announced recruitment for 513 administrative vacancies across Maharashtra state departments. The selection process includes Preliminary Exam, Mains Exam, and personal interview rounds."
  },
  {
    id: "job-2",
    title: "TCS National Qualifier Test (NQT) Hiring 2026",
    category: "Private",
    organization: "Tata Consultancy Services (TCS)",
    postName: "Systems Engineer & Ninja / Digital Developer",
    vacancies: "5000+ Posts",
    salary: "₹3.36 LPA - ₹7.0 LPA",
    lastDate: "August 10, 2026",
    qualification: "B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc (Batch of 2025/2026)",
    link: "https://nextstep.tcs.com",
    details: "The TCS NQT is a multi-dimensional assessment designed to evaluate cognitive skills, professional knowledge, and programming capabilities. Top performers receive job offers for TCS Ninja or Digital roles."
  },
  {
    id: "job-3",
    title: "SSC Combined Graduate Level (CGL) 2026",
    category: "Government",
    organization: "Staff Selection Commission (SSC)",
    postName: "Assistant Section Officer, Inspector of Income Tax, Assistant Enforcement Officer",
    vacancies: "17,727 Posts",
    salary: "₹35,400 - ₹1,51,100/month (Pay Level 6 to 8)",
    lastDate: "July 24, 2026",
    qualification: "Bachelor's Degree in any discipline from a recognized University.",
    link: "https://ssc.gov.in",
    details: "One of the largest national government recruitments. SSC CGL recruitment is held to select staff for various Group B and Group C posts in ministries, departments, and organizations of the Government of India."
  },
  {
    id: "job-4",
    title: "Infosys Off-Campus Freshers Drive 2026",
    category: "Private",
    organization: "Infosys Limited",
    postName: "System Engineer & Associate Developer",
    vacancies: "1500+ Posts",
    salary: "₹3.6 LPA - ₹4.5 LPA",
    lastDate: "July 28, 2026",
    qualification: "B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc (Any Specialization)",
    link: "https://www.infosys.com/careers/",
    details: "Infosys is conducting national off-campus hiring for technical graduates. The candidate must have robust analytical, debugging and coding skills. Selected candidates will undergo specialized training at Mysore campus."
  },
  {
    id: "job-5",
    title: "ISRO Scientist/Engineer 'SC' Recruitment",
    category: "Government",
    organization: "Indian Space Research Organisation (ISRO)",
    postName: "Scientist/Engineer 'SC' (Electronics, Mechanical, Computer Science)",
    vacancies: "85 Posts",
    salary: "₹56,100/month basic pay (plus DA, HRA, TA)",
    lastDate: "August 5, 2026",
    qualification: "B.E/B.Tech or equivalent degree with minimum aggregate of 65% marks or CGPA of 6.84.",
    link: "https://www.isro.gov.in/Careers.html",
    details: "ISRO Centralised Recruitment Board (ICRB) invites applications from highly motivated candidates for the prestigious post of Scientist/Engineer. Selection involves written test and strict panel interview."
  },
  {
    id: "job-6",
    title: "HDFC Bank Relationship Manager Program",
    category: "Private",
    organization: "HDFC Bank Ltd.",
    postName: "Personal Banker / Elite Relationship Manager",
    vacancies: "300+ Posts",
    salary: "₹4.2 LPA - ₹6.5 LPA",
    lastDate: "August 1, 2026",
    qualification: "Graduation degree in commerce, management or science with good communication skills.",
    link: "https://www.hdfcbank.com/personal/about-us/careers",
    details: "HDFC is looking for fresh and experienced personnel to join the retail banking assets and relationship management divisions. Candidates must possess outstanding interpersonal and financial negotiation skills."
  },
  {
    id: "job-7",
    title: "RRB Non-Technical Popular Categories (NTPC)",
    category: "Government",
    organization: "Railway Recruitment Board (RRB)",
    postName: "Commercial Apprentice, Station Master, Goods Guard, Junior Accounts Assistant",
    vacancies: "11,558 Posts",
    salary: "₹19,900 - ₹35,400/month plus allowances",
    lastDate: "August 12, 2026",
    qualification: "12th (+2 Stage) or University degree depending on the specific post tier.",
    link: "https://rrcb.gov.in",
    details: "The Ministry of Railways conducts RRB NTPC examinations for major commercial and operational staff positions within Indian Railways zones. Excellent job security and additional housing benefits are provided."
  },
  {
    id: "job-8",
    title: "Reliance Jio Graduate Engineer Trainee",
    category: "Private",
    organization: "Reliance Jio Infocomm Ltd.",
    postName: "Graduate Engineer Trainee (Networks / Cloud Platform / AI Systems)",
    vacancies: "450 Posts",
    salary: "₹5.0 LPA - ₹8.0 LPA",
    lastDate: "August 15, 2026",
    qualification: "B.Tech in Computer Science, Information Technology, or Telecommunications.",
    link: "https://careers.jio.com",
    details: "Join the largest telecom network operator in India. Jio is hiring software and networking graduates to work on high-capacity cloud infrastructures, 5G core optimization, and enterprise solutions."
  }
];

