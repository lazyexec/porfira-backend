import { Model } from "mongoose";

export interface IStudent {
  interestedSubjects?: string[] | null;
}

export interface ITeacher {
  yearsOfTeachingExp?: number | null;
  subjectsTaught?: string[] | null;
  stripePriceId?: string | null;
  hourlyRate?: number | null;
  availableTime?: {
    startTime?: string | null;
    endTime?: Date | null;
  } | null;
  availableDays?: string[] | null;
  content?: string | null;
  documents?: string[] | null;
  rating?: number | null;
  qualification?: {
    title: string;
    institution: string;
    year: number;
  }[];
  isAccepted?: boolean;
  balance?: number | null;
}

export interface IUser {
  email: string;
  avatar: string;
  isEmailVerified: boolean;
  isResetPassword: boolean;
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
