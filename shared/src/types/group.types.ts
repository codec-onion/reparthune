import type { Currency, Role } from "../constants/group"

export interface MemberDTO {
  _id: string,
  userId: string | null,
  name: string,
  shares: number,
  role: Role
}

export interface ParticipantDTO {
  _id: string,
  memberId: string,
  shares: number
}

export interface PresetDTO {
  _id: string,
  name: string,
  participants: ParticipantDTO[]
}

export interface GroupDTO {
  _id: string,
  name: string,
  currency: Currency,
  createdBy: string,
  members: MemberDTO[],
  presets: PresetDTO[],
  createdAt: string
}