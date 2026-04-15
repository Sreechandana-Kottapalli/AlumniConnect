/**
 * User model – Supabase/PostgreSQL implementation.
 * Exposes the same interface the rest of the app relies on,
 * including `_id` (mapped from the UUID `id` column) so that
 * all controllers and middleware continue to work without change.
 */
const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

// Map a DB row to the shape expected by controllers/middleware
const mapUser = (row) => {
  if (!row) return null;
  const user = {
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    batch: row.batch || null,
    domain: row.domain || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  // Include hashed password only when explicitly fetched
  if (row.password !== undefined) {
    user.password = row.password;
  }
  return user;
};

/**
 * Find a user by email address.
 * @param {string} email
 * @param {boolean} includePassword - set true when you need the hashed password (login)
 */
const findByEmail = async (email, includePassword = false) => {
  const columns = includePassword
    ? "*"
    : "id, name, email, role, batch, domain, created_at, updated_at";

  const { data, error } = await supabase
    .from("users")
    .select(columns)
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) throw error;
  return mapUser(data);
};

/**
 * Find a user by primary-key UUID (or the string form of the UUID).
 */
const findById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, batch, domain, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return mapUser(data);
};

/**
 * Create a new user. Hashes the password before insert.
 */
const create = async ({ name, email, password, role = "trainee", batch, domain }) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data, error } = await supabase
    .from("users")
    .insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      batch: batch || null,
      domain: domain || null,
    })
    .select("id, name, email, role, batch, domain, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapUser(data);
};

/**
 * Compare a plain-text password with its bcrypt hash.
 * @returns {Promise<boolean>}
 */
const matchPassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

module.exports = { findByEmail, findById, create, matchPassword };
