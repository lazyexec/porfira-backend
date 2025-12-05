export interface IStudent {
  interestedSubjects?: string[] | null;
}

export interface ITeacher {
  yearsOfTeachingExp?: number | null;
  subjectsTaught?: string[] | null;
  hourlyRate?: number | null;
  availableTime?: {
    startTime?: string | null;
    endTime?: Date | null;
  } | null;
  availableDays?: string[] | null;
  documents?: string[] | null;
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
  role?: string | null;
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

