export interface UserDTO {
  _id: string,
  name: string,
  email: string,
  createdAt: Date
}

export interface UserBDD {
  _id: string,
  name: string,
  email: string,
  hashedPassword: string,
  createdAt: Date
}