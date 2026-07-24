with open('src/components/UniexControlPanel.tsx', 'r') as f:
    content = f.read()

target = """          )}

        </main>
      </div>"""

new_tab = """          )}

          {/* HOMEPAGE BANNERS CONTROL TAB */}
          {activeTab === "homepage_banners" && (
            <div className="space-y-6 animate-fadeIn" id="uniex-homepage-banners">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">
                    Homepage Banners Configuration
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the promotional slider banners on the main landing page.
                  </p>
                </div>
                <button
                  onClick={handleSaveBanners}
                  disabled={savingBanners}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-2"
                >
                  {savingBanners ? "Saving..." : "Save Banners"}
                </button>
              </div>

              <div className="space-y-6 text-left">
                {editingBanners.map((banner, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase mb-4 border-b pb-2 flex items-center justify-between">
                      Slide {index + 1}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Heading (Title)</label>
                        <input
                          type="text"
                          value={banner.heading}
                          onChange={(e) => {
                            const updated = [...editingBanners];
                            updated[index].heading = e.target.value;
                            setEditingBanners(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={banner.description}
                          onChange={(e) => {
                            const updated = [...editingBanners];
                            updated[index].description = e.target.value;
                            setEditingBanners(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Button Text</label>
                        <input
                          type="text"
                          value={banner.buttonText}
                          onChange={(e) => {
                            const updated = [...editingBanners];
                            updated[index].buttonText = e.target.value;
                            setEditingBanners(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#004aad]"
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

content = content.replace(target, new_tab)

with open('src/components/UniexControlPanel.tsx', 'w') as f:
    f.write(content)

