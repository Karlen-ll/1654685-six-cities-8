import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { UserEntity } from '../user/index.js';
import { OfferEntity } from '../offer/index.js';

export interface CommentEntity extends defaultClasses.Base {}

@modelOptions({ schemaOptions: { collection: 'comments', timestamps: true } })
export class CommentEntity extends defaultClasses.TimeStamps {
  @prop({ trim: true, required: true })
  public text: string;

  @prop({ required: true })
  public rating: number;

  @prop({ ref: UserEntity, required: true })
  public author: Ref<UserEntity>;

  @prop({ ref: OfferEntity, required: true })
  public offer: Ref<OfferEntity>;
}

export const CommentModel = getModelForClass(CommentEntity);
