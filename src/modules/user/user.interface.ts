import { Model, Types } from "mongoose";

export interface IStudent {
  interestedSubjects?: string[] | null;
}

export interface ITeacher {
  yearsOfTeachingExp?: number | null;
  subjectsTaught?: string[] | null;
  stripePriceId?: string | null;
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean;
  stripePayoutsEnabled?: boolean;
  hourlyRate?: number | null;
  availableTime?: {
    startTime?: string | null;
    endTime?: Date | null;
  } | null;
  availableDays?: string[] | null;
  content?: string | null;
  documents?: string[] | null;
  rating?: number | 0;
  qualification?: {
    title: string;
    institution: string;
    year: number;
  }[];
  status?: string;
  balance?: number | null;
}

export interface IUser {
  email: string;
  avatar: string;
  isEmailVerified: boolean;
  isResetPassword: boolean;
  id?: Types.ObjectId | string;
  _id?: Types.ObjectId | string;
  isDeleted: boolean;
  name?: string | null;
  googleAuth?: string | null;
  password?: string | null;
  role: string;
  oneTimeCode?: string | null;
  onTimeCodeExpires?: Date | null;
  fcmToken?: string | null;
  student?: IStudent;
  teacher?: ITeacher;
  dateOfBirth?: Date | null;
  phoneNumber?: number | null;
  countryCode?: string | null;
  bio?: string | null;
  isRestricted?: boolean;
  restrictionReason?: string | null;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface IUserMethods {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
  isPhoneNumberTaken(
    phoneNumber: number,
    excludeUserId?: string
  ): Promise<boolean>;
}
