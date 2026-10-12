export const role = ["admin", "member", "readonly"] as const

export type Role = typeof role

export const currency = ["EUR", "USD", "CHF", "GBP", "JPY"] as const

export type Currency = typeof currency

export const sharesLimits = {
  min: 0,
  max: 99
}