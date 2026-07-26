// Shared option lists used by both Onboarding and Profile editing.
// Every picker built from these also exposes an "Other" option for custom entries.

export const EDUCATION_STATUSES = [
  { value: "high_school", label: "High school" },
  { value: "college", label: "Community college" },
  { value: "university", label: "University" },
  { value: "other", label: "Other" },
];

export const GRADE_OPTIONS = ["9th grade", "10th grade", "11th grade", "12th grade"];
export const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export const TARGET_COLLEGES = [
  "Harvard University", "Yale University", "Princeton University", "Columbia University",
  "University of Pennsylvania", "Cornell University", "Brown University", "Dartmouth College",
  "Massachusetts Institute of Technology (MIT)", "Stanford University", "Johns Hopkins University",
  "Georgetown University", "University of Maryland - College Park", "George Washington University",
  "George Mason University", "University of Virginia (UVA)", "Virginia Tech", "Howard University",
  "UMBC", "American University", "Duke University", "Northwestern University", "UC Berkeley", "UCLA"
];

export const SKILLS = [
  "Design", "Coding", "Tutoring", "Writing", "Organizing", "Social media",
  "Event support", "Translation", "Research", "Photography", "Public speaking",
  "Data entry", "Graphic design", "Video editing", "Fundraising", "Mentoring",
];

export const INTERESTS = [
  "Education", "Youth mentoring", "Food insecurity", "Mosque service", "Environment",
  "Health", "Arts", "Technology", "Family support", "Community events", "Social justice",
  "Elder care", "Student support", "Refugee support", "Interfaith", "Mental health",
];

export const CAREER_INTERESTS = [
  "Medicine / Health", "Engineering", "Computer Science / Tech", "Education / Teaching",
  "Law / Policy", "Business / Entrepreneurship", "Arts & Media", "Social Work",
  "Environmental Science", "Psychology / Counseling", "Journalism / Communications",
  "Nonprofit / Community", "Government / Public Service", "Research / Science",
  "Healthcare", "Finance",
];

export const FIELDS_OF_STUDY = [
  "STEM", "Pre-med / Health sciences", "Computer Science", "Humanities",
  "Social Sciences", "Business", "Education", "Arts", "Communications",
  "Public Health", "Law / Pre-law", "Engineering",
];

export const INTERNSHIP_INTERESTS = [
  "Research", "Government / Public service", "Healthcare / Clinical",
  "Tech / Software", "Nonprofit", "Communications / Marketing", "Policy / Advocacy",
  "Lab / Science", "Education", "Business",
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const TIMES = ["Morning", "Afternoon", "Evening", "Weekend only", "After school"];

export const SAFETY = [
  "Women-led", "Mosque-based", "Youth-friendly", "Family-safe", "No transportation needed",
];

export const MCPS_HIGH_SCHOOLS = [
  { name: "Montgomery Blair High School", code: "551" },
  { name: "Albert Einstein High School", code: "789" },
  { name: "Bethesda-Chevy Chase High School", code: "401" },
  { name: "Clarksburg High School", code: "249" },
  { name: "Col. Zadok Magruder High School", code: "510" },
  { name: "Damascus High School", code: "701" },
  { name: "Gaithersburg High School", code: "552" },
  { name: "John F. Kennedy High School", code: "815" },
  { name: "Northwood High School", code: "796" },
  { name: "Paint Branch High School", code: "305" },
  { name: "Poolesville High School", code: "152" },
  { name: "Rockville High School", code: "702" },
  { name: "Seneca Valley High School", code: "104" },
  { name: "Sherwood High School", code: "503" },
  { name: "Springbrook High School", code: "798" },
  { name: "Walter Johnson High School", code: "424" },
  { name: "Walt Whitman High School", code: "427" },
  { name: "Watkins Mill High School", code: "545" },
  { name: "Wheaton High School", code: "782" },
  { name: "Winston Churchill High School", code: "602" },
  { name: "Thomas S. Wootton High School", code: "230" },
];

export const OPPORTUNITY_TYPES = ["volunteer", "internship", "ssl", "job", "other"];
