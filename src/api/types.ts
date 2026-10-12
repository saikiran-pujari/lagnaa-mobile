/** Mobile-facing types. Names follow GLOSSARY.md, not the database. */

export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type ContactRequestStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
export type ProfileFor = 'SELF' | 'MY_SON' | 'MY_DAUGHTER' | 'MY_BROTHER' | 'MY_SISTER';

/** A photo is identified by its object key; the URL is a temporary, server-authorised credential. */
export interface PhotoRef {
  objectKey: string;
  url?: string;
}

export interface ProfileCard {
  profileId: string;
  memberId: string | null;
  name: string;
  firstName: string;
  age: number | null;
  city: string | null;
  state: string | null;
  profession: string | null;
  education: string | null;
  photo: PhotoRef | null;
  isVerified: boolean;
  activeToday: boolean;
  compatibilityScore: number | null;
  interestStatus: InterestStatus | null;
  profileFor: ProfileFor | null;
}

export interface ProfileCommon {
  profileId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  city: string | null;
  state: string | null;
  education: string | null;
  profession: string | null;
  maritalStatus: string | null;
  subCaste: string | null;
  bio: string | null;
  photos: PhotoRef[];
  primaryPhoto: PhotoRef | null;
  activeToday: boolean;
  profileFor: ProfileFor | null;
  hobbiesInterests: string | null;
  lifeGoals: string | null;
  nativePlace: string | null;
  motherTongue: string | null;
  familyType: string | null;
}

export interface ProfilePrivateDetails {
  dateOfBirth: string | null;
  timeOfBirth: string | null;
  annualIncome: string | null;
  fatherName: string | null;
  motherName: string | null;
  fatherOccupation: string | null;
  motherOccupation: string | null;
  siblings: string | null;
  familyStatus: string | null;
  familyBackground: string | null;
  familyValues: string | null;
  horoscope: string | null;
  kuldevi: string | null;
  gotra: string | null;
  manglik: boolean | null;
  diet: string | null;
  smoking: string | null;
  drinking: string | null;
  weight: number | null;
  educationDetails: string | null;
  companyName: string | null;
  lookingFor: string | null;
  preferences: {
    ageMin: number | null;
    ageMax: number | null;
    heightMin: number | null;
    heightMax: number | null;
    education: string | null;
    diet: string | null;
    location: string | null;
    maritalStatus: string | null;
  };
  visibility: Visibility | null;
  photoPrivacy: string | null;
  profileViews: number | null;
}

export type ProfileView =
  | ({ level: 'public'; interestStatus: 'PENDING' | null } & ProfileCommon)
  | ({ level: 'privateNoContact'; contactRequestStatus: ContactRequestStatus } & ProfileCommon &
      ProfilePrivateDetails)
  | ({
      level: 'privateWithContact';
      email: string;
      phone: string | null;
      isVerified: boolean;
    } & ProfileCommon &
      ProfilePrivateDetails);

export interface Member {
  memberId: string;
  email: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  hasProfile: boolean;
}

export interface AuthSessionResult {
  accessToken: string;
  refreshToken: string;
  member: Member;
  isNewMember: boolean;
  needsProfileCompletion: boolean;
}

export interface PageInfo {
  nextCursor: string | null;
  hasMore: boolean;
  total: number | null;
}

export interface Paged<T> {
  items: T[];
  page: PageInfo;
}

export interface MiniMember {
  memberId: string;
  profileId: string | null;
  firstName: string;
  lastName: string;
  photo: PhotoRef | null;
  city: string | null;
  profession: string | null;
  age: number | null;
}

export interface Interest {
  interestId: string;
  senderId: string;
  receiverId: string;
  status: InterestStatus;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  sender: MiniMember | null;
  receiver: MiniMember | null;
}

export interface InterestStats {
  sent: number;
  received: number;
  accepted: number;
  connections: number;
}

export interface ContactRequest {
  contactRequestId: string;
  requesterId: string;
  recipientId: string;
  status: Exclude<ContactRequestStatus, 'NONE'>;
  createdAt: string;
  requester: MiniMember | null;
  recipient: MiniMember | null;
}

export interface Conversation {
  conversationId: string;
  other: MiniMember | null;
  lastMessage: Message | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SearchFilters {
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  city?: string;
  state?: string;
  education?: string;
  profession?: string;
  subCaste?: string;
  gotra?: string;
  maritalStatus?: string;
  profileFor?: ProfileFor;
  diet?: string;
  motherTongue?: string;
  verifiedOnly?: boolean;
  sortBy?: 'lastActive' | 'createdAt' | 'recentlyJoined' | 'profileViews';
  sortOrder?: 'asc' | 'desc';
}

export type UploadPurpose =
  | 'profile-photo'
  | 'profile-photos'
  | 'horoscope'
  | 'verification-document'
  | 'verification-selfie';
