import re

with open('src/components/UniexControlPanel.tsx', 'r') as f:
    content = f.read()

# Add import
import_str = 'import { defaultBanners, HomeBanner } from "../bannerData";'
new_import_str = 'import { defaultBanners, HomeBanner } from "../bannerData";\nimport { defaultJobFilters, JobFilterToggle } from "../jobFiltersData";'
content = content.replace(import_str, new_import_str)

# Add to activeTab type
activeTab_str = '    "editors_tools" | "jobs" | "gov_jobs" | "private_jobs" | "live_mock_test" | "create_mock_test" | "users" | "pdfs" | "settings" | "total_registration" | "employment_ace" | "homepage_banners"'
new_activeTab_str = '    "editors_tools" | "jobs" | "gov_jobs" | "private_jobs" | "live_mock_test" | "create_mock_test" | "users" | "pdfs" | "settings" | "total_registration" | "employment_ace" | "homepage_banners" | "job_filters"'
content = content.replace(activeTab_str, new_activeTab_str)

# Add state and effect
state_str = """  // Home Banners state
  const [editingBanners, setEditingBanners] = useState<HomeBanner[]>(defaultBanners);
  const [savingBanners, setSavingBanners] = useState(false);"""

new_state_str = """  // Home Banners state
  const [editingBanners, setEditingBanners] = useState<HomeBanner[]>(defaultBanners);
  const [savingBanners, setSavingBanners] = useState(false);

  // Job Filters state
  const [editingJobFilters, setEditingJobFilters] = useState<JobFilterToggle[]>(defaultJobFilters);
  const [savingJobFilters, setSavingJobFilters] = useState(false);"""
content = content.replace(state_str, new_state_str)

effect_str = """  useEffect(() => {
    if (activeTab === "homepage_banners") {
      const fetchBanners = async () => {
        try {
          const settingsDoc = await getDoc(doc(db, "settings", "homepage_banners"));
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            if (data.banners && Array.isArray(data.banners)) {
              setEditingBanners(data.banners);
            }
          }
        } catch (err) {
          console.error("Error fetching homepage banners:", err);
        }
      };
      fetchBanners();
    }
  }, [activeTab]);"""

new_effect_str = """  useEffect(() => {
    if (activeTab === "homepage_banners") {
      const fetchBanners = async () => {
        try {
          const settingsDoc = await getDoc(doc(db, "settings", "homepage_banners"));
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            if (data.banners && Array.isArray(data.banners)) {
              setEditingBanners(data.banners);
            }
          }
        } catch (err) {
          console.error("Error fetching homepage banners:", err);
        }
      };
      fetchBanners();
    }
    
    if (activeTab === "job_filters") {
      const fetchFilters = async () => {
        try {
          const filterDoc = await getDoc(doc(db, "settings", "job_filter_toggles"));
          if (filterDoc.exists()) {
            const data = filterDoc.data();
            if (data.filters && Array.isArray(data.filters)) {
              setEditingJobFilters(data.filters);
            }
          }
        } catch (err) {
          console.error("Error fetching job filters:", err);
        }
      };
      fetchFilters();
    }
  }, [activeTab]);"""
content = content.replace(effect_str, new_effect_str)

save_str = """  const handleSaveBanners = async () => {
    setSavingBanners(true);
    try {
      await setDoc(doc(db, "settings", "homepage_banners"), { banners: editingBanners });
      alert("Homepage banners updated successfully! Changes will reflect on the homepage immediately.");
    } catch (err: any) {
      alert(`Error saving banners: ${err.message}`);
    }
    setSavingBanners(false);
  };"""

new_save_str = """  const handleSaveBanners = async () => {
    setSavingBanners(true);
    try {
      await setDoc(doc(db, "settings", "homepage_banners"), { banners: editingBanners });
      alert("Homepage banners updated successfully! Changes will reflect on the homepage immediately.");
    } catch (err: any) {
      alert(`Error saving banners: ${err.message}`);
    }
    setSavingBanners(false);
  };

  const handleSaveJobFilters = async () => {
    setSavingJobFilters(true);
    try {
      await setDoc(doc(db, "settings", "job_filter_toggles"), { filters: editingJobFilters });
      alert("Job filters updated successfully! Changes will reflect on the homepage immediately.");
    } catch (err: any) {
      alert(`Error saving job filters: ${err.message}`);
    }
    setSavingJobFilters(false);
  };"""
content = content.replace(save_str, new_save_str)


# Add pill
pill_str = """              { id: "settings", label: "Settings", icon: "⚙️" },
              { id: "homepage_banners", label: "Homepage Banners", icon: "🖼️" }"""

new_pill_str = """              { id: "settings", label: "Settings", icon: "⚙️" },
              { id: "homepage_banners", label: "Homepage Banners", icon: "🖼️" },
              { id: "job_filters", label: "Job Filters", icon: "🔍" }"""
content = content.replace(pill_str, new_pill_str)

# Add tab UI
tab_target = """          )}

        </main>
      </div>"""

new_tab_str = """          )}

          {/* JOB FILTERS CONTROL TAB */}
          {activeTab === "job_filters" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-job-filters">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                    Job Filter Toggles Configuration
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the job filter toggles shown on the main landing page.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingJobFilters([...editingJobFilters, { id: `new-filter-${Date.now()}`, label: "New Filter", colorClass: "bg-slate-600" }]);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors"
                  >
                    + Add Filter
                  </button>
                  <button
                    onClick={handleSaveJobFilters}
                    disabled={savingJobFilters}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-2"
                  >
                    {savingJobFilters ? "Saving..." : "Save Filters"}
                  </button>
                </div>
              </div>

              <div className="space-y-6 text-left">
                {editingJobFilters.map((filter, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm relative">
                    <button 
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                      onClick={() => {
                        const updated = [...editingJobFilters];
                        updated.splice(index, 1);
                        setEditingJobFilters(updated);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <h3 className="text-sm font-black text-slate-800 uppercase mb-4 border-b pb-2 flex items-center justify-between">
                      Filter {index + 1}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Filter ID (Value)</label>
                        <input
                          type="text"
                          value={filter.id}
                          onChange={(e) => {
                            const updated = [...editingJobFilters];
                            updated[index].id = e.target.value;
                            setEditingJobFilters(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                          placeholder="e.g. all, Government, Private"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Label (Display Name)</label>
                        <input
                          type="text"
                          value={filter.label}
                          onChange={(e) => {
                            const updated = [...editingJobFilters];
                            updated[index].label = e.target.value;
                            setEditingJobFilters(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Color Class (Tailwind)</label>
                        <input
                          type="text"
                          value={filter.colorClass}
                          onChange={(e) => {
                            const updated = [...editingJobFilters];
                            updated[index].colorClass = e.target.value;
                            setEditingJobFilters(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                          placeholder="e.g. bg-[#004aad], bg-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>"""
content = content.replace(tab_target, new_tab_str)

with open('src/components/UniexControlPanel.tsx', 'w') as f:
    f.write(content)
