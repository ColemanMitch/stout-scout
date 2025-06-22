export interface CreatePatronRequest {
  name: string;
  email?: string;
  birthday?: string; // ISO date string
}

export interface UpdatePatronRequest {
  name?: string;
  email?: string;
  birthday?: string; // ISO date string
  totalPints?: number;
}

export interface CreatePintRequest {
  patronId: string;
  bartenderId: string;
}

export interface PatronResponse {
  id: string;
  name: string;
  email?: string;
  birthday?: Date;
  joinedAt: Date;
  loyaltyProgramJoinedAt: Date;
  totalPints: number;
  avatarUrl?: string;
}

export interface PintResponse {
  id: string;
  patronId: string;
  patronName: string;
  pouredAt: Date;
  bartenderId: string;
  bartenderName: string;
}

export interface LeaderboardEntry {
  patronId: string;
  patronName: string;
  totalPints: number;
  rank: number;
}

export interface MilestoneResponse {
  id: string;
  name: string;
  pintTarget: number;
  rewardText?: string;
} 