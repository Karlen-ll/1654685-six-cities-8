import { Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { CreateUserMessages } from './create-user.messages.js';
import { UserType } from '../../../types/index.js';

export class CreateUserDto {
  @IsEmail({}, { message: CreateUserMessages.email.invalidFormat })
  @Expose()
  public email: string;

  @IsString({ message: CreateUserMessages.name.invalidFormat })
  @Length(1, 15, { message: CreateUserMessages.name.lengthField })
  @Expose()
  public name: string;

  @IsOptional()
  @IsString({ message: CreateUserMessages.avatarPath.invalidFormat })
  @Expose()
  public avatarPath?: string;

  public type: UserType;

  @IsString({ message: CreateUserMessages.password.invalidFormat })
  @Length(6, 12, { message: CreateUserMessages.password.lengthField })
  @Expose()
  public password: string;
}
