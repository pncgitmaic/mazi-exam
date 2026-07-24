import re

with open('src/components/UniexControlPanel.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
import_block = """import { 
  Briefcase,"""
new_import_block = """import { defaultBanners, HomeBanner } from "../bannerData";
import { 
  Briefcase,"""
content = content.replace(import_block, new_import_block)

# 2. Add state and effect
state_block = """  // Forms data bindings
  const [jobForm, setJobForm] = useState<Omit<JobAlert, "id">>({"""

new_state_block = """  // Home Banners state
  const [editingBanners, setEditingBanners] = useState<HomeBanner[]>(defaultBanners);
  const [savingBanners, setSavingBanners] = useState(false);

  useEffect(() => {
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
  }, [activeTab]);

  const handleSaveBanners = async () => {
    setSavingBanners(true);
    try {
      await setDoc(doc(db, "settings", "homepage_banners"), { banners: editingBanners });
      alert("Homepage banners updated successfully! Changes will reflect on the homepage immediately.");
    } catch (err: any) {
      alert(`Error saving banners: ${err.message}`);
    }
    setSavingBanners(false);
  };

  // Forms data bindings
  const [jobForm, setJobForm] = useState<Omit<JobAlert, "id">>({"""
content = content.replace(state_block, new_state_block)

with open('src/components/UniexControlPanel.tsx', 'w') as f:
    f.write(content)
