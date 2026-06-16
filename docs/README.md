# Réparthune — Documentation technique

Application web de répartition de dépenses au sein d'un groupe de personnes.
Répond à la question : **qui doit combien à qui ?**

## Index

| Fichier | Contenu |
|---|---|
| [stack.md](./stack.md) | Stack technique et justifications |
| [architecture.md](./architecture.md) | Architecture générale, couches, flux de données |
| [structure.md](./structure.md) | Structure des dossiers et rôle de chaque fichier |
| [collections.md](./collections.md) | Schémas MongoDB complets |
| [files.md](./files.md) | Détail du fonctionnement de chaque fichier |

## Concepts clés à retenir

- **Groupe** : conteneur de membres potentiellement concernés par des dépenses. N'intervient pas dans le calcul.
- **Preset** : sélection prédéfinie de membres avec leurs parts, créée au niveau du groupe, réutilisable sur plusieurs dépenses.
- **Participants d'une dépense** : liste des membres réellement concernés par une dépense donnée, avec leurs parts et montants calculés. C'est **la seule base du calcul des soldes**.
- **Payers** : un ou plusieurs membres ayant avancé l'argent d'une dépense. `sum(payers[i].amount) === expense.amount`.
- **Settlement** : remboursement entre deux membres, généré par l'algorithme de simplification des dettes.
- **Dépense corrective** : mécanisme de correction d'une dépense quand des settlements `paid` existent déjà dans le groupe. Montant positif ou négatif.
