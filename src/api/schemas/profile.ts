import { z } from 'zod';

import { envelope, isoDate, nullableString } from './common';

const nullableNumber = z.number().nullable().optional();

/** Fields the server includes at every level (mapToPublicProfile). */
const publicFields = {
  id: z.string(),
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.number().nullable().optional(),
  height: nullableNumber,
  city: nullableString,
  state: nullableString,
  education: nullableString,
  profession: nullableString,
  profilePhoto: nullableString,
  photos: z.array(z.string()).optional().default([]),
  maritalStatus: nullableString,
  subCaste: nullableString,
  shortBio: nullableString,
  gender: z.string().nullable().optional(),
  lastActive: isoDate.nullable().optional(),
  activeToday: z.boolean().optional(),
  profileFor: z.string().nullable().optional(),
  hobbiesInterests: nullableString,
  lifeGoals: nullableString,
  nativePlace: nullableString,
  motherTongue: nullableString,
  familyType: nullableString,
  interestStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
};

/** Level 1. Strict on contact fields: an email or phone here is a contract violation. */
export const PublicProfile = z
  .object({
    ...publicFields,
    email: z.never().optional(),
    phone: z.never().optional(),
    contactUnlocked: z.literal(false).optional(),
  })
  .loose();

const privateFields = {
  ...publicFields,
  dateOfBirth: isoDate.nullable().optional(),
  timeOfBirth: nullableString,
  annualIncome: nullableString,
  preferredAgeMin: nullableNumber,
  preferredAgeMax: nullableNumber,
  preferredHeightMin: nullableNumber,
  preferredHeightMax: nullableNumber,
  preferredEducation: nullableString,
  preferredDiet: nullableString,
  preferredLocation: nullableString,
  preferredMaritalStatus: nullableString,
  fatherName: nullableString,
  motherName: nullableString,
  fatherOccupation: nullableString,
  motherOccupation: nullableString,
  siblings: nullableString,
  familyStatus: nullableString,
  familyBackground: nullableString,
  horoscope: nullableString,
  kuldevi: nullableString,
  gotra: nullableString,
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY']).optional(),
  profileViews: z.number().optional(),
  weight: nullableNumber,
  location: nullableString,
  country: nullableString,
  educationDetails: nullableString,
  companyName: nullableString,
  familyValues: nullableString,
  diet: nullableString,
  smoking: nullableString,
  drinking: nullableString,
  manglik: z.boolean().nullable().optional(),
  lookingFor: nullableString,
  photoPrivacy: nullableString,
  bio: nullableString,
  createdAt: isoDate.optional(),
  updatedAt: isoDate.optional(),
};

/** Level 2: contactUnlocked false, carries contactRequestStatus. */
export const PrivateProfileWithoutContact = z
  .object({
    ...privateFields,
    contactUnlocked: z.literal(false),
    contactRequestStatus: z.enum(['NONE', 'PENDING', 'ACCEPTED', 'REJECTED']).optional(),
    email: z.never().optional(),
    phone: z.never().optional(),
  })
  .loose();

/** Level 3: contactUnlocked true, email + phone present. */
export const PrivateProfileWithContact = z
  .object({
    ...privateFields,
    contactUnlocked: z.literal(true),
    email: z.string(),
    phone: nullableString,
    isVerified: z.boolean().optional(),
  })
  .loose();

export const ProfileResponse = envelope(
  z.union([PrivateProfileWithContact, PrivateProfileWithoutContact, PublicProfile]),
);

export const UpdateProfileResponse = envelope(
  z.looseObject({ id: z.string(), userId: z.string() }),
);

export const ViewersResponse = z.looseObject({
  success: z.literal(true),
  data: z.array(
    z.looseObject({ viewerUserId: z.string().optional(), viewedAt: isoDate.optional() }),
  ),
});
