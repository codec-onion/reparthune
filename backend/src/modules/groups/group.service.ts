import mongoose from "mongoose"
import { Group } from "./group.model"

import type { GroupDoc, MemberDoc, PresetDoc, ParticipantDoc, GroupFields, MemberFields, ParticipantFields, PresetFields, GroupCreate, MemberCreate } from "./group.model"
import type { GroupDTO, MemberDTO, PresetDTO, CreateGroupInput, ParticipantDTO } from "@reparthune/shared"
import type { Synced } from "../../types/syncedType"

function toMemberDTO(member: MemberDoc): Synced<MemberDTO, MemberFields> {
  return {
    _id: member._id.toString(),
    userId: member.userId ? member.userId.toString() : null,
    name: member.name,
    shares: member.shares,
    role: member.role
  }
}

function toPartcipantDTO(participant: ParticipantDoc): Synced<ParticipantDTO, ParticipantFields> {
  return {
    _id: participant._id.toString(),
    memberId: participant.memberId.toString(),
    shares: participant.shares
  }
}

function toPresetDTO(preset: PresetDoc): Synced<PresetDTO, PresetFields> {
  return {
    _id: preset._id.toString(),
    name: preset.name,
    participants: preset.participants.map(toPartcipantDTO)
  }
}

export function toGroupDTO(group: GroupDoc): Synced<GroupDTO, GroupFields> {
  return {
    _id: group._id.toString(),
    name: group.name,
    currency: group.currency,
    createdBy: group.createdBy.toString(),
    members: group.members.map(toMemberDTO),
    presets: group.presets.map(toPresetDTO),
    createdAt: group.createdAt.toISOString()
  }
}

export async function createGroup(data: CreateGroupInput, userId: string): Promise<GroupDTO> {
  const creator: Required<MemberCreate> = {
    ...data.creator,
    role: "admin",
    userId: new mongoose.Types.ObjectId(userId)
  }
  const members: MemberCreate[] = data.members.map(member => ({
    ...member,
    role: "readonly",
  }))
  const groupInput: GroupCreate = {
    name: data.name,
    currency: data.currency,
    createdBy: new mongoose.Types.ObjectId(userId),
    members: [...members, creator],
    presets: []
  }
  const group = new Group(groupInput)
  await group.save()

  return toGroupDTO(group)
}

// export async function updateGroup(data): Promise<GroupDTO> {

// }