# Structure des dossiers

## Vue d'ensemble

```
réparthune/
├── package.json              # npm workspaces
├── tsconfig.base.json        # config TypeScript commune
├── .env.example              # variables d'environnement à documenter
├── shared/
├── frontend/
└── backend/
```

---

## shared/

```
shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # barrel export — tout re-exporté depuis ici
    ├── types/
    │   ├── user.types.ts
    │   ├── group.types.ts
    │   ├── expense.types.ts
    │   ├── balance.types.ts
    │   └── inviteLink.types.ts
    ├── schemas/
    │   ├── auth.schema.ts
    │   ├── group.schema.ts
    │   └── expense.schema.ts
    └── constants/
        ├── roles.ts
        └── errors.ts
```

---

## frontend/

```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.ts               # point d'entrée — monte Vue, Pinia, Router
    ├── App.vue               # root component — <RouterView /> + AppNavbar
    ├── assets/
    │   └── main.scss         # import Bootstrap 5 + variables SCSS custom
    ├── router/
    │   └── index.ts          # routes + guards d'authentification
    ├── stores/
    │   ├── auth.store.ts
    │   ├── group.store.ts
    │   ├── expense.store.ts
    │   └── balance.store.ts
    ├── services/
    │   ├── api.ts            # instance Axios + intercepteurs JWT
    │   ├── auth.service.ts
    │   ├── group.service.ts
    │   ├── expense.service.ts
    │   ├── balance.service.ts
    │   └── inviteLink.service.ts
    ├── composables/
    │   ├── useAuth.ts
    │   ├── useExpenses.ts
    │   └── useBalances.ts
    ├── components/
    │   ├── common/
    │   │   ├── AppNavbar.vue
    │   │   ├── AppModal.vue
    │   │   └── AppAlert.vue
    │   ├── groups/
    │   │   ├── GroupCard.vue
    │   │   ├── MemberList.vue
    │   │   ├── SharesEditor.vue
    │   │   └── PresetManager.vue
    │   ├── expenses/
    │   │   ├── ExpenseForm.vue
    │   │   ├── ExpenseItem.vue
    │   │   ├── PayersPicker.vue
    │   │   └── ParticipantsPicker.vue
    │   └── balances/
    │       ├── BalanceCard.vue
    │       ├── DebtSummary.vue
    │       └── SettleButton.vue
    └── views/
        ├── HomeView.vue
        ├── LoginView.vue
        ├── RegisterView.vue
        ├── GroupView.vue
        ├── ExpensesView.vue
        ├── BalancesView.vue
        └── JoinView.vue      # page d'accueil du lien de partage
```

---

## backend/

```
backend/
├── package.json
├── tsconfig.json
├── jest.config.ts
└── src/
    ├── server.ts             # point d'entrée — démarre HTTP après connexion MongoDB
    ├── app.ts                # configure Express (CORS, JSON, routes, error handler)
    ├── config/
    │   ├── env.ts            # validation des variables d'env au démarrage (Zod)
    │   ├── db.ts             # connexion Mongoose + gestion des événements
    │   └── logger.ts         # instance Winston
    ├── middlewares/
    │   ├── auth.middleware.ts
    │   ├── role.middleware.ts
    │   ├── validate.middleware.ts
    │   └── error.middleware.ts
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.routes.ts
    │   │   ├── auth.controller.ts
    │   │   └── auth.service.ts
    │   ├── users/
    │   │   ├── user.model.ts
    │   │   └── user.service.ts
    │   ├── groups/
    │   │   ├── group.routes.ts
    │   │   ├── group.controller.ts
    │   │   ├── group.service.ts
    │   │   └── group.model.ts
    │   ├── expenses/
    │   │   ├── expense.routes.ts
    │   │   ├── expense.controller.ts
    │   │   ├── expense.service.ts
    │   │   └── expense.model.ts
    │   ├── balances/
    │   │   ├── balance.routes.ts
    │   │   ├── balance.controller.ts
    │   │   ├── balance.service.ts
    │   │   └── settlement.model.ts
    │   └── inviteLinks/
    │       ├── inviteLink.routes.ts
    │       ├── inviteLink.controller.ts
    │       ├── inviteLink.service.ts
    │       ├── inviteLink.model.ts
    │       └── linkUsage.model.ts
    ├── core/
    │   ├── shares.resolver.ts
    │   ├── debt.calculator.ts
    │   ├── mailer.ts
    │   └── pdf.exporter.ts
    ├── types/
    │   └── express.d.ts      # augmentation req.user
    └── tests/
        ├── unit/
        │   ├── shares.resolver.spec.ts
        │   └── debt.calculator.spec.ts
        └── integration/
            ├── expenses.spec.ts
            └── balances.spec.ts
```
