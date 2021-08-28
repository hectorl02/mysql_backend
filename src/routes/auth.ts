import { Router } from "express";
import AuthController from "../controller/AuthController";
import { checkJwt } from "../middleware/jwt";
const router = Router();

router.post("/login", AuthController.login);

router.post('/changePassword',[checkJwt],AuthController.changePassword);

export default router;
