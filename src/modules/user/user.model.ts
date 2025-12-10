import mongoose from "mongoose";
import { roles } from "../../configs/roles.ts";
import regex from "../../utils/regex.ts";
import bcrypt from "bcrypt";
import hideFieldsPlugin from "../../plugins/mongoose/hideFields.plugin.ts";
import mongoosePaginate from "mongoose-paginate-v2";
import type {
  IStudent,
  ITeacher,
  IUser,
  IUserMethods,
  IUserModel,
} from "./user.interface.ts";

const studentSchema = new mongoose.Schema<IStudent>({
  interestedSubjects: {
    type: [String],
    required: false,
    default: null,
  },
});

const teacherSchema = new mongoose.Schema<ITeacher>({
  yearsOfTeachingExp: {
    type: Number,
    required: false,
    default: null,
  },
  subjectsTaught: {
    type: [String],
    required: false,
    default: null,
  },
  stripePriceId: {
    type: String,
    default: null,
    required: false,
  },
  stripeAccountId: {
    type: String,
    unique: true,
  },
  stripeOnboardingComplete: {
    type: Boolean,
    default: false,
  },
  stripePayoutsEnabled: {
    type: Boolean,
    default: false,
  },
  hourlyRate: {
    type: Number,
    required: false,
    default: null,
  },
  availableTime: {
    startTime: {
      type: String,
      required: false,
      default: null,
    },
    endTime: {
      type: Date,
      required: false,
      default: null,
    },
  },
  availableDays: {
    type: [String],
    required: false,
    default: null,
  },
  content: {
    type: String,
    required: false,
    default: null,
  },
  documents: {
    type: [String],
    required: false,
    default: null,
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
  },
  balance: {
    type: Number,
    required: false,
  },
  qualification: [
    {
      title: {
        type: String,
        required: false,
        default: null,
      },
      institution: {
        type: String,
        required: false,
        default: null,
      },
      year: {
        type: Number,
        required: false,
        default: null,
      },
    },
  ],
  status: {
    type: String,
    required: false,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const userSchema = new mongoose.Schema<
  IUser,
  mongoose.Model<IUser, {}, IUserMethods>,
  IUserMethods
>(
  {
    name: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!regex.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    avatar: {
      type: String,
      required: [true, "Image is must be Required"],
      default: "/uploads/users/user.png",
    },
    googleAuth: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true,
    },
    role: {
      type: String,
      enum: roles,
    },
    oneTimeCode: {
      type: String,
      required: false,
      default: null,
    },
    onTimeCodeExpires: {
      type: Date,
      required: false,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
      required: false,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      required: false,
      default: null,
    },
    phoneNumber: {
      type: Number,
      required: false,
      default: null,
    },
    countryCode: {
      type: String,
      required: false,
      default: null,
    },
    bio: {
      type: String,
      required: false,
      default: null,
    },
    student: {
      type: studentSchema,
      required: false,
      // default: null,
    },
    teacher: {
      type: teacherSchema,
      required: false,
      // default: null,
    },
    // STATUS
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    restrictionReason: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoosePaginate);
userSchema.plugin(hideFieldsPlugin);

// Middleware and Methods
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};
userSchema.statics.isPhoneNumberTaken = async function (
  phoneNumber,
  excludeUserId
) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  if (!user.password) return false;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password") && user.password) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

userSchema.pre("save", function (next) {
  if (this.role === "teacher" && !this.teacher) this.teacher = {};
  if (this.role === "student" && !this.student) this.student = {};
});

const User = mongoose.model<IUser, IUserModel>("user", userSchema);

export default User;
