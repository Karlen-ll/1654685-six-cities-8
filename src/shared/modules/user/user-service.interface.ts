import { DocumentType } from '@typegoose/typegoose';
import { CreateUserDto } from './dto/create-user.dto.js';
import { updateUserDto } from './dto/update-user.dto.js';
import { UserEntity } from './user.entity.js';

export interface UserService {
  create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;
  updateById(userId: string, dto: updateUserDto): Promise<DocumentType<UserEntity> | null>;
}
