import mongoose from 'mongoose';
import { Libro } from '../models/libro.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedImages() {
  try {
    const uri = process.env.DB_CONN || process.env.db_CONN || '';
    if (!uri) throw new Error('No connection string found');
    
    await mongoose.connect(uri);
    console.log('📦 Conectado a MongoDB para actualizar imágenes...');

    const updates = [
      {
        titulo: "Cien años de soledad",
        portadaUrl: "/covers/cien_anos_soledad_front.png",
        contraportadaUrl: "/covers/cien_anos_soledad_back.png"
      },
      {
        titulo: "1984",
        portadaUrl: "/covers/1984_front.png",
        contraportadaUrl: "/covers/1984_back.png"
      },
      {
        titulo: "El principito",
        portadaUrl: "/covers/el_principito_front.png",
        contraportadaUrl: "/covers/el_principito_back.png"
      }
    ];

    for (const update of updates) {
      const res = await Libro.updateOne(
        { titulo: update.titulo },
        { 
          $set: { 
            portadaUrl: update.portadaUrl, 
            contraportadaUrl: update.contraportadaUrl 
          } 
        }
      );
      if (res.matchedCount > 0) {
        console.log(`✅ Imagenes actualizadas para: ${update.titulo}`);
      } else {
        console.log(`⚠️ No se encontró el libro: ${update.titulo}`);
      }
    }

    console.log('🚀 Semilla de imágenes completada.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar imágenes:', error);
    process.exit(1);
  }
}

seedImages();
