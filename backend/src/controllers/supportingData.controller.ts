import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import MovementFamilies from "../models/movementFamilies.model";
import BodyRegions from "../models/bodyRegions.model";
import ExerciseBenefits from "../models/exerciseBenefits.model";
import Muscles from "../models/muscles.model";
import Equipment from "../models/equipment.model";
import Constraints from "../models/constraints.model";
import VariantLadders from "../models/variantLadders.model";
import VariantLadderItems from "../models/variantLadderItems.model";
import { logger } from "../utils/logger.utils";
import { deleteCacheByPattern } from "../utils/cache.utils";

type ResourceParamRequest = Request<{ resource: string }>;
type ResourceItemParamRequest = Request<{ resource: string; id: string }>;

const resources: Record<string, any> = {
  "movement-families": MovementFamilies,
  "body-regions": BodyRegions,
  "exercise-benefits": ExerciseBenefits,
  muscles: Muscles,
  equipment: Equipment,
  constraints: Constraints,
  "variant-ladders": VariantLadders,
};

const clearSupportingDataCaches = async () => {
  await Promise.all([
    deleteCacheByPattern("supporting-data:*"),
    deleteCacheByPattern("exercises:*"),
  ]);
};

const getResourceModel = (resource: string) => {
  return resources[resource];
};

const toPlain = (rows: any[]) => rows.map((row) => row.get({ plain: true }));

const findFirstBodyRegionId = async () => {
  const bodyRegion = await BodyRegions.findOne({ order: [["sort_order", "ASC"]] });
  return bodyRegion?.id ?? null;
};

const slugify = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
};

const generateUniqueSlug = async (
  model: any,
  name: string,
  existingId?: string,
) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    await model.findOne({
      where: {
        slug,
        ...(existingId ? { id: { [Op.ne]: existingId } } : {}),
      },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const normalizePayload = async (
  resource: string,
  body: Record<string, any>,
  model: any,
  existingId?: string,
) => {
  const payload = { ...body };
  delete payload.items;
  delete payload.slug;

  if (typeof payload.name === "string" && payload.name.trim()) {
    payload.slug = await generateUniqueSlug(model, payload.name, existingId);
  }

  if (resource === "muscles" && !payload.body_region_id) {
    payload.body_region_id = await findFirstBodyRegionId();
  }

  if (resource === "constraints" && !payload.category) {
    payload.category = "body_area";
  }

  return payload;
};

const getVariantLadderItems = async (variantLadderId: string) => {
  const items = await VariantLadderItems.findAll({
    where: { variant_ladder_id: variantLadderId },
    order: [["position", "ASC"]],
  });

  return items.map((item) => {
    const data = item.get({ plain: true }) as Record<string, any>;
    delete data.variant_ladder_id;
    return data;
  });
};

const toVariantLadderPayload = async (variantLadder: VariantLadders) => {
  return {
    ...variantLadder.get({ plain: true }),
    items: await getVariantLadderItems(variantLadder.id),
  };
};

const replaceVariantLadderItems = async (
  variantLadderId: string,
  items: Array<Record<string, any>> = [],
) => {
  await VariantLadderItems.destroy({ where: { variant_ladder_id: variantLadderId } });

  if (!items.length) return;

  await VariantLadderItems.bulkCreate(
    items.map((item, index) => ({
      variant_ladder_id: variantLadderId,
      exercise_id: item.exercise_id,
      position: item.position ?? index + 1,
      is_default_anchor: item.is_default_anchor ?? false,
      editor_notes: item.editor_notes ?? null,
    })),
  );
};

export const listSupportingData: any = async (_req: Request, res: Response) => {
  try {
    const [
      movementFamilies,
      bodyRegions,
      exerciseBenefits,
      muscles,
      equipment,
      constraints,
      variantLadders,
    ] = await Promise.all([
      MovementFamilies.findAll({ order: [["sort_order", "ASC"]] }),
      BodyRegions.findAll({ order: [["sort_order", "ASC"]] }),
      ExerciseBenefits.findAll({ order: [["sort_order", "ASC"]] }),
      Muscles.findAll({ order: [["name", "ASC"]] }),
      Equipment.findAll({ order: [["sort_order", "ASC"]] }),
      Constraints.findAll({ order: [["sort_order", "ASC"]] }),
      VariantLadders.findAll({ order: [["name", "ASC"]] }),
    ]);

    return res.status(200).json({
      message: "Supporting data retrieved successfully",
      data: {
        movementFamilies: toPlain(movementFamilies),
        bodyRegions: toPlain(bodyRegions),
        exerciseBenefits: toPlain(exerciseBenefits),
        muscles: toPlain(muscles),
        equipment: toPlain(equipment),
        constraints: toPlain(constraints),
        variantLadders: await Promise.all(
          variantLadders.map((variantLadder) => toVariantLadderPayload(variantLadder)),
        ),
      },
    });
  } catch (error) {
    logger.error("Error listing supporting data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createSupportingDataItem: any = async (
  req: ResourceParamRequest,
  res: Response,
) => {
  try {
    const model = getResourceModel(req.params.resource);

    if (!model) {
      return res.status(404).json({ message: "Supporting data resource not found" });
    }

    const payload = await normalizePayload(req.params.resource, req.body, model);
    const item = await model.create(payload);

    if (req.params.resource === "variant-ladders") {
      await replaceVariantLadderItems(item.id, req.body.items);
      await clearSupportingDataCaches();

      return res.status(201).json({
        message: "Supporting data item created successfully",
        data: await toVariantLadderPayload(item),
      });
    }

    await clearSupportingDataCaches();

    return res.status(201).json({
      message: "Supporting data item created successfully",
      data: item.get({ plain: true }),
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: "Slug already exists" });
    }

    logger.error("Error creating supporting data item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSupportingDataItem: any = async (
  req: ResourceItemParamRequest,
  res: Response,
) => {
  try {
    const model = getResourceModel(req.params.resource);

    if (!model) {
      return res.status(404).json({ message: "Supporting data resource not found" });
    }

    const item = await model.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Supporting data item not found" });
    }

    const payload = await normalizePayload(req.params.resource, req.body, model, req.params.id);
    await item.update(payload);

    if (req.params.resource === "variant-ladders" && Array.isArray(req.body.items)) {
      await replaceVariantLadderItems(item.id, req.body.items);
      await clearSupportingDataCaches();

      return res.status(200).json({
        message: "Supporting data item updated successfully",
        data: await toVariantLadderPayload(item),
      });
    }

    await clearSupportingDataCaches();

    return res.status(200).json({
      message: "Supporting data item updated successfully",
      data: item.get({ plain: true }),
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: "Slug already exists" });
    }

    logger.error("Error updating supporting data item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSupportingDataItem: any = async (
  req: ResourceItemParamRequest,
  res: Response,
) => {
  try {
    const model = getResourceModel(req.params.resource);

    if (!model) {
      return res.status(404).json({ message: "Supporting data resource not found" });
    }

    const item = await model.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Supporting data item not found" });
    }

    if (req.params.resource === "variant-ladders") {
      await VariantLadderItems.destroy({ where: { variant_ladder_id: item.id } });
    }

    await item.destroy();
    await clearSupportingDataCaches();

    return res.status(200).json({
      message: "Supporting data item deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting supporting data item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
