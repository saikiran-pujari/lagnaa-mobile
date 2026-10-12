import { create } from 'zustand';

export type SessionStatus = 'booting' | 'signedOut' | 'signedIn' | 'needsProfile';
export type SignOutReason = 'user' | 'expired' | 'revoked' | 'deleted';

export interface SessionState {
  status: SessionStatus;
  memberId: string | null;
  role: string | null;
  lastSignOutReason: SignOutReason | null;
}

export interface SessionActions {
  setBooting(): void;
  setSignedIn(memberId: string, role: string | null, needsProfile: boolean): void;
  setNeedsProfile(needsProfile: boolean): void;
  setSignedOut(reason: SignOutReason | null): void;
}

export const useSessionStore = create<SessionState & SessionActions>()((set) => ({
  status: 'booting',
  memberId: null,
  role: null,
  lastSignOutReason: null,
  setBooting: () => set({ status: 'booting' }),
  setSignedIn: (memberId, role, needsProfile) =>
    set({
      status: needsProfile ? 'needsProfile' : 'signedIn',
      memberId,
      role,
      lastSignOutReason: null,
    }),
  setNeedsProfile: (needsProfile) =>
    set((s) => (s.memberId ? { status: needsProfile ? 'needsProfile' : 'signedIn' } : s)),
  setSignedOut: (reason) =>
    set({ status: 'signedOut', memberId: null, role: null, lastSignOutReason: reason }),
}));

export const selectStatus = (s: SessionState) => s.status;
export const selectMemberId = (s: SessionState) => s.memberId;
