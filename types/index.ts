// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  activeGroupId: string | null;
  // Backward compatibility while older seed docs still use this field.
  sharedGroupId?: string | null;
}

export type AuthProvider = 'mock' | 'firebase';

export interface UserProfileDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  activeGroupId: string | null;
  sharedGroupId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface LoomJoinRequest {
  requesterUid: string;
  status: JoinRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface GroupInvite {
  id: string;
  groupId: string;
  emailLower: string;
  role: 'member';
  status: InviteStatus;
  tokenHash: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  acceptedBy: string | null;
  acceptedAt: string | null;
}

// ─── Impression ───────────────────────────────────────────────────────────────
export interface ImpressionLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Impression {
  id: string;
  authorId: string;
  placeName: string;
  description: string;
  rating: 1 | 2 | 3 | 4 | 5;
  images: string[];
  location: ImpressionLocation | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateImpressionInput = Omit<Impression, 'id' | 'createdAt' | 'updatedAt'>;

// ─── Calendar ─────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  authorId: string;
  title: string;
  description: string;
  date: string;
  time: string | null;
  createdAt: string;
}

export type CreateCalendarEventInput = Omit<CalendarEvent, 'id' | 'createdAt'>;

// ─── Goals ────────────────────────────────────────────────────────────────────
export type GoalStatus =
  | 'pending'
  | 'in_progress'
  | 'finished'
  | 'blocked'
  | 'cancelled';

export type GoalPeriod = 'weekly' | 'monthly';

export interface Goal {
  id: string;
  authorId: string;
  title: string;
  description: string;
  period: GoalPeriod;
  periodLabel: string;
  status: GoalStatus;
  statusReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateGoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateGoalStatusInput {
  id: string;
  status: GoalStatus;
  reason?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  totalImpressions: number;
  avgRating: number;
  upcomingEventsCount: number;
  goalsByStatus: Record<GoalStatus, number>;
  recentImpressions: Impression[];
  upcomingEvents: CalendarEvent[];
}

// ─── Shared / Utility ─────────────────────────────────────────────────────────
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  finished: 'Finished',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
};

export const GOAL_PERIOD_LABELS: Record<GoalPeriod, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
};
