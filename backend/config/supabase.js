/**
 * Supabase client — lazy-initialized on first use.
 *
 * Lazy init means the module can be required without throwing even if env vars
 * aren't set yet (e.g. during Vercel's build phase). The error surfaces as a
 * proper JSON response when the first DB/Storage call is made.
 */
const { createClient } = require("@supabase/supabase-js");

let _client = null;

function getClient() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const missing = [!url && "SUPABASE_URL", !key && "SUPABASE_SERVICE_ROLE_KEY"]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `Missing Supabase environment variable(s): ${missing}. ` +
      `Set them in Vercel → Project → Settings → Environment Variables.`
    );
  }

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

// Proxy so all existing callers (supabase.from / supabase.storage / etc.) work unchanged
module.exports = new Proxy(
  {},
  {
    get(_, prop) {
      return getClient()[prop];
    },
  }
);
