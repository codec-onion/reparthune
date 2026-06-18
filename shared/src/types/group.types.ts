export interface Group {
  _id: string,
  name: string,
  members: Member[],
  createdAt: Date
}

export interface Member {
  _id: string,
  name: string,
  role: string
}