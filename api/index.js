/**
 * Vercel Serverless Function entry point.
 * Re-exports the Express app from backend/server.js so Vercel can invoke it
 * as a serverless function for all /api/* routes.
 */
const app = require("../backend/server");

module.exports = app;
