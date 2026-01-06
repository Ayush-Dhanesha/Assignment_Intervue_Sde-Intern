import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPollOption {
    _id?: Types.ObjectId;
    text: string;
    votes: number;
    votedBy: Types.ObjectId[];
    isCorrect: boolean;
}

export interface IPoll extends Document {
    question: string;
    options: IPollOption[];
    createdBy: Types.ObjectId;
    isActive: boolean;
    duration: number;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
}

const pollOptionSchema = new Schema<IPollOption>({
    text: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    votedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isCorrect: {
        type: Boolean,
        default: false
    }
}, { _id: true });

const pollSchema = new Schema<IPoll>({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [pollOptionSchema],
        validate: {
            validator: function(v: IPollOption[]) {
                return v.length >= 2 && v.length <= 6;
            },
            message: 'A poll must have between 2 and 6 options'
        }
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    duration: {
        type: Number,
        default: 60
    },
    startedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IPoll>('Poll', pollSchema);
