/**
 * Database seeder – run with: npm run seed
 * Clears and repopulates the alumni table and creates a demo trainee user.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Alumni seed data (snake_case to match DB columns) ────────────────────────
const ALUMNI_SEED = [
  {
    full_name: "Priya Sharma",
    email: "sreechandanamakkapati@gmail.com",
    company: "TCS",
    job_role: "Software Engineer",
    technologies: ["React", "Node.js", "MongoDB", "JavaScript"],
    years_of_experience: 2,
    linkedin_profile: "https://linkedin.com/in/priya-sharma",
    availability_status: "available",
    profile_photo: "",
    batch: "2022",
    location: "Hyderabad",
    domain: "Web Development",
    bio: "Placed from NCPL in 2022. Happy to mentor trainees in full stack development.",
    avatar_initials: "PS",
    avatar_color: "#1A3C6E",
  },
  {
    full_name: "Ravi Kumar",
    email: "siva.gattu007@gmail.com",
    company: "Infosys",
    job_role: "Java Developer",
    technologies: ["Java", "Spring Boot", "MySQL", "Hibernate"],
    years_of_experience: 3,
    linkedin_profile: "https://linkedin.com/in/ravi-kumar",
    availability_status: "available",
    profile_photo: "",
    batch: "2021",
    location: "Bangalore",
    domain: "Backend Development",
    bio: "NCPL trained me from scratch. Now working at Infosys. Can guide anyone in Java.",
    avatar_initials: "RK",
    avatar_color: "#7C3AED",
  },
  {
    full_name: "Ananya Reddy",
    email: "sreechandanamakkapati@gmail.com",
    company: "Wipro",
    job_role: "Data Analyst",
    technologies: ["Python", "SQL", "Power BI", "Pandas"],
    years_of_experience: 1,
    linkedin_profile: "https://linkedin.com/in/ananya-reddy",
    availability_status: "busy",
    profile_photo: "",
    batch: "2023",
    location: "Pune",
    domain: "Data Science",
    bio: "Got placed at Wipro after NCPL training. Looking forward to helping current trainees.",
    avatar_initials: "AR",
    avatar_color: "#059669",
  },
  {
    full_name: "Mohammed Farhan",
    email: "sreechandanamakkapati@gmail.com",
    company: "Capgemini",
    job_role: "QA Engineer",
    technologies: ["Selenium", "Jira", "Manual Testing", "Postman"],
    years_of_experience: 2,
    linkedin_profile: "https://linkedin.com/in/mohammed-farhan",
    availability_status: "available",
    profile_photo: "",
    batch: "2022",
    location: "Chennai",
    domain: "Testing & QA",
    bio: "QA Engineer at Capgemini. Can help with testing strategies and interview prep.",
    avatar_initials: "MF",
    avatar_color: "#DC2626",
  },
  {
    full_name: "Sneha Patel",
    email: "sreechandanamakkapati@gmail.com",
    company: "HCL Technologies",
    job_role: "DevOps Engineer",
    technologies: ["AWS", "Docker", "Jenkins", "Kubernetes"],
    years_of_experience: 3,
    linkedin_profile: "https://linkedin.com/in/sneha-patel",
    availability_status: "available",
    profile_photo: "",
    batch: "2021",
    location: "Mumbai",
    domain: "DevOps & Cloud",
    bio: "DevOps at HCL. NCPL gave me the foundation. Happy to mentor anyone interested in cloud.",
    avatar_initials: "SP",
    avatar_color: "#F4A823",
  },
  {
    full_name: "Kiran Babu",
    email: "sreechandanamakkapati@gmail.com",
    company: "Tech Mahindra",
    job_role: "Android Developer",
    technologies: ["Kotlin", "Android", "Firebase", "Jetpack Compose"],
    years_of_experience: 1,
    linkedin_profile: "https://linkedin.com/in/kiran-babu",
    availability_status: "available",
    profile_photo: "",
    batch: "2023",
    location: "Hyderabad",
    domain: "Mobile Development",
    bio: "Android dev at Tech Mahindra. Placed from NCPL batch 2023. Ready to guide!",
    avatar_initials: "KB",
    avatar_color: "#0891B2",
  },
  {
    full_name: "Divya Menon",
    email: "sreechandanamakkapati@gmail.com",
    company: "Accenture",
    job_role: "React Developer",
    technologies: ["React", "TypeScript", "Redux", "GraphQL"],
    years_of_experience: 2,
    linkedin_profile: "https://linkedin.com/in/divya-menon",
    availability_status: "available",
    profile_photo: "",
    batch: "2022",
    location: "Kochi",
    domain: "Web Development",
    bio: "Frontend developer at Accenture specialising in React. NCPL batch 2022.",
    avatar_initials: "DM",
    avatar_color: "#BE185D",
  },
  {
    full_name: "Arjun Nair",
    email: "sreechandanamakkapati@gmail.com",
    company: "Cognizant",
    job_role: "Full Stack Developer",
    technologies: ["Angular", "Node.js", "PostgreSQL", "Docker"],
    years_of_experience: 4,
    linkedin_profile: "https://linkedin.com/in/arjun-nair",
    availability_status: "available",
    profile_photo: "",
    batch: "2020",
    location: "Trivandrum",
    domain: "Web Development",
    bio: "Full-stack at Cognizant. Love solving complex problems. NCPL alumni 2020.",
    avatar_initials: "AN",
    avatar_color: "#0D9488",
  },
];

const DEMO_USER = {
  name: "Deepika Nair",
  email: "deepika@ncpl.in",
  password: "demo1234",
  role: "trainee",
  batch: "2024",
  domain: "Web Development",
};

async function seed() {
  try {
    console.log("Starting Supabase seed...");

    // Clear existing data (referral_requests first due to FK constraints)
    const { error: delRefErr } = await supabase
      .from("referral_requests")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows
    if (delRefErr) throw delRefErr;

    const { error: delAlumniErr } = await supabase
      .from("alumni")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delAlumniErr) throw delAlumniErr;

    const { error: delUserErr } = await supabase
      .from("users")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delUserErr) throw delUserErr;

    console.log("Cleared existing data.");

    // Insert alumni
    const { data: insertedAlumni, error: alumniErr } = await supabase
      .from("alumni")
      .insert(ALUMNI_SEED)
      .select("id, full_name");
    if (alumniErr) throw alumniErr;
    console.log(`Seeded ${insertedAlumni.length} alumni records.`);

    // Create demo user (with hashed password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEMO_USER.password, salt);

    const { error: userErr } = await supabase.from("users").insert({
      name:   DEMO_USER.name,
      email:  DEMO_USER.email,
      password: hashedPassword,
      role:   DEMO_USER.role,
      batch:  DEMO_USER.batch,
      domain: DEMO_USER.domain,
    });
    if (userErr) throw userErr;

    console.log(`Demo user created: ${DEMO_USER.email} / ${DEMO_USER.password}`);
    console.log("\nSeeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message || err);
    process.exit(1);
  }
}

seed();
