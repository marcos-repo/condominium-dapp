import { Router } from "express";
import ResidentController from "../controllers/ResidentController";

const router = Router();

router.get('/:wallet', ResidentController.getResident);
router.post('/', ResidentController.addResident);
router.patch('/:wallet', ResidentController.updateResident);
router.delete('/:wallet', ResidentController.deleteResident);

export default router;
