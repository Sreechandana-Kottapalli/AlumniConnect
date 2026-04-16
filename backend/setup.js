/**
 * backend/setup.js
 *
 * One-time initialisation script for the Supabase-backed AlumniConnect backend.
 * Run with:  node setup.js
 *
 * What it does:
 *  1. Verifies the Supabase connection
 *  2. Checks that required database tables exist (users, alumni, referral_requests)
 *  3. Ensures the "resumes" storage bucket exists (creates it if missing)
 *  4. Prints a summary with ✓ / ✗ for each check
 */

require("dotenv").config();
const supabase = require("./config/supabase");

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "resumes";
const REQUIRED_TABLES = ["users", "alumni", "referral_requests"];

// ── helpers ────────────────────────────────────────────────────────────────────

function ok(msg)   { console.log(`  ✓  ${msg}`); }
function fail(msg) { console.error(`  ✗  ${msg}`); }
function info(msg) { console.log(`  ℹ  ${msg}`); }

// ── checks ────────────────────────────────────────────────────────────────────

async function checkConnection() {
  console.log("\n[1] Supabase connection");
  // A lightweight query that always works if the project is reachable
  const { error } = await supabase.from("users").select("id").limit(1);
  // "PGRST116" = no rows — that's fine; anything else is a real problem
  if (!error || error.code === "PGRST116") {
    ok(`Connected to Supabase project: ${process.env.SUPABASE_URL}`);
    return true;
  }
  fail(`Cannot reach Supabase: ${error.message}`);
  return false;
}

async function checkTables() {
  console.log("\n[2] Database tables");
  let allOk = true;

  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table).select("*").limit(0);
    if (!error) {
      ok(`Table "${table}" exists`);
    } else if (error.code === "42P01") {
      fail(`Table "${table}" does NOT exist — run backend/config/schema.sql in your Supabase SQL editor`);
      allOk = false;
    } else {
      fail(`Table "${table}" check failed: ${error.message}`);
      allOk = false;
    }
  }

  return allOk;
}

async function checkStorageBucket() {
  console.log("\n[3] Storage bucket");

  const { data: existing, error: getError } = await supabase.storage.getBucket(BUCKET);

  if (existing) {
    ok(`Bucket "${BUCKET}" already exists (public: ${existing.public})`);
    return true;
  }

  const msg = (getError?.message || "").toLowerCase();
  if (msg.includes("not found") || msg.includes("does not exist") || msg.includes("no bucket")) {
    info(`Bucket "${BUCKET}" not found — creating it now…`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ["application/pdf"],
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    });
    if (createError) {
      fail(`Could not create bucket "${BUCKET}": ${createError.message}`);
      return false;
    }
    ok(`Bucket "${BUCKET}" created successfully`);
    return true;
  }

  fail(`Storage bucket check failed: ${getError?.message}`);
  return false;
}

async function checkEnvVars() {
  console.log("\n[0] Environment variables");
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET"];
  let allOk = true;
  for (const v of required) {
    if (process.env[v]) {
      ok(`${v} is set`);
    } else {
      fail(`${v} is MISSING — add it to your .env file`);
      allOk = false;
    }
  }
  const optional = ["SUPABASE_STORAGE_BUCKET", "PORT", "FRONTEND_URL"];
  for (const v of optional) {
    if (process.env[v]) {
      ok(`${v} = ${process.env[v]}`);
    } else {
      info(`${v} not set (optional — using default)`);
    }
  }
  return allOk;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("══════════════════════════════════════════════");
  console.log("  AlumniConnect – Supabase Setup Check");
  console.log("══════════════════════════════════════════════");

  const envOk = await checkEnvVars();
  if (!envOk) {
    console.log("\n⚠  Fix missing environment variables before continuing.\n");
    process.exit(1);
  }

  const connOk = await checkConnection();
  if (!connOk) {
    console.log("\n⚠  Cannot connect to Supabase. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n");
    process.exit(1);
  }

  const tablesOk = await checkTables();
  const storageOk = await checkStorageBucket();

  console.log("\n══════════════════════════════════════════════");
  if (tablesOk && storageOk) {
    console.log("  All checks passed. Backend is ready.");
  } else {
    console.log("  Some checks failed — see ✗ items above.");
    if (!tablesOk) {
      console.log("\n  → To fix missing tables:");
      console.log("    1. Open your Supabase project dashboard");
      console.log("    2. Go to SQL Editor");
      console.log("    3. Paste and run the contents of backend/config/schema.sql");
    }
  }
  console.log("══════════════════════════════════════════════\n");

  process.exit(tablesOk && storageOk ? 0 : 1);
}

main().catch((err) => {
  console.error("\nUnhandled error:", err.message || err);
  process.exit(1);
});
