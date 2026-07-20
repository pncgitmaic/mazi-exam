import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Award,
  AlertTriangle
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { JobAlert, MockTest, PaperPdf, ExamDetail } from "../data";

// Pre-populated realistic user profiles if database has no active records
const INITIAL_MOCK_PROFILES = [
  { userId: "u-1", fullName: "Prathamesh Chaware", phoneNumber: "+91 9421113005", state: "Pune, Maharashtra", examPreference: "MPSC", notificationsActive: true, email: "prathameshchaware132005@gmail.com" },
  { userId: "u-2", fullName: "Karan Deshmukh", phoneNumber: "+91 9823456789", state: "Mumbai, Maharashtra", examPreference: "UPSC", notificationsActive: true, email: "karan.deshmukh@gmail.com" },
  { userId: "u-3", fullName: "Shreya Patil", phoneNumber: "+91 7765432109", state: "Nagpur, Maharashtra", examPreference: "Banking Exams", notificationsActive: false, email: "shreya.patil@outlook.com" },
  { userId: "u-4", fullName: "Aditya Shinde", phoneNumber: "+91 8899001122", state: "Nashik, Maharashtra", examPreference: "Police Bharti", notificationsActive: true, email: "aditya.shinde@yahoo.com" }
];

// Pre-populated realistic classroom leads if database is empty
const INITIAL_MOCK_LEADS = [
  { id: "lead-1", fullName: "Amit Ghorpade", email: "amit.ghorpade@gmail.com", phoneNumber: "+91 9011223344", preferredBatch: "Police Bharti Batch 2026", timestamp: Date.now() - 3600000 * 4 },
  { id: "lead-2", fullName: "Snehal Tambe", email: "snehal.tambe@outlook.com", phoneNumber: "+91 7020304050", preferredBatch: "MPSC Foundation Batch", timestamp: Date.now() - 3600000 * 24 },
  { id: "lead-3", fullName: "Rahul Kadam", email: "rahul.kadam@live.com", phoneNumber: "+91 9545352515", preferredBatch: "General Combined Batch", timestamp: Date.now() - 3600000 * 48 }
];

interface UniexControlPanelProps {
  jobAlerts: JobAlert[];
  setJobAlerts: React.Dispatch<React.SetStateAction<JobAlert[]>>;
  mockTests: MockTest[];
  setMockTests: React.Dispatch<React.SetStateAction<MockTest[]>>;
  paperPdfs: PaperPdf[];
  setPaperPdfs: React.Dispatch<React.SetStateAction<PaperPdf[]>>;
  upcomingExams: ExamDetail[];
  setUpcomingExams: React.Dispatch<React.SetStateAction<ExamDetail[]>>;
  onClose: () => void;
}

export function UniexControlPanel({
  jobAlerts,
  setJobAlerts,
  mockTests,
  setMockTests,
  paperPdfs,
  setPaperPdfs,
  upcomingExams,
  setUpcomingExams,
  onClose
}: UniexControlPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("uniex_admin_auth") === "true";
  });
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError("");
    try {
      const res = await fetch("/api/verify-uniex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setAuthError(`Server error (${res.status}). Please check Vercel logs.`);
        setIsVerifying(false);
        return;
      }
      
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("uniex_admin_auth", "true");
      } else {
        setAuthError("Incorrect password");
      }
    } catch (err) {
      setAuthError("Server error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Navigation tabs matching the Orange rounded nav pills
  const [activeTab, setActiveTab] = useState<
    "editors_tools" | "jobs" | "gov_jobs" | "private_jobs" | "live_mock_test" | "create_mock_test" | "users" | "pdfs" | "settings" | "total_registration" | "employment_ace"
  >("editors_tools");

  // Left sidebar category filters
  const [activeSidebarFilter, setActiveSidebarFilter] = useState<string>("All");

  // Shared search queries
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time Firestore states
  const [dbProfiles, setDbProfiles] = useState<any[]>([]);
  const [dbLeads, setDbLeads] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "loading">("loading");

  // Site-wide configuration states (persisted to localStorage)
  const [ga4Key, setGa4Key] = useState(() => localStorage.getItem("site_config_ga4") || "G-V5Z8N4S8E1");
  const [seoDescription, setSeoDescription] = useState(() => localStorage.getItem("site_config_seo_desc") || "MaziExam India's primary bilingual prep platform. MPSC, UPSC, Railways, SSC, Banking resources.");
  const [primaryTitle, setPrimaryTitle] = useState(() => localStorage.getItem("site_config_title") || "माझी Exam - MaziExam Academic Portal");
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem("site_config_support_email") || "support@maziexam.com");

  // Modals / forms states
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobAlert | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<PaperPdf | null>(null);

  // Forms data bindings
  const [jobForm, setJobForm] = useState<Omit<JobAlert, "id">>({
    title: "",
    category: "Government",
    organization: "",
    postName: "",
    vacancies: "",
    salary: "",
    lastDate: "",
    qualification: "",
    link: "",
    details: ""
  });

  const [pdfForm, setPdfForm] = useState<Omit<PaperPdf, "id">>({
    title: "",
    year: "2026",
    subject: "General Studies",
    questionsCount: 100,
    fileSize: "2.5 MB",
    downloadUrl: "#",
    pages: [],
    category: "MPSC"
  });

  // Interactive Create Mock Test form bindings
  const [newMockTitle, setNewMockTitle] = useState("");
  const [newMockDuration, setNewMockDuration] = useState(10);
  const [newMockCategory, setNewMockCategory] = useState<MockTest["category"]>("MPSC");
  const [newMockQuestions, setNewMockQuestions] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
  ]);

  // Employment Ace specialized coaching variables
  const [coachingModules, setCoachingModules] = useState([
    { id: "cm-1", name: "Police Bharti Constable super batch", price: 50, duration: "3 Months", status: "Active", enrolled: 412 },
    { id: "cm-2", name: "MPSC Comp GS Foundation batch", price: 80, duration: "6 Months", status: "Active", enrolled: 289 },
    { id: "cm-3", name: "PSI/STI/ASO Combined batch", price: 65, duration: "4 Months", status: "Active", enrolled: 153 }
  ]);

  // Fetch Firestore users and classroom leads
  const fetchDbRecords = async () => {
    setLoadingDb(true);
    setDbStatus("loading");
    try {
      // 1. Fetch user profiles
      const profilesCol = collection(db, "user_profiles");
      const profilesSnapshot = await getDocs(profilesCol);
      const profilesList = profilesSnapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      }));
      setDbProfiles(profilesList.length > 0 ? profilesList : INITIAL_MOCK_PROFILES);

      // 2. Fetch classroom leads
      const leadsCol = collection(db, "classroom_leads");
      const leadsSnapshot = await getDocs(leadsCol);
      const leadsList = leadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDbLeads(leadsList.length > 0 ? leadsList : INITIAL_MOCK_LEADS);

      setDbStatus("connected");
    } catch (err: any) {
      console.warn("Firestore access error. Using populated sandbox fallback:", err.message);
      setDbProfiles(INITIAL_MOCK_PROFILES);
      setDbLeads(INITIAL_MOCK_LEADS);
      setDbStatus("disconnected");
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDbRecords();
  }, []);

  // Sync state data arrays to localStorage
  const saveJobsToLocal = (updated: JobAlert[]) => {
    setJobAlerts(updated);
    localStorage.setItem("maziexam_job_alerts", JSON.stringify(updated));
  };

  const saveMockTestsToLocal = (updated: MockTest[]) => {
    setMockTests(updated);
    localStorage.setItem("maziexam_mock_tests", JSON.stringify(updated));
  };

  const savePdfsToLocal = (updated: PaperPdf[]) => {
    setPaperPdfs(updated);
    localStorage.setItem("maziexam_paper_pdfs", JSON.stringify(updated));
  };

  // Convert Sidebar Category to full standard data tag
  const getSyllabusCategoryMap = (tag: string): string => {
    const map: Record<string, string> = {
      "Upsc": "UPSC",
      "Mpsc": "MPSC",
      "Clerk": "Clerk Exams",
      "Railways": "Railway Exams",
      "SSC": "SSC Exams",
      "Banking": "Banking Exams",
      "Defence": "Defence Exams",
      "State Exam": "State Exams",
      "Private exam": "Private Exams",
      "Mediacal exam": "Medical Exams"
    };
    return map[tag] || tag;
  };

  // Handle Job submission
  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.organization || !jobForm.postName) {
      alert("Please fill all mandatory fields.");
      return;
    }

    if (editingJob) {
      // Edit
      const updated = jobAlerts.map(j => j.id === editingJob.id ? { ...editingJob, ...jobForm } : j);
      saveJobsToLocal(updated);
      alert("Job alert successfully updated!");
    } else {
      // Add
      const newJob: JobAlert = {
        id: "job-" + Date.now(),
        ...jobForm
      };
      saveJobsToLocal([newJob, ...jobAlerts]);
      alert("New Job alert added successfully!");
    }

    // Reset Form
    setJobForm({
      title: "",
      category: "Government",
      organization: "",
      postName: "",
      vacancies: "",
      salary: "",
      lastDate: "",
      qualification: "",
      link: "",
      details: ""
    });
    setEditingJob(null);
    setJobModalOpen(false);
  };

  // Handle Job delete
  const handleDeleteJob = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the job alert: "${title}"?`)) {
      const updated = jobAlerts.filter(j => j.id !== id);
      saveJobsToLocal(updated);
    }
  };

  // Handle PDF submission
  const handlePdfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfForm.title || !pdfForm.subject) {
      alert("Please fill in the PDF Title and Subject.");
      return;
    }

    if (editingPdf) {
      const updated = paperPdfs.map(p => p.id === editingPdf.id ? { ...editingPdf, ...pdfForm } : p);
      savePdfsToLocal(updated);
      alert("PDF reference updated successfully!");
    } else {
      const newPdf: PaperPdf = {
        id: "pdf-" + Date.now(),
        ...pdfForm
      };
      savePdfsToLocal([newPdf, ...paperPdfs]);
      alert("New PDF reference added successfully!");
    }

    setPdfForm({
      title: "",
      year: "2026",
      subject: "General Studies",
      questionsCount: 100,
      fileSize: "2.5 MB",
      downloadUrl: "#",
      pages: [],
      category: "MPSC"
    });
    setEditingPdf(null);
    setPdfModalOpen(false);
  };

  // Handle PDF delete
  const handleDeletePdf = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the PDF booklet reference: "${title}"?`)) {
      const updated = paperPdfs.filter(p => p.id !== id);
      savePdfsToLocal(updated);
    }
  };

  // Handle Mock Test Delete
  const handleDeleteMockTest = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the Mock Test: "${title}"?`)) {
      const updated = mockTests.filter(m => m.id !== id);
      saveMockTestsToLocal(updated);
    }
  };

  // Add question to active mock builder form
  const addQuestionToMockForm = () => {
    setNewMockQuestions([
      ...newMockQuestions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]);
  };

  // Remove question from active mock builder
  const removeQuestionFromMockForm = (index: number) => {
    if (newMockQuestions.length <= 1) return;
    setNewMockQuestions(newMockQuestions.filter((_, i) => i !== index));
  };

  // Submit compiled mock test
  const handleCreateMockTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMockTitle) {
      alert("Please specify a Mock Test Title.");
      return;
    }

    const invalid = newMockQuestions.some(q => !q.question || q.options.some(opt => !opt));
    if (invalid) {
      alert("Please provide the question body and all 4 options for every question block.");
      return;
    }

    const compiledQuestions = newMockQuestions.map((q, idx) => ({
      id: idx + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "No explanation provided."
    }));

    const newTest: MockTest = {
      id: "test-" + Date.now(),
      title: newMockTitle,
      durationMinutes: Number(newMockDuration),
      questions: compiledQuestions,
      category: newMockCategory
    };

    saveMockTestsToLocal([newTest, ...mockTests]);
    alert(`Success! Mock Test "${newMockTitle}" with ${compiledQuestions.length} questions created.`);
    
    // Clear Form
    setNewMockTitle("");
    setNewMockDuration(10);
    setNewMockQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);
    setActiveTab("live_mock_test");
  };

  // Handle site config save
  const handleSaveSiteConfig = () => {
    localStorage.setItem("site_config_ga4", ga4Key);
    localStorage.setItem("site_config_seo_desc", seoDescription);
    localStorage.setItem("site_config_title", primaryTitle);
    localStorage.setItem("site_config_support_email", supportEmail);
    alert("✓ System config saved! Reflected across sitemaps and headers.");
  };

  // Restore Default Static Databases
  const handleRestoreDefaults = () => {
    if (confirm("Are you sure you want to wipe local changes and restore original template datasets?")) {
      localStorage.removeItem("maziexam_job_alerts");
      localStorage.removeItem("maziexam_mock_tests");
      localStorage.removeItem("maziexam_paper_pdfs");
      localStorage.removeItem("maziexam_upcoming_exams");
      window.location.reload();
    }
  };

  // Delete classroom lead from database
  const handleDeleteLead = async (id: string, name: string) => {
    if (confirm(`Delete batch application lead for student "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "classroom_leads", id));
        setDbLeads(dbLeads.filter(l => l.id !== id));
        alert("Lead record deleted successfully from cloud.");
      } catch (err: any) {
        // Local removal
        setDbLeads(dbLeads.filter(l => l.id !== id));
        alert("Offline lead removed from view.");
      }
    }
  };

  // Filter lists based on Sidebar Tag AND search queries
  const getFilteredJobsList = () => {
    let list = jobAlerts;

    // Apply sidebar category if not All
    if (activeSidebarFilter !== "All") {
      const dbTag = getSyllabusCategoryMap(activeSidebarFilter);
      list = list.filter(j => j.organization.toUpperCase().includes(dbTag.toUpperCase()) || j.title.toUpperCase().includes(dbTag.toUpperCase()) || j.details.toUpperCase().includes(dbTag.toUpperCase()));
    }

    // Apply search query
    if (searchQuery) {
      list = list.filter(j => 
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.postName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.organization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  };

  const getFilteredPdfsList = () => {
    let list = paperPdfs;

    if (activeSidebarFilter !== "All") {
      const dbTag = getSyllabusCategoryMap(activeSidebarFilter);
      list = list.filter(p => p.category.toUpperCase().includes(dbTag.toUpperCase()) || p.title.toUpperCase().includes(dbTag.toUpperCase()));
    }

    if (searchQuery) {
      list = list.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  };

  const getFilteredMocksList = () => {
    let list = mockTests;

    if (activeSidebarFilter !== "All") {
      const dbTag = getSyllabusCategoryMap(activeSidebarFilter);
      list = list.filter(m => m.category.toUpperCase().includes(dbTag.toUpperCase()) || m.title.toUpperCase().includes(dbTag.toUpperCase()));
    }

    if (searchQuery) {
      list = list.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Admin Workspace</h2>
          <p className="text-slate-500 text-center text-sm mb-8 font-medium">
            Please enter the administrator password to access the Uniex Control Panel.
          </p>
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono shadow-sm"
                autoFocus
              />
            </div>
            {authError && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{authError}</p>}
            <button 
              type="submit" 
              disabled={isVerifying || !password}
              className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2 text-lg"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={20} className="animate-spin" /> Verifying...
                </>
              ) : "Authenticate"}
            </button>
            <button
               type="button"
               onClick={onClose}
               className="w-full py-3 mt-1 text-slate-500 hover:text-slate-800 font-bold transition-colors rounded-xl hover:bg-slate-50"
            >
               Return to Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-100 min-h-screen flex flex-col font-sans" id="uniex-root-container">
      
      {/* 2.A DYNAMIC HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col gap-3 shadow-xs sticky top-0 z-30" id="uniex-header-section">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Area (Left) */}
          <div className="flex items-center gap-3 self-start md:self-auto" id="uniex-logo-block">
            <img 
              src="https://isxhcatn0reqvwnv.public.blob.vercel-storage.com/Exam__1_-removebg-preview.png" 
              alt="माझी Exam logo" 
              className="h-16 md:h-20 w-auto object-contain hover:scale-105 transition-transform cursor-pointer"
              onClick={onClose}
              id="uniex-logo-image"
            />
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Admin Workspace
            </span>
          </div>

          {/* Title (Center) */}
          <div className="text-center" id="uniex-title-block">
            <h1 className="text-sm md:text-base lg:text-lg font-extrabold text-slate-900 tracking-tight leading-tight uppercase font-sans">
              Welcome to prathamesh project workspace - Pratham Adaz
            </h1>
          </div>

          {/* Badge (Right) */}
          <div className="self-end md:self-auto flex items-center gap-3" id="uniex-badge-block">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0">
              <img 
                src="https://isxhcatn0reqvwnv.public.blob.vercel-storage.com/Black%20and%20White%20Simple%20Modern%20Bold%20Minimalist%20%20Logo.jpg" 
                alt="Workspace Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Top Quick Navigation (Orange Rounded Pills row) */}
        <div className="overflow-x-auto scrollbar-none border-t border-slate-100 pt-2.5" id="uniex-navigation-bar">
          <div className="flex items-center gap-2 pb-1 pr-4 min-w-max">
            
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full text-xs font-extrabold text-white bg-[#ff6f00] hover:bg-[#e65100] hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer uppercase tracking-wider flex items-center gap-1"
            >
              🚪 Home
            </button>

            {[
              { id: "editors_tools", label: "Editors tools", icon: "🛠️" },
              { id: "jobs", label: "jOBS", icon: "📰" },
              { id: "gov_jobs", label: "Gov jobs", icon: "🏛️" },
              { id: "private_jobs", label: "Private Jobs", icon: "🏢" },
              { id: "live_mock_test", label: "Live Mock Test", icon: "📝" },
              { id: "create_mock_test", label: "Create Mock Test", icon: "➕" },
              { id: "users", label: "Users", icon: "👤" },
              { id: "pdfs", label: "PDFs", icon: "📄" },
              { id: "total_registration", label: "Total Regestration", icon: "📈" },
              { id: "employment_ace", label: "Employment Ace", icon: "🏆" },
              { id: "settings", label: "Settings", icon: "⚙️" }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setActiveTab(pill.id as any);
                  setSearchQuery("");
                }}
                className={`px-4.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5 ${
                  activeTab === pill.id
                    ? "bg-[#ff6f00] text-white shadow-md scale-105"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
                }`}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </button>
            ))}

          </div>
        </div>
      </header>

      {/* Main Dual-pane Container */}
      <div className="flex-1 flex flex-col md:flex-row relative" id="uniex-dual-pane-layout">
        
        {/* 2.B LEFT SIDEBAR PANEL (Dark Minimal Theme) */}
        <aside className="w-full md:w-64 bg-[#1c1c1e] text-white p-5 flex flex-col gap-4 border-r border-neutral-800 shrink-0" id="uniex-sidebar-pane">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
              Category Matrix
            </span>
            <span className="text-[10px] bg-blue-900/40 text-blue-300 font-bold px-2 py-0.5 rounded font-mono border border-blue-800/30">
              Active: {activeSidebarFilter}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Quick Add Content highlighted ice-blue action button */}
            <button
              onClick={() => {
                // Quickly spawn contextual modal or open create builder
                if (activeTab === "pdfs") {
                  setEditingPdf(null);
                  setPdfModalOpen(true);
                } else if (activeTab === "create_mock_test") {
                  alert("You are already on the Mock Test Builder form.");
                } else if (activeTab === "live_mock_test") {
                  setActiveTab("create_mock_test");
                } else {
                  setEditingJob(null);
                  setJobModalOpen(true);
                }
              }}
              className="w-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-slate-950 font-black text-xs py-2.5 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md uppercase tracking-widest cursor-pointer mb-2"
              title="Spawn Quick Action Creator Form"
              id="quick-add-sidebar-btn"
            >
              <Plus size={16} strokeWidth={3} />
              <span>+ Quick Add</span>
            </button>

            {/* Sidebar Rounded Pill tags */}
            {[
              "All",
              "Upsc",
              "Mpsc",
              "Clerk",
              "Railways",
              "SSC",
              "Banking",
              "Defence",
              "State Exam",
              "Private exam",
              "Mediacal exam"
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveSidebarFilter(tag)}
                className={`w-full py-2 px-4 rounded-full text-xs font-bold text-left transition-all flex items-center justify-between ${
                  activeSidebarFilter === tag
                    ? "bg-[#0a5cd6] text-white shadow-sm scale-[1.02] border-l-4 border-sky-400 pl-3"
                    : "bg-transparent hover:bg-neutral-800 text-neutral-300 hover:text-white"
                }`}
              >
                <span>🏷️ {tag}</span>
                {activeSidebarFilter === tag && (
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                )}
              </button>
            ))}
          </div>

          {/* DB Live status card */}
          <div className="mt-auto border-t border-neutral-800 pt-4 text-xs font-mono">
            <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Firebase Cloud Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus === "connected" ? "bg-emerald-500" : dbStatus === "loading" ? "bg-amber-500 animate-pulse" : "bg-red-500"
                }`} />
                <span className="font-bold text-neutral-300">
                  {dbStatus === "connected" ? "Sync Active" : dbStatus === "loading" ? "Contacting..." : "Offline Sandbox"}
                </span>
              </div>
              <button 
                onClick={fetchDbRecords}
                className="w-full text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-1 rounded transition-all flex items-center justify-center gap-1 font-bold"
              >
                <RefreshCw size={10} className={loadingDb ? "animate-spin" : ""} />
                Force Refresh
              </button>
            </div>
          </div>
        </aside>

        {/* 2.C PRIMARY WORK SURFACE (Content Panel) */}
        <main className="flex-1 bg-[#f9fafb] p-6 min-h-0 overflow-y-auto flex flex-col gap-6 shadow-inner" id="uniex-content-pane">
          
          {/* DEFAULT STATE: editors tools view */}
          {activeTab === "editors_tools" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto" id="uniex-default-view">
              <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-4xl mb-6 shadow-sm">
                🛠️
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-sans uppercase">
                editors tools
              </h2>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed font-sans max-w-md">
                Welcome to the माझी Exam unified portal control panel. Select any top navigation pill or use quick-add buttons to manage job listings, design real-time mock questionnaires, edit answer key PDFs, or audit registered candidate rosters.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
                <button 
                  onClick={() => setActiveTab("jobs")}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#ff6f00] hover:shadow-md transition-all text-left flex flex-col gap-1.5"
                >
                  <span className="text-xl">📰</span>
                  <span className="text-xs font-black uppercase text-slate-800">Job Alerts</span>
                  <span className="text-[10px] text-slate-400">Manage 500+ Sarkari and private vacancies.</span>
                </button>
                <button 
                  onClick={() => setActiveTab("create_mock_test")}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#ff6f00] hover:shadow-md transition-all text-left flex flex-col gap-1.5"
                >
                  <span className="text-xl">➕</span>
                  <span className="text-xs font-black uppercase text-slate-800">Mock Builder</span>
                  <span className="text-[10px] text-slate-400">Design custom MCQ tests instantly.</span>
                </button>
              </div>
            </div>
          )}

          {/* JOBS / GOV / PRIVATE MANAGER TABS */}
          {(activeTab === "jobs" || activeTab === "gov_jobs" || activeTab === "private_jobs") && (
            <div className="space-y-6 animate-fadeIn" id="uniex-jobs-manager">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                    {activeTab === "jobs" ? "Global Job Alert Registry" : activeTab === "gov_jobs" ? "Government Public Sector Posts" : "Corporate Private Job Alerts"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Showing filtered entries from local state variables. Create, update or delete job bulletins instantly.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setEditingJob(null);
                    setJobForm({
                      title: "",
                      category: activeTab === "private_jobs" ? "Private" : "Government",
                      organization: "",
                      postName: "",
                      vacancies: "",
                      salary: "",
                      lastDate: "",
                      qualification: "",
                      link: "",
                      details: ""
                    });
                    setJobModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-lg transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  <Plus size={14} /> Add New Job Alert
                </button>
              </div>

              {/* Filtering indicators */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative max-w-xs w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search title or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#ff6f00]"
                  />
                </div>
                {activeSidebarFilter !== "All" && (
                  <span className="bg-blue-50 text-blue-800 border border-blue-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase font-mono">
                    Sidebar Tag: {activeSidebarFilter}
                  </span>
                )}
              </div>

              {/* Grid / Spreadsheet Table representation */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-mono">
                        <th className="p-3">Title & Organization</th>
                        <th className="p-3">Post & Vacancies</th>
                        <th className="p-3">Qualifications</th>
                        <th className="p-3">Salary & Last Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {getFilteredJobsList()
                        .filter(job => {
                          if (activeTab === "gov_jobs") return job.category === "Government";
                          if (activeTab === "private_jobs") return job.category === "Private";
                          return true;
                        })
                        .map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3">
                              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono mb-1 ${
                                job.category === "Government" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                              }`}>
                                {job.category}
                              </span>
                              <div className="font-bold text-slate-900 leading-snug">{job.title}</div>
                              <div className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-0.5">{job.organization}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-700">{job.postName}</div>
                              <div className="font-mono text-emerald-600 font-bold mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded text-[10px]">
                                {job.vacancies}
                              </div>
                            </td>
                            <td className="p-3 max-w-[200px] truncate" title={job.qualification}>
                              {job.qualification}
                            </td>
                            <td className="p-3">
                              <div className="font-mono font-bold text-slate-800">{job.salary}</div>
                              <div className="text-[10px] text-red-500 font-mono font-semibold mt-1">🗓️ Exp: {job.lastDate}</div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingJob(job);
                                    setJobForm({
                                      title: job.title,
                                      category: job.category,
                                      organization: job.organization,
                                      postName: job.postName,
                                      vacancies: job.vacancies,
                                      salary: job.salary,
                                      lastDate: job.lastDate,
                                      qualification: job.qualification,
                                      link: job.link,
                                      details: job.details
                                    });
                                    setJobModalOpen(true);
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-[#004aad] text-slate-600 hover:text-white rounded transition-colors"
                                  title="Edit Alert"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id, job.title)}
                                  className="p-1.5 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white rounded transition-colors"
                                  title="Delete Alert"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PDFs PYQ SOLUTION BOOKLET MANAGER */}
          {activeTab === "pdfs" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-pdfs-manager">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                    Previous Year Papers & PDF Solution Manager
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage reference documents, question booklets, and master answer keys hosted on MaziExam.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setEditingPdf(null);
                    setPdfForm({
                      title: "",
                      year: "2026",
                      subject: "General Studies",
                      questionsCount: 100,
                      fileSize: "2.5 MB",
                      downloadUrl: "#",
                      pages: [],
                      category: "MPSC"
                    });
                    setPdfModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-lg transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  <Plus size={14} /> Add New PYQ PDF Reference
                </button>
              </div>

              {/* Filtering indicators */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative max-w-xs w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search PDFs by title or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#ff6f00]"
                  />
                </div>
              </div>

              {/* Datagrid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredPdfsList().map((pdf) => (
                  <div key={pdf.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-50 text-blue-800 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                          {pdf.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          Year: {pdf.year}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{pdf.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Subject: <strong className="text-slate-600">{pdf.subject}</strong></p>
                      
                      <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-100/50 flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>Questions: <strong>{pdf.questionsCount}</strong></span>
                        <span>Size: <strong>{pdf.fileSize}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <code className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{pdf.downloadUrl}</code>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingPdf(pdf);
                            setPdfForm({
                              title: pdf.title,
                              year: pdf.year,
                              subject: pdf.subject,
                              questionsCount: pdf.questionsCount,
                              fileSize: pdf.fileSize,
                              downloadUrl: pdf.downloadUrl,
                              pages: pdf.pages,
                              category: pdf.category
                            });
                            setPdfModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-[#004aad] text-slate-600 hover:text-white rounded transition-colors"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeletePdf(pdf.id, pdf.title)}
                          className="p-1.5 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white rounded transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE MOCK TEST MANAGER */}
          {activeTab === "live_mock_test" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-mock-list-manager">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                    Active Mock Tests & Simulators
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Review published mock exams, countdowns, and questionnaires taken by competitive exam candidates.
                  </p>
                </div>
                
                <button
                  onClick={() => setActiveTab("create_mock_test")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-lg transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  <Plus size={14} /> Design New Mock Exam
                </button>
              </div>

              {/* Interactive list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredMocksList().map((test) => (
                  <div key={test.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-indigo-50 text-indigo-800 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                          {test.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          ⏱️ {test.durationMinutes} Min
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 leading-tight mb-2">
                        {test.title}
                      </h4>
                      
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-2 mt-4 text-xs">
                        <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                          <span>QUESTIONS COMPILED:</span>
                          <span className="font-bold text-slate-800">{test.questions.length}</span>
                        </div>
                        <div className="max-h-[100px] overflow-y-auto pr-1 text-[11px] divide-y divide-slate-100">
                          {test.questions.map((q, i) => (
                            <div key={q.id} className="py-1 truncate text-slate-600">
                              Q{i+1}. {q.question}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-mono">ID: {test.id}</span>
                      <button
                        onClick={() => handleDeleteMockTest(test.id, test.title)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete Simulator
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CREATE MOCK TEST FORM */}
          {activeTab === "create_mock_test" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-mock-builder-form">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                  Interactive Mock Test Builder
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Design complex questionnaires, compile multiple-choice options, set accurate timer rules, and write detailed answer key explanations.
                </p>
              </div>

              <form onSubmit={handleCreateMockTestSubmit} className="bg-white border border-slate-200 rounded-xl p-5 md:p-8 shadow-xs space-y-6">
                
                {/* Metas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">Mock Exam Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MPSC Comb Group B Speed Booster"
                      value={newMockTitle}
                      onChange={(e) => setNewMockTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">Syllabus category *</label>
                    <select
                      value={newMockCategory}
                      onChange={(e) => setNewMockCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00]"
                    >
                      <option value="MPSC">MPSC State Services</option>
                      <option value="UPSC">UPSC Civil Services</option>
                      <option value="Railway Exams">Railway Board RRB</option>
                      <option value="SSC Exams">Staff Selection SSC</option>
                      <option value="Banking Exams">Banking IBPS / SBI</option>
                      <option value="Defence Exams">Police Bharti / NDA</option>
                      <option value="State Exams">Other State board Exams</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">Timer Duration (Minutes) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={180}
                      value={newMockDuration}
                      onChange={(e) => setNewMockDuration(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00]"
                    />
                  </div>
                </div>

                {/* Question builder cards */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">Compile MCQ Question Stack</h3>
                    <span className="text-xs text-slate-400 font-mono">Compiled: {newMockQuestions.length} Questions</span>
                  </div>

                  {newMockQuestions.map((questionBlock, index) => (
                    <div key={index} className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 md:p-6 space-y-4 relative">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                        <span className="font-mono text-xs font-bold text-slate-700">QUESTION #{index + 1}</span>
                        {newMockQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestionFromMockForm(index)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs"
                          >
                            Remove Block
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Question Statement / Text *</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Which Governor-General of India abolished the Sati practice?"
                          value={questionBlock.question}
                          onChange={(e) => {
                            const updated = [...newMockQuestions];
                            updated[index].question = e.target.value;
                            setNewMockQuestions(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {questionBlock.options.map((option, optIdx) => (
                          <div key={optIdx}>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Option {String.fromCharCode(65 + optIdx)} *</label>
                            <input
                              type="text"
                              required
                              placeholder={`Option text value`}
                              value={option}
                              onChange={(e) => {
                                const updated = [...newMockQuestions];
                                updated[index].options[optIdx] = e.target.value;
                                setNewMockQuestions(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#ff6f00]"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/50 pt-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Correct Answer Index *</label>
                          <select
                            value={questionBlock.correctAnswer}
                            onChange={(e) => {
                              const updated = [...newMockQuestions];
                              updated[index].correctAnswer = Number(e.target.value);
                              setNewMockQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#ff6f00]"
                          >
                            <option value={0}>Option A (First index)</option>
                            <option value={1}>Option B (Second index)</option>
                            <option value={2}>Option C (Third index)</option>
                            <option value={3}>Option D (Fourth index)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Answer Explanation & Citations</label>
                          <input
                            type="text"
                            placeholder="Passed in 1829 by Lord William Bentinck declaring practice illegal..."
                            value={questionBlock.explanation}
                            onChange={(e) => {
                              const updated = [...newMockQuestions];
                              updated[index].explanation = e.target.value;
                              setNewMockQuestions(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#ff6f00]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addQuestionToMockForm}
                    className="w-full bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 text-slate-600 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Add New Question Block</span>
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="submit"
                    className="bg-[#ff6f00] hover:bg-[#e65100] text-white text-xs font-black px-6 py-3 rounded-lg transition-all shadow-md uppercase tracking-widest cursor-pointer"
                  >
                    🚀 Save & Deploy Mock Simulator
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* USERS ACCOUNT ROSTER VIEW */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-users-manager">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                    Registered Candidate Accounts
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Auditing user accounts synced in real-time from Firestore's <code>user_profiles</code> collection.
                  </p>
                </div>
                
                <button
                  onClick={fetchDbRecords}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold py-2.5 px-4 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={13} className={loadingDb ? "animate-spin" : ""} /> Sync Cloud Records
                </button>
              </div>

              {/* Users search */}
              <div className="flex items-center gap-2 max-w-xs">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#ff6f00]"
                  />
                </div>
              </div>

              {/* Users List Data Grid */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-mono">
                        <th className="p-3">User UID / Email</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">WhatsApp / Contact</th>
                        <th className="p-3">State / Region</th>
                        <th className="p-3">Exam Preference</th>
                        <th className="p-3">Alerts Toggled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {dbProfiles
                        .filter(u => 
                          (u.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phoneNumber || "").includes(searchQuery)
                        )
                        .map((u) => (
                          <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3">
                              <code className="text-[10px] text-slate-400 font-mono block select-all">{u.userId}</code>
                              <span className="text-slate-950 font-bold block mt-0.5">{u.email || "aspirant@maziexam.com"}</span>
                            </td>
                            <td className="p-3 font-bold text-slate-900">{u.fullName || "N/A"}</td>
                            <td className="p-3 font-mono text-slate-700">{u.phoneNumber || "N/A"}</td>
                            <td className="p-3">{u.state || "N/A"}</td>
                            <td className="p-3">
                              <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded">
                                {u.examPreference || "General"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                u.notificationsActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-400"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.notificationsActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                                {u.notificationsActive ? "ENABLED" : "MUTED"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TOTAL REGISTRATION / LEADS ANALYTICS */}
          {activeTab === "total_registration" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-total-registrations">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                    Total Registrations & Analytics
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Visualizing user analytics, subscription leads, and batch application indicators from firestore.
                  </p>
                </div>
                
                <button
                  onClick={fetchDbRecords}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold py-2.5 px-4 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RefreshCw size={13} className={loadingDb ? "animate-spin" : ""} /> RE-RUN QUERIES
                </button>
              </div>

              {/* BENTO STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Sync User Profiles</span>
                  <div className="text-2xl font-black text-[#004aad] font-mono mt-1">{dbProfiles.length}</div>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Cloud Synchronized</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Classroom Leads</span>
                  <div className="text-2xl font-black text-amber-600 font-mono mt-1">{dbLeads.length}</div>
                  <span className="text-[10px] text-amber-600 font-bold block mt-1">Pending Batch Invites</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Ad-campaign Reach</span>
                  <div className="text-2xl font-black text-emerald-600 font-mono mt-1">94.2%</div>
                  <span className="text-[10px] text-slate-400 block mt-1">WCAG Access Compliant</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Mock attempts logged</span>
                  <div className="text-2xl font-black text-slate-800 font-mono mt-1">1,248</div>
                  <span className="text-[10px] text-sky-600 font-semibold block mt-1">Unlimited Pass Holder</span>
                </div>
              </div>

              {/* Datatable for classroom_leads submissions */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span>📬 Classroom Batch Leads & Application Tracker</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">Aspirant Submissions</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono">
                        <th className="p-3">Applicant Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">WhatsApp / Contact</th>
                        <th className="p-3">Preferred Batch Choice</th>
                        <th className="p-3 font-mono">Time Submitted</th>
                        <th className="p-3 text-right">Operation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {dbLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{lead.fullName}</td>
                          <td className="p-3 font-mono text-slate-700">{lead.email}</td>
                          <td className="p-3 font-mono text-slate-700">{lead.phoneNumber}</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                              {lead.preferredBatch}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">
                            {new Date(lead.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.fullName)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* EMPLOYMENT ACE COACHING MODULES */}
          {activeTab === "employment_ace" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-employment-ace">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                  Employment Ace - Specialized Coaching Modules
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust pricing, features, batch dates and active status of premium coaching batches commencing online.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coachingModules.map((module) => (
                  <div key={module.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase font-mono">
                          {module.status}
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {module.duration}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {module.name}
                      </h4>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-600 font-mono">₹{module.price}</span>
                        <span className="text-xs text-slate-400 uppercase font-bold font-mono">/ One-time fee</span>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Verified Students Enrolled:</span>
                          <span className="font-bold text-slate-800">{module.enrolled}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => {
                          const newPrice = prompt(`Enter new price (₹) for "${module.name}":`, String(module.price));
                          if (newPrice && !isNaN(Number(newPrice))) {
                            setCoachingModules(coachingModules.map(m => m.id === module.id ? { ...m, price: Number(newPrice) } : m));
                            alert("Coaching package price successfully updated!");
                          }
                        }}
                        className="flex-1 text-center bg-slate-100 hover:bg-[#004aad] text-slate-700 hover:text-white py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Adjust Pricing
                      </button>
                      <button
                        onClick={() => {
                          const targetState = module.status === "Active" ? "Suspended" : "Active";
                          setCoachingModules(coachingModules.map(m => m.id === module.id ? { ...m, status: targetState } : m));
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors text-xs font-bold"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SYSTEM SETTINGS CONTROL TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-settings">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                  Site-wide System Configurations
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manipulate system global settings, sitemaps index, GA4 tracking codes, and meta template definitions safely.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-8 shadow-xs space-y-6 text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title & Support */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b pb-2">Global Meta Settings</h3>
                    
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Primary Application Title</label>
                      <input
                        type="text"
                        value={primaryTitle}
                        onChange={(e) => setPrimaryTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Administrative Support Email</label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00]"
                      />
                    </div>
                  </div>

                  {/* SEO & GA4 */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b pb-2">SEO & Tracking</h3>
                    
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Google Analytics 4 Measurement ID</label>
                      <input
                        type="text"
                        value={ga4Key}
                        onChange={(e) => setGa4Key(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Sarkari SEO Description Template</label>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff6f00]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sitemap XML definition view */}
                <div className="border-t border-slate-100 pt-6 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Dynamic Sitemap & Indexation Directories</h4>
                  <p className="text-xs text-slate-400">
                    The sitemap system parses registered categories and routes. Ensure your crawler indexes have been fully saved before updating.
                  </p>
                  
                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto">
                    <div>&lt;?xml version="1.1" encoding="UTF-8"?&gt;</div>
                    <div>&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;</div>
                    <div className="pl-4 text-emerald-400">&lt;!-- Primary App Segment Indexes --&gt;</div>
                    <div className="pl-4">&lt;url&gt;&lt;loc&gt;https://maziexam.com/&lt;/loc&gt;&lt;priority&gt;1.0&lt;/priority&gt;&lt;/url&gt;</div>
                    <div className="pl-4">&lt;url&gt;&lt;loc&gt;https://maziexam.com/Uniex&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</div>
                    <div className="pl-4">&lt;url&gt;&lt;loc&gt;https://maziexam.com/jobs&lt;/loc&gt;&lt;priority&gt;0.9&lt;/priority&gt;&lt;/url&gt;</div>
                    <div className="pl-4">&lt;url&gt;&lt;loc&gt;https://maziexam.com/mock&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</div>
                    <div className="pl-4">&lt;url&gt;&lt;loc&gt;https://maziexam.com/pdf&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</div>
                    <div className="pl-4 text-slate-500">&lt;!-- Dynamic compiled sitemaps counts: {jobAlerts.length} jobs, {mockTests.length} mocks --&gt;</div>
                    <div>&lt;/urlset&gt;</div>
                  </div>
                </div>

                {/* Operations */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={handleRestoreDefaults}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-red-200"
                  >
                    Wipe State Cache & Restore Defaults
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="bg-[#ff6f00] hover:bg-[#e65100] text-white text-xs font-black px-6 py-2.5 rounded-lg transition-all shadow-md uppercase tracking-wider cursor-pointer"
                  >
                    Save configurations
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* QUICK JOB ALERTS DRAWER MODAL */}
      {jobModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="quick-add-job-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 text-left">
            <div className="bg-[#004aad] text-white p-5 sticky top-0 flex justify-between items-center z-10">
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                {editingJob ? "Modify Job Alert Bulletin" : "Create New Job Alert Bulletin"}
              </h3>
              <button 
                onClick={() => setJobModalOpen(false)} 
                className="text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-all font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Recruitment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPSC State Services 2026"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPSC"
                    value={jobForm.organization}
                    onChange={(e) => setJobForm({ ...jobForm, organization: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category Sector *</label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  >
                    <option value="Government">Government Sector (Sarkari)</option>
                    <option value="Private">Private Corporate Sector</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Post Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deputy Collector"
                    value={jobForm.postName}
                    onChange={(e) => setJobForm({ ...jobForm, postName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Vacancies Count *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 513 Posts"
                    value={jobForm.vacancies}
                    onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Salary / Compensation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹56,100 - ₹1,77,500/month"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Last Application Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="July 30, 2026"
                    value={jobForm.lastDate}
                    onChange={(e) => setJobForm({ ...jobForm, lastDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Qualifications Criteria *</label>
                  <input
                    type="text"
                    required
                    placeholder="Graduate degree in any stream"
                    value={jobForm.qualification}
                    onChange={(e) => setJobForm({ ...jobForm, qualification: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Official Portal URL Link *</label>
                <input
                  type="text"
                  required
                  placeholder="https://mpsc.gov.in"
                  value={jobForm.link}
                  onChange={(e) => setJobForm({ ...jobForm, link: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Detailed Recruitment Information</label>
                <textarea
                  rows={3}
                  placeholder="Provide any additional syllabus points, age limits, or steps to apply..."
                  value={jobForm.details}
                  onChange={(e) => setJobForm({ ...jobForm, details: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save Alert Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD PAPER PDF MODAL */}
      {pdfModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="quick-add-pdf-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 text-left">
            <div className="bg-[#004aad] text-white p-5 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                {editingPdf ? "Modify PYQ PDF Solution" : "Append New PYQ PDF Solution"}
              </h3>
              <button 
                onClick={() => setPdfModalOpen(false)} 
                className="text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-all font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePdfSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">PDF Booklet Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MPSC Rajyaseva GS Paper I PYQ (2025)"
                  value={pdfForm.title}
                  onChange={(e) => setPdfForm({ ...pdfForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Document Year *</label>
                  <input
                    type="text"
                    required
                    placeholder="2025"
                    value={pdfForm.year}
                    onChange={(e) => setPdfForm({ ...pdfForm, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="General Studies"
                    value={pdfForm.subject}
                    onChange={(e) => setPdfForm({ ...pdfForm, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Exam category tag *</label>
                  <select
                    value={pdfForm.category}
                    onChange={(e) => setPdfForm({ ...pdfForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  >
                    <option value="MPSC">MPSC State Services</option>
                    <option value="UPSC">UPSC Civil Services</option>
                    <option value="Railway Exams">Railway Board RRB</option>
                    <option value="SSC Exams">Staff Selection SSC</option>
                    <option value="Banking Exams">Banking IBPS / SBI</option>
                    <option value="Defence Exams">Police Bharti / NDA</option>
                    <option value="State Exams">Other State board Exams</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Questions Count *</label>
                  <input
                    type="number"
                    required
                    value={pdfForm.questionsCount}
                    onChange={(e) => setPdfForm({ ...pdfForm, questionsCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">PDF File Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2.4 MB"
                    value={pdfForm.fileSize}
                    onChange={(e) => setPdfForm({ ...pdfForm, fileSize: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Download Tracker URL</label>
                <input
                  type="text"
                  required
                  placeholder="#"
                  value={pdfForm.downloadUrl}
                  onChange={(e) => setPdfForm({ ...pdfForm, downloadUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save PYQ Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
