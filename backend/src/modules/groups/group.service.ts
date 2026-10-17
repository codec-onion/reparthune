import mongoose from "mongoose"
import { Group } from "./group.model"
import { AppError } from "../../errors/AppError"

import type {
  GroupDoc,
  MemberDoc,
  PresetDoc,
  ParticipantDoc,
  GroupFields,
  MemberFields,
  ParticipantFields,
  PresetFields,
  GroupCreate,
  MemberCreate
} from "./group.model"
import type {
  GroupDTO,
  MemberDTO,
  PresetDTO,
  ParticipantDTO,
  CreateGroupInput,
  UpdateGroupInput
} from "@reparthune/shared"
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
    description: group.description ?? null,
    period: group.period,
    currency: group.currency,
    createdBy: group.createdBy.toString(),
    members: group.members.map(toMemberDTO),
    presets: group.presets.map(toPresetDTO),
    createdAt: group.createdAt.toISOString()
  }
}

export async function getGroups (userId: string): Promise<GroupDTO[] | null> {
  const groups = await Group.find({ "members.userId": userId })
  return groups.map(toGroupDTO)
}

export async function getOneGroup (groupId: string, userId: string): Promise<GroupDTO | null> {
  if (!mongoose.isValidObjectId(groupId)) throw new AppError("Syntaxe id de groupe non valide", 400, "VALIDATION_ERROR")
  const group = await Group.findOne({ _id: groupId, "members.userId": userId })
  return group ? toGroupDTO(group) : null
}

export async function createGroup(data: CreateGroupInput, userId: string): Promise<GroupDTO> {
  const creator: MemberCreate = {
    ...data.creator,
    role: "admin",
    userId: new mongoose.Types.ObjectId(userId)
  }
  const members: MemberCreate[] = data.members.map(member => ({
    ...member,
    role: "readonly",
    userId: null
  }))
  const groupInput: GroupCreate = {
    name: data.name,
    description: data.description,
    period: data.period,
    currency: data.currency,
    createdBy: new mongoose.Types.ObjectId(userId),
    members: [...members, creator],
    presets: []
  }
  const group = new Group(groupInput)
  await group.save()

  return toGroupDTO(group)
}

export async function updateGroup(group: GroupDoc, data: UpdateGroupInput): Promise<GroupDTO> {
  group.set(data)
  const savedGroup = await group.save()
  return toGroupDTO(savedGroup)
}

export async function deleteGroup(group: GroupDoc) {
  const deletedGroup = await group.deleteOne(group._id)
  if (!deletedGroup.acknowledged) throw new Error
}