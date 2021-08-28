import { Request, Response } from "express";
import { getRepository } from "typeorm";
import config from "../config/config";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";

class AuthController {
  static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).json({ message: "Usuario y Pass son requeridos" });
    }
    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      return res.status(400).json({ message: "user o pass incorrectos" });
    }

    // check password
    if(!user.checkPassword(password)){
      return res.status(400).json({message: 'usiario o password es incorrecto'});
    }

    const token = jwt.sign({userId:user.id, username:user.username}, config.jwtSecret, {expiresIn:'1h'});

    res.json({message: 'ok', token:token});
  };

  static changePassword = async (req: Request, res: Response) => {
    const{userId} = res.locals.jwtPayLoad;
    const{oldPassword,newPassword}= req.body;

    if (!(oldPassword && newPassword)) {
      res.status(400).json({message: 'Old y New Son requeridos'})
    }

    const userRepository =getRepository(User);
    let user: User;
    try {
      user= await userRepository.findOneOrFail(userId);
    } catch (error) {
      res.status(400).json({message: 'Algo esta mal'})
    }
    if(!userId.checkPassword(oldPassword)){
      return res.status(401).json({message:'Revisa tu old '})
    }
    user.password = newPassword;
    const errors = await validate(user,{validationError:{target:false, value:false}});

    if (errors.length>0){
      return res.status(400).json(errors)
    }
    //hash pass
    user.hashPassword();
    userRepository.save(user);

    res.json({message: 'password cambiado'});


  }

}

export default AuthController;
