export interface JobFilterToggle {
  id: string;
  label: string;
  colorClass: string;
}

export const defaultJobFilters: JobFilterToggle[] = [
  { id: "all", label: "All Jobs", colorClass: "bg-[#004aad]" },
  { id: "Government", label: "Govt Jobs", colorClass: "bg-amber-600" },
  { id: "Private", label: "Private Jobs", colorClass: "bg-indigo-600" }
];
