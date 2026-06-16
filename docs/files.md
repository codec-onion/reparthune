# Détail des fichiers

## shared/

### src/types/

#### user.types.ts
```typescript
export interface User {
  _id:       string
  name:      string
  email:     string
  createdAt: string
}
```

#### group.types.ts
```typescript
export interface Member {
  _id:    string
  userId: string | null  // null si non rattaché à un compte
  name:   string
  shares: number
  role:   'admin' | 'member' | 'readonly'
}

export interface PresetParticipant {
  memberId: string
  shares:   number
}

export interface Preset {
  _id:          string
  name:         string
  participants: PresetParticipant[]
}

export interface Group {
  _id:       string
  name:      string
  currency:  string
  createdBy: string
  members:   Member[]
  presets:   Preset[]
  createdAt: string
}
```

#### expense.types.ts
```typescript
export interface Payer {
  memberId: string
  amount:   number
}

export interface Participant {
  memberId: string
  shares:   number
  amount:   number  // calculé côté serveur
}

export interface Expense {
  _id:          string
  groupId:      string
  description:  string
  amount:       number   // positif ou négatif (corrections)
  category?:    string
  date:         string
  payers:       Payer[]
  participants: Participant[]
  presetId?:    string
  corrected:    boolean
  corrects?:    string   // id de l'expense originale
  createdBy:    string
  createdAt:    string
}

// Vue calculée côté frontend : expense originale + ses corrections agrégées
export interface ExpenseView extends Expense {
  effectiveAmount: number   // amount + sum(corrections)
  corrections:     Expense[]
}
```

#### balance.types.ts
```typescript
export interface Balance {
  memberId: string
  name:     string
  net:      number  // positif = créditeur, négatif = débiteur
}

export interface Settlement {
  _id:          string
  groupId:      string
  fromMemberId: string
  toMemberId:   string
  amount:       number
  status:       'pending' | 'paid'
  paidAt?:      string
  createdAt:    string
}
```

#### inviteLink.types.ts
```typescript
export interface InviteLink {
  _id:       string
  groupId:   string
  token:     string
  role:      'readonly' | 'member' | 'admin'
  memberId?: string
  createdBy: string
  expiresAt?: string
  createdAt: string
}

export interface LinkUsage {
  _id:        string
  linkId:     string
  userId?:    string
  memberId?:  string
  accessMode: 'authenticated' | 'anonymous'
  usedAt:     string
}
```

---

### src/schemas/

#### auth.schema.ts
```typescript
import { z } from 'zod'

export const RegisterSchema = z.object({
  name:     z.string().min(1).max(50),
  email:    z.string().email(),
  password: z.string().min(8),
})

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export type RegisterDto = z.infer<typeof RegisterSchema>
export type LoginDto    = z.infer<typeof LoginSchema>
```

#### group.schema.ts
```typescript
import { z } from 'zod'

export const CreateGroupSchema = z.object({
  name:     z.string().min(1).max(100),
  currency: z.string().length(3).default('EUR'),
})

export const AddMemberSchema = z.object({
  name:   z.string().min(1).max(50),
  shares: z.number().int().min(1),
})

export const UpdateSharesSchema = z.object({
  shares: z.number().int().min(1),
})

export const CreatePresetSchema = z.object({
  name: z.string().min(1).max(50),
  participants: z.array(z.object({
    memberId: z.string(),
    shares:   z.number().int().min(1),
  })).min(1),
})
```

#### expense.schema.ts
```typescript
import { z } from 'zod'

const PayerSchema = z.object({
  memberId: z.string(),
  amount:   z.number().positive(),
})

const ParticipantInputSchema = z.object({
  memberId: z.string(),
  shares:   z.number().int().min(1),
  // amount est calculé côté serveur — pas envoyé par le client
})

export const CreateExpenseSchema = z.object({
  description:  z.string().min(1).max(200),
  amount:       z.number().positive(),
  category:     z.string().optional(),
  date:         z.string().datetime(),
  payers:       z.array(PayerSchema).min(1),
  participants: z.array(ParticipantInputSchema).min(1),
  presetId:     z.string().optional(),
}).refine(
  data => {
    const sum = data.payers.reduce((acc, p) => acc + p.amount, 0)
    return Math.abs(sum - data.amount) < 0.01 // tolérance arrondi
  },
  { message: 'La somme des payeurs doit être égale au montant total' }
)

// Pour une correction — le client envoie uniquement le nouveau montant
export const CorrectExpenseSchema = z.object({
  amount: z.number().refine(v => v !== 0, 'Le montant correctif ne peut pas être zéro'),
})
```

---

### src/constants/

#### roles.ts
```typescript
export const ROLES = {
  ADMIN:    'admin',
  MEMBER:   'member',
  READONLY: 'readonly',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]
```

#### errors.ts
```typescript
export const ERRORS = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED:       'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_MISSING:       'AUTH_TOKEN_MISSING',
  GROUP_NOT_FOUND:          'GROUP_NOT_FOUND',
  GROUP_FORBIDDEN:          'GROUP_FORBIDDEN',
  MEMBER_NOT_FOUND:         'MEMBER_NOT_FOUND',
  EXPENSE_NOT_FOUND:        'EXPENSE_NOT_FOUND',
  EXPENSE_FORBIDDEN:        'EXPENSE_FORBIDDEN',
  SETTLEMENT_NOT_FOUND:     'SETTLEMENT_NOT_FOUND',
  SETTLEMENT_FORBIDDEN:     'SETTLEMENT_FORBIDDEN',
  INVITE_TOKEN_INVALID:     'INVITE_TOKEN_INVALID',
  INVITE_TOKEN_EXPIRED:     'INVITE_TOKEN_EXPIRED',
} as const
```

---

## backend/

### src/config/

#### env.ts
Charge et valide toutes les variables d'environnement au démarrage via Zod.
Si une variable obligatoire manque, le processus s'arrête immédiatement avec un message clair — aucune erreur silencieuse en production.

```typescript
const EnvSchema = z.object({
  MONGO_URI:       z.string().url(),
  JWT_SECRET:      z.string().min(32),
  JWT_EXPIRES_IN:  z.string().default('7d'),
  PORT:            z.coerce.number().default(3000),
  NODE_ENV:        z.enum(['development', 'production', 'test']).default('development'),
  SMTP_HOST:       z.string(),
  SMTP_PORT:       z.coerce.number(),
  SMTP_USER:       z.string(),
  SMTP_PASS:       z.string(),
})

export const env = EnvSchema.parse(process.env)
```

#### db.ts
Connexion Mongoose à MongoDB Atlas. Gère les événements `connected`, `error`, `disconnected` et log via Winston. Retry automatique en cas de déconnexion.

#### logger.ts
Instance Winston. Niveau `debug` en développement, `info` en production. Transports : console coloré + fichier `logs/app.log`.

---

### src/middlewares/

#### auth.middleware.ts
Extrait le JWT du header `Authorization: Bearer <token>`, le vérifie avec `jsonwebtoken`, attache le payload décodé à `req.user`.
Retourne 401 si absent, invalide ou expiré.

#### role.middleware.ts
Factory qui prend un rôle en paramètre et vérifie que `req.user` a ce rôle dans le groupe demandé (`:groupId` dans les params).
Retourne 403 si insuffisant.
```typescript
// Usage dans les routes :
router.delete('/:id', authMiddleware, roleMiddleware('admin'), controller.delete)
```

#### validate.middleware.ts
Middleware générique — prend un schéma Zod, valide `req.body`, retourne 400 avec les erreurs formatées si invalide.
```typescript
// Usage :
router.post('/', authMiddleware, validate(CreateExpenseSchema), controller.create)
```

#### error.middleware.ts
Middleware d'erreur global Express (4 paramètres). Intercepte toutes les erreurs non gérées, les logue, retourne une réponse JSON structurée :
```json
{ "code": "EXPENSE_NOT_FOUND", "message": "Dépense introuvable" }
```

---

### src/modules/auth/

#### auth.routes.ts
```
POST /api/auth/register   → validate(RegisterSchema) → authController.register
POST /api/auth/login      → validate(LoginSchema)    → authController.login
```

#### auth.service.ts
- `register(dto)` : vérifie unicité email, hash bcrypt, crée User, génère JWT
- `login(dto)` : trouve User par email, compare hash, génère JWT signé avec `env.JWT_SECRET` et TTL `env.JWT_EXPIRES_IN`

---

### src/modules/groups/

#### group.routes.ts
```
GET    /api/groups                          → authMiddleware → controller.list
POST   /api/groups                          → validate(CreateGroupSchema) → controller.create
GET    /api/groups/:id                      → authMiddleware → controller.get
DELETE /api/groups/:id                      → authMiddleware + role('admin') → controller.delete
POST   /api/groups/:id/members              → authMiddleware + role('admin') + validate(AddMemberSchema) → controller.addMember
PATCH  /api/groups/:id/members/:memberId    → authMiddleware + role('admin') + validate(UpdateSharesSchema) → controller.updateShares
DELETE /api/groups/:id/members/:memberId    → authMiddleware + role('admin') → controller.removeMember
POST   /api/groups/:id/presets              → authMiddleware + role('admin') + validate(CreatePresetSchema) → controller.createPreset
PATCH  /api/groups/:id/presets/:presetId    → authMiddleware + role('admin') → controller.updatePreset
DELETE /api/groups/:id/presets/:presetId    → authMiddleware + role('admin') → controller.deletePreset
```

#### group.service.ts
- `createGroup(userId, dto)` : crée le groupe, ajoute le créateur comme membre ADMIN avec 1 part
- `addMember(groupId, dto)` : ajoute un membre avec `userId: null` (sera rattaché via lien ou manuellement)
- `createPreset(groupId, dto)` : crée une sélection prédéfinie avec participants et parts
- `updatePreset(groupId, presetId, dto)` : met à jour nom et/ou participants du preset

---

### src/modules/expenses/

#### expense.routes.ts
```
GET    /api/groups/:id/expenses     → authMiddleware → controller.list  (pagination, filtres)
POST   /api/groups/:id/expenses     → authMiddleware + validate(CreateExpenseSchema) → controller.create
GET    /api/expenses/:id            → authMiddleware → controller.get
PATCH  /api/expenses/:id            → authMiddleware + validate(CorrectExpenseSchema) → controller.update
DELETE /api/expenses/:id            → authMiddleware → controller.delete
```

#### expense.service.ts

**`createExpense(groupId, userId, dto)`**
1. Récupère le groupe pour valider que les memberIds existent
2. Appelle `shares.resolver.ts` pour calculer `participants[].amount`
3. Persiste l'Expense avec `corrected: false`, `corrects: undefined`

**`updateExpense(expenseId, userId, dto)`** — gestion de la correction
```
1. Vérifie que l'expense n'est pas elle-même une correction (corrects !== undefined)
2. Vérifie que req.user est payeur ou admin du groupe
3. Vérifie si des settlements "paid" existent dans le groupe

   CAS 1 — aucun settlement paid :
   → modifie directement l'expense
   → supprime les settlements "pending" du groupe
   → recalcule via balance.service

   CAS 2 — settlements paid existent :
   → calcule delta = nouveauMontant − expense.amount
   → calcule les nouveaux participants avec shares.resolver (sur le delta)
   → crée une expense corrective { amount: delta, corrects: expenseId, ... }
   → passe expense.corrected à true
   → recalcule les settlements "pending" via balance.service
```

**`deleteExpense(expenseId, userId)`**
Vérifie que l'utilisateur est payeur ou admin. Supprime l'expense et ses corrections. Recalcule les settlements `pending`.

---

### src/modules/balances/

#### balance.service.ts

**`getBalances(groupId)`**
1. Récupère toutes les expenses du groupe (y compris corrections)
2. Agrège en montant effectif par expense :
   ```typescript
   // Pour chaque expense originale (corrects === undefined)
   effectiveAmount = expense.amount + sum(corrections.amount)
   effectiveParticipants = agrégation pondérée des participants
   ```
3. Passe à `debt.calculator.ts`
4. Retourne `{ balances[], settlements[] }`

**`settle(settlementId, userId)`**
1. Vérifie que `req.user` est bien le `fromMemberId` du settlement
2. Passe le settlement à `status: 'paid'`, renseigne `paidAt`
3. Ne modifie aucune expense — les dépenses sont immuables

---

### src/modules/inviteLinks/

#### inviteLink.service.ts

**`generateLink(groupId, adminUserId, dto)`**
```typescript
// dto = { role, memberId? }
// Crée un InviteLink avec token UUID v4
// Le memberId est défini par l'admin au moment de la création
```

**`validateToken(token)`**
1. Trouve l'InviteLink par token
2. Vérifie l'expiration si `expiresAt` renseigné
3. Retourne les infos du groupe + role + memberId prévu

**`useLink(token, userId?)`**
1. Valide le token
2. Si `userId` présent (authentifié) :
   - Applique le role sur le membre du groupe
   - Si `memberId` défini sur le lien : rattache `members[memberId].userId = userId`
   - Crée LinkUsage `{ accessMode: 'authenticated', userId, memberId }`
3. Si pas de `userId` (anonyme) :
   - Crée LinkUsage `{ accessMode: 'anonymous' }` — lecture seule uniquement

---

### src/core/

#### shares.resolver.ts
Calcule les montants dus par chaque participant à partir des parts. Gère les arrondis (centimes résiduels attribués au premier participant).

```typescript
export function resolveShares(
  totalAmount: number,
  participants: Array<{ memberId: string; shares: number }>
): Array<{ memberId: string; shares: number; amount: number }> {
  const totalShares = participants.reduce((sum, p) => sum + p.shares, 0)
  let remaining = totalAmount
  return participants.map((p, i) => {
    const isLast = i === participants.length - 1
    const amount = isLast
      ? remaining  // le dernier prend le reste pour absorber les arrondis
      : Math.round((totalAmount * p.shares / totalShares) * 100) / 100
    remaining -= amount
    return { ...p, amount }
  })
}
```

#### debt.calculator.ts
Algorithme greedy de simplification des dettes. Entrée : balances nettes par membre. Sortie : liste minimale de transactions (au plus N−1 pour N membres).

```typescript
export function calculateDebts(
  balances: Array<{ memberId: string; net: number }>
): Array<{ fromMemberId: string; toMemberId: string; amount: number }> {
  // Copie triée : débiteurs (net < 0) et créditeurs (net > 0)
  // À chaque itération : le plus grand débiteur rembourse le plus grand créditeur
  // Montant = min(|débiteur|, créditeur)
  // Répète jusqu'à ce que tout soit à 0
}
```

---

### src/types/express.d.ts
Augmente le type `Request` d'Express pour ajouter `req.user` après passage par `authMiddleware`.

```typescript
import { JwtPayload } from '../modules/auth/auth.service'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload  // { userId, email, role }
    }
  }
}
```

---

### tests/

#### unit/shares.resolver.spec.ts
- Parts égales, montant divisible
- Parts inégales avec centimes résiduels → vérification que sum(amounts) === totalAmount exactement
- Participant unique
- Montant négatif (correction)

#### unit/debt.calculator.spec.ts
- 3 personnes, soldes symétriques → N−1 transactions
- Une personne doit à tous les autres
- Soldes déjà à zéro → aucune transaction
- Arrondis de centimes

#### integration/expenses.spec.ts
Base MongoDB en mémoire (`mongodb-memory-server`). Teste les routes POST et GET via Supertest : validation Zod, 401 sans token, 403 sans les bons droits, pagination, filtres.

#### integration/balances.spec.ts
Scénario complet : crée groupe → ajoute membres avec parts → crée plusieurs dépenses → vérifie balances et settlements → settle → vérifie que le paid persiste après correction.
