import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: {
    text: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const conversationMongoSchema: Schema = new Schema(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
      validate: {
        validator: function (v: mongoose.Types.ObjectId[]) {
          return v.length === 2;
        },
        message: 'Conversation must have exactly 2 participants',
      },
      required: true,
      index: true,
    },
    lastMessage: {
      text: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

conversationMongoSchema.index({ participants: 1 });
conversationMongoSchema.index({ updatedAt: -1 });

conversationMongoSchema.pre('save', function (this: IConversation) {
  if (this.isModified('participants')) {
    this.participants.sort((a, b) => a.toString().localeCompare(b.toString()));
  }
});

export const ConversationModel = mongoose.model<IConversation>(
  'Conversation',
  conversationMongoSchema
);
