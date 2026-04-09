import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;

  const uri = process.env.DB_CONN || process.env.db_CONN || "";

  if (!uri) throw new Error("No hay conexion a la base de datos de MongoDB");
  await mongoose.connect(uri);
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
  });

  mongoose.set("strictQuery", true);
  isConnected = true;
  console.log("Conectado a MongoDB");
}
