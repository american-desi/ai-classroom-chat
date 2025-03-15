import { Schema, model, Document, Model, Types } from 'mongoose';

interface IBreakoutRoom {
  name: string;
  participants: Types.ObjectId[]; // User IDs
  isActive: boolean;
}

export interface IClassroom extends Document {
  name: string;
  code: string;
  teacher: Types.ObjectId; // User ID
  students: Types.ObjectId[]; // User IDs
  breakoutRooms: IBreakoutRoom[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IClassroomModel extends Model<IClassroom> {
  findOne(criteria: { code: string }): Promise<IClassroom | null>;
}

const classroomSchema = new Schema<IClassroom, IClassroomModel>(
  {
    name: {
      type: String,
      required: [true, 'Classroom name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Classroom code is required'],
      unique: true,
      trim: true,
    },
    teacher: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher is required'],
    },
    students: [{
      type: Types.ObjectId,
      ref: 'User',
    }],
    breakoutRooms: [{
      name: String,
      participants: [{
        type: Types.ObjectId,
        ref: 'User',
      }],
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a unique classroom code
classroomSchema.pre('save', async function(this: IClassroom, next) {
  if (!this.isModified('code')) {
    return next();
  }
  
  // Generate a 6-character alphanumeric code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  let code = generateCode();
  let codeExists = true;
  
  // Keep generating new codes until we find a unique one
  while (codeExists) {
    const existingClassroom = await (this.constructor as IClassroomModel).findOne({ code });
    if (!existingClassroom) {
      codeExists = false;
    } else {
      code = generateCode();
    }
  }
  
  this.code = code;
});

export const Classroom = model<IClassroom, IClassroomModel>('Classroom', classroomSchema); 