import React, { useState, useEffect } from "react";
import { 
  Search, 
  User, 
  ExternalLink, 
  Download, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Info, 
  ArrowRight, 
  BookOpen, 
  Trophy, 
  RefreshCw,
  GraduationCap,
  Award,
  LogIn,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Star,
  Sparkles,
  Lock,
  Unlock,
  CreditCard,
  ShieldAlert
} from "lucide-react";
import { 
  upcomingExams, 
  paperPdfs, 
  mockTests, 
  ExamDetail, 
  PaperPdf, 
  MockTest,
  jobAlerts,
  JobAlert,
  premiumPacks,
  PremiumExamPack
} from "./data";
import { auth, db, onAuthStateChanged, collection, addDoc, doc, getDoc, setDoc, User as FirebaseUser } from "./firebase";
import { AuthModal } from "./components/AuthModal";

function AppLogo({ className, id, isFooter = false }: { className?: string; id?: string; isFooter?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = "https://isxhcatn0reqvwnv.public.blob.vercel-storage.com/Exam__1_-removebg-preview.png";

  if (imgError) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full aspect-square border-2 ${
          isFooter 
            ? "border-amber-400/50 bg-amber-400/10 text-amber-400" 
            : "border-[#004aad]/50 bg-[#004aad]/5 text-[#004aad]"
        } p-2 shadow-inner transition-all hover:scale-105 shrink-0`}
        style={{ height: isFooter ? '80px' : '96px', width: isFooter ? '80px' : '96px' }}
        id={id}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <GraduationCap className={isFooter ? "w-6 h-6 text-amber-400" : "w-8 h-8 text-[#004aad] animate-pulse"} />
          <span className="text-[8px] font-black tracking-tight leading-none mt-0.5 uppercase">
            MAZI
          </span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt="maziexam Logo" 
      className={className}
      id={id}
      onError={() => {
        console.warn("Logo failed to load. Falling back to clean vector seal.");
        setImgError(true);
      }}
      referrerPolicy="no-referrer"
    />
  );
}

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<"jobs" | "exams" | "pdf" | "mock" | "selection">("jobs");
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Premium Purchases and Subscriptions state
  const [hasPortalPass, setHasPortalPass] = useState<boolean>(false);
  const [unlockedPacks, setUnlockedPacks] = useState<string[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState<boolean>(false);

  // Payment Simulator states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<"portal_pass" | "exam_pack" | "selection_pass">("portal_pass");
  const [paymentTargetPack, setPaymentTargetPack] = useState<PremiumExamPack | null>(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(50);

  // Unlocked premium pack details dialog
  const [unlockedDetailsModal, setUnlockedDetailsModal] = useState<PremiumExamPack | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sync user purchases from Firestore with LocalStorage fallback
  useEffect(() => {
    if (currentUser) {
      setLoadingPurchases(true);
      const docRef = doc(db, "user_purchases", currentUser.uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHasPortalPass(!!data.hasPortalPass);
            setUnlockedPacks(data.unlockedPacks || []);
          } else {
            // Check local storage for fallback/instant sync
            const localPass = localStorage.getItem(`portalPass_${currentUser.uid}`);
            const localPacks = localStorage.getItem(`unlockedPacks_${currentUser.uid}`);
            const initPass = localPass === "true";
            const initPacks = localPacks ? JSON.parse(localPacks) : [];
            setHasPortalPass(initPass);
            setUnlockedPacks(initPacks);
            
            // Auto create document in firestore so it stays synced
            setDoc(docRef, {
              userId: currentUser.uid,
              hasPortalPass: initPass,
              unlockedPacks: initPacks
            }).catch(e => console.error("Error creating purchases document:", e));
          }
        })
        .catch((err) => {
          console.error("Error fetching purchases:", err);
          // Fallback to local storage
          const localPass = localStorage.getItem(`portalPass_${currentUser.uid}`);
          const localPacks = localStorage.getItem(`unlockedPacks_${currentUser.uid}`);
          setHasPortalPass(localPass === "true");
          setUnlockedPacks(localPacks ? JSON.parse(localPacks) : []);
        })
        .finally(() => {
          setLoadingPurchases(false);
        });
    } else {
      setHasPortalPass(false);
      setUnlockedPacks([]);
    }
  }, [currentUser]);

  // Handle transaction success
  const handlePurchaseSuccess = async (type: "portal_pass" | "exam_pack" | "selection_pass", packId?: string) => {
    if (!currentUser) return;
    
    let nextPass = hasPortalPass;
    let nextPacks = [...unlockedPacks];
    
    if (type === "portal_pass") {
      nextPass = true;
      localStorage.setItem(`portalPass_${currentUser.uid}`, "true");
    } else if (type === "selection_pass") {
      if (!nextPacks.includes("all_selection_pass")) {
        nextPacks.push("all_selection_pass");
      }
      // Add all individual premium packs for total compatibility
      ["pack-upsc", "pack-mpsc", "pack-ssc", "pack-banking"].forEach(id => {
        if (!nextPacks.includes(id)) {
          nextPacks.push(id);
        }
      });
      localStorage.setItem(`unlockedPacks_${currentUser.uid}`, JSON.stringify(nextPacks));
    } else if (type === "exam_pack" && packId) {
      if (!nextPacks.includes(packId)) {
        nextPacks.push(packId);
      }
      localStorage.setItem(`unlockedPacks_${currentUser.uid}`, JSON.stringify(nextPacks));
    }
    
    // Update state instantly
    setHasPortalPass(nextPass);
    setUnlockedPacks(nextPacks);
    
    // Save to Firestore
    try {
      const docRef = doc(db, "user_purchases", currentUser.uid);
      await setDoc(docRef, {
        userId: currentUser.uid,
        hasPortalPass: nextPass,
        unlockedPacks: nextPacks
      });
      console.log("Purchases saved to Firestore successfully!");
    } catch (err) {
      console.error("Error saving purchases to Firestore:", err);
    }
  };

  // Limit checks (Free users can access the first 2 items of any category)
  const isPdfAccessible = (pdf: PaperPdf) => {
    if (hasPortalPass || unlockedPacks.includes("all_selection_pass") || unlockedPacks.includes("selection_pass")) return true;
    
    // Find all PDFs of the same category
    const categoryPdfs = paperPdfs.filter(p => p.category === pdf.category);
    // Find index of this PDF within that category
    const index = categoryPdfs.findIndex(p => p.id === pdf.id);
    
    // If index is less than 2, it's free
    return index < 2;
  };

  const isTestAccessible = (test: MockTest) => {
    if (hasPortalPass || unlockedPacks.includes("all_selection_pass") || unlockedPacks.includes("selection_pass")) return true;
    
    // Find all tests of the same category
    const categoryTests = mockTests.filter(t => t.category === test.category);
    // Find index of this test within that category
    const index = categoryTests.findIndex(t => t.id === test.id);
    
    // If index is less than 2, it's free
    return index < 2;
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter toggle for Job Alerts page ("all" vs "Government" vs "Private")
  const [jobCategoryFilter, setJobCategoryFilter] = useState<"all" | "Government" | "Private">("all");

  // Filter toggle for Upcoming Exams page
  const [examFilter, setExamFilter] = useState<
    "upcoming" | "all" | "UPSC" | "MPSC" | "Railway Exams" | "SSC Exams" | "Banking Exams" | "Defence Exams" | "Clerk Exams" | "State Exams" | "Private Exams"
  >("upcoming");

  // Filter toggle for Paper PDF page
  const [pdfFilter, setPdfFilter] = useState<
    "upcoming" | "all" | "UPSC" | "MPSC" | "Railway Exams" | "SSC Exams" | "Banking Exams" | "Defence Exams" | "Clerk Exams" | "State Exams" | "Private Exams"
  >("all");

  // Filter toggle for Mock Test page
  const [mockFilter, setMockFilter] = useState<
    "upcoming" | "all" | "UPSC" | "MPSC" | "Railway Exams" | "SSC Exams" | "Banking Exams" | "Defence Exams" | "Clerk Exams" | "State Exams" | "Private Exams"
  >("all");

  // Demo banner active slide state
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Interaction Modals
  const [activeExamModal, setActiveExamModal] = useState<ExamDetail | null>(null);
  const [activeJobModal, setActiveJobModal] = useState<JobAlert | null>(null);
  const [activePdfModal, setActivePdfModal] = useState<PaperPdf | null>(null);
  const [activeTestModal, setActiveTestModal] = useState<MockTest | null>(null);

  // Active PDF Viewer state
  const [pdfCurrentPage, setPdfCurrentPage] = useState(0);

  // Active Mock Test states
  const [testCurrentQuestion, setTestCurrentQuestion] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [testTimer, setTestTimer] = useState(600); // 10 minutes in seconds
  const [testScore, setTestScore] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // Start / Reset test timer
  useEffect(() => {
    let timerInterval: any;
    if (activeTestModal && !testSubmitted && testTimer > 0) {
      timerInterval = setInterval(() => {
        setTestTimer((prev) => prev - 1);
      }, 1000);
    } else if (testTimer === 0 && !testSubmitted) {
      handleSubmitTest();
    }
    return () => clearInterval(timerInterval);
  }, [activeTestModal, testTimer, testSubmitted]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTest = (test: MockTest) => {
    setActiveTestModal(test);
    setTestCurrentQuestion(0);
    setTestAnswers({});
    setTestCompleted(false);
    setTestTimer(test.durationMinutes * 60);
    setTestSubmitted(false);
    setTestScore(0);
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (testSubmitted) return;
    setTestAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeTestModal) return;
    
    let score = 0;
    activeTestModal.questions.forEach((q) => {
      if (testAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    
    setTestScore(score);
    setTestSubmitted(true);
    setTestCompleted(true);

    if (currentUser) {
      try {
        await addDoc(collection(db, "test_attempts"), {
          userId: currentUser.uid,
          testId: activeTestModal.id,
          testTitle: activeTestModal.title,
          score: score,
          totalQuestions: activeTestModal.questions.length,
          timestamp: Date.now()
        });
        console.log("Mock test saved to cloud successfully!");
      } catch (err) {
        console.error("Error saving mock test results:", err);
      }
    }
  };

  // Filter current content based on search query and filters
  const filteredJobs = jobAlerts.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.postName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (jobCategoryFilter === "all") return matchesSearch;
    return matchesSearch && job.category === jobCategoryFilter;
  });

  const filteredExams = upcomingExams.filter((exam) => {
    const matchesSearch = 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.eligibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (examFilter === "all") return matchesSearch;
    if (examFilter === "upcoming") return matchesSearch && exam.isUpcoming;
    return matchesSearch && exam.category === examFilter;
  });

  const filteredPdfs = paperPdfs.filter((pdf) => {
    const matchesSearch = 
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (pdfFilter === "all") return matchesSearch;
    if (pdfFilter === "upcoming") {
      const isUpcomingCategory = upcomingExams.some(exam => exam.category === pdf.category && exam.isUpcoming);
      return matchesSearch && isUpcomingCategory;
    }
    return matchesSearch && pdf.category === pdfFilter;
  });

  const filteredTests = mockTests.filter((test) => {
    const matchesSearch = 
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (mockFilter === "all") return matchesSearch;
    if (mockFilter === "upcoming") {
      const isUpcomingCategory = upcomingExams.some(exam => exam.category === test.category && exam.isUpcoming);
      return matchesSearch && isUpcomingCategory;
    }
    return matchesSearch && test.category === mockFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root">
      {/* GLOBAL HEADER */}
      <header className="bg-white border-b border-gray-200 relative z-40 shadow-sm" id="global-header">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          
          {/* Left: Logo & Stacked Text */}
          <div className="flex items-center gap-3 cursor-pointer" id="header-logo-container" onClick={() => setCurrentPage("jobs")}>
            <AppLogo 
              className="h-20 md:h-28 lg:h-32 w-auto object-contain transition-all"
              id="header-logo-img"
            />
            <div className="flex flex-col text-left" id="header-title-text">
              <span className="text-lg md:text-xl font-extrabold text-[#004aad] tracking-tight leading-tight uppercase font-sans">
                Government Exams
              </span>
              <span className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-widest leading-none">
                MockTest Portal
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-base font-semibold" id="header-nav">
            <button
              id="nav-link-jobs"
              onClick={() => { setCurrentPage("jobs"); setSearchQuery(""); }}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === "jobs" 
                  ? "text-[#004aad] font-bold border-b-2 border-[#004aad]" 
                  : "text-gray-600 hover:text-[#004aad]"
              }`}
            >
              Job Alerts
            </button>
            <button
              id="nav-link-exams"
              onClick={() => { setCurrentPage("exams"); setSearchQuery(""); }}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === "exams" 
                  ? "text-[#004aad] font-bold border-b-2 border-[#004aad]" 
                  : "text-gray-600 hover:text-[#004aad]"
              }`}
            >
              Upcoming Exams
            </button>
            <button
              id="nav-link-mock"
              onClick={() => { setCurrentPage("mock"); setSearchQuery(""); }}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === "mock" 
                  ? "text-[#004aad] font-bold border-b-2 border-[#004aad]" 
                  : "text-gray-600 hover:text-[#004aad]"
              }`}
            >
              Mock Test
            </button>
            <button
              id="nav-link-pdf"
              onClick={() => { setCurrentPage("pdf"); setSearchQuery(""); }}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === "pdf" 
                  ? "text-[#004aad] font-bold border-b-2 border-[#004aad]" 
                  : "text-gray-600 hover:text-[#004aad]"
              }`}
            >
              Paper PDF
            </button>
            <button
              id="nav-link-selection"
              onClick={() => { setCurrentPage("selection"); setSearchQuery(""); }}
              className={`transition-all py-2 cursor-pointer flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-transparent bg-clip-text hover:brightness-110 font-black border-b-2 ${
                currentPage === "selection" 
                  ? "border-amber-500" 
                  : "border-transparent"
              }`}
            >
              <Star size={16} className="text-amber-500 animate-pulse fill-amber-400" />
              Get Selection
            </button>
          </nav>

          {/* Right: User profile / Sign In */}
          <div className="flex items-center gap-4" id="header-right-container">
            {currentUser && hasPortalPass && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30 text-amber-600 rounded-full text-xs font-black tracking-wider uppercase animate-pulse">
                <Sparkles size={12} className="fill-amber-400 text-amber-500" />
                <span>Premium Pass Active</span>
              </div>
            )}
            
            {currentUser ? (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-slate-50 hover:bg-slate-100 hover:border-gray-300 transition-all cursor-pointer"
                id="header-profile-btn"
                title="My Profile"
              >
                <div className="w-7 h-7 rounded-full bg-[#004aad] text-white flex items-center justify-center font-bold text-sm uppercase">
                  {currentUser.displayName ? currentUser.displayName[0] : currentUser.email ? currentUser.email[0] : "?"}
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-700 max-w-[100px] truncate hidden sm:inline">
                  {currentUser.displayName || "Aspirant"}
                </span>
              </button>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004aad] text-white text-xs md:text-sm font-bold shadow-sm hover:bg-[#003d91] transition-all cursor-pointer"
                id="header-signin-btn"
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden bg-slate-50 border-t border-gray-100 justify-around py-3 font-semibold text-xs sm:text-sm">
          <button
            id="mobile-nav-jobs"
            onClick={() => { setCurrentPage("jobs"); setSearchQuery(""); }}
            className={`px-2 py-1 rounded-md transition-colors ${
              currentPage === "jobs" ? "bg-[#004aad] text-white font-bold" : "text-gray-600"
            }`}
          >
            Jobs
          </button>
          <button
            id="mobile-nav-exams"
            onClick={() => { setCurrentPage("exams"); setSearchQuery(""); }}
            className={`px-2 py-1 rounded-md transition-colors ${
              currentPage === "exams" ? "bg-[#004aad] text-white font-bold" : "text-gray-600"
            }`}
          >
            Exams
          </button>
          <button
            id="mobile-nav-mock"
            onClick={() => { setCurrentPage("mock"); setSearchQuery(""); }}
            className={`px-2 py-1 rounded-md transition-colors ${
              currentPage === "mock" ? "bg-[#004aad] text-white font-bold" : "text-gray-600"
            }`}
          >
            Mocks
          </button>
          <button
            id="mobile-nav-pdf"
            onClick={() => { setCurrentPage("pdf"); setSearchQuery(""); }}
            className={`px-2 py-1 rounded-md transition-colors ${
              currentPage === "pdf" ? "bg-[#004aad] text-white font-bold" : "text-gray-600"
            }`}
          >
            PDFs
          </button>
          <button
            id="mobile-nav-selection"
            onClick={() => { setCurrentPage("selection"); setSearchQuery(""); }}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-0.5 font-bold ${
              currentPage === "selection" 
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white" 
                : "text-amber-600 hover:bg-amber-50"
            }`}
          >
            <Star size={11} className="fill-current" />
            Selection
          </button>
        </div>
      </header>

      {/* MAIN BODY WRAPPER */}
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6" id="main-content-wrapper">
        
        {/* PAGE 1: JOB ALERTS ONLY - BLANK DEMO BANNERS */}
        {currentPage === "jobs" && (
          <div className="w-full relative group" id="home-demo-banners-wrapper">
            <div 
              className="w-full bg-white border-2 border-[#004aad] rounded-lg p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm relative overflow-hidden min-h-[180px] md:min-h-[220px] transition-all hover:shadow-md"
              id="home-demo-banner-container"
            >
              {/* Subtle tech grid / blueprint background for 'blank/demo' aesthetic */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#004aad08_1px,transparent_1px),linear-gradient(to_bottom,#004aad08_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
              
              <div className="flex flex-col text-left relative z-10 max-w-xl">
                {/* Dynamic Sliding Text content */}
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase font-sans">
                  {activeBannerIndex === 0 && "Active Government & Private Job Alerts 2026"}
                  {activeBannerIndex === 1 && "Authentic PYQs & Solution Key PDF Vault"}
                  {activeBannerIndex === 2 && "Free Live Exam Simulators & Daily Streaks"}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 max-w-lg leading-relaxed">
                  {activeBannerIndex === 0 && "Explore immediate recruitment announcements from top boards including MPSC, UPSC, SSC, and premium private companies like TCS and Infosys."}
                  {activeBannerIndex === 1 && "Study high-resolution official reference answer booklets, exam-oriented notes, and syllabus breakdowns curated for top scoring."}
                  {activeBannerIndex === 2 && "Take free test drives anytime, practice without boundaries, track your historic accuracy levels and secure success."}
                </p>
                
                <div className="flex gap-2.5 mt-4">
                  <button 
                    onClick={() => {
                      if (activeBannerIndex === 0) setJobCategoryFilter("all");
                      if (activeBannerIndex === 1) setCurrentPage("pdf");
                      if (activeBannerIndex === 2) setCurrentPage("mock");
                    }}
                    className="bg-[#004aad] hover:bg-[#004aad]/90 text-white font-bold text-xs px-5 py-2.5 rounded shadow-sm transition-all uppercase tracking-wider cursor-pointer"
                  >
                    {activeBannerIndex === 0 && "View Job Alerts"}
                    {activeBannerIndex === 1 && "Read PDFs"}
                    {activeBannerIndex === 2 && "Launch Simulator"}
                  </button>
                </div>
              </div>

              {/* Right decorative visual box illustrating professional academic prep */}
              <div className="hidden md:flex flex-col items-center justify-center border border-[#004aad]/20 w-56 h-36 rounded-md bg-gradient-to-br from-[#004aad]/5 to-[#004aad]/15 relative z-10 shrink-0">
                {activeBannerIndex === 0 && (
                  <>
                    <GraduationCap className="w-10 h-10 text-[#004aad] mb-2 animate-pulse" />
                    <span className="font-sans text-[11px] text-[#004aad] font-extrabold uppercase tracking-widest">
                      CIVIL SERVICES
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      MPSC & UPSC PREP
                    </span>
                  </>
                )}
                {activeBannerIndex === 1 && (
                  <>
                    <BookOpen className="w-10 h-10 text-[#004aad] mb-2 animate-pulse" />
                    <span className="font-sans text-[11px] text-[#004aad] font-extrabold uppercase tracking-widest">
                      OFFICIAL PYQS
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      SOLUTIONS KEY PDF
                    </span>
                  </>
                )}
                {activeBannerIndex === 2 && (
                  <>
                    <Award className="w-10 h-10 text-[#004aad] mb-2 animate-pulse" />
                    <span className="font-sans text-[11px] text-[#004aad] font-extrabold uppercase tracking-widest">
                      EXAM SIMULATOR
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      DAILY STREAK ACTIVE
                    </span>
                  </>
                )}
              </div>

              {/* Slider Controls */}
              {/* Left Arrow */}
              <button 
                onClick={() => setActiveBannerIndex((prev) => (prev === 0 ? 2 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-[#004aad] hover:border-[#004aad] hover:shadow-md transition-all"
                title="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Right Arrow */}
              <button 
                onClick={() => setActiveBannerIndex((prev) => (prev === 2 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-600 hover:text-[#004aad] hover:border-[#004aad] hover:shadow-md transition-all"
                title="Next Slide"
              >
                <ChevronRight size={18} />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeBannerIndex ? "bg-[#004aad] w-4" : "bg-slate-300 hover:bg-slate-400"
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEARCH BAR (All pages) */}
        <div className="w-full" id="search-bar-container">
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#004aad] w-5 h-5 pointer-events-none" />
            <input
              type="text"
              id="search-input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentPage === "jobs" 
                  ? "Search Job Alerts..." 
                  : currentPage === "exams" 
                  ? "Search Exams..." 
                  : currentPage === "mock" 
                  ? "Search Mock Tests..." 
                  : "Search Paper PDFs..."
              }
              className="w-full h-12 md:h-14 pl-12 pr-6 border-2 border-[#004aad] rounded-full text-center text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 transition-all text-[#004aad] placeholder-[#004aad]/60 font-semibold uppercase tracking-wider"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-bold bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-all"
                title="Clear Search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* PAGE 1: JOB ALERTS ONLY - CATEGORY TOGGLES */}
        {currentPage === "jobs" && (
          <div className="flex justify-center gap-3 md:gap-4 py-2" id="job-filter-toggles">
            <button
              id="toggle-job-all"
              onClick={() => setJobCategoryFilter("all")}
              className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                jobCategoryFilter === "all"
                  ? "bg-[#004aad] text-white scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Briefcase size={14} />
              All Jobs
            </button>
            <button
              id="toggle-job-gov"
              onClick={() => setJobCategoryFilter("Government")}
              className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                jobCategoryFilter === "Government"
                  ? "bg-amber-600 text-white scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Building size={14} />
              Govt Jobs
            </button>
            <button
              id="toggle-job-private"
              onClick={() => setJobCategoryFilter("Private")}
              className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                jobCategoryFilter === "Private"
                  ? "bg-indigo-600 text-white scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Users size={14} />
              Private Jobs
            </button>
          </div>
        )}

        {/* PAGE 2: UPCOMING EXAMS ONLY - FILTER TOGGLES */}
        {currentPage === "exams" && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-4 px-4 bg-slate-100/50 rounded-xl border border-slate-200/60 max-w-5xl mx-auto w-full shadow-xs mb-4" id="exams-filter-toggles">
            {[
              { id: "upcoming", label: "Upcoming Exams" },
              { id: "all", label: "All Exams" },
              { id: "UPSC", label: "UPSC" },
              { id: "MPSC", label: "MPSC" },
              { id: "Railway Exams", label: "Railway Exams" },
              { id: "SSC Exams", label: "SSC Exams" },
              { id: "Banking Exams", label: "Banking Exams" },
              { id: "Defence Exams", label: "Defence Exams" },
              { id: "Clerk Exams", label: "Clerk Exams" },
              { id: "State Exams", label: "State Exams" },
              { id: "Private Exams", label: "Private Exams" }
            ].map((categoryItem) => (
              <button
                key={categoryItem.id}
                id={`toggle-exam-${categoryItem.id.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setExamFilter(categoryItem.id as any)}
                className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xs cursor-pointer ${
                  examFilter === categoryItem.id
                    ? "bg-[#004aad] text-white ring-2 ring-[#004aad]/20 scale-105"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-[#004aad] hover:border-[#004aad]/30"
                }`}
              >
                {categoryItem.label}
              </button>
            ))}
          </div>
        )}

        {/* PAGE 3: PAPER PDF - FILTER TOGGLES */}
        {currentPage === "pdf" && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-4 px-4 bg-slate-100/50 rounded-xl border border-slate-200/60 max-w-5xl mx-auto w-full shadow-xs mb-4" id="pdf-filter-toggles">
            {[
              { id: "upcoming", label: "Upcoming Exams" },
              { id: "all", label: "All Exams" },
              { id: "UPSC", label: "UPSC" },
              { id: "MPSC", label: "MPSC" },
              { id: "Railway Exams", label: "Railway Exams" },
              { id: "SSC Exams", label: "SSC Exams" },
              { id: "Banking Exams", label: "Banking Exams" },
              { id: "Defence Exams", label: "Defence Exams" },
              { id: "Clerk Exams", label: "Clerk Exams" },
              { id: "State Exams", label: "State Exams" },
              { id: "Private Exams", label: "Private Exams" }
            ].map((categoryItem) => (
              <button
                key={categoryItem.id}
                id={`toggle-pdf-${categoryItem.id.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setPdfFilter(categoryItem.id as any)}
                className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xs cursor-pointer ${
                  pdfFilter === categoryItem.id
                    ? "bg-[#004aad] text-white ring-2 ring-[#004aad]/20 scale-105"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-[#004aad] hover:border-[#004aad]/30"
                }`}
              >
                {categoryItem.label}
              </button>
            ))}
          </div>
        )}

        {/* PAGE 4: MOCK TEST - FILTER TOGGLES */}
        {currentPage === "mock" && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-4 px-4 bg-slate-100/50 rounded-xl border border-slate-200/60 max-w-5xl mx-auto w-full shadow-xs mb-4" id="mock-filter-toggles">
            {[
              { id: "upcoming", label: "Upcoming Exams" },
              { id: "all", label: "All Exams" },
              { id: "UPSC", label: "UPSC" },
              { id: "MPSC", label: "MPSC" },
              { id: "Railway Exams", label: "Railway Exams" },
              { id: "SSC Exams", label: "SSC Exams" },
              { id: "Banking Exams", label: "Banking Exams" },
              { id: "Defence Exams", label: "Defence Exams" },
              { id: "Clerk Exams", label: "Clerk Exams" },
              { id: "State Exams", label: "State Exams" },
              { id: "Private Exams", label: "Private Exams" }
            ].map((categoryItem) => (
              <button
                key={categoryItem.id}
                id={`toggle-mock-${categoryItem.id.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setMockFilter(categoryItem.id as any)}
                className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xs cursor-pointer ${
                  mockFilter === categoryItem.id
                    ? "bg-[#004aad] text-white ring-2 ring-[#004aad]/20 scale-105"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-[#004aad] hover:border-[#004aad]/30"
                }`}
              >
                {categoryItem.label}
              </button>
            ))}
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex flex-col w-full" id="portal-content-area">
          
          {/* Aligned left tab heading & Thick blue line */}
          <div className="flex flex-col items-start" id="tab-heading-block">
            <div 
              className="bg-[#004aad] text-white px-6 py-3 font-bold uppercase tracking-wider text-sm md:text-base rounded-t-md"
              id="active-tab-indicator"
            >
              {currentPage === "jobs" 
                ? `${jobCategoryFilter === "all" ? "All" : jobCategoryFilter} Job Alerts` 
                : currentPage === "exams" 
                ? `${examFilter === "upcoming" ? "Upcoming" : examFilter === "all" ? "All" : examFilter} Exams` 
                : currentPage === "pdf" 
                ? `${pdfFilter === "upcoming" ? "Upcoming" : pdfFilter === "all" ? "All" : pdfFilter} PYQ PDFs` 
                : `${mockFilter === "upcoming" ? "Upcoming" : mockFilter === "all" ? "All" : mockFilter} Mock Tests`}
            </div>
            {/* Thick blue line spanning full width */}
            <div className="w-full h-1 bg-[#004aad]" id="thick-blue-divider-line" />
          </div>

          {/* Cards Stack Container */}
          <div className="flex flex-col gap-4 mt-6" id="cards-stack-container">
            {/* INTERACTIVE LIVE VIEW: Rich academic exam items */}
            {currentPage === "jobs" ? (
              // Job alerts list
              filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    id={`job-card-${job.id}`}
                    className="w-full bg-white border border-[#004aad] rounded-lg shadow-sm hover:shadow-md hover:border-2 transition-all p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group"
                    onClick={() => setActiveJobModal(job)}
                  >
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className={`font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full tracking-wider uppercase border ${
                          job.category === "Government"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        }`}>
                          {job.category}
                        </span>
                        <span className="font-mono text-xs text-slate-500 font-bold tracking-wider">
                          {job.organization}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-[#004aad] transition-colors leading-snug">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} className="text-[#004aad]" />
                          {job.postName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-[#004aad]" />
                          {job.vacancies}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} className="text-[#004aad]" />
                          {job.qualification}
                        </span>
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <Clock size={12} />
                          Last Date: {job.lastDate}
                        </span>
                      </div>
                    </div>
                    <button className="self-end md:self-auto bg-[#004aad]/10 text-[#004aad] group-hover:bg-[#004aad] group-hover:text-white px-5 py-2 rounded-lg font-bold text-xs md:text-sm tracking-wide transition-all flex items-center gap-2">
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-[#004aad]/20 rounded-lg">
                  <p className="text-slate-500 font-medium">No job alerts matched your search.</p>
                  <button onClick={() => setSearchQuery("")} className="mt-2 text-[#004aad] font-bold underline">Clear filter</button>
                </div>
              )
            ) : currentPage === "exams" ? (
              // Upcoming exams list
              filteredExams.length > 0 ? (
                filteredExams.map((exam, index) => (
                  <div
                    key={exam.id}
                    id={`exam-card-${exam.id}`}
                    className="w-full bg-white border border-[#004aad] rounded-lg shadow-sm hover:shadow-md hover:border-2 transition-all p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group"
                    onClick={() => setActiveExamModal(exam)}
                  >
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        {exam.isUpcoming && (
                          <span className="bg-red-50 text-red-600 font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full tracking-wider uppercase border border-red-100">
                            Upcoming
                          </span>
                        )}
                        <span className="bg-blue-50 text-[#004aad] font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full tracking-wider uppercase border border-blue-100">
                          {exam.category}
                        </span>
                        <span className="font-mono text-xs text-slate-500 font-bold tracking-wider">
                          {exam.code}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-[#004aad] transition-colors leading-snug">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock size={14} className="text-[#004aad]" />
                        Exam Date: <strong className="text-slate-700">{exam.date}</strong>
                      </p>
                    </div>
                    <button className="self-end md:self-auto bg-[#004aad]/10 text-[#004aad] group-hover:bg-[#004aad] group-hover:text-white px-5 py-2 rounded-lg font-bold text-xs md:text-sm tracking-wide transition-all flex items-center gap-2">
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-[#004aad]/20 rounded-lg">
                  <p className="text-slate-500 font-medium">No exams matched your search or category selection.</p>
                  <button onClick={() => { setSearchQuery(""); setExamFilter("all"); }} className="mt-2 text-[#004aad] font-bold underline cursor-pointer">Reset search & filters</button>
                </div>
              )
            ) : currentPage === "pdf" ? (
              // Paper PDF previous year papers
              filteredPdfs.length > 0 ? (
                filteredPdfs.map((pdf) => {
                  // Check if this PDF is a restricted item (index >= 2 in its category)
                  const categoryPdfs = paperPdfs.filter(p => p.category === pdf.category);
                  const pdfIndexInCategory = categoryPdfs.findIndex(p => p.id === pdf.id);
                  const isPremiumPdf = pdfIndexInCategory >= 2;
                  const accessible = hasPortalPass || !isPremiumPdf;

                  return (
                    <div
                      key={pdf.id}
                      id={`pdf-card-${pdf.id}`}
                      className={`w-full bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-2 transition-all p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group ${
                        accessible ? "border-[#004aad]" : "border-slate-300 bg-slate-50/50"
                      }`}
                      onClick={() => {
                        if (!accessible) {
                          if (!currentUser) {
                            setAuthModalOpen(true);
                          } else {
                            setPaymentType("portal_pass");
                            setPaymentTargetPack(null);
                            setPaymentAmount(50);
                            setPaymentSuccess(false);
                            setPaymentPending(false);
                            setPaymentModalOpen(true);
                          }
                        } else {
                          setActivePdfModal(pdf);
                          setPdfCurrentPage(0);
                        }
                      }}
                    >
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <span className="bg-blue-50 text-[#004aad] font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full tracking-wider uppercase border border-blue-100">
                            {pdf.category}
                          </span>
                          <span className="bg-[#004aad]/10 text-[#004aad] font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase">
                            {pdf.subject}
                          </span>
                          <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase border border-emerald-100">
                            Year {pdf.year}
                          </span>
                          <span className="font-mono text-xs text-slate-400 font-medium mr-1">
                            {pdf.fileSize}
                          </span>
                          
                          {/* Access Badges */}
                          {isPremiumPdf ? (
                            accessible ? (
                              <span className="bg-emerald-50 text-emerald-600 font-extrabold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase border border-emerald-200 flex items-center gap-1 animate-pulse">
                                <Unlock size={10} className="fill-current text-emerald-500" /> Pass Unlocked
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 font-extrabold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase border border-amber-200 flex items-center gap-1">
                                <Lock size={10} className="text-amber-500" /> Pass Premium
                              </span>
                            )
                          ) : (
                            <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase border border-slate-200 flex items-center gap-1">
                              Free Sample
                            </span>
                          )}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-[#004aad] transition-colors leading-snug">
                          {pdf.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <FileText size={14} className="text-[#004aad]" />
                          Includes {pdf.questionsCount} authentic previous year questions
                        </p>
                      </div>
                      <div className="self-end md:self-auto flex items-center gap-2">
                        <button className="bg-[#004aad]/10 text-[#004aad] group-hover:bg-[#004aad] group-hover:text-white px-5 py-2 rounded-lg font-bold text-xs md:text-sm tracking-wide transition-all flex items-center gap-2">
                          {accessible ? "Read Document" : "Unlock Document"} <BookOpen size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white border border-[#004aad]/20 rounded-lg">
                  <p className="text-slate-500 font-medium">No question paper PDFs matched your search or category selection.</p>
                  <button onClick={() => { setSearchQuery(""); setPdfFilter("all"); }} className="mt-2 text-[#004aad] font-bold underline cursor-pointer">Reset search & filters</button>
                </div>
              )
            ) : currentPage === "mock" ? (
              // Mock test list
              filteredTests.length > 0 ? (
                filteredTests.map((test) => {
                  // Check if this Test is a restricted item (index >= 2 in its category)
                  const categoryTests = mockTests.filter(t => t.category === test.category);
                  const testIndexInCategory = categoryTests.findIndex(t => t.id === test.id);
                  const isPremiumTest = testIndexInCategory >= 2;
                  const accessible = hasPortalPass || !isPremiumTest;

                  return (
                    <div
                      key={test.id}
                      id={`test-card-${test.id}`}
                      className={`w-full bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-2 transition-all p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group ${
                        accessible ? "border-[#004aad]" : "border-slate-300 bg-slate-50/50"
                      }`}
                      onClick={() => {
                        if (!accessible) {
                          if (!currentUser) {
                            setAuthModalOpen(true);
                          } else {
                            setPaymentType("portal_pass");
                            setPaymentTargetPack(null);
                            setPaymentAmount(50);
                            setPaymentSuccess(false);
                            setPaymentPending(false);
                            setPaymentModalOpen(true);
                          }
                        } else {
                          handleStartTest(test);
                        }
                      }}
                    >
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <span className="bg-blue-50 text-[#004aad] font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full tracking-wider uppercase border border-blue-100">
                            {test.category}
                          </span>
                          <span className="bg-slate-100 text-slate-700 font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={12} /> {test.durationMinutes} Mins
                          </span>

                          {/* Access Badges */}
                          {isPremiumTest ? (
                            accessible ? (
                              <span className="bg-emerald-50 text-emerald-600 font-extrabold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase border border-emerald-200 flex items-center gap-1 animate-pulse">
                                <Unlock size={10} className="fill-current text-emerald-500" /> Pass Unlocked
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 font-extrabold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase border border-amber-200 flex items-center gap-1">
                                <Lock size={10} className="text-amber-500" /> Pass Premium
                              </span>
                            )
                          ) : (
                            <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full uppercase border border-slate-200 flex items-center gap-1">
                              Free Simulator
                            </span>
                          )}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-[#004aad] transition-colors leading-snug">
                          {test.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Trophy size={14} className="text-[#004aad]" />
                          Contains {test.questions.length} real pattern multiple-choice questions
                        </p>
                      </div>
                      <button className="self-end md:self-auto bg-[#004aad] text-white hover:bg-[#004aad]/90 px-6 py-2.5 rounded-lg font-bold text-xs md:text-sm tracking-wide transition-all flex items-center gap-1.5 shadow-sm">
                        {accessible ? "Start Free Mock" : "Unlock Mock Test"} <PlayIcon />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white border border-[#004aad]/20 rounded-lg">
                  <p className="text-slate-500 font-medium">No mock tests matched your search or category selection.</p>
                  <button onClick={() => { setSearchQuery(""); setMockFilter("all"); }} className="mt-2 text-[#004aad] font-bold underline cursor-pointer">Reset search & filters</button>
                </div>
              )
            ) : (
              // GET SELECTION - GOLDEN OBSIDIAN PREMIUM PORTAL
              <div className="w-full bg-[#0d121f] text-slate-100 rounded-2xl border border-amber-500/20 shadow-2xl p-6 md:p-10 relative overflow-hidden flex flex-col gap-8 text-left" id="get-selection-premium-page">
                {/* Visual glow backdrop elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header Title Hero */}
                <div className="border-b border-amber-500/20 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="selection-hero-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30 text-amber-400 font-extrabold text-[10px] md:text-xs px-3.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-400 animate-pulse fill-amber-400" />
                        Premium success hub
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase font-sans tracking-tight">
                      GET SELECTION <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-transparent bg-clip-text">PREMIUM PORTAL</span>
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed max-w-2xl font-medium">
                      One-time subscription of ₹80/month unlocks ALL premium mock tests, CSAT/GS speed simulators, trend-mapped answer booklets, and current affairs keys.
                    </p>
                  </div>

                  {/* Golden Guarantee Badge */}
                  <div className="bg-gradient-to-br from-slate-900 to-[#111827] border border-amber-500/40 rounded-2xl p-5 flex items-center gap-4 shadow-xl max-w-sm shrink-0 self-stretch md:self-auto" id="golden-guarantee-badge">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                      ₹
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-amber-400 tracking-wider">All-Access Model</p>
                      <h4 className="text-lg font-black text-white">₹80 Monthly Fee</h4>
                      <p className="text-[10px] text-slate-400 leading-tight">A single fee of ₹80 monthly unlocks all premium mock tests and cracker resources on this page.</p>
                    </div>
                  </div>
                </div>

                {/* Central Premium Subscription Banner */}
                {!(unlockedPacks.includes("all_selection_pass") || unlockedPacks.includes("selection_pass")) ? (
                  <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border-2 border-amber-400/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden" id="central-subscription-banner">
                    {/* Background glow effects */}
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-start gap-4 text-left">
                      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                        <Sparkles size={28} className="animate-pulse text-amber-400 fill-amber-400/20" />
                      </div>
                      <div>
                        <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">BEST VALUE</span>
                        <h3 className="text-xl md:text-2xl font-black text-white mt-1 leading-tight uppercase">MaziExam Premium All-Access Pass</h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                          Subscribe once and immediately unlock all current and future premium packs listed below. Instant access to speed runs, PYQ answer keys, and target current affairs.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
                      <div className="text-center md:text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Monthly Subscription</p>
                        <div className="flex items-baseline justify-center md:justify-end gap-1 mt-0.5">
                          <span className="text-3xl font-black text-white font-mono">₹80</span>
                          <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium">Cancel subscription anytime</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            setAuthModalOpen(true);
                          } else {
                            setPaymentType("selection_pass");
                            setPaymentTargetPack(null);
                            setPaymentAmount(80);
                            setPaymentSuccess(false);
                            setPaymentPending(false);
                            setPaymentModalOpen(true);
                          }
                        }}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black tracking-wider uppercase text-xs shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        id="buy-premium-pass-cta"
                      >
                        <CreditCard size={16} />
                        Get All-Access Pass
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-left shadow-lg" id="unlocked-subscription-banner">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 animate-pulse">
                        <CheckCircle2 size={20} className="fill-emerald-500/10" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-emerald-400 uppercase tracking-tight">🏆 All-Access Subscription is ACTIVE!</h4>
                        <p className="text-xs text-slate-300 leading-normal">
                          You have premium access to every exam pack, speed run, and expert-written key.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 shrink-0">
                      Auto-Renewal: ₹80/mo (sandbox)
                    </span>
                  </div>
                )}

                {/* Core Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="premium-crackers-grid">
                  {premiumPacks.map((pack) => {
                    const isUnlocked = unlockedPacks.includes("all_selection_pass") || unlockedPacks.includes("selection_pass") || unlockedPacks.includes(pack.id);
                    return (
                      <div
                        key={pack.id}
                        id={`premium-pack-card-${pack.id}`}
                        className={`bg-gradient-to-br from-slate-900/95 to-slate-950/98 border ${
                          pack.highlight ? "border-amber-400/40 shadow-amber-500/5 ring-1 ring-amber-400/20" : "border-slate-800"
                        } rounded-xl p-6 hover:border-amber-400/60 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between relative group shadow-lg`}
                      >
                        {/* Shimmer overlay for highlighted */}
                        {pack.highlight && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                        )}

                        <div>
                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/20 text-amber-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                              {pack.category} Cracker
                            </span>
                            <span className="bg-slate-950 text-slate-400 font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-slate-800">
                              Target Exam: {pack.examCode}
                            </span>
                            {isUnlocked ? (
                              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Unlock size={10} className="fill-current" /> Active & Unlocked
                              </span>
                            ) : (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Lock size={10} /> Locked
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-400 transition-colors">
                            {pack.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-medium">
                            {pack.description}
                          </p>

                          {/* Stats Indicator */}
                          <div className="grid grid-cols-2 gap-3 mt-4 py-3 border-y border-slate-800/60 text-xs">
                            <div className="text-left">
                              <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Premium Mocks</p>
                              <p className="text-sm font-black text-slate-200 mt-0.5">{pack.mockCount} Solved Papers</p>
                            </div>
                            <div className="text-left">
                              <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Curated PDFs</p>
                              <p className="text-sm font-black text-slate-200 mt-0.5">{pack.pdfCount} Curated Files</p>
                            </div>
                          </div>

                          {/* Bullet Points */}
                          <ul className="mt-4 space-y-2 text-left">
                            {pack.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                                <span className="text-amber-400 font-bold mt-0.5">★</span>
                                <span className="font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Simplified card footer - No redundant price blocks on every card */}
                        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            {isUnlocked ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                                <Unlock size={12} className="fill-emerald-400/10" /> Included
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                                <Lock size={12} /> Needs Pass
                              </span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (!currentUser) {
                                setAuthModalOpen(true);
                              } else if (isUnlocked) {
                                setUnlockedDetailsModal(pack);
                              } else {
                                setPaymentType("selection_pass");
                                setPaymentTargetPack(null);
                                setPaymentAmount(80);
                                setPaymentSuccess(false);
                                setPaymentPending(false);
                                setPaymentModalOpen(true);
                              }
                            }}
                            className={`px-5 py-2.5 rounded-lg font-black text-xs tracking-wider uppercase transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer ${
                              isUnlocked
                                ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
                                : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110"
                            }`}
                          >
                            {isUnlocked ? (
                              <>
                                <Unlock size={12} className="fill-current" />
                                Study Now
                              </>
                            ) : (
                              <>
                                <CreditCard size={12} />
                                Unlock Pass
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Callout Info Section */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-start gap-4 text-left" id="selection-callout-panel">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Aspirant Selection Oath</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Our special targets are strictly structured to remove clutter. No useless videos, no endless forums. Only top-tier, high-probability pattern simulators and precise answer booklets written by selected civil service officers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* INTERACTIVE MODAL 1: EXAM DETAIL MODAL */}
      {activeExamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="exam-detail-modal-overlay">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200" id="exam-detail-modal">
            <div className="bg-[#004aad] text-white p-5 sticky top-0 flex justify-between items-center z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Exam Briefing
                </span>
                <h3 className="text-lg font-extrabold mt-1">{activeExamModal.title}</h3>
              </div>
              <button 
                onClick={() => setActiveExamModal(null)} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors font-bold"
                id="close-exam-modal"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5 text-left text-sm md:text-base">
              <div>
                <h4 className="font-bold text-xs text-[#004aad] uppercase tracking-wider mb-1">Official Code</h4>
                <p className="font-mono bg-slate-100 px-3 py-1.5 rounded-md text-slate-800 font-bold inline-block text-xs">
                  {activeExamModal.code}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#004aad] uppercase tracking-wider mb-1">Target Exam Date</h4>
                <p className="font-semibold text-slate-800 flex items-center gap-2">
                  <Clock size={16} className="text-[#004aad]" />
                  {activeExamModal.date}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#004aad] uppercase tracking-wider mb-1">Academic Eligibility</h4>
                <p className="text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-[#004aad]/10">
                  {activeExamModal.eligibility}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#004aad] uppercase tracking-wider mb-2">Core Syllabus Topics</h4>
                <ul className="flex flex-col gap-2">
                  {activeExamModal.syllabus.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-[#004aad] font-bold mt-0.5">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-2 flex justify-between gap-4">
                <a
                  href={activeExamModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow text-center border-2 border-[#004aad] text-[#004aad] hover:bg-blue-50 font-bold py-2.5 rounded-lg transition-all text-xs md:text-sm flex items-center justify-center gap-1.5"
                  id="link-official-site"
                >
                  Official Portal <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => {
                    setActiveExamModal(null);
                    // Open relevant Mock Test if matches
                    const matchingTest = mockTests.find(t => t.title.toLowerCase().includes(activeExamModal.title.substring(0, 5).toLowerCase()));
                    if (matchingTest) {
                      handleStartTest(matchingTest);
                    } else {
                      setCurrentPage("mock");
                    }
                  }}
                  className="flex-grow text-center bg-[#004aad] hover:bg-[#004aad]/90 text-white font-bold py-2.5 rounded-lg transition-all text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-sm"
                  id="btn-start-matching-mock"
                >
                  Attempt Mock Test <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE MODAL: JOB ALERTS DETAIL MODAL */}
      {activeJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="job-detail-modal-overlay">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200" id="job-detail-modal">
            <div className={`p-5 sticky top-0 flex justify-between items-center z-10 text-white ${
              activeJobModal.category === "Government" ? "bg-amber-600" : "bg-indigo-600"
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  {activeJobModal.category} Job Alert
                </span>
                <h3 className="text-lg font-extrabold mt-1">{activeJobModal.title}</h3>
              </div>
              <button 
                onClick={() => setActiveJobModal(null)} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors font-bold cursor-pointer"
                id="close-job-modal"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5 text-left text-sm md:text-base">
              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Recruiter</h4>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5">{activeJobModal.organization}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Post Name</h4>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5">{activeJobModal.postName}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Total Vacancies</h4>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5">{activeJobModal.vacancies}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Scale of Pay</h4>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                    <DollarSign size={12} className="text-slate-400" />
                    {activeJobModal.salary}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Required Qualification</h4>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5">{activeJobModal.qualification}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Last Date to Apply</h4>
                  <p className="font-bold text-red-600 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                    <Clock size={12} />
                    {activeJobModal.lastDate}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#004aad] uppercase tracking-wider mb-1.5">Job Overview</h4>
                <p className="text-slate-700 leading-relaxed bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                  {activeJobModal.details}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#004aad] uppercase tracking-wider mb-1.5">Eligibility & Requirements</h4>
                <div className="text-slate-700 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p>• <strong>Age Limit:</strong> 18 - 38 years (relaxation applicable for category students).</p>
                  <p>• <strong>Education:</strong> Must possess relevant degrees corresponding to {activeJobModal.qualification}.</p>
                  <p>• <strong>Experience:</strong> Freshers are eligible unless mentioned in the notification briefing.</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-2 flex flex-col sm:flex-row justify-between gap-3">
                <a
                  href={activeJobModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow text-center border-2 border-[#004aad] text-[#004aad] hover:bg-blue-50 font-bold py-2.5 rounded-lg transition-all text-xs md:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  id="job-link-official-site"
                >
                  Apply Online <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => {
                    setActiveJobModal(null);
                    // Match a relevant Mock Test or go to Mock Test page
                    const matchingTest = mockTests.find(t => 
                      t.title.toLowerCase().includes(activeJobModal.organization.toLowerCase()) ||
                      t.title.toLowerCase().includes(activeJobModal.title.substring(0, 5).toLowerCase())
                    );
                    if (matchingTest) {
                      handleStartTest(matchingTest);
                    } else {
                      setCurrentPage("mock");
                    }
                  }}
                  className="flex-grow text-center bg-[#004aad] hover:bg-[#004aad]/90 text-white font-bold py-2.5 rounded-lg transition-all text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  id="job-btn-prep-mock"
                >
                  Attempt Prep Mock <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE MODAL 2: PYQ PDF VIEWER SIMULATOR */}
      {activePdfModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="pdf-modal-overlay">
          <div className="bg-slate-100 rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-gray-200" id="pdf-modal">
            {/* Modal Header */}
            <div className="bg-[#004aad] text-white p-5 flex justify-between items-center z-10 rounded-t-xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Interactive PDF Reader
                </span>
                <h3 className="text-base md:text-lg font-extrabold mt-1">{activePdfModal.title}</h3>
              </div>
              <button 
                onClick={() => setActivePdfModal(null)} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors font-bold"
                id="close-pdf-modal"
              >
                ×
              </button>
            </div>

            {/* PDF Canvas Simulation */}
            <div className="p-4 md:p-6 flex-grow overflow-y-auto flex flex-col items-center justify-center bg-slate-200 min-h-[300px]">
              <div 
                className="bg-white w-full max-w-xl shadow-md border border-gray-300 p-6 md:p-8 rounded-md relative flex flex-col text-left transition-all hover:shadow-lg min-h-[380px]"
                id="mock-pdf-paper-page"
              >
                {/* PDF Header Stamp */}
                <div className="border-b-2 border-gray-100 pb-3 mb-4 flex justify-between items-center text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                  <span>MAZIEXAM PREVIEW SYSTEM</span>
                  <span>Page {pdfCurrentPage + 1} of {activePdfModal.pages.length}</span>
                </div>

                {/* PDF Content Area */}
                <div className="flex-grow whitespace-pre-wrap text-slate-800 text-sm md:text-base leading-relaxed font-sans">
                  {activePdfModal.pages[pdfCurrentPage]}
                </div>

                {/* PDF Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
                  <span className="text-5xl md:text-7xl font-extrabold uppercase text-[#004aad] rotate-45">
                    MAZIEXAM
                  </span>
                </div>

                {/* Footer Stamp */}
                <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-center text-slate-400 font-sans italic">
                  © 2026 Government Exams MockTest Portal
                </div>
              </div>
            </div>

            {/* PDF Actions & Controls */}
            <div className="bg-white border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-xl">
              {/* Pagination controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPdfCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={pdfCurrentPage === 0}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                  id="pdf-btn-prev"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs md:text-sm font-semibold text-slate-700 font-mono">
                  Page {pdfCurrentPage + 1} / {activePdfModal.pages.length}
                </span>
                <button
                  onClick={() => setPdfCurrentPage((prev) => Math.min(activePdfModal.pages.length - 1, prev + 1))}
                  disabled={pdfCurrentPage === activePdfModal.pages.length - 1}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                  id="pdf-btn-next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={() => alert("Mock PDF downloaded successfully to your device!")}
                  className="flex-grow sm:flex-grow-0 bg-[#004aad] hover:bg-[#004aad]/90 text-white font-bold px-4 py-2 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  id="pdf-btn-download"
                >
                  Download Free PDF <Download size={15} />
                </button>
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="flex-grow sm:flex-grow-0 border border-gray-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs md:text-sm transition-all text-center"
                  id="pdf-btn-close"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE MODAL 3: EXAM SIMULATOR */}
      {activeTestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="test-modal-overlay">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-6 flex flex-col border border-gray-200 max-h-[92vh]" id="test-modal">
            
            {/* Simulator Header */}
            <div className="bg-[#004aad] text-white p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-t-xl sticky top-0 z-10 shadow-sm">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                  Live Exam Simulator
                </span>
                <h3 className="text-base md:text-lg font-extrabold mt-0.5">{activeTestModal.title}</h3>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15" id="test-timer-badge">
                <Clock size={16} className="text-blue-200" />
                <span className="font-mono text-sm font-bold leading-none">
                  {testSubmitted ? "TEST OVER" : formatTime(testTimer)}
                </span>
              </div>
            </div>

            {/* Questions area / Results summary */}
            <div className="p-5 md:p-8 flex-grow overflow-y-auto text-left flex flex-col">
              {!testSubmitted ? (
                // Active Quiz Form
                <div className="flex flex-col flex-grow">
                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center mb-6 text-xs text-slate-500 font-bold">
                    <span className="uppercase tracking-wider">
                      Question {testCurrentQuestion + 1} of {activeTestModal.questions.length}
                    </span>
                    <span className="font-mono bg-blue-50 text-[#004aad] px-2 py-1 rounded-md">
                      {Math.round(((testCurrentQuestion + 1) / activeTestModal.questions.length) * 100)}% Complete
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="bg-slate-50 p-4 md:p-5 rounded-lg border border-slate-200 mb-6 flex-shrink-0">
                    <h4 className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                      {activeTestModal.questions[testCurrentQuestion].question}
                    </h4>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="flex flex-col gap-3 flex-grow">
                    {activeTestModal.questions[testCurrentQuestion].options.map((option, idx) => {
                      const isSelected = testAnswers[activeTestModal.questions[testCurrentQuestion].id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(activeTestModal.questions[testCurrentQuestion].id, idx)}
                          className={`w-full text-left p-4 rounded-lg border-2 font-semibold text-sm transition-all flex items-center justify-between gap-3 ${
                            isSelected 
                              ? "border-[#004aad] bg-blue-50/50 text-[#004aad]" 
                              : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                          }`}
                        >
                          <span>{option}</span>
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? "border-[#004aad] bg-[#004aad]" 
                              : "border-slate-300"
                          }`}>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Results and Detailed Review Screen
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-20 h-20 bg-[#004aad]/10 rounded-full flex items-center justify-center text-[#004aad] mb-4">
                    <Trophy size={42} className="stroke-[1.5]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-[#004aad]">Mock Test Completed!</h3>
                  <p className="text-slate-500 mt-1 font-medium">Your score has been successfully computed under official parameters.</p>
                  
                  {/* Scoreboard Widget */}
                  <div className="my-6 bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center justify-around gap-12 w-full max-w-md shadow-sm">
                    <div className="text-center">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Raw Score</span>
                      <strong className="text-3xl font-extrabold text-slate-800 font-mono">
                        {testScore} / {activeTestModal.questions.length}
                      </strong>
                    </div>
                    <div className="w-px h-10 bg-slate-300" />
                    <div className="text-center">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Percentage</span>
                      <strong className="text-3xl font-extrabold text-[#004aad] font-mono">
                        {Math.round((testScore / activeTestModal.questions.length) * 100)}%
                      </strong>
                    </div>
                  </div>

                  {/* Detailed Solutions Section */}
                  <div className="w-full text-left mt-4 border-t border-slate-100 pt-6">
                    <h4 className="font-extrabold text-sm uppercase tracking-widest text-[#004aad] mb-4">
                      Review Questions & Solutions
                    </h4>
                    <div className="flex flex-col gap-5">
                      {activeTestModal.questions.map((q, idx) => {
                        const userAns = testAnswers[q.id];
                        const isCorrect = userAns === q.correctAnswer;
                        return (
                          <div key={q.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs">
                            <p className="font-bold text-slate-800 text-sm md:text-base">
                              Q{idx + 1}. {q.question}
                            </p>
                            
                            <div className="mt-3 flex flex-col gap-1.5 pl-2 text-xs md:text-sm">
                              {q.options.map((opt, oIdx) => {
                                const isCorrectOpt = oIdx === q.correctAnswer;
                                const isUserOpt = oIdx === userAns;
                                return (
                                  <div 
                                    key={oIdx}
                                    className={`flex items-center gap-2 p-1 px-2.5 rounded ${
                                      isCorrectOpt 
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold" 
                                        : isUserOpt 
                                          ? "bg-red-50 text-red-800 border border-red-200" 
                                          : "text-slate-600"
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrectOpt && <CheckCircle2 size={14} className="text-emerald-600 ml-auto flex-shrink-0" />}
                                    {isUserOpt && !isCorrectOpt && <XCircle size={14} className="text-red-600 ml-auto flex-shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Detailed Explanation */}
                            <div className="mt-3 bg-blue-50/50 p-3 rounded border border-blue-100 text-xs text-slate-600">
                              <strong className="text-[#004aad] block mb-0.5">Solution & Explanation:</strong>
                              {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="bg-slate-50 border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-xl sticky bottom-0 z-10 shadow-inner">
              {!testSubmitted ? (
                // Active Quiz Controls
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTestCurrentQuestion((prev) => Math.max(0, prev - 1))}
                      disabled={testCurrentQuestion === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      Q {testCurrentQuestion + 1} / {activeTestModal.questions.length}
                    </span>
                    <button
                      onClick={() => setTestCurrentQuestion((prev) => Math.min(activeTestModal.questions.length - 1, prev + 1))}
                      disabled={testCurrentQuestion === activeTestModal.questions.length - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Next"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to exit the exam simulation? Your current state will be lost.")) {
                          setActiveTestModal(null);
                        }
                      }}
                      className="flex-grow sm:flex-grow-0 border border-gray-300 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs md:text-sm transition-all text-center"
                    >
                      Exit Simulator
                    </button>
                    <button
                      onClick={handleSubmitTest}
                      className="flex-grow sm:flex-grow-0 bg-[#004aad] hover:bg-[#004aad]/90 text-white font-bold px-6 py-2 rounded-lg text-xs md:text-sm transition-all text-center shadow-sm"
                    >
                      Submit Exam Paper
                    </button>
                  </div>
                </>
              ) : (
                // Post-test Result Controls
                <div className="flex items-center gap-3.5 w-full justify-end">
                  <button
                    onClick={() => handleStartTest(activeTestModal)}
                    className="bg-[#004aad]/10 text-[#004aad] hover:bg-[#004aad]/20 font-bold px-4 py-2 rounded-lg text-xs md:text-sm transition-all flex items-center gap-1.5"
                  >
                    Retake Simulator <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => setActiveTestModal(null)}
                    className="bg-[#004aad] hover:bg-[#004aad]/90 text-white font-bold px-5 py-2 rounded-lg text-xs md:text-sm transition-all"
                  >
                    Back to Portal
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL FOOTER */}
      <footer className="bg-[#222222] text-white py-10 mt-auto border-t border-slate-800" id="global-footer">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col gap-8">
          
          {/* Footer Top Panel: Left Brand, Right Socials */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6" id="footer-top-panel">
            {/* Footer Left: Brand & Logo */}
            <div className="flex items-center gap-4 text-left" id="footer-logo-block">
              <AppLogo 
                className="h-18 md:h-24 w-auto object-contain brightness-95 opacity-90 transition-all"
                id="footer-logo-img"
                isFooter={true}
              />
              <div className="h-8 w-[1.5px] bg-white opacity-40 self-center hidden sm:block" id="footer-vertical-line" />
              <div className="flex flex-col text-left" id="footer-title-text">
                <span className="text-base md:text-lg font-black tracking-tight leading-none text-white uppercase">
                  Government Exams
                </span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5 leading-none">
                  MockTest Portal
                </span>
              </div>
            </div>

            {/* Footer Right: Social Medias */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm font-semibold text-slate-300" id="footer-socials-block">
              <span className="uppercase tracking-widest text-[11px] font-bold text-slate-400">
                follow us :
              </span>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {/* Facebook hollow outline */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
                  title="Facebook"
                  id="footer-facebook"
                >
                  <svg className="w-5 h-5 stroke-current text-white fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>

                {/* Instagram hollow outline */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
                  title="Instagram"
                  id="footer-instagram"
                >
                  <svg className="w-5 h-5 stroke-current text-white fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>

                {/* YouTube hollow outline */}
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
                  title="YouTube"
                  id="footer-youtube"
                >
                  <svg className="w-5 h-5 stroke-current text-white fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
                  </svg>
                </a>

                {/* Telegram hollow outline */}
                <a 
                  href="https://telegram.org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
                  title="Telegram"
                  id="footer-telegram"
                >
                  <svg className="w-5 h-5 stroke-current text-white fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"></path>
                    <path d="M22 2 11 13"></path>
                  </svg>
                </a>

                {/* Twitter / X hollow outline */}
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
                  title="Twitter / X"
                  id="footer-twitter"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </a>

                {/* LinkedIn hollow outline */}
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
                  title="LinkedIn"
                  id="footer-linkedin"
                >
                  <svg className="w-5 h-5 stroke-current text-white fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12" fill="currentColor"></rect>
                    <circle cx="4" cy="4" r="2" fill="currentColor"></circle>
                  </svg>
                </a>
                
                {/* WhatsApp hollow outline */}
                <a 
                  href="https://whatsapp.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
                  title="WhatsApp"
                  id="footer-whatsapp"
                >
                  <svg className="w-5 h-5 stroke-current text-white fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Line & Copyright */}
          <div className="flex flex-col gap-4 text-center mt-2" id="footer-bottom-panel">
            <hr className="border-white/10 w-full" id="footer-horizontal-separator" />
            <p className="text-xs text-slate-400 font-mono tracking-wider" id="footer-copyright">
              @2026 All right reserved maziexam
            </p>
          </div>

        </div>
      </footer>

      {/* Auth Modal for sign in / registration & profile */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        currentUser={currentUser} 
      />

      {/* PAYMENT GATEWAY SIMULATOR MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="payment-simulator-modal-overlay">
          <div className="bg-slate-900 border border-amber-500/30 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" id="payment-simulator-modal">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-5 text-slate-950 font-bold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-slate-950 animate-bounce" />
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase leading-tight">Secured Payment Gateway</h3>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">MaziExam Sandbox Simulator</p>
                </div>
              </div>
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                className="text-slate-950 hover:bg-black/10 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-colors font-bold"
                id="close-payment-modal"
              >
                ×
              </button>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {!paymentSuccess ? (
                <div>
                  {/* Summary */}
                  <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-5 text-left">
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Item Details</p>
                    <h4 className="text-base font-black text-amber-400 mt-1">
                      {paymentType === "portal_pass" 
                        ? "🏆 All-Access Standard Portal Pass" 
                        : paymentType === "selection_pass"
                        ? "🏆 Get Selection Premium All-Access Pass"
                        : `💎 Premium Exam Cracker: ${paymentTargetPack?.title}`}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {paymentType === "portal_pass" 
                        ? "Unlocks all standard mock tests and paper PDFs across all categories." 
                        : paymentType === "selection_pass"
                        ? "Unlocks ALL premium cracker packs, including 150+ high-yield speed mocks, detailed PYQ solutions, and current affairs keys."
                        : "Includes 25+ Full mocks, topic tests, standard PYQ explanations and current affairs keys."}
                    </p>
                    <div className="flex justify-between items-center border-t border-slate-800 mt-3 pt-3">
                      <span className="text-sm font-semibold text-slate-300">Amount to Pay:</span>
                      <span className="text-2xl font-black text-white font-mono font-sans">₹{paymentAmount}</span>
                    </div>
                  </div>

                  {paymentPending ? (
                    /* Spinner Loader */
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <h4 className="text-lg font-bold text-amber-400 animate-pulse">Contacting Banking API...</h4>
                      <p className="text-xs text-slate-400 mt-1 px-4">Processing standard mock validation parameters. Please do not close or refresh this tab.</p>
                    </div>
                  ) : (
                    /* Inputs Form */
                    <div className="flex flex-col text-left">
                      {/* Tabs */}
                      <div className="flex bg-slate-950 rounded-lg p-1 mb-4 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`flex-1 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            paymentMethod === "card" ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950" : "text-slate-400 hover:text-slate-100"
                          }`}
                        >
                          <CreditCard size={14} />
                          Debit / Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("upi")}
                          className={`flex-1 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            paymentMethod === "upi" ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950" : "text-slate-400 hover:text-slate-100"
                          }`}
                        >
                          <svg className="w-3.5 h-3.5 fill-current text-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                          </svg>
                          UPI (Paytm/GPay)
                        </button>
                      </div>

                      {paymentMethod === "card" ? (
                        <div className="space-y-4 font-sans">
                          <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Card Number</label>
                            <input
                              type="text"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setCardNumber(v);
                              }}
                              placeholder="4111 2222 3333 4444"
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Expiry Date</label>
                              <input
                                type="text"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => {
                                  let v = e.target.value.replace(/\D/g, '');
                                  if (v.length > 2) {
                                    v = v.substring(0, 2) + "/" + v.substring(2, 4);
                                  }
                                  setCardExpiry(v);
                                }}
                                placeholder="MM/YY"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">CVV</label>
                              <input
                                type="password"
                                maxLength={3}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                placeholder="123"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 font-sans">UPI ID (VPA)</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="aspirant@okaxis"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                            required
                          />
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentPending(true);
                          setTimeout(() => {
                            setPaymentPending(false);
                            setPaymentSuccess(true);
                            handlePurchaseSuccess(paymentType, paymentTargetPack?.id);
                          }, 1800);
                        }}
                        className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black tracking-wider uppercase text-sm shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldAlert size={16} />
                        Proceed to Pay ₹{paymentAmount}
                      </button>

                      <p className="text-[10px] text-slate-500 mt-4 text-center font-mono">
                        🔒 SSL Secured 256-Bit Sandbox Transaction
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Success screen */
                <div className="py-8 flex flex-col items-center justify-center text-center font-sans">
                  <div className="w-20 h-20 bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle2 size={44} className="fill-emerald-500 text-slate-900" />
                  </div>
                  <h4 className="text-2xl font-black text-emerald-400 tracking-tight uppercase">Payment Success!</h4>
                  <p className="text-sm text-slate-300 font-bold mt-2 px-4">
                    Transaction of ₹{paymentAmount} Completed Successfully.
                  </p>
                  <p className="text-xs text-slate-400 mt-1 px-4 leading-relaxed">
                    Your account has been instantly upgraded. Premium features are unlocked in real-time across this browser.
                  </p>

                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black tracking-wider uppercase text-sm hover:brightness-110 transition-all shadow-md"
                  >
                    🚀 Start Premium Access
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* UNLOCKED PREMIUM PACK DETAILS VIEW */}
      {unlockedDetailsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="unlocked-details-modal-overlay">
          <div className="bg-slate-900 border-2 border-amber-400/50 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" id="unlocked-details-modal">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 p-5 font-bold flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star size={20} className="fill-slate-950 text-slate-950" />
                <h3 className="text-base font-black uppercase tracking-tight">Premium Pack Active</h3>
              </div>
              <button 
                onClick={() => setUnlockedDetailsModal(null)}
                className="text-slate-950 hover:bg-black/10 rounded-full w-8 h-8 flex items-center justify-center text-xl font-black"
                id="close-unlocked-details-modal"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                {unlockedDetailsModal.category} • {unlockedDetailsModal.examCode}
              </span>
              <h4 className="text-xl font-black text-white mt-2 leading-tight">
                {unlockedDetailsModal.title}
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {unlockedDetailsModal.description}
              </p>
              
              <div className="border-t border-slate-800 mt-4 pt-4">
                <h5 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">Your Unlocked Premium Assets</h5>
                
                <div className="space-y-2">
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">60 High-Yield Exam Mocks</p>
                      <p className="text-[10px] text-slate-500">Includes CSAT, GS speed runs and formula simulators</p>
                    </div>
                    <button 
                      onClick={() => {
                        setUnlockedDetailsModal(null);
                        setCurrentPage("mock");
                        setMockFilter(unlockedDetailsModal.category as any);
                      }} 
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Access
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Premium Curated PYQ Explainers</p>
                      <p className="text-[10px] text-slate-500">Fully solved, mapped to latest 2026 patterns</p>
                    </div>
                    <button 
                      onClick={() => {
                        setUnlockedDetailsModal(null);
                        setCurrentPage("pdf");
                        setPdfFilter(unlockedDetailsModal.category as any);
                      }} 
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Read
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Current Affairs 2026 Bullet Key</p>
                      <p className="text-[10px] text-slate-500">Premium high-yield current event mapping</p>
                    </div>
                    <button 
                      onClick={() => alert("Downloading Premium Current Affairs Bullet Key PDF... Check your browser downloads!")} 
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={10} /> Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-4 mt-5 flex gap-3 items-start">
                <Sparkles className="text-amber-400 mt-0.5 shrink-0 animate-pulse" size={16} />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider leading-none">Success Guaranteed</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    This premium pack covers every major high-probability question trend. Complete all mocks and read all explanatory materials twice.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal icons helpers to bypass external imports
function PlayIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
