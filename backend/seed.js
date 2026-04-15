/**
 * Database seeder – run with: node seed.js
 * Seeds sample alumni and a demo trainee user.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Alumni = require("./models/Alumni");
const User = require("./models/User");

const ALUMNI_SEED = [
  {
    fullName: "Priya Sharma",
    email: "priya.sharma@example.com",
    company: "TCS",
    jobRole: "Software Engineer",
    technologies: ["React", "Node.js", "MongoDB", "JavaScript"],
    yearsOfExperience: 2,
    linkedinProfile: "https://linkedin.com/in/priya-sharma",
    availabilityStatus: "available",
    profilePhoto: "",
    batch: "2022",
    location: "Hyderabad",
    domain: "Web Development",
    bio: "Placed from NCPL in 2022. Happy to mentor trainees in full stack development.",
    avatarInitials: "PS",
    avatarColor: "#1A3C6E",
  },
  {
    fullName: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    company: "Infosys",
    jobRole: "Java Developer",
    technologies: ["Java", "Spring Boot", "MySQL", "Hibernate"],
    yearsOfExperience: 3,
    linkedinProfile: "https://linkedin.com/in/ravi-kumar",
    availabilityStatus: "available",
    profilePhoto: "",
    batch: "2021",
    location: "Bangalore",
    domain: "Backend Development",
    bio: "NCPL trained me from scratch. Now working at Infosys. Can guide anyone in Java.",
    avatarInitials: "RK",
    avatarColor: "#7C3AED",
  },
  {
    fullName: "Ananya Reddy",
    email: "ananya.reddy@example.com",
    company: "Wipro",
    jobRole: "Data Analyst",
    technologies: ["Python", "SQL", "Power BI", "Pandas"],
    yearsOfExperience: 1,
    linkedinProfile: "https://linkedin.com/in/ananya-reddy",
    availabilityStatus: "busy",
    profilePhoto: "",
    batch: "2023",
    location: "Pune",
    domain: "Data Science",
    bio: "Got placed at Wipro after NCPL training. Looking forward to helping current trainees.",
    avatarInitials: "AR",
    avatarColor: "#059669",
  },
  {
    fullName: "Mohammed Farhan",
    email: "farhan.m@example.com",
    company: "Capgemini",
    jobRole: "QA Engineer",
    technologies: ["Selenium", "Jira", "Manual Testing", "Postman"],
    yearsOfExperience: 2,
    linkedinProfile: "https://linkedin.com/in/mohammed-farhan",
    availabilityStatus: "available",
    profilePhoto: "",
    batch: "2022",
    location: "Chennai",
    domain: "Testing & QA",
    bio: "QA Engineer at Capgemini. Can help with testing strategies and interview prep.",
    avatarInitials: "MF",
    avatarColor: "#DC2626",
  },
  {
    fullName: "Sneha Patel",
    email: "sneha.patel@example.com",
    company: "HCL Technologies",
    jobRole: "DevOps Engineer",
    technologies: ["AWS", "Docker", "Jenkins", "Kubernetes"],
    yearsOfExperience: 3,
    linkedinProfile: "https://linkedin.com/in/sneha-patel",
    availabilityStatus: "available",
    profilePhoto: "",
    batch: "2021",
    location: "Mumbai",
    domain: "DevOps & Cloud",
    bio: "DevOps at HCL. NCPL gave me the foundation. Happy to mentor anyone interested in cloud.",
    avatarInitials: "SP",
    avatarColor: "#F4A823",
  },
  {
    fullName: "Kiran Babu",
    email: "kiran.babu@example.com",
    company: "Tech Mahindra",
    jobRole: "Android Developer",
    technologies: ["Kotlin", "Android", "Firebase", "Jetpack Compose"],
    yearsOfExperience: 1,
    linkedinProfile: "https://linkedin.com/in/kiran-babu",
    availabilityStatus: "available",
    profilePhoto: "",
    batch: "2023",
    location: "Hyderabad",
    domain: "Mobile Development",
    bio: "Android dev at Tech Mahindra. Placed from NCPL batch 2023. Ready to guide!",
    avatarInitials: "KB",
    avatarColor: "#0891B2",
  },
  {
    fullName: "Divya Menon",
    email: "divya.menon@example.com",
    company: "Accenture",
    jobRole: "React Developer",
    technologies: ["React", "TypeScript", "Redux", "GraphQL"],
    yearsOfExperience: 2,
    linkedinProfile: "https://linkedin.com/in/divya-menon",
    availabilityStatus: "available",
    profilePhoto: "",
    batch: "2022",
    location: "Kochi",
    domain: "Web Development",
    bio: "Frontend developer at Accenture specialising in React. NCPL batch 2022.",
    avatarInitials: "DM",
    avatarColor: "#BE185D",
  },
  {
    fullName: "Arjun Nair",
    email: "arjun.nair@example.com",
    company: "Cognizant",
    jobRole: "Full Stack Developer",
    technologies: ["Angular", "Node.js", "PostgreSQL", "Docker"],
    yearsOfExperience: 4,
    linkedinProfile: "https://linkedin.com/in/arjun-nair",
    availabilityStatus: "available",
    profilePhoto: "",
    batch: "2020",
    location: "Trivandrum",
    domain: "Web Development",
    bio: "Full-stack at Cognizant. Love solving complex problems. NCPL alumni 2020.",
    avatarInitials: "AN",
    avatarColor: "#0D9488",
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
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Alumni.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    // Insert alumni
    const inserted = await Alumni.insertMany(ALUMNI_SEED);
    console.log(`Seeded ${inserted.length} alumni records`);

    // Create demo user
    await User.create(DEMO_USER);
    console.log(`Demo user created: ${DEMO_USER.email} / ${DEMO_USER.password}`);

    console.log("\nSeeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
