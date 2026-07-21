"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupportingDataItem = exports.updateSupportingDataItem = exports.createSupportingDataItem = exports.listSupportingData = void 0;
const sequelize_1 = require("sequelize");
const movementFamilies_model_1 = __importDefault(require("../models/movementFamilies.model"));
const bodyRegions_model_1 = __importDefault(require("../models/bodyRegions.model"));
const exercisePurposes_model_1 = __importDefault(require("../models/exercisePurposes.model"));
const muscles_model_1 = __importDefault(require("../models/muscles.model"));
const equipment_model_1 = __importDefault(require("../models/equipment.model"));
const constraints_model_1 = __importDefault(require("../models/constraints.model"));
const variantLadders_model_1 = __importDefault(require("../models/variantLadders.model"));
const variantLadderItems_model_1 = __importDefault(require("../models/variantLadderItems.model"));
const logger_utils_1 = require("../utils/logger.utils");
const cache_utils_1 = require("../utils/cache.utils");
const resources = {
    "movement-families": movementFamilies_model_1.default,
    "body-regions": bodyRegions_model_1.default,
    "exercise-purposes": exercisePurposes_model_1.default,
    muscles: muscles_model_1.default,
    equipment: equipment_model_1.default,
    constraints: constraints_model_1.default,
    "variant-ladders": variantLadders_model_1.default,
};
const clearSupportingDataCaches = () => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all([
        (0, cache_utils_1.deleteCacheByPattern)("supporting-data:*"),
        (0, cache_utils_1.deleteCacheByPattern)("exercises:*"),
    ]);
});
const getResourceModel = (resource) => {
    return resources[resource];
};
const toPlain = (rows) => rows.map((row) => row.get({ plain: true }));
const findFirstBodyRegionId = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const bodyRegion = yield bodyRegions_model_1.default.findOne({ order: [["sort_order", "ASC"]] });
    return (_a = bodyRegion === null || bodyRegion === void 0 ? void 0 : bodyRegion.id) !== null && _a !== void 0 ? _a : null;
});
const slugify = (value) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "item";
};
const generateUniqueSlug = (model, name, existingId) => __awaiter(void 0, void 0, void 0, function* () {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 2;
    while (yield model.findOne({
        where: Object.assign({ slug }, (existingId ? { id: { [sequelize_1.Op.ne]: existingId } } : {})),
    })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
    return slug;
});
const normalizePayload = (resource, body, model, existingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign({}, body);
    delete payload.items;
    delete payload.slug;
    if (typeof payload.name === "string" && payload.name.trim()) {
        payload.slug = yield generateUniqueSlug(model, payload.name, existingId);
    }
    if (resource === "muscles" && !payload.body_region_id) {
        payload.body_region_id = yield findFirstBodyRegionId();
    }
    if (resource === "constraints" && !payload.category) {
        payload.category = "body_area";
    }
    return payload;
});
const getVariantLadderItems = (variantLadderId) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield variantLadderItems_model_1.default.findAll({
        where: { variant_ladder_id: variantLadderId },
        order: [["position", "ASC"]],
    });
    return items.map((item) => {
        const data = item.get({ plain: true });
        delete data.variant_ladder_id;
        return data;
    });
});
const toVariantLadderPayload = (variantLadder) => __awaiter(void 0, void 0, void 0, function* () {
    return Object.assign(Object.assign({}, variantLadder.get({ plain: true })), { items: yield getVariantLadderItems(variantLadder.id) });
});
const replaceVariantLadderItems = (variantLadderId_1, ...args_1) => __awaiter(void 0, [variantLadderId_1, ...args_1], void 0, function* (variantLadderId, items = []) {
    yield variantLadderItems_model_1.default.destroy({ where: { variant_ladder_id: variantLadderId } });
    if (!items.length)
        return;
    yield variantLadderItems_model_1.default.bulkCreate(items.map((item, index) => {
        var _a, _b, _c;
        return ({
            variant_ladder_id: variantLadderId,
            exercise_id: item.exercise_id,
            position: (_a = item.position) !== null && _a !== void 0 ? _a : index + 1,
            is_default_anchor: (_b = item.is_default_anchor) !== null && _b !== void 0 ? _b : false,
            editor_notes: (_c = item.editor_notes) !== null && _c !== void 0 ? _c : null,
        });
    }));
});
const listSupportingData = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [movementFamilies, bodyRegions, exercisePurposes, muscles, equipment, constraints, variantLadders,] = yield Promise.all([
            movementFamilies_model_1.default.findAll({ order: [["sort_order", "ASC"]] }),
            bodyRegions_model_1.default.findAll({ order: [["sort_order", "ASC"]] }),
            exercisePurposes_model_1.default.findAll({ order: [["sort_order", "ASC"]] }),
            muscles_model_1.default.findAll({ order: [["name", "ASC"]] }),
            equipment_model_1.default.findAll({ order: [["sort_order", "ASC"]] }),
            constraints_model_1.default.findAll({ order: [["sort_order", "ASC"]] }),
            variantLadders_model_1.default.findAll({ order: [["name", "ASC"]] }),
        ]);
        return res.status(200).json({
            message: "Supporting data retrieved successfully",
            data: {
                movementFamilies: toPlain(movementFamilies),
                bodyRegions: toPlain(bodyRegions),
                exercisePurposes: toPlain(exercisePurposes),
                muscles: toPlain(muscles),
                equipment: toPlain(equipment),
                constraints: toPlain(constraints),
                variantLadders: yield Promise.all(variantLadders.map((variantLadder) => toVariantLadderPayload(variantLadder))),
            },
        });
    }
    catch (error) {
        logger_utils_1.logger.error("Error listing supporting data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.listSupportingData = listSupportingData;
const createSupportingDataItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = getResourceModel(req.params.resource);
        if (!model) {
            return res.status(404).json({ message: "Supporting data resource not found" });
        }
        const payload = yield normalizePayload(req.params.resource, req.body, model);
        const item = yield model.create(payload);
        if (req.params.resource === "variant-ladders") {
            yield replaceVariantLadderItems(item.id, req.body.items);
            yield clearSupportingDataCaches();
            return res.status(201).json({
                message: "Supporting data item created successfully",
                data: yield toVariantLadderPayload(item),
            });
        }
        yield clearSupportingDataCaches();
        return res.status(201).json({
            message: "Supporting data item created successfully",
            data: item.get({ plain: true }),
        });
    }
    catch (error) {
        if (error instanceof sequelize_1.UniqueConstraintError) {
            return res.status(409).json({ message: "Slug already exists" });
        }
        logger_utils_1.logger.error("Error creating supporting data item:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createSupportingDataItem = createSupportingDataItem;
const updateSupportingDataItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = getResourceModel(req.params.resource);
        if (!model) {
            return res.status(404).json({ message: "Supporting data resource not found" });
        }
        const item = yield model.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Supporting data item not found" });
        }
        const payload = yield normalizePayload(req.params.resource, req.body, model, req.params.id);
        yield item.update(payload);
        if (req.params.resource === "variant-ladders" && Array.isArray(req.body.items)) {
            yield replaceVariantLadderItems(item.id, req.body.items);
            yield clearSupportingDataCaches();
            return res.status(200).json({
                message: "Supporting data item updated successfully",
                data: yield toVariantLadderPayload(item),
            });
        }
        yield clearSupportingDataCaches();
        return res.status(200).json({
            message: "Supporting data item updated successfully",
            data: item.get({ plain: true }),
        });
    }
    catch (error) {
        if (error instanceof sequelize_1.UniqueConstraintError) {
            return res.status(409).json({ message: "Slug already exists" });
        }
        logger_utils_1.logger.error("Error updating supporting data item:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateSupportingDataItem = updateSupportingDataItem;
const deleteSupportingDataItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = getResourceModel(req.params.resource);
        if (!model) {
            return res.status(404).json({ message: "Supporting data resource not found" });
        }
        const item = yield model.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Supporting data item not found" });
        }
        if (req.params.resource === "variant-ladders") {
            yield variantLadderItems_model_1.default.destroy({ where: { variant_ladder_id: item.id } });
        }
        yield item.destroy();
        yield clearSupportingDataCaches();
        return res.status(200).json({
            message: "Supporting data item deleted successfully",
        });
    }
    catch (error) {
        logger_utils_1.logger.error("Error deleting supporting data item:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteSupportingDataItem = deleteSupportingDataItem;
