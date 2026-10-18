import type { GraphStore } from "../store.ts";
import type { ToolContext } from "../common.ts";
import type { ToolName } from "../contracts.ts";
import { searchExperiences } from "./search.ts";
import { getExperience } from "./get.ts";
import { checkFeasibility } from "./feasibility.ts";
import { requestExperience } from "./request.ts";

export const TOOLS: Record<ToolName, (store: GraphStore, args: any, ctx: ToolContext) => object> = {
  search_experiences: searchExperiences,
  get_experience: getExperience,
  check_feasibility: checkFeasibility,
  request_experience: requestExperience,
};
