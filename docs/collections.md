# Collections MongoDB

## users

```typescript
{
  _id:       ObjectId,
  name:      string,
  email:     string,    // unique, indexé
  password:  string,    // hash bcrypt (salt 12)
  createdAt: Date
}
```

**Index :** `{ email: 1 }` unique

---

## groups

```typescript
{
  _id:       ObjectId,
  name:      string,
  currency:  string,    // "EUR" par défaut
  createdBy: ObjectId,  // ref users

  members: [
    {
      _id:    ObjectId,        // id du sous-document
      userId: ObjectId | null, // null si non encore rattaché à un compte
      name:   string,          // nom affiché dans l'interface
      shares: number,          // parts globales du membre (min 1)
      role:   "admin" | "member" | "readonly"
    }
  ],

  // Sélections prédéfinies — raccourcis réutilisables sur les dépenses
  presets: [
    {
      _id:  ObjectId,
      name: string,   // ex. "Chambre A", "Équipe cuisine"
      participants: [
        {
          memberId: ObjectId, // ref members._id (sous-document)
          shares:   number    // parts dans le contexte de ce preset
        }
      ]
    }
  ],

  createdAt: Date
}
```

**Index :** `{ "members.userId": 1 }` pour retrouver les groupes d'un utilisateur

---

## expenses

```typescript
{
  _id:         ObjectId,
  groupId:     ObjectId,  // ref groups
  description: string,
  amount:      number,    // montant total (positif ou négatif si correction)
  category:    string?,   // optionnel
  date:        Date,

  // Qui a payé — peut être plusieurs personnes
  // Invariant : sum(payers[i].amount) === amount
  payers: [
    {
      memberId: ObjectId, // ref members._id dans groups
      amount:   number
    }
  ],

  // Qui est concerné — base exclusive du calcul des soldes
  // Peut être tout le groupe, un preset, ou une sélection manuelle
  participants: [
    {
      memberId: ObjectId, // ref members._id dans groups
      shares:   number,   // parts pour cette dépense
      amount:   number    // montant calculé = total × (shares / totalShares)
    }
  ],

  // Preset utilisé comme point de départ (informatif uniquement)
  presetId: ObjectId?,

  // Champs de correction
  corrected:  boolean,   // true si au moins une correction existe
  corrects:   ObjectId?, // ref expenses._id — renseigné sur les corrections uniquement

  createdBy:  ObjectId,  // ref users
  createdAt:  Date
}
```

**Notes :**
- Une correction est une expense normale avec `corrects` renseigné et un `amount` positif ou négatif.
- Toutes les corrections d'une même dépense pointent vers l'expense originale (pas en chaîne).
- `montant effectif = expense.amount + sum(corrections où corrects === expense._id)`
- Les corrections héritent des mêmes `payers` et `participants` (avec les mêmes proportions de parts), recalculés sur le delta.

**Index :**
- `{ groupId: 1, createdAt: -1 }` pour lister les dépenses d'un groupe
- `{ corrects: 1 }` pour retrouver les corrections d'une dépense
- `{ "payers.memberId": 1 }` pour filtrer par payeur
- `{ "participants.memberId": 1 }` pour filtrer par participant

---

## settlements

```typescript
{
  _id:          ObjectId,
  groupId:      ObjectId,   // ref groups
  fromMemberId: ObjectId,   // débiteur — ref members._id dans groups
  toMemberId:   ObjectId,   // créditeur — ref members._id dans groups
  amount:       number,     // toujours positif
  status:       "pending" | "paid",
  paidAt:       Date?,      // renseigné quand status passe à "paid"
  createdAt:    Date
}
```

**Notes :**
- Les settlements sont recalculés (supprimés et recréés) à chaque modification de dépense sans settlement `paid`.
- Les settlements `paid` sont **immuables** — ils tracent un remboursement réel.
- Quand une correction est créée, seuls les settlements `pending` sont recalculés.

**Index :**
- `{ groupId: 1, status: 1 }` pour savoir si des settlements paid existent
- `{ fromMemberId: 1, status: 1 }` pour les dettes d'un membre
- `{ toMemberId: 1, status: 1 }` pour les créances d'un membre

---

## inviteLinks

```typescript
{
  _id:       ObjectId,
  groupId:   ObjectId,                        // ref groups
  token:     string,                          // UUID v4 unique, indexé
  role:      "readonly" | "member" | "admin",
  memberId:  ObjectId?,                       // ref members._id — rattachement défini par l'admin
  createdBy: ObjectId,                        // ref users (admin du groupe)
  expiresAt: Date?,                           // null = pas d'expiration
  createdAt: Date
}
```

**Index :** `{ token: 1 }` unique

---

## linkUsages

```typescript
{
  _id:        ObjectId,
  linkId:     ObjectId,                         // ref inviteLinks
  userId:     ObjectId?,                        // null si accès anonyme
  memberId:   ObjectId?,                        // ref members._id — null si observateur
  accessMode: "authenticated" | "anonymous",
  usedAt:     Date
}
```

**Notes :**
- Accès anonyme → `accessMode: "anonymous"`, `userId: null`, `memberId: null`, lecture seule forcée.
- Accès authentifié → `accessMode: "authenticated"`, `memberId` renseigné si rattachement défini par l'admin.
- Si `memberId` null après authentification → observateur (accès selon role du lien, mais non impliqué dans les calculs).

**Index :** `{ linkId: 1 }`, `{ userId: 1 }`
