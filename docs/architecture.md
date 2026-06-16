# Architecture

## Vue d'ensemble

```
┌─────────────────────────────────────────────┐
│  Frontend (Vercel)                          │
│  Vue 3 · Pinia · Vue Router · Bootstrap 5  │
└────────────────────┬────────────────────────┘
                     │ REST JSON (Axios + JWT)
┌────────────────────▼────────────────────────┐
│  Backend (VPS / PM2)                        │
│  Express · TypeScript · Zod · Mongoose      │
│                                             │
│  auth/ │ groups/ │ expenses/ │ balances/    │
│  inviteLinks/ │ users/                      │
│                                             │
│  core/                                      │
│  shares.resolver · debt.calculator          │
└────────────────────┬────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────┐
│  MongoDB Atlas                              │
│  users · groups · expenses · settlements   │
│  inviteLinks · linkUsages                   │
└─────────────────────────────────────────────┘
```

---

## Architecture backend — feature-first

Le backend est organisé par domaine métier, pas par couche technique.
Chaque module contient ses propres routes, contrôleur, service et modèle.

```
modules/
├── auth/          # Inscription, connexion, JWT
├── groups/        # CRUD groupe, membres, presets
├── expenses/      # CRUD dépenses, corrections
├── balances/      # Calcul des soldes, settlements
├── inviteLinks/   # Liens de partage
└── users/         # Profil utilisateur
```

**Avantages :**
- On travaille dans un seul dossier par fonctionnalité
- Chaque module est testable en isolation
- Extraction future en microservices facilitée

**Ordre d'exécution des middlewares sur chaque requête :**
```
authMiddleware → roleMiddleware? → validateMiddleware → controller → service
```

---

## Couche core/ — logique métier pure

`core/` ne dépend ni d'Express ni de Mongoose. Fonctions pures, testables unitairement sans base de données.

```
core/
├── shares.resolver.ts    # Calcule les montants par participant
├── debt.calculator.ts    # Algorithme de simplification des dettes
├── mailer.ts             # Envoi d'emails (Nodemailer)
└── pdf.exporter.ts       # Export PDF (PDFKit)
```

---

## Flux de données — création d'une dépense

Exemple : dépense de 90€, Alice paie seule, répartie entre Alice (2 parts), Bob (1 part), Claire (1 part).

```
1. ExpenseForm.vue
   └─ Validation Zod (CreateExpenseSchema depuis shared/)
   └─ POST /api/groups/:id/expenses
        { amount: 90, payers: [{ memberId: Alice, amount: 90 }],
          participants: [{ memberId: Alice, shares: 2 },
                         { memberId: Bob,   shares: 1 },
                         { memberId: Claire, shares: 1 }] }

2. authMiddleware        → vérifie JWT, attache req.user
   validateMiddleware    → CreateExpenseSchema.safeParse(req.body)
   expense.controller    → appelle expense.service.createExpense()

3. expense.service
   └─ shares.resolver.ts
        totalShares = 2+1+1 = 4
        Alice  = 90 × 2/4 = 45.00€
        Bob    = 90 × 1/4 = 22.50€
        Claire = 90 × 1/4 = 22.50€
        vérification : 45 + 22.50 + 22.50 = 90 ✓
   └─ persist Expense avec participants[].amount calculés

4. Réponse 201 → expense.store.ts ajoute la dépense localement
```

---

## Flux de données — calcul des soldes

```
GET /api/groups/:id/balances

balance.service.getBalances()
└─ récupère toutes les expenses du groupe (hors corrections — agrégées)
└─ debt.calculator.ts

  Étape 1 — soldes nets par membre
  Pour chaque expense, pour chaque participant :
    solde[memberId] += payers[memberId].amount  (ce qu'il a payé)
    solde[memberId] -= participants[memberId].amount  (ce qu'il doit)

  Résultat : Alice +45€, Bob −22.50€, Claire −22.50€

  Étape 2 — algorithme greedy (simplification des dettes)
  Tant que des soldes ≠ 0 :
    prendre le plus grand débiteur  (ex. Bob −22.50€)
    prendre le plus grand créditeur (ex. Alice +45€)
    settlement : Bob → Alice 22.50€
    Alice passe à +22.50€, Bob à 0
    settlement : Claire → Alice 22.50€
    Alice à 0, Claire à 0

  Résultat : 2 settlements au lieu de N×(N−1) possibles

└─ retourne balances[] + settlements[]
```

---

## Flux de données — correction d'une dépense

```
PATCH /api/expenses/:id  { amount: 70 }  (était 90€)

expense.service.updateExpense()

  Cas 1 — aucun settlement "paid" dans le groupe
  └─ modification directe de la dépense
  └─ recalcul des settlements "pending"

  Cas 2 — au moins un settlement "paid" existe
  └─ calcul du delta : 70 − 90 = −20€
  └─ création d'une dépense corrective :
       { amount: −20, corrects: expenseId,
         payers: [{ memberId: Alice, amount: −20 }],
         participants: [{ memberId: Alice, shares: 2, amount: −10 },
                        { memberId: Bob,   shares: 1, amount: −5  },
                        { memberId: Claire, shares: 1, amount: −5  }] }
  └─ expense originale : corrected: true
  └─ recalcul des settlements "pending" en tenant compte de la correction
     (les settlements "paid" restent intacts)

Corrections multiples : chaque correction pointe vers l'expense originale
  (pas vers la correction précédente)
  montant effectif = amount original + sum(corrections[].amount)
```

---

## Flux de données — lien de partage

```
Admin génère un lien :
  POST /api/groups/:id/invite-links
  { role: "member", memberId: "Bob" }  ← rattachement défini par l'admin
  └─ crée InviteLink { token, role, memberId, groupId }
  └─ retourne https://réparthune.fr/join/<token>

David clique sur le lien :
  GET /api/invite/:token → infos du groupe + niveau de droit

  Option A — sans connexion
  └─ accès lecture seule (quel que soit le role du lien)
  └─ LinkUsage { accessMode: "anonymous", memberId: null }

  Option B — avec connexion
  └─ role du lien appliqué
  └─ rattachement au memberId défini par l'admin (Bob dans cet exemple)
     → members[Bob].userId = David.userId
  └─ LinkUsage { accessMode: "authenticated", memberId: Bob._id, userId: David._id }
```
