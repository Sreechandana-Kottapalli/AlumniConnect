/**
 * One-time script: update every alumni row's email to sreechandanamakkapati@gmail.com
 * Run from the backend/ directory:  node update-alumni-emails.js
 */
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TARGET_EMAIL = "sreechandanamakkapati@gmail.com";

async function run() {
  console.log(`Updating all alumni emails → ${TARGET_EMAIL} …`);

  const { data, error } = await supabase
    .from("alumni")
    .update({ email: TARGET_EMAIL })
    .neq("id", "00000000-0000-0000-0000-000000000000") // matches every row
    .select("id, full_name, email");

  if (error) {
    console.error("Update failed:", error.message);
    process.exit(1);
  }

  console.log(`\nUpdated ${data.length} alumni record(s):`);
  data.forEach((a) => console.log(`  ✓  ${a.full_name}  →  ${a.email}`));
  console.log("\nDone.");
  process.exit(0);
}

run();
