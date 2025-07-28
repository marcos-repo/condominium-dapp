import { Router } from "express";
import ResidentController from "../controllers/ResidentController";
import { onlyCounselor, onlyManager } from "../middlewares/authorizationMiddleware";

const router = Router();

router.get('/:wallet', ResidentController.getResident);
router.post('/', onlyCounselor, ResidentController.addResident);
router.patch('/:wallet', onlyManager, ResidentController.updateResident);
router.delete('/:wallet', onlyManager, ResidentController.deleteResident);

export default router;
