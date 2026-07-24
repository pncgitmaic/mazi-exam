import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
import_str = 'import { defaultBanners, HomeBanner } from "./bannerData";'
new_import_str = 'import { defaultBanners, HomeBanner } from "./bannerData";\nimport { defaultJobFilters, JobFilterToggle } from "./jobFiltersData";'
content = content.replace(import_str, new_import_str)

# Add state
state_str = 'const [homeBanners, setHomeBanners] = useState<HomeBanner[]>(defaultBanners);'
new_state_str = 'const [homeBanners, setHomeBanners] = useState<HomeBanner[]>(defaultBanners);\n  const [jobFilters, setJobFilters] = useState<JobFilterToggle[]>(defaultJobFilters);'
content = content.replace(state_str, new_state_str)

# Add fetch in useEffect
fetch_str = """      try {
        const settingsDoc = await getDoc(doc(db, "settings", "homepage_banners"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.banners && Array.isArray(data.banners)) {
            setHomeBanners(data.banners);
          }
        }
      } catch (err) {
        console.error("Error fetching homepage banners:", err);
      }"""
new_fetch_str = """      try {
        const settingsDoc = await getDoc(doc(db, "settings", "homepage_banners"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.banners && Array.isArray(data.banners)) {
            setHomeBanners(data.banners);
          }
        }
      } catch (err) {
        console.error("Error fetching homepage banners:", err);
      }

      try {
        const filterDoc = await getDoc(doc(db, "settings", "job_filter_toggles"));
        if (filterDoc.exists()) {
          const data = filterDoc.data();
          if (data.filters && Array.isArray(data.filters)) {
            setJobFilters(data.filters);
          }
        }
      } catch (err) {
        console.error("Error fetching job filters:", err);
      }"""
content = content.replace(fetch_str, new_fetch_str)

# Use dynamic toggles in JSX
old_toggles_str = """        {/* PAGE 1: JOB ALERTS ONLY - CATEGORY TOGGLES */}
        {currentPage === "jobs" && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-4 px-4 bg-slate-100/50 rounded-xl border border-slate-200/60 max-w-5xl mx-auto w-full shadow-xs mb-4" id="job-filter-toggles">
            {[
              { id: "all", label: "All Jobs", colorClass: "bg-[#004aad]" },
              { id: "Government", label: "Govt Jobs", colorClass: "bg-amber-600" },
              { id: "Private", label: "Private Jobs", colorClass: "bg-indigo-600" }
            ].map((categoryItem) => ("""

new_toggles_str = """        {/* PAGE 1: JOB ALERTS ONLY - CATEGORY TOGGLES */}
        {currentPage === "jobs" && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-4 px-4 bg-slate-100/50 rounded-xl border border-slate-200/60 max-w-5xl mx-auto w-full shadow-xs mb-4" id="job-filter-toggles">
            {jobFilters.map((categoryItem) => ("""
content = content.replace(old_toggles_str, new_toggles_str)

with open('src/App.tsx', 'w') as f:
    f.write(content)
