import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChat extends Document {
    sender: Types.ObjectId;
    message: string;
    createdAt: Date;
}

const chatSchema = new Schema<IChat>({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IChat>('Chat', chatSchema);
