import { Request, Response } from "express";
import { getRepository } from "typeorm";
import config from "../config/config";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";
import { transporter } from "./../config/mailer";

class AuthController {
  static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).json({ message: "Us y Pass son requeridos" });
    }

    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      return res.status(400).json({ message: "Us o Pass incorrectos" });
    }

    // check password
    if (!user.checkPassword(password)) {
      return res.status(400).json({ message: "Usuario o pass es incorrecto" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecretRefresh,
      { expiresIn: "240" }
    );

    user.refreshToken = refreshToken;
    try {
      await userRepository.save(user);
    } catch (error) {
      return res.status(400).json({ message: "algoooo paso" });
    }

    res.json({ message: "ok", token, refreshToken, role: user.role });
  };

  static changePassword = async (req: Request, res: Response) => {
    const { userId } = res.locals.jwtPayLoad;
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      res.status(400).json({ message: "Old y New Son requeridos" });
    }

    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail(userId);
    } catch (error) {
      res.status(400).json({ message: "Algo esta mal" });
    }

    if (!userId.checkPassword(oldPassword)) {
      return res.status(401).json({ message: "Revisa tu old " });
    }
    user.password = newPassword;
    const errors = await validate(user, {
      validationError: { target: false, value: false },
    });

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }
    //hash pass
    user.hashPassword();
    userRepository.save(user);

    res.json({ message: "Pass cambiado" });
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Us es requerido" });
    }

    const message = "check tu email para el link.";
    let verificationLink;
    let emailStatus = "OK";

    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        config.jwtSecretReset,
        { expiresIn: "10m" }
      );
      verificationLink = `http://localhost:3000/newPassword/${token}`;
      user.resetToken = token;
    } catch (error) {
      return res.json({ message: "No hay us" });
    }

    // send mail with defined transport object

    try {
      await transporter.sendMail({
        from: '"forgot Password" <hector840219@gmail.com>', // sender address
        to: "hectorlopezp02@gmail.com", // list of receivers
        subject: "Hello ✔, vamos a cambiar password", // Subject line
        text: "Hello Tú, vamos a cambiar pass", // plain text body
        html: `<b>Hello world?</b>
        <a href ="${verificationLink}">${verificationLink}</a>
        `, // html body
      });
    } catch (error) {
      emailStatus = error;
      return res.status(400).json({ message: "algo pasó con el mail" });
    }

    try {
      await userRepository.save(user);
    } catch (error) {
      return res.status(400).json({ message: "Algo paso, no guardo" });
    }

    res.json({ message, info: emailStatus });
  };

  static createNewPassword = async (req: Request, res: Response) => {
    const { newPassword } = req.body;
    const resetToken = req.headers.reset as string;

    if (!(resetToken && newPassword)) {
      res.status(400).json({ message: "Campos son requeridos" });
    }

    const userRepository = getRepository(User);
    let jwtPayload;
    let user: User;

    try {
      jwtPayload = jwt.verify(resetToken, config.jwtSecretReset);
      user = await userRepository.findOneOrFail({ where: { resetToken } });
    } catch (error) {
      return res.status(401).json({ message: "No resetToken o vencido" });
    }

    if (user.refreshToken === "") {
      user.refreshToken = " ";
    }

    user.password = newPassword;
    const validationOps = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOps);

    if (errors.length > 0) {
      return res.status(400).json({ message: "Falta refresh" });
    }

    try {
      user.hashPassword();
      await userRepository.save(user);
    } catch (error) {
      return res.status(401).json({ message: "algo passooouu" });
    }

    res.json({ message: "Pass cambiado" });
  };

  static refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.headers.refresh as string;

    if (!refreshToken) {
      res.status(400).json({ message: "Algo salio mal" });
    }

    const userRepository = getRepository(User);
    let user: User;

    try {
      const verifyResult = jwt.verify(refreshToken, config.jwtSecretRefresh);
      const { username } = verifyResult as User;
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      return res.status(400).json({ message: "algo pasa aq" });
    }

    if (user.resetToken === "") {
      user.resetToken = " ";
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "240" }
    );
    res.json({ message: "Ok", token });
  };
}

export default AuthController;
