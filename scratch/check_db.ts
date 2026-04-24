import mongoose from 'mongoose';
import { Libro } from '../server/src/models/libro.model';
import dotenv from 'dotenv';

dotenv.config({ path: '../server/.env' });

async function checkDb() {
    const uri = process.env.DB_CONN || process.env.db_CONN || "";
    await mongoose.connect(uri);
    const libros = await Libro.find({ portadaUrl: { $exists: true, $ne: "" } });
    console.log('Libros con portada:', JSON.stringify(libros, null, 2));
    await mongoose.disconnect();
}

checkDb();
