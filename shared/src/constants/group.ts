export const roles = ["admin", "member", "readonly"] as const

export type Role = typeof roles[number]

export const currencies = ["EUR", "USD", "CHF", "GBP", "JPY"] as const

export type Currency = typeof currencies[number]

export const sharesLimits = {
  min: 0,
  max: 99
}