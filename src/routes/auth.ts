import { Router } from "express";
import AuthController from "../controller/AuthController";
import { checkJwt } from "../middleware/jwt";
const router = Router();

router.post("/login", AuthController.login);

router.put("/forgotPassword", AuthController.forgotPassword);

router.put("/newPassword", AuthController.createNewPassword);

router.post("/changePassword", [checkJwt], AuthController.changePassword);

router.post("/refreshToken", [checkJwt], AuthController.refreshToken);

export default router;
