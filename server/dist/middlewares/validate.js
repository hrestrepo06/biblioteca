"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateBody = void 0;
const zod_1 = require("zod");
// ✅ BODY
const validateBody = (schema) => (req, res, next) => {
    try {
        const data = schema.parse(req.body);
        req.body = data;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                ok: false,
                msg: "Body inválido",
                errors: error.issues.map((e) => e.message),
            });
        }
        return next(error);
    }
};
exports.validateBody = validateBody;
// ✅ PARAMS
const validateParams = (schema) => (req, res, next) => {
    try {
        const data = schema.parse(req.params);
        req.params = data;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                ok: false,
                msg: "Params inválidos",
                errors: error.issues.map((e) => e.message),
            });
        }
        return next(error);
    }
};
exports.validateParams = validateParams;
//# sourceMappingURL=validate.js.map