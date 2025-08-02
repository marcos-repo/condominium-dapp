import { Router } from "express";
import TopicFileController from "../controllers/TopicFileController";
import { onlyCounselor, onlyManager } from "../middlewares/authorizationMiddleware";

const router = Router();


//<TODO>: Rever as permissoes
router.get('/:hash/:fileName', TopicFileController.getTopicFile);
router.get('/:hash/', TopicFileController.getTopicFiles);
router.post('/:hash/', /*onlyCounselor,*/ TopicFileController.addTopicFile);
router.delete('/:hash/:fileName', /*onlyManager,*/ TopicFileController.deleteTopicFile);
router.delete('/:hash/', /*onlyManager,*/ TopicFileController.deleteAllTopicFiles);

export default router;
