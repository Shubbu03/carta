import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface ILetter extends Document {
  id: string;
  title: string;
  content: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LetterSchema: Schema<ILetter> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

LetterSchema.virtual("id").get(function (this: ILetter) {
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

const Letter: Model<ILetter> =
  models.Letter || mongoose.model<ILetter>("Letter", LetterSchema);

export default Letter;
