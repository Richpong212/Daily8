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
exports.deleteExercise = exports.updateExercise = exports.createExercise = exports.getExercise = exports.listExercises = void 0;
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
const exercises_model_1 = __importDefault(require("../models/exercises.model"));
const exerciseMuscles_model_1 = __importDefault(require("../models/exerciseMuscles.model"));
const exerciseEquipment_model_1 = __importDefault(require("../models/exerciseEquipment.model"));
const exerciseConstraints_model_1 = __importDefault(require("../models/exerciseConstraints.model"));
const exerciseMedia_model_1 = __importDefault(require("../models/exerciseMedia.model"));
const variantLadderItems_model_1 = __importDefault(require("../models/variantLadderItems.model"));
const exerciseVariants_model_1 = __importDefault(require("../models/exerciseVariants.model"));
const logger_utils_1 = require("../utils/logger.utils");
const cache_utils_1 = require("../utils/cache.utils");
const toClientExercise = (exercise, relations = {}) => {
    var _a, _b, _c, _d, _e, _f;
    const data = exercise.get({ plain: true });
    return Object.assign(Object.assign({}, data), { created_at: data.createdAt, updated_at: data.updatedAt, muscles: (_a = relations.muscles) !== null && _a !== void 0 ? _a : [], equipment: (_b = relations.equipment) !== null && _b !== void 0 ? _b : [], constraints: (_c = relations.constraints) !== null && _c !== void 0 ? _c : [], variant_ladder_ids: ((_d = relations.variantLadderItems) !== null && _d !== void 0 ? _d : [])
            .map((item) => item.variant_ladder_id)
            .filter(Boolean), variants: (_e = relations.variants) !== null && _e !== void 0 ? _e : [], media: (_f = relations.media) !== null && _f !== void 0 ? _f : [], createdAt: undefined, updatedAt: undefined });
};
const getExerciseRelations = (exerciseId) => __awaiter(void 0, void 0, void 0, function* () {
    const [muscles, equipment, constraints, media, variantLadderItems, variants] = yield Promise.all([
        exerciseMuscles_model_1.default.findAll({
            where: { exercise_id: exerciseId },
            attributes: ["muscle_id", "role"],
        }),
        exerciseEquipment_model_1.default.findAll({
            where: { exercise_id: exerciseId },
            attributes: ["equipment_id", "requirement_type"],
        }),
        exerciseConstraints_model_1.default.findAll({
            where: { exercise_id: exerciseId },
            attributes: ["constraint_id", "level", "editor_notes"],
        }),
        exerciseMedia_model_1.default.findAll({
            where: { exercise_id: exerciseId },
            attributes: [
                "id",
                "media_type",
                "url",
                "version",
                "view_angle",
                "is_primary",
                "source",
                "rights_status",
                "external_media_id",
                "notes",
            ],
        }),
        variantLadderItems_model_1.default.findAll({
            where: { exercise_id: exerciseId },
            attributes: ["variant_ladder_id"],
        }),
        exerciseVariants_model_1.default.findAll({
            where: { from_exercise_id: exerciseId },
            attributes: [
                "id",
                "to_exercise_id",
                "variant_type",
                "sort_order",
                "notes",
            ],
            order: [
                ["variant_type", "ASC"],
                ["sort_order", "ASC"],
            ],
        }),
    ]);
    return {
        muscles: muscles.map((row) => row.get({ plain: true })),
        equipment: equipment.map((row) => row.get({ plain: true })),
        constraints: constraints.map((row) => row.get({ plain: true })),
        media: media.map((row) => row.get({ plain: true })),
        variantLadderItems: variantLadderItems.map((row) => row.get({ plain: true })),
        variants: variants.map((row) => row.get({ plain: true })),
    };
});
const buildVariantLadderRows = (exerciseId, variantLadderIds = []) => {
    return [...new Set(variantLadderIds)]
        .filter(Boolean)
        .map((variantLadderId, index) => ({
        exercise_id: exerciseId,
        variant_ladder_id: variantLadderId,
        position: index + 1,
        is_default_anchor: false,
        editor_notes: null,
    }));
};
const buildExerciseVariantRows = (exerciseId, variants = []) => {
    return variants
        .filter((variant) => variant.to_exercise_id)
        .map((variant, index) => {
        var _a, _b, _c;
        return ({
            from_exercise_id: exerciseId,
            to_exercise_id: variant.to_exercise_id,
            variant_type: (_a = variant.variant_type) !== null && _a !== void 0 ? _a : "related",
            sort_order: (_b = variant.sort_order) !== null && _b !== void 0 ? _b : index + 1,
            notes: (_c = variant.notes) !== null && _c !== void 0 ? _c : null,
        });
    });
};
const clearExerciseCaches = () => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all([
        (0, cache_utils_1.deleteCacheByPattern)("exercises:*"),
        (0, cache_utils_1.deleteCacheByPattern)("supporting-data:*"),
    ]);
});
const databaseNow = () => connectDb_1.db.literal("CURRENT_TIMESTAMP");
const normalizeExerciseData = (body) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const status = (_a = body.status) !== null && _a !== void 0 ? _a : "draft";
    const data = {
        slug: (_b = body.slug) !== null && _b !== void 0 ? _b : `${((_c = body.name) !== null && _c !== void 0 ? _c : "new-exercise").toString().trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        name: (_d = body.name) !== null && _d !== void 0 ? _d : "New Exercise",
        movement_family_id: (_e = body.movement_family_id) !== null && _e !== void 0 ? _e : null,
        body_region_id: (_f = body.body_region_id) !== null && _f !== void 0 ? _f : null,
        exercise_purpose_id: (_g = body.exercise_purpose_id) !== null && _g !== void 0 ? _g : null,
        category: (_h = body.category) !== null && _h !== void 0 ? _h : "strength",
        position: (_j = body.position) !== null && _j !== void 0 ? _j : "standing",
        impact_level: (_k = body.impact_level) !== null && _k !== void 0 ? _k : "low",
        complexity_level: (_l = body.complexity_level) !== null && _l !== void 0 ? _l : "low",
        intensity_level: (_m = body.intensity_level) !== null && _m !== void 0 ? _m : "low",
        balance_demand: (_o = body.balance_demand) !== null && _o !== void 0 ? _o : "low",
        space_need: (_p = body.space_need) !== null && _p !== void 0 ? _p : "small",
        summary: (_q = body.summary) !== null && _q !== void 0 ? _q : "",
        instructions: (_r = body.instructions) !== null && _r !== void 0 ? _r : [],
        coaching_cues: (_s = body.coaching_cues) !== null && _s !== void 0 ? _s : [],
        safety_info: (_t = body.safety_info) !== null && _t !== void 0 ? _t : null,
        review_status: (_u = body.review_status) !== null && _u !== void 0 ? _u : "draft",
        review_notes: (_v = body.review_notes) !== null && _v !== void 0 ? _v : null,
        status,
        color: (_w = body.color) !== null && _w !== void 0 ? _w : "#2f7a54",
    };
    if (status === "active") {
        data.published_at = databaseNow();
    }
    if (status === "retired") {
        data.retired_at = databaseNow();
    }
    return data;
};
const prepareExerciseUpdateData = (body, currentExercise) => {
    const exerciseData = Object.assign({}, body);
    delete exerciseData.muscles;
    delete exerciseData.equipment;
    delete exerciseData.constraints;
    delete exerciseData.media;
    delete exerciseData.variant_ladder_ids;
    delete exerciseData.variants;
    delete exerciseData.created_at;
    delete exerciseData.updated_at;
    delete exerciseData.createdAt;
    delete exerciseData.updatedAt;
    delete exerciseData.published_at;
    delete exerciseData.retired_at;
    delete exerciseData.id;
    if (exerciseData.status === "active" && !currentExercise.published_at) {
        exerciseData.published_at = databaseNow();
    }
    if (exerciseData.status === "retired" && !currentExercise.retired_at) {
        exerciseData.retired_at = databaseNow();
    }
    return exerciseData;
};
const createRelationRows = (exerciseId, body, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const { muscles = [], equipment = [], constraints = [], media = [], variant_ladder_ids = [], variants = [], } = body;
    const muscleRows = muscles.map((item) => {
        var _a;
        return ({
            exercise_id: exerciseId,
            muscle_id: item.muscle_id,
            role: (_a = item.role) !== null && _a !== void 0 ? _a : "secondary",
        });
    });
    const equipmentRows = equipment.map((item) => {
        var _a;
        return ({
            exercise_id: exerciseId,
            equipment_id: item.equipment_id,
            requirement_type: (_a = item.requirement_type) !== null && _a !== void 0 ? _a : "required",
        });
    });
    const constraintRows = constraints.map((item) => {
        var _a, _b;
        return ({
            exercise_id: exerciseId,
            constraint_id: item.constraint_id,
            level: (_a = item.level) !== null && _a !== void 0 ? _a : "low",
            editor_notes: (_b = item.editor_notes) !== null && _b !== void 0 ? _b : null,
        });
    });
    const mediaRows = media.map((item) => {
        var _a, _b, _c, _d, _e, _f, _g;
        return ({
            exercise_id: exerciseId,
            media_type: item.media_type,
            url: item.url,
            version: (_a = item.version) !== null && _a !== void 0 ? _a : "standard",
            view_angle: (_b = item.view_angle) !== null && _b !== void 0 ? _b : "unknown",
            is_primary: (_c = item.is_primary) !== null && _c !== void 0 ? _c : false,
            source: (_d = item.source) !== null && _d !== void 0 ? _d : "admin",
            rights_status: (_e = item.rights_status) !== null && _e !== void 0 ? _e : "unknown",
            external_media_id: (_f = item.external_media_id) !== null && _f !== void 0 ? _f : null,
            notes: (_g = item.notes) !== null && _g !== void 0 ? _g : null,
        });
    });
    const variantLadderRows = buildVariantLadderRows(exerciseId, variant_ladder_ids);
    const exerciseVariantRows = buildExerciseVariantRows(exerciseId, variants);
    yield Promise.all([
        muscleRows.length
            ? exerciseMuscles_model_1.default.bulkCreate(muscleRows, { transaction })
            : Promise.resolve(),
        equipmentRows.length
            ? exerciseEquipment_model_1.default.bulkCreate(equipmentRows, { transaction })
            : Promise.resolve(),
        constraintRows.length
            ? exerciseConstraints_model_1.default.bulkCreate(constraintRows, { transaction })
            : Promise.resolve(),
        mediaRows.length
            ? exerciseMedia_model_1.default.bulkCreate(mediaRows, { transaction })
            : Promise.resolve(),
        variantLadderRows.length
            ? variantLadderItems_model_1.default.bulkCreate(variantLadderRows, { transaction })
            : Promise.resolve(),
        exerciseVariantRows.length
            ? exerciseVariants_model_1.default.bulkCreate(exerciseVariantRows, { transaction })
            : Promise.resolve(),
    ]);
    return {
        muscles: muscleRows,
        equipment: equipmentRows,
        constraints: constraintRows,
        media: mediaRows,
        variantLadderItems: variantLadderRows,
        variants: exerciseVariantRows,
    };
});
const listExercises = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exercises = yield exercises_model_1.default.findAll({ order: [["updatedAt", "DESC"]] });
        const data = yield Promise.all(exercises.map((exercise) => __awaiter(void 0, void 0, void 0, function* () { return toClientExercise(exercise, yield getExerciseRelations(exercise.id)); })));
        return res.status(200).json({ message: "Exercises retrieved successfully", data });
    }
    catch (error) {
        logger_utils_1.logger.error("Error listing exercises:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.listExercises = listExercises;
const getExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exercise = yield exercises_model_1.default.findByPk(req.params.id);
        if (!exercise) {
            return res.status(404).json({ message: "Exercise not found" });
        }
        return res.status(200).json({
            message: "Exercise retrieved successfully",
            data: toClientExercise(exercise, yield getExerciseRelations(exercise.id)),
        });
    }
    catch (error) {
        logger_utils_1.logger.error("Error retrieving exercise:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getExercise = getExercise;
const createExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connectDb_1.db.transaction();
    try {
        const exerciseData = normalizeExerciseData(req.body);
        const exercise = yield exercises_model_1.default.create(exerciseData, { transaction });
        const relations = yield createRelationRows(exercise.id, req.body, transaction);
        yield transaction.commit();
        yield clearExerciseCaches();
        return res.status(201).json({
            message: "Exercise created successfully",
            data: toClientExercise(exercise, relations),
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof sequelize_1.UniqueConstraintError) {
            return res.status(409).json({
                message: "Exercise already exists with this slug",
            });
        }
        logger_utils_1.logger.error("Error creating exercise:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createExercise = createExercise;
const updateExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connectDb_1.db.transaction();
    try {
        const exercise = yield exercises_model_1.default.findByPk(req.params.id, { transaction });
        if (!exercise) {
            yield transaction.rollback();
            return res.status(404).json({ message: "Exercise not found" });
        }
        const { muscles, equipment, constraints, media, variant_ladder_ids, variants } = req.body;
        const exerciseData = prepareExerciseUpdateData(req.body, exercise);
        yield exercise.update(exerciseData, { transaction });
        if (muscles) {
            yield exerciseMuscles_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction });
            yield exerciseMuscles_model_1.default.bulkCreate(muscles.map((item) => {
                var _a;
                return ({
                    exercise_id: exercise.id,
                    muscle_id: item.muscle_id,
                    role: (_a = item.role) !== null && _a !== void 0 ? _a : "secondary",
                });
            }), { transaction });
        }
        if (equipment) {
            yield exerciseEquipment_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction });
            yield exerciseEquipment_model_1.default.bulkCreate(equipment.map((item) => {
                var _a;
                return ({
                    exercise_id: exercise.id,
                    equipment_id: item.equipment_id,
                    requirement_type: (_a = item.requirement_type) !== null && _a !== void 0 ? _a : "required",
                });
            }), { transaction });
        }
        if (constraints) {
            yield exerciseConstraints_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction });
            yield exerciseConstraints_model_1.default.bulkCreate(constraints.map((item) => {
                var _a, _b;
                return ({
                    exercise_id: exercise.id,
                    constraint_id: item.constraint_id,
                    level: (_a = item.level) !== null && _a !== void 0 ? _a : "low",
                    editor_notes: (_b = item.editor_notes) !== null && _b !== void 0 ? _b : null,
                });
            }), { transaction });
        }
        if (media) {
            yield exerciseMedia_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction });
            yield exerciseMedia_model_1.default.bulkCreate(media.map((item) => {
                var _a, _b, _c, _d, _e, _f, _g;
                return ({
                    exercise_id: exercise.id,
                    media_type: item.media_type,
                    url: item.url,
                    version: (_a = item.version) !== null && _a !== void 0 ? _a : "standard",
                    view_angle: (_b = item.view_angle) !== null && _b !== void 0 ? _b : "unknown",
                    is_primary: (_c = item.is_primary) !== null && _c !== void 0 ? _c : false,
                    source: (_d = item.source) !== null && _d !== void 0 ? _d : "admin",
                    rights_status: (_e = item.rights_status) !== null && _e !== void 0 ? _e : "unknown",
                    external_media_id: (_f = item.external_media_id) !== null && _f !== void 0 ? _f : null,
                    notes: (_g = item.notes) !== null && _g !== void 0 ? _g : null,
                });
            }), { transaction });
        }
        if (Array.isArray(variant_ladder_ids)) {
            yield variantLadderItems_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction });
            const variantLadderRows = buildVariantLadderRows(exercise.id, variant_ladder_ids);
            if (variantLadderRows.length) {
                yield variantLadderItems_model_1.default.bulkCreate(variantLadderRows, { transaction });
            }
        }
        if (Array.isArray(variants)) {
            yield exerciseVariants_model_1.default.destroy({
                where: { from_exercise_id: exercise.id },
                transaction,
            });
            const exerciseVariantRows = buildExerciseVariantRows(exercise.id, variants);
            if (exerciseVariantRows.length) {
                yield exerciseVariants_model_1.default.bulkCreate(exerciseVariantRows, { transaction });
            }
        }
        yield transaction.commit();
        yield clearExerciseCaches();
        const updated = yield exercises_model_1.default.findByPk(req.params.id);
        return res.status(200).json({
            message: "Exercise updated successfully",
            data: toClientExercise(updated, yield getExerciseRelations(req.params.id)),
        });
    }
    catch (error) {
        yield transaction.rollback();
        logger_utils_1.logger.error("Error updating exercise:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateExercise = updateExercise;
const deleteExercise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connectDb_1.db.transaction();
    try {
        const exercise = yield exercises_model_1.default.findByPk(req.params.id, { transaction });
        if (!exercise) {
            yield transaction.rollback();
            return res.status(404).json({ message: "Exercise not found" });
        }
        yield Promise.all([
            exerciseMuscles_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction }),
            exerciseEquipment_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction }),
            exerciseConstraints_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction }),
            exerciseMedia_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction }),
            variantLadderItems_model_1.default.destroy({ where: { exercise_id: exercise.id }, transaction }),
            exerciseVariants_model_1.default.destroy({
                where: {
                    [sequelize_1.Op.or]: [
                        { from_exercise_id: exercise.id },
                        { to_exercise_id: exercise.id },
                    ],
                },
                transaction,
            }),
        ]);
        yield exercise.destroy({ transaction });
        yield transaction.commit();
        yield clearExerciseCaches();
        return res.status(200).json({ message: "Exercise deleted successfully" });
    }
    catch (error) {
        yield transaction.rollback();
        logger_utils_1.logger.error("Error deleting exercise:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteExercise = deleteExercise;
