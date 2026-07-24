import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

original_target = """                        {/* Vacancy Breakdown Table */}
                        <div className="border border-slate-200 rounded-2xl p-5 md:p-6">
                          <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider mb-3 flex items-center gap-1 border-b pb-2">
                            📊 Vacancy Distribution Breakdown
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">"""

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
                            <table className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">"""

content = content.replace(original_target, new_target)

original_target2 = """                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              ⚙️ Selection Process Sequence
                            </h4>
                            <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal leading-relaxed">"""

new_target2 = """                          <div>
                            <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider border-b pb-1.5 mb-2">
                              ⚙️ Selection Process Sequence
                            </h4>
                            {selectedJob.selectionProcessHtml ? (
                              <div 
                                className="text-xs md:text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedJob.selectionProcessHtml }}
                              />
                            ) : (
                            <ol className="text-xs text-slate-600 space-y-2 pl-4 list-decimal leading-relaxed">"""

content = content.replace(original_target2, new_target2)

# Also need to close the tags
original_target3 = """                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>"""

new_target3 = """                                </tr>
                              </tbody>
                            </table>
                          </div>
                          )}
                        </div>"""

content = content.replace(original_target3, new_target3)

original_target4 = """                              <li><strong>Phase III (Formal Document Check):</strong> Verification of age, category credentials, and educational qualification certificates.</li>
                            </ol>
                          </div>"""

new_target4 = """                              <li><strong>Phase III (Formal Document Check):</strong> Verification of age, category credentials, and educational qualification certificates.</li>
                            </ol>
                            )}
                          </div>"""

content = content.replace(original_target4, new_target4)


with open('src/App.tsx', 'w') as f:
    f.write(content)

