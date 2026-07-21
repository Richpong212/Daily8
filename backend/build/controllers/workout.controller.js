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
exports.getWorkout = exports.deleteWorkout = exports.updateWorkout = exports.createWorkout = exports.getWorkoutById = exports.listWorkouts = void 0;
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
const workouts_model_1 = __importDefault(require("../models/workouts.model"));
const workoutGroups_model_1 = __importDefault(require("../models/workoutGroups.model"));
const workoutSlots_model_1 = __importDefault(require("../models/workoutSlots.model"));
const logger_utils_1 = require("../utils/logger.utils");
const cache_utils_1 = require("../utils/cache.utils");
const connectExternalAPI_1 = require("../utils/connectExternalAPI");
const groupColors = ["#d5a34d", "#2f7a54", "#3a5da8", "#7a4ea8", "#c1663d"];
const databaseNow = () => connectDb_1.db.literal("CURRENT_TIMESTAMP");
const slugify = (value) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "workout";
};
const generateUniqueSlug = (name, existingId) => __awaiter(void 0, void 0, void 0, function* () {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 2;
    while (yield workouts_model_1.default.findOne({
        where: Object.assign({ slug }, (existingId ? { id: { [sequelize_1.Op.ne]: existingId } } : {})),
    })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
    return slug;
});
const clearWorkoutCaches = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cache_utils_1.deleteCacheByPattern)("workouts:*");
});
const toClientWorkout = (workout, groups = []) => {
    const data = workout.get({ plain: true });
    return Object.assign(Object.assign({}, data), { created_at: data.createdAt, updated_at: data.updatedAt, groups, createdAt: undefined, updatedAt: undefined });
};
const getWorkoutGroups = (workoutId) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield workoutGroups_model_1.default.findAll({
        where: { workout_id: workoutId },
        order: [["group_order", "ASC"]],
    });
    return Promise.all(groups.map((group, index) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const data = group.get({ plain: true });
        const slots = yield workoutSlots_model_1.default.findAll({
            where: { workout_group_id: group.id },
            order: [["slot_order", "ASC"]],
        });
        return Object.assign(Object.assign({}, data), { color: (_a = data.color) !== null && _a !== void 0 ? _a : groupColors[index % groupColors.length], slots: slots.map((slot) => slot.get({ plain: true })), createdAt: undefined, updatedAt: undefined });
    })));
});
const normalizeWorkoutData = (body, currentWorkout) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const status = (_b = (_a = body.status) !== null && _a !== void 0 ? _a : currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.status) !== null && _b !== void 0 ? _b : "draft";
    const name = (_d = (_c = body.name) !== null && _c !== void 0 ? _c : currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.name) !== null && _d !== void 0 ? _d : "New Workout";
    const data = {
        slug: yield generateUniqueSlug(name, currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.id),
        name,
        description: (_f = (_e = body.description) !== null && _e !== void 0 ? _e : currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.description) !== null && _f !== void 0 ? _f : "",
        transition_seconds: (_h = (_g = body.transition_seconds) !== null && _g !== void 0 ? _g : currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.transition_seconds) !== null && _h !== void 0 ? _h : 10,
        is_new_user_friendly: (_k = (_j = body.is_new_user_friendly) !== null && _j !== void 0 ? _j : currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.is_new_user_friendly) !== null && _k !== void 0 ? _k : false,
        difficulty_band: (_m = (_l = body.difficulty_band) !== null && _l !== void 0 ? _l : currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.difficulty_band) !== null && _m !== void 0 ? _m : "standard",
        status,
        review_notes: (_p = (_o = body.review_notes) !== null && _o !== void 0 ? _o : currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.review_notes) !== null && _p !== void 0 ? _p : null,
    };
    if (!currentWorkout) {
        data.version_number = (_q = body.version_number) !== null && _q !== void 0 ? _q : 1;
        data.previous_version_id = (_r = body.previous_version_id) !== null && _r !== void 0 ? _r : null;
    }
    if (status === "active" && !(currentWorkout === null || currentWorkout === void 0 ? void 0 : currentWorkout.published_at)) {
        data.published_at = databaseNow();
    }
    return data;
});
const replaceWorkoutStructure = (workoutId_1, ...args_1) => __awaiter(void 0, [workoutId_1, ...args_1], void 0, function* (workoutId, groups = [], transaction) {
    var _a, _b, _c, _d, _e;
    const existingGroups = yield workoutGroups_model_1.default.findAll({
        where: { workout_id: workoutId },
        attributes: ["id"],
        transaction,
    });
    const existingGroupIds = existingGroups.map((group) => group.id);
    if (existingGroupIds.length) {
        yield workoutSlots_model_1.default.destroy({
            where: { workout_group_id: existingGroupIds },
            transaction,
        });
    }
    yield workoutGroups_model_1.default.destroy({ where: { workout_id: workoutId }, transaction });
    const createdGroups = [];
    for (const [groupIndex, group] of groups.entries()) {
        const createdGroup = yield workoutGroups_model_1.default.create({
            workout_id: workoutId,
            group_order: (_a = group.group_order) !== null && _a !== void 0 ? _a : groupIndex + 1,
            name: (_b = group.name) !== null && _b !== void 0 ? _b : `Group ${groupIndex + 1}`,
            repeat_count: (_c = group.repeat_count) !== null && _c !== void 0 ? _c : 1,
            notes: (_d = group.notes) !== null && _d !== void 0 ? _d : null,
        }, { transaction });
        const slots = Array.isArray(group.slots) ? group.slots : [];
        const slotRows = slots.map((slot, slotIndex) => {
            var _a, _b, _c, _d;
            return ({
                workout_group_id: createdGroup.id,
                slot_order: (_a = slot.slot_order) !== null && _a !== void 0 ? _a : slotIndex + 1,
                exercise_id: slot.exercise_id,
                exercise_purpose_id: (_b = slot.exercise_purpose_id) !== null && _b !== void 0 ? _b : null,
                duration_seconds: (_c = slot.duration_seconds) !== null && _c !== void 0 ? _c : 30,
                notes: (_d = slot.notes) !== null && _d !== void 0 ? _d : null,
            });
        });
        if (slotRows.length) {
            yield workoutSlots_model_1.default.bulkCreate(slotRows, { transaction });
        }
        createdGroups.push(Object.assign(Object.assign({}, createdGroup.get({ plain: true })), { color: (_e = group.color) !== null && _e !== void 0 ? _e : groupColors[groupIndex % groupColors.length], slots: slotRows }));
    }
    return createdGroups;
});
const listWorkouts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workouts = yield workouts_model_1.default.findAll({ order: [["updatedAt", "DESC"]] });
        const data = yield Promise.all(workouts.map((workout) => __awaiter(void 0, void 0, void 0, function* () { return toClientWorkout(workout, yield getWorkoutGroups(workout.id)); })));
        return res.status(200).json({ message: "Workouts retrieved successfully", data });
    }
    catch (error) {
        logger_utils_1.logger.error("Error listing workouts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.listWorkouts = listWorkouts;
const getWorkoutById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workout = yield workouts_model_1.default.findByPk(req.params.id);
        if (!workout) {
            return res.status(404).json({ message: "Workout not found" });
        }
        return res.status(200).json({
            message: "Workout retrieved successfully",
            data: toClientWorkout(workout, yield getWorkoutGroups(workout.id)),
        });
    }
    catch (error) {
        logger_utils_1.logger.error("Error retrieving workout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWorkoutById = getWorkoutById;
const createWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield connectDb_1.db.transaction();
    try {
        const workoutData = yield normalizeWorkoutData(req.body);
        const workout = yield workouts_model_1.default.create(workoutData, { transaction });
        const groups = yield replaceWorkoutStructure(workout.id, (_a = req.body.groups) !== null && _a !== void 0 ? _a : [], transaction);
        yield transaction.commit();
        yield clearWorkoutCaches();
        return res.status(201).json({
            message: "Workout created successfully",
            data: toClientWorkout(workout, groups),
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof sequelize_1.UniqueConstraintError) {
            return res.status(409).json({ message: "Workout slug already exists" });
        }
        logger_utils_1.logger.error("Error creating workout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createWorkout = createWorkout;
const updateWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connectDb_1.db.transaction();
    try {
        const workout = yield workouts_model_1.default.findByPk(req.params.id, { transaction });
        if (!workout) {
            yield transaction.rollback();
            return res.status(404).json({ message: "Workout not found" });
        }
        const isPublished = workout.status === "active" || Boolean(workout.published_at);
        const hasProtectedUpdate = Array.isArray(req.body.groups) || req.body.transition_seconds !== undefined;
        if (isPublished && hasProtectedUpdate) {
            yield transaction.rollback();
            return res.status(409).json({
                message: "Published workout structure or playback settings cannot be edited in place",
            });
        }
        const workoutData = yield normalizeWorkoutData(req.body, workout);
        yield workout.update(workoutData, { transaction });
        if (Array.isArray(req.body.groups)) {
            yield replaceWorkoutStructure(workout.id, req.body.groups, transaction);
        }
        yield transaction.commit();
        yield clearWorkoutCaches();
        const updated = yield workouts_model_1.default.findByPk(req.params.id);
        return res.status(200).json({
            message: "Workout updated successfully",
            data: toClientWorkout(updated, yield getWorkoutGroups(req.params.id)),
        });
    }
    catch (error) {
        yield transaction.rollback();
        logger_utils_1.logger.error("Error updating workout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateWorkout = updateWorkout;
const deleteWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connectDb_1.db.transaction();
    try {
        const workout = yield workouts_model_1.default.findByPk(req.params.id, { transaction });
        if (!workout) {
            yield transaction.rollback();
            return res.status(404).json({ message: "Workout not found" });
        }
        if (workout.status === "active" || workout.published_at) {
            yield workout.update({ status: "retired" }, { transaction });
            yield transaction.commit();
            yield clearWorkoutCaches();
            return res.status(200).json({ message: "Workout retired successfully" });
        }
        const groups = yield workoutGroups_model_1.default.findAll({
            where: { workout_id: workout.id },
            attributes: ["id"],
            transaction,
        });
        const groupIds = groups.map((group) => group.id);
        if (groupIds.length) {
            yield workoutSlots_model_1.default.destroy({
                where: { workout_group_id: groupIds },
                transaction,
            });
        }
        yield workoutGroups_model_1.default.destroy({ where: { workout_id: workout.id }, transaction });
        yield workout.destroy({ transaction });
        yield transaction.commit();
        yield clearWorkoutCaches();
        return res.status(200).json({ message: "Workout deleted successfully" });
    }
    catch (error) {
        yield transaction.rollback();
        logger_utils_1.logger.error("Error deleting workout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteWorkout = deleteWorkout;
const getWorkout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workoutCheck = yield (0, connectExternalAPI_1.checkMuscleWikiAPIHealth)();
        const workoutData = yield (0, connectExternalAPI_1.getMuscleWikiExercises)();
        return res.status(200).json({
            message: "Workout retrieved successfully",
            workoutCheck,
            workoutData,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Failed to retrieve workout", error });
    }
});
exports.getWorkout = getWorkout;
