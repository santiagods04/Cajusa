require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const {
  MONGO_URI,
  ALLOW_SEED,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

const exitWith = async (code, msg) => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  if (msg) console.log(msg);
  process.exit(code);
};

(async () => {
  try {
    if (ALLOW_SEED !== 'true') {
      console.log('⛔ Seed bloqueado. Para correrlo: ALLOW_SEED=true');
      return exitWith(0);
    }

    if (!MONGO_URI) {
      throw new Error('Falta MONGO_URI en .env');
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD (pásalos por variable de entorno al ejecutar).');
    }

    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      // Si ya existe, no lo duplica
      if (existing.role !== 'admin' && ADMIN_PROMOTE === 'true') {
        existing.role = 'admin';
        await existing.save();
        return exitWith(0, `✅ Usuario existente promovido a admin: ${ADMIN_EMAIL}`);
      }

      return exitWith(0, `✅ Admin/usuario ya existe: ${ADMIN_EMAIL} (no se hizo nada)`);
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.create({
      email: ADMIN_EMAIL,
      password: hash,
      role: 'admin',
    });

    return exitWith(0, `✅ Admin creado: ${admin.email}`);
  } catch (err) {
    console.error('❌ Error en seedAdmin:', err.message);
    return exitWith(1);
  }
})();
