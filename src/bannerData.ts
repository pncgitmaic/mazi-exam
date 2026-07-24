export interface HomeBanner {
  heading: string;
  description: string;
  buttonText: string;
}

export const defaultBanners: HomeBanner[] = [
  {
    heading: "Active Government & Private Job Alerts 2026",
    description: "Explore immediate recruitment announcements from top boards including MPSC, UPSC, SSC, and premium private companies like TCS and Infosys.",
    buttonText: "View Job Alerts"
  },
  {
    heading: "Authentic PYQs & Solution Key PDF Vault",
    description: "Study high-resolution official reference answer booklets, exam-oriented notes, and syllabus breakdowns curated for top scoring.",
    buttonText: "Read PDFs"
  },
  {
    heading: "Free Live Exam Simulators & Daily Streaks",
    description: "Take free test drives anytime, practice without boundaries, track your historic accuracy levels and secure success.",
    buttonText: "Launch Simulator"
  }
];
