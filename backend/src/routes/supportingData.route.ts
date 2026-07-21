import { Router } from "express";
import {
  createSupportingDataItem,
  deleteSupportingDataItem,
  listSupportingData,
  updateSupportingDataItem,
} from "../controllers/supportingData.controller";
import { cacheResponse } from "../utils/cache.utils";

const supportingDataRouter = Router();

supportingDataRouter.get("/", cacheResponse("supporting-data", 300), listSupportingData);
supportingDataRouter.post("/:resource", createSupportingDataItem);
supportingDataRouter.patch("/:resource/:id", updateSupportingDataItem);
supportingDataRouter.delete("/:resource/:id", deleteSupportingDataItem);

export default supportingDataRouter;
