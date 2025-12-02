import { Router } from "express";
import { fanpageBroadcast, fanpageSendMessageFromWeb } from "./fanpage.controller";

const router = Router();

router.post("/broadcast", fanpageBroadcast);
router.post("/send", fanpageSendMessageFromWeb);
export default router;
