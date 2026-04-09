"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
async function connectMongo() {
    if (isConnected)
        return;
    const uri = process.env.DB_CONN || process.env.db_CONN || "";
    if (!uri)
        throw new Error("No hay conexion a la base de datos de MongoDB");
    await mongoose_1.default.connect(uri);
    mongoose_1.default.connection.on("error", (err) => {
        console.error("MongoDB error:", err);
    });
    mongoose_1.default.set("strictQuery", true);
    isConnected = true;
    console.log("Conectado a MongoDB");
}
//# sourceMappingURL=mongoose.js.map