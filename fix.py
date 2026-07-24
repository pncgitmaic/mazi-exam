import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

bad_block = """                        🔒 {t("Secure Password                        {/* Vacancy Breakdown Table */}
                        <div className="border border-slate-200 rounded-2xl p-5 md:p-6">
                          <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider mb-3 flex items-center gap-1 border-b pb-2">
                            📊 Vacancy Distribution Breakdown
                          </h4>
                          {selectedJob.vacancyTableHtml ? (
                            <div 
                              className="text-xs md:text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: selectedJob.vacancyTableHtml }}
                            />
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                                    <th className="p-2.5">Category Class</th>
                                    <th className="p-2.5">Seat Distribution (Percentage)</th>
                                    <th className="p-2.5">Estimated Posts</th>
                                    <th className="p-2.5">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  <tr>
                                    <td className="p-2.5 font-bold">Unreserved / General (UR)</td>
                                    <td className="p-2.5">38%</td>
                                    <td className="p-2.5 font-mono">195 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Other Backward Classes (OBC)</td>
                                    <td className="p-2.5">19%</td>
                                    <td className="p-2.5 font-mono">97 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Economically Weaker Section (EWS)</td>
                                    <td className="p-2.5">10%</td>
                                    <td className="p-2.5 font-mono">51 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Scheduled Castes (SC)</td>
                                    <td className="p-2.5">13%</td>
                                    <td className="p-2.5 font-mono">67 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Scheduled Tribes (ST)</td>
                                    <td className="p-2.5">7%</td>
                                    <td className="p-2.5 font-mono">36 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr className="bg-slate-50 font-extrabold text-slate-900 border-t">
                                    <td className="p-2.5">Total Available Posts</td>
                                    <td className="p-2.5">100%</td>
                                    <td className="p-2.5 font-mono">{selectedJob.vacancies}</td>
                                    <td className="p-2.5 text-[#004aad]">Full Capacity</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Post Eligibility and Details */}
                        <div className="border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              🎓 Minimum Eligibility Criteria
                            </h4>
                            <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                              💡 {selectedJob.qualification}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              ⚙️ Selection Process Sequence
                            </h4>
                            {selectedJob.selectionProcessHtml ? (
                              <div 
                                className="text-xs md:text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedJob.selectionProcessHtml }}
                              />
                            ) : (
                              <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal leading-relaxed">
                                <li><strong>Phase I (Written Examination):</strong> Multiple Choice Questions (Bilingual standard) covering GS and mental ability.</li>
                                <li><strong>Phase II (Physical Fitness Evaluation / Technical Skill Test):</strong> Wherever explicitly applicable based on post requirements.</li>
                                <li><strong>Phase III (Formal Document Check):</strong> Verification of age, category credentials, and educational qualification certificates.</li>
                              </ol>
                            )}
                          </div>slate-100 p-2.5 rounded-lg flex justify-between items-center text-[10px] font-mono">"""

good_block = """                        🔒 {t("Secure Password Recovery")}
                      </h5>
                      <p className="text-xs text-slate-500 mb-3 text-left">
                        {t("Need to update or forgot your password? Trigger secure password reset instructions directly to your registered email.")}
                      </p>
                      <button
                        onClick={async () => {
                          if (currentUser?.email) {
                            try {
                              await sendPasswordResetEmail(auth, currentUser.email);
                              alert(`✓ Password reset email successfully sent to ${currentUser.email}! Please verify your spam folder.`);
                            } catch (err: any) {
                              alert(`Error sending reset link: ${err.message}`);
                            }
                          }
                        }}
                        className="text-xs bg-white border border-slate-200 hover:border-[#004aad] hover:text-[#004aad] text-slate-700 font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                      >
                        📬 {t("Send Password Reset Email")}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: History & Subscriptions */}
                  <div className="space-y-6">
                    {/* Subscriptions Card */}
                    <div className="border border-slate-100 rounded-2xl p-5 md:p-6 bg-slate-50/20 shadow-3xs">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b pb-2 flex items-center gap-1">
                        💳 {t("My Subscriptions")}
                      </h4>
                      <div className="mt-4">
                        {hasPortalPass ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs font-semibold space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-mono text-amber-700 font-black">
                              <span>PREMIUM PASS STATUS</span>
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">ACTIVE</span>
                            </div>
                            <p className="text-xs font-bold">₹80 Selection Pass or ₹50 Practice Pack is currently tied to your database profile.</p>
                            <p className="text-[10px] text-amber-600 font-mono">Unlock all PYQ PDFs, full timer analysis, and limitless exam attempts.</p>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-xs text-center space-y-3">
                            <p className="font-semibold text-slate-500">You are on the Free Academic Sandbox tier.</p>
                            <button
                              onClick={() => {
                                setCurrentPage("selection");
                              }}
                              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-xs py-2 rounded-lg transition-all shadow-3xs cursor-pointer"
                            >
                              🚀 Unlock ₹50 / ₹80 Pass
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Practice History Card */}
                    <div className="border border-slate-100 rounded-2xl p-5 md:p-6 bg-slate-50/20 shadow-3xs">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b pb-2 flex items-center gap-1">
                        📊 {t("My Practice History")}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solved Mocks</span>
                          <span className="text-xl font-black text-[#004aad] font-mono">{solvedAttempts.length}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Score</span>
                          <span className="text-xl font-black text-emerald-600 font-mono">
                            {solvedAttempts.length > 0 
                              ? `${Math.round(solvedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / solvedAttempts.length)}%`
                              : "0%"
                            }
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {loadingAttempts ? (
                          <p className="text-xs text-slate-400 italic text-center py-2">Syncing database logs...</p>
                        ) : solvedAttempts.length > 0 ? (
                          solvedAttempts.map((attempt, index) => (
                            <div key={index} className="bg-white border border-slate-100 p-2.5 rounded-lg flex justify-between items-center text-[10px] font-mono">"""

if bad_block in content:
    content = content.replace(bad_block, good_block)
    print("Fixed bad block 1")
else:
    print("Could not find bad block 1")

# Now I need to do the target replacement where it actually belongs!
original_target = """                        {/* Vacancy Breakdown Table */}
                        <div className="border border-slate-200 rounded-2xl p-5 md:p-6">
                          <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider mb-3 flex items-center gap-1 border-b pb-2">
                            📊 Vacancy Distribution Breakdown
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                                  <th className="p-2.5">Category Class</th>
                                  <th className="p-2.5">Seat Distribution (Percentage)</th>
                                  <th className="p-2.5">Estimated Posts</th>
                                  <th className="p-2.5">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                <tr>
                                  <td className="p-2.5 font-bold">Unreserved / General (UR)</td>
                                  <td className="p-2.5">38%</td>
                                  <td className="p-2.5 font-mono">195 Posts</td>
                                  <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 font-bold">Other Backward Classes (OBC)</td>
                                  <td className="p-2.5">19%</td>
                                  <td className="p-2.5 font-mono">97 Posts</td>
                                  <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 font-bold">Economically Weaker Section (EWS)</td>
                                  <td className="p-2.5">10%</td>
                                  <td className="p-2.5 font-mono">51 Posts</td>
                                  <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 font-bold">Scheduled Castes (SC)</td>
                                  <td className="p-2.5">13%</td>
                                  <td className="p-2.5 font-mono">67 Posts</td>
                                  <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                </tr>
                                <tr>
                                  <td className="p-2.5 font-bold">Scheduled Tribes (ST)</td>
                                  <td className="p-2.5">7%</td>
                                  <td className="p-2.5 font-mono">36 Posts</td>
                                  <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                </tr>
                                <tr className="bg-slate-50 font-extrabold text-slate-900 border-t">
                                  <td className="p-2.5">Total Available Posts</td>
                                  <td className="p-2.5">100%</td>
                                  <td className="p-2.5 font-mono">{selectedJob.vacancies}</td>
                                  <td className="p-2.5 text-[#004aad]">Full Capacity</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Post Eligibility and Details */}
                        <div className="border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              🎓 Minimum Eligibility Criteria
                            </h4>
                            <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                              💡 {selectedJob.qualification}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              ⚙️ Selection Process Sequence
                            </h4>
                            <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal leading-relaxed">
                              <li><strong>Phase I (Written Examination):</strong> Multiple Choice Questions (Bilingual standard) covering GS and mental ability.</li>
                              <li><strong>Phase II (Physical Fitness Evaluation / Technical Skill Test):</strong> Wherever explicitly applicable based on post requirements.</li>
                              <li><strong>Phase III (Formal Document Check):</strong> Verification of age, category credentials, and educational qualification certificates.</li>
                            </ol>
                          </div>"""

new_target = """                        {/* Vacancy Breakdown Table */}
                        <div className="border border-slate-200 rounded-2xl p-5 md:p-6">
                          <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider mb-3 flex items-center gap-1 border-b pb-2">
                            📊 Vacancy Distribution Breakdown
                          </h4>
                          {selectedJob.vacancyTableHtml ? (
                            <div 
                              className="text-xs md:text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: selectedJob.vacancyTableHtml }}
                            />
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                                    <th className="p-2.5">Category Class</th>
                                    <th className="p-2.5">Seat Distribution (Percentage)</th>
                                    <th className="p-2.5">Estimated Posts</th>
                                    <th className="p-2.5">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  <tr>
                                    <td className="p-2.5 font-bold">Unreserved / General (UR)</td>
                                    <td className="p-2.5">38%</td>
                                    <td className="p-2.5 font-mono">195 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Other Backward Classes (OBC)</td>
                                    <td className="p-2.5">19%</td>
                                    <td className="p-2.5 font-mono">97 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Economically Weaker Section (EWS)</td>
                                    <td className="p-2.5">10%</td>
                                    <td className="p-2.5 font-mono">51 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Scheduled Castes (SC)</td>
                                    <td className="p-2.5">13%</td>
                                    <td className="p-2.5 font-mono">67 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2.5 font-bold">Scheduled Tribes (ST)</td>
                                    <td className="p-2.5">7%</td>
                                    <td className="p-2.5 font-mono">36 Posts</td>
                                    <td className="p-2.5 text-emerald-600 font-bold">Available</td>
                                  </tr>
                                  <tr className="bg-slate-50 font-extrabold text-slate-900 border-t">
                                    <td className="p-2.5">Total Available Posts</td>
                                    <td className="p-2.5">100%</td>
                                    <td className="p-2.5 font-mono">{selectedJob.vacancies}</td>
                                    <td className="p-2.5 text-[#004aad]">Full Capacity</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Post Eligibility and Details */}
                        <div className="border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              🎓 Minimum Eligibility Criteria
                            </h4>
                            <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                              💡 {selectedJob.qualification}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              ⚙️ Selection Process Sequence
                            </h4>
                            {selectedJob.selectionProcessHtml ? (
                              <div 
                                className="text-xs md:text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedJob.selectionProcessHtml }}
                              />
                            ) : (
                              <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal leading-relaxed">
                                <li><strong>Phase I (Written Examination):</strong> Multiple Choice Questions (Bilingual standard) covering GS and mental ability.</li>
                                <li><strong>Phase II (Physical Fitness Evaluation / Technical Skill Test):</strong> Wherever explicitly applicable based on post requirements.</li>
                                <li><strong>Phase III (Formal Document Check):</strong> Verification of age, category credentials, and educational qualification certificates.</li>
                              </ol>
                            )}
                          </div>"""

if original_target in content:
    content = content.replace(original_target, new_target)
    print("Fixed target 2")
else:
    print("Could not find target 2")

with open('src/App.tsx', 'w') as f:
    f.write(content)

