// Vercel Serverless Function entry point — exports the Express app directly.
// Vercel's @vercel/node runtime handles the request/response bridging.
const app = require('../app');
module.exports = app;
