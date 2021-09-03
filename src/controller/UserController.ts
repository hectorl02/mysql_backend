import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "../entity/User";
import { validate } from "class-validator";

export class UserController {
  //get all
  static getAll = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    let users;
    try {
      users = await userRepository.find();
    } catch (error) {
      res.status(404).json({ message: "No hallados" });
    }

    if (users.length > 0) {
      res.send(users);
    } else {
      res.status(404).json({ message: "No hallados" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id);
      res.send(user);
    } catch (error) {
      res.status(404).json({ message: "No hallado" });
    }
  };

  static newUser = async (req: Request, res: Response) => {
    const { username, password, role, refreshToken, resetToken } = req.body;

    const user = new User();

    if (user.resetToken === "") {
      user.resetToken = " ";
    }

    if (user.refreshToken === "") {
      user.refreshToken = " ";
    }

    user.username = username;
    user.password = password;
    user.role = role;

    const errors = await validate(user, {
      validationError: { target: false, value: false },
    });
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // hash de password

    const userRepository = getRepository(User);
    try {
      user.hashPassword();
      await userRepository.save(user);
    } catch (error) {
      return res.status(409).json({ message: "Us ya existe", error });
    }

    res.send("Us creado");
  };

  static editUser = async (req: Request, res: Response) => {
    let user;
    const { id } = req.params;
    const { username, role } = req.body;

    const userRepository = getRepository(User);

    try {
      user = await userRepository.findOneOrFail(id);
      user.username = username;
      user.role = role;
    } catch (error) {
      return res.status(404).json({ message: "Us no hallado" });
    }

    const errors = await validate(user, {
      validationError: { target: false, value: false },
    });

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    try {
      await userRepository.save(user);
    } catch (error) {
      return res.status(409).json({ message: "Us esta usado" });
    }
    res.status(201).json({ message: "Us modificado" });
  };

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      return res.status(404).json({ message: "Us no hallado" });
    }

    userRepository.delete(id);
    res.status(201).json({ message: "Us borrado" });
  };
}

export default UserController;
