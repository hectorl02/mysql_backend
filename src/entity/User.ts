import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { MinLength, IsNotEmpty, IsEmail } from "class-validator";
import * as bcryptjs from "bcryptjs";

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MinLength(6)
  username: string;

  @Column()
  @MinLength(6)
  password: string;

  @Column()
  @IsNotEmpty()
  role: string;

  @Column()
  @CreateDateColumn()
  createAt: Date;

  @Column()
  @UpdateDateColumn()
  updateAt: Date;

  hashPassword():void{
      const salt = bcryptjs.genSaltSync(10);
      this.password = bcryptjs.hashSync(this.password, salt);
  }

  checkPassword(password: string):Boolean{
    return bcryptjs.compareSync(password, this.password);
  }


}
