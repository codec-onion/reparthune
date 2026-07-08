export interface UserDTO {
  _id: string,
  name: string,
  email: string,
  createdAt: Date
}

export interface UserBDD extends UserDTO{
  hashedPassword: string
}

export interface UserRegister extends Omit<UserDTO, "_id" | "createdAt">{
  password: string
}

export type UserLogin = Omit<UserRegister, "name">