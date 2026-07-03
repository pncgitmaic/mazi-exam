import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  LogOut, 
  Loader2, 
  Award, 
  History, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  OperationType,
  handleFirestoreError
} from "../firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export function AuthModal({ isOpen, onClose, currentUser }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile status
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Clear states on close or tab change
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setDisplayName("");
    }
  }, [isOpen, tab]);

  // Load user test attempts when profile is viewed
  useEffect(() => {
    if (currentUser && isOpen) {
      loadUserAttempts();
    }
  }, [currentUser, isOpen]);

  const loadUserAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const attemptsRef = collection(db, "test_attempts");
      const q = query(
        attemptsRef,
        where("userId", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      // Sort by timestamp local fallback (since ordering requires custom Firestore index)
      fetched.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAttempts(fetched);
    } catch (e) {
      console.error("Error loading attempts:", e);
      handleFirestoreError(e, OperationType.GET, "test_attempts");
    } finally {
      setLoadingAttempts(false);
    }
  };

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "An error occurred during sign-in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      setSuccessMsg("Account created successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError(err.message || "An error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setSuccessMsg("Signed out successfully.");
      setAttempts([]);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col relative overflow-hidden max-h-[90vh]"
        id="auth-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white" id="auth-modal-header">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-[#004aad] w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900">
              {currentUser ? "My Profile" : tab === "signin" ? "Sign In to maziexam" : "Create Account"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            id="auth-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-left" id="auth-modal-content">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md text-red-700 flex items-start gap-2.5 text-sm" id="auth-error-alert">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-md text-green-700 flex items-start gap-2.5 text-sm" id="auth-success-alert">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            /* PROFILE VIEW */
            <div className="space-y-6" id="profile-container">
              {/* User badge */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100" id="profile-header-card">
                <div className="w-14 h-14 rounded-full bg-[#004aad] text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md">
                  {currentUser.displayName ? currentUser.displayName[0] : currentUser.email ? currentUser.email[0] : "?"}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{currentUser.displayName || "Aspirant"}</h4>
                  <p className="text-sm text-gray-500 font-medium">{currentUser.email}</p>
                </div>
              </div>

              {/* Stats & History */}
              <div className="space-y-3" id="profile-history-section">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-base">
                  <History size={18} className="text-[#004aad]" />
                  <span>My Mock Test Attempts ({attempts.length})</span>
                </div>

                {loadingAttempts ? (
                  <div className="py-8 flex flex-col items-center justify-center text-gray-400" id="history-loading">
                    <Loader2 className="w-8 h-8 animate-spin text-[#004aad]" />
                    <span className="text-xs mt-2">Loading attempts...</span>
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-gray-200 rounded-xl px-4" id="history-empty">
                    <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No mock tests attempted yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start a Mock Test from the Portal to track your history here!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1" id="history-list">
                    {attempts.map((attempt) => (
                      <div 
                        key={attempt.id} 
                        className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between hover:border-gray-200 transition-colors"
                        id={`attempt-card-${attempt.id}`}
                      >
                        <div className="text-left">
                          <p className="font-bold text-sm text-gray-900 line-clamp-1">{attempt.testTitle || "Mock Test"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {attempt.timestamp ? new Date(attempt.timestamp).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : "Recent"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full text-green-700 font-bold text-xs shrink-0">
                          <Award size={12} />
                          <span>{attempt.score} / {attempt.totalQuestions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                id="profile-signout-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* LOGIN / REGISTER TABS & FORM */
            <div className="space-y-5" id="auth-forms-container">
              {/* Tab Toggles */}
              <div className="flex bg-slate-100 p-1 rounded-xl" id="auth-tab-buttons">
                <button
                  type="button"
                  onClick={() => setTab("signin")}
                  className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    tab === "signin" ? "bg-white text-[#004aad] shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                  id="tab-signin-toggle"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className={`flex-1 text-center py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    tab === "register" ? "bg-white text-[#004aad] shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                  id="tab-register-toggle"
                >
                  Register
                </button>
              </div>

              {tab === "signin" ? (
                /* SIGN IN FORM */
                <form onSubmit={handleSignIn} className="space-y-4" id="signin-form">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] outline-none text-sm transition-all font-medium text-gray-800"
                        id="signin-email-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] outline-none text-sm transition-all font-medium text-gray-800"
                        id="signin-password-input"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#004aad] hover:bg-[#003d91] active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-md shadow-[#004aad]/10 hover:shadow-[#004aad]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    id="signin-submit-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>
              ) : (
                /* REGISTER FORM */
                <form onSubmit={handleRegister} className="space-y-4" id="register-form">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text"
                        placeholder="John Doe"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] outline-none text-sm transition-all font-medium text-gray-800"
                        id="register-name-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] outline-none text-sm transition-all font-medium text-gray-800"
                        id="register-email-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Password (min 6 chars)</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] outline-none text-sm transition-all font-medium text-gray-800"
                        id="register-password-input"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#004aad] hover:bg-[#003d91] active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-md shadow-[#004aad]/10 hover:shadow-[#004aad]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    id="register-submit-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
