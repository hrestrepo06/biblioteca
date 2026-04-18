import { Schema, model, InferSchemaType, Types } from "mongoose";

const libroSchema = new Schema(
  {
    titulo: { type: String, required: true, unique: true, trim: true },
    autor: { type: String, required: true, trim: true },
    aPublicacion: { type: String, trim: true },
    editorial: { type: String, trim: true },
    categoria: { type: String, trim: true },
    sede: { type: String, trim: true },
    disponible: { type: Boolean, default: true },
    portadaUrl: { type: String, trim: true },
    contraportadaUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id != null ? String(ret._id) : undefined;
        return ret;
      },
    },
  },
);

export type libroDoc = InferSchemaType<typeof libroSchema> & {
  _id: Types.ObjectId;
};

export const Libro = model<libroDoc>("Libro", libroSchema);

/*
[
  {
    "titulo": "Cien años de soledad",
    "autor": "Gabriel García Márquez",
    "aPublicacion": "1967",
    "editorial": "Editorial Sudamericana",
    "sede": "Buenos Aires"
  },
  {
    "titulo": "Don Quijote de la Mancha",
    "autor": "Miguel de Cervantes",
    "aPublicacion": "1605",
    "editorial": "Francisco de Robles",
    "sede": "Madrid"
  },
  {
    "titulo": "La sombra del viento",
    "autor": "Carlos Ruiz Zafón",
    "aPublicacion": "2001",
    "editorial": "Planeta",
    "sede": "Barcelona"
  },
  {
    "titulo": "El amor en los tiempos del cólera",
    "autor": "Gabriel García Márquez",
    "aPublicacion": "1985",
    "editorial": "Oveja Negra",
    "sede": "Bogotá"
  },
  {
    "titulo": "1984",
    "autor": "George Orwell",
    "aPublicacion": "1949",
    "editorial": "Secker & Warburg",
    "sede": "Londres"
  },
  {
    "titulo": "Fahrenheit 451",
    "autor": "Ray Bradbury",
    "aPublicacion": "1953",
    "editorial": "Ballantine Books",
    "sede": "Nueva York"
  },
  {
    "titulo": "El principito",
    "autor": "Antoine de Saint-Exupéry",
    "aPublicacion": "1943",
    "editorial": "Reynal & Hitchcock",
    "sede": "Nueva York"
  },
  {
    "titulo": "Crónica de una muerte anunciada",
    "autor": "Gabriel García Márquez",
    "aPublicacion": "1981",
    "editorial": "La Oveja Negra",
    "sede": "Bogotá"
  },
  {
    "titulo": "Los juegos del hambre",
    "autor": "Suzanne Collins",
    "aPublicacion": "2008",
    "editorial": "Scholastic Press",
    "sede": "Nueva York"
  },
  {
    "titulo": "Harry Potter y la piedra filosofal",
    "autor": "J.K. Rowling",
    "aPublicacion": "1997",
    "editorial": "Bloomsbury",
    "sede": "Londres"
  }
]
*/
