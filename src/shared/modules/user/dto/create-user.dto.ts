import { UserType } from '../../../types/index.js';

export class CreateUserDto {
  public email: string;
  public name: string;
  public avatarPath?: string;
  public type: UserType;
  public password: string;
}
