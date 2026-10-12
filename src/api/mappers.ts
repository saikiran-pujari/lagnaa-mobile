import type { z } from 'zod';

import type * as C from './schemas/connections';
import type * as Mg from './schemas/messaging';
import type * as P from './schemas/profile';
import type * as S from './schemas/search';
import type {
  ContactRequest,
  Conversation,
  Interest,
  Message,
  MiniMember,
  PhotoRef,
  ProfileCard,
  ProfileFor,
  ProfileView,
} from './types';

const str = (v: string | null | undefined): string | null => (v == null || v === '' ? null : v);
const num = (v: number | null | undefined): number | null => (v == null ? null : v);
const profileFor = (v: string | null | undefined): ProfileFor | null =>
  v === 'SELF' || v === 'MY_SON' || v === 'MY_DAUGHTER' || v === 'MY_BROTHER' || v === 'MY_SISTER'
    ? v
    : null;

/**
 * The server inlines a presigned URL when the viewer may see the photo; otherwise the field is
 * the bare object key (or null). A value that looks like a URL is a credential, anything else a key.
 */
export function toPhotoRef(value: string | null | undefined): PhotoRef | null {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) {
    const keyGuess = value.split('?')[0]!.split('/').slice(-3).join('/');
    return { objectKey: keyGuess, url: value };
  }
  return { objectKey: value };
}

export function toProfileCard(card: z.infer<typeof S.SearchCard>): ProfileCard {
  return {
    profileId: card.id,
    memberId: card.user?.id ?? card.userId ?? null,
    name: card.name ?? `${card.firstName} ${card.lastName}`.trim(),
    firstName: card.firstName,
    age: num(card.age),
    city: str(card.city),
    state: str(card.state),
    profession: str(card.profession),
    education: str(card.education),
    photo: toPhotoRef(card.profileImage ?? card.profilePhoto),
    isVerified: card.user?.isVerified ?? false,
    activeToday: card.activeToday ?? false,
    compatibilityScore: num(card.compatibilityScore),
    interestStatus: card.interestStatus ?? null,
    profileFor: profileFor(card.profileFor),
  };
}

type AnyProfile =
  | z.infer<typeof P.PrivateProfileWithContact>
  | z.infer<typeof P.PrivateProfileWithoutContact>
  | z.infer<typeof P.PublicProfile>;

function common(p: AnyProfile) {
  const photos = (p.photos ?? []).map(toPhotoRef).filter((x): x is PhotoRef => x !== null);
  return {
    profileId: p.id,
    memberId: p.userId,
    firstName: p.firstName,
    lastName: p.lastName,
    age: num(p.age),
    gender: str(p.gender),
    height: num(p.height),
    city: str(p.city),
    state: str(p.state),
    education: str(p.education),
    profession: str(p.profession),
    maritalStatus: str(p.maritalStatus),
    subCaste: str(p.subCaste),
    bio: str('bio' in p ? (p.bio as string | null | undefined) : null) ?? str(p.shortBio),
    photos,
    primaryPhoto: toPhotoRef(p.profilePhoto),
    activeToday: p.activeToday ?? false,
    profileFor: profileFor(p.profileFor),
    hobbiesInterests: str(p.hobbiesInterests),
    lifeGoals: str(p.lifeGoals),
    nativePlace: str(p.nativePlace),
    motherTongue: str(p.motherTongue),
    familyType: str(p.familyType),
  };
}

function privateDetails(
  p: z.infer<typeof P.PrivateProfileWithoutContact> | z.infer<typeof P.PrivateProfileWithContact>,
) {
  return {
    dateOfBirth: str(p.dateOfBirth),
    timeOfBirth: str(p.timeOfBirth),
    annualIncome: str(p.annualIncome),
    fatherName: str(p.fatherName),
    motherName: str(p.motherName),
    fatherOccupation: str(p.fatherOccupation),
    motherOccupation: str(p.motherOccupation),
    siblings: str(p.siblings),
    familyStatus: str(p.familyStatus),
    familyBackground: str(p.familyBackground),
    familyValues: str(p.familyValues),
    horoscope: str(p.horoscope),
    kuldevi: str(p.kuldevi),
    gotra: str(p.gotra),
    manglik: p.manglik ?? null,
    diet: str(p.diet),
    smoking: str(p.smoking),
    drinking: str(p.drinking),
    weight: num(p.weight),
    educationDetails: str(p.educationDetails),
    companyName: str(p.companyName),
    lookingFor: str(p.lookingFor),
    preferences: {
      ageMin: num(p.preferredAgeMin),
      ageMax: num(p.preferredAgeMax),
      heightMin: num(p.preferredHeightMin),
      heightMax: num(p.preferredHeightMax),
      education: str(p.preferredEducation),
      diet: str(p.preferredDiet),
      location: str(p.preferredLocation),
      maritalStatus: str(p.preferredMaritalStatus),
    },
    visibility: p.visibility ?? null,
    photoPrivacy: str(p.photoPrivacy),
    profileViews: num(p.profileViews),
  };
}

export function toProfileView(p: AnyProfile): ProfileView {
  if ('contactUnlocked' in p && p.contactUnlocked === true) {
    const full = p;
    return {
      level: 'privateWithContact',
      ...common(full),
      ...privateDetails(full),
      email: full.email,
      phone: str(full.phone),
      isVerified: full.isVerified ?? false,
    };
  }
  if ('contactUnlocked' in p && p.contactUnlocked === false && 'dateOfBirth' in p) {
    const noContact = p as z.infer<typeof P.PrivateProfileWithoutContact>;
    return {
      level: 'privateNoContact',
      ...common(noContact),
      ...privateDetails(noContact),
      contactRequestStatus: noContact.contactRequestStatus ?? 'NONE',
    };
  }
  const pub = p as z.infer<typeof P.PublicProfile>;
  return {
    level: 'public',
    ...common(pub),
    interestStatus: pub.interestStatus === 'PENDING' ? 'PENDING' : null,
  };
}

type Party = {
  id: string;
  profile?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?: string | null;
    city?: string | null;
    profession?: string | null;
    age?: number | null;
  } | null;
};

export function toMiniMember(party: Party | null | undefined): MiniMember | null {
  if (!party) return null;
  const pr = party.profile ?? {};
  return {
    memberId: party.id,
    profileId: pr.id ?? null,
    firstName: pr.firstName ?? '',
    lastName: pr.lastName ?? '',
    photo: toPhotoRef(pr.profilePhoto),
    city: str(pr.city),
    profession: str(pr.profession),
    age: num(pr.age),
  };
}

export function toInterest(i: z.infer<typeof C.Interest>): Interest {
  return {
    interestId: i.id,
    senderId: i.senderId,
    receiverId: i.receiverId,
    status: i.status,
    message: str(i.message),
    createdAt: i.createdAt,
    respondedAt: i.respondedAt ?? null,
    sender: toMiniMember(i.sender),
    receiver: toMiniMember(i.receiver),
  };
}

export function toContactRequest(r: z.infer<typeof C.ContactRequest>): ContactRequest {
  return {
    contactRequestId: r.id,
    requesterId: r.requesterId,
    recipientId: r.recipientId,
    status: r.status,
    createdAt: r.createdAt,
    requester: toMiniMember(r.requester),
    recipient: toMiniMember(r.recipient),
  };
}

export function toMessage(m: z.infer<typeof Mg.Message>): Message {
  return {
    messageId: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    isRead: m.isRead,
    createdAt: m.createdAt,
  };
}

export function toConversation(c: z.infer<typeof Mg.Conversation>): Conversation {
  return {
    conversationId: c.id,
    other: toMiniMember(c.otherUser),
    lastMessage: c.lastMessage ? toMessage(c.lastMessage) : null,
    unreadCount: c.unreadCount ?? 0,
    lastMessageAt: c.lastMessageAt ?? c.lastMessage?.createdAt ?? null,
  };
}
