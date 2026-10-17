//Type permettant de synchronisé le type DTO et le type mongo, si un champ est ajouté à l'un alors une erreur se lèvera dans les fonction toxxxDTO tant que l'autre n'aura pas eu ce champ d'ajouté. Les deux types restent séparés car ils ne représentent pas la même chose

import { Types } from "mongoose"

type Diff<A, B> = Exclude<A, B> | Exclude<B, A>

export type Synced<DTO, Fields, Hidden extends keyof Fields = never> =
  [Diff<keyof DTO, Exclude<keyof Fields, Hidden> | "_id">] extends [never]
    ? DTO
    : { "champs absents du modele ou du DTO": Diff<keyof DTO, Exclude<keyof Fields, Hidden> | "_id"> }

// type de création d'un document dans le cas de la présence de sous document
export type Plain<T> = { [K in keyof T]: T[K] extends Types.DocumentArray<infer U> ? Plain<U>[] : T[K] }
