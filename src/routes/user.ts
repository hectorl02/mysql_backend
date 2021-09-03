import { Router } from "express";
import { UserController } from "../controller/UserController";
import { checkRole } from "../middleware/role";
import { checkJwt } from "./../middleware/jwt";
const router = Router();

// get all users
router.get("/", [checkJwt], UserController.getAll);

// get one user
router.get("/:id", [checkJwt, checkRole(["user"])], UserController.getById);

// create user
router.post("/", [checkJwt, checkRole(["admin"])], UserController.newUser);

//edit user
router.patch("/:id", [checkJwt, checkRole(["admin"])], UserController.editUser);

// delete user
router.delete(
  "/:id",
  [checkJwt, checkRole(["admin"])],
  UserController.deleteUser
);

export default router;
