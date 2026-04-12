/**
 * SEED SCRIPT — Crea el primer usuario administrador en MongoDB
 *
 * Uso:
 *   npx ts-node src/scripts/seed-usuario.ts
 *
 * Se puede ejecutar varias veces — verifica si el email ya existe
 * antes de insertar para evitar duplicados.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/usuario.model';

// ── Lee el .env del servidor si existe ───────────────────────────────────────
const DB_URI = process.env['DB_CONN'] || process.env['db_CONN'] || '';


// ── Datos del usuario administrador inicial ───────────────────────────────────
const ADMIN_INICIAL = {
  nombre: 'Administrador',
  email: 'admin@biblioteca.com',
  password: 'Admin123!',          // ← Cámbiala antes de usar en producción
  rol: 'admin' as const,
  activo: true,
};

async function seed() {
  if (!DB_URI) {
    console.error('❌ No se encontró DB_CONN en las variables de entorno.');
    console.error('   Asegúrate de que el archivo .env existe en /server/');
    process.exit(1);
  }

  console.log('🔌 Conectando a MongoDB...');
  await mongoose.connect(DB_URI);
  console.log('✅ Conectado a MongoDB');

  // Verifica si ya existe un usuario con ese email
  const existe = await Usuario.findOne({ email: ADMIN_INICIAL.email });

  if (existe) {
    console.log(`⚠️  El usuario "${ADMIN_INICIAL.email}" ya existe. No se creó duplicado.`);
    await mongoose.disconnect();
    return;
  }

  // Hashea la contraseña con bcrypt (10 rondas de sal — balance seguridad/velocidad)
  const SALT_ROUNDS = 10;
  const passwordHash = await bcrypt.hash(ADMIN_INICIAL.password, SALT_ROUNDS);

  // Inserta el usuario en la base de datos
  const usuario = new Usuario({
    nombre: ADMIN_INICIAL.nombre,
    email: ADMIN_INICIAL.email,
    password: passwordHash,
    rol: ADMIN_INICIAL.rol,
    activo: ADMIN_INICIAL.activo,
  });

  await usuario.save();

  console.log('');
  console.log('🎉 Usuario administrador creado exitosamente:');
  console.log('   ┌─────────────────────────────────────────┐');
  console.log(`   │  Email    : ${ADMIN_INICIAL.email.padEnd(27)}│`);
  console.log(`   │  Password : ${ADMIN_INICIAL.password.padEnd(27)}│`);
  console.log(`   │  Rol      : ${'admin'.padEnd(27)}│`);
  console.log('   └─────────────────────────────────────────┘');
  console.log('');
  console.log('   ⚠️  IMPORTANTE: Cambia la contraseña en producción.');
  console.log('');

  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB. Seed completado.');
}

seed().catch((err) => {
  console.error('❌ Error durante el seed:', err);
  mongoose.disconnect();
  process.exit(1);
});
