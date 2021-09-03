import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import * as bcrypt from "bcryptjs";
import { validate } from "class-validator";

export const createAdmin = async () => {
  const user = new User();
  user.username = "admin@localhost.com";
  user.password = await bcrypt.hash("administrator", 10);
  user.role = "admin";
  user.refreshToken = " ";
  user.resetToken = " ";

  const errors = await validate(user, {
    validationError: { target: false, value: false },
  });

  const userRepository = getRepository(User);

  try {
    user.hashPassword();
    await userRepository.save(user);
  } catch (error) {
    return error;
  }

  console.log("Us creado");
};
