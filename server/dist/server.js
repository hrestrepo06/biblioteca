"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const mongoose_1 = require("./database/mongoose");
async function bootstrap() {
    const port = Number(process.env.PORT) || 3000;
    await (0, mongoose_1.connectMongo)();
    app_1.app.listen(port, () => {
        console.log(`Bibliotec API: http://localhost:${port}`);
    });
}
bootstrap().catch((err) => {
    console.error('Fallo al iniciar servidor:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map