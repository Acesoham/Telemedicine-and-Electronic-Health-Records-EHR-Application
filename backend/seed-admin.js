/**
 * seed-admin.js
 * Run once to create the admin account:
 *   node seed-admin.js
 *
 * Change ADMIN_EMAIL / ADMIN_PASSWORD below before running.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

// ── Configure these ──────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@medivault.com';
const ADMIN_PASSWORD = 'Admin@12345';        // ← change to something strong
// ─────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:    { type: String, required: true, select: false },
    role:            { type: String, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], required: true },
    isActive:        { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
    refreshTokens:   { type: [String], default: [], select: false },
    lastLoginAt:     { type: Date },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`⚠️   Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const salt         = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  await User.create({
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'ADMIN',
    isActive: true,
    isEmailVerified: true,
  });

  console.log('🎉  Admin account created!');
  console.log(`    Email   : ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log('    Login at: http://localhost:5173/login');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
