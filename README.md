# 🚀 Cynoia Spaces Frontend

Bienvenue sur le **frontend de Cynoia Spaces** — la plateforme tout-en-un pour gérer des espaces collaboratifs *(coworkings, hubs, incubateurs)* pensée pour les réalités africaines.

---

## 📌 Contexte

**Cynoia Spaces** permet de :
- Gérer les réservations *(espaces, équipements, experts)*
- Planifier et valider des événements via un **calendrier interactif**
- Communiquer en interne *(chat : channels & DMs)*
- Publier des opportunités et annonces
- Collecter du feedback utilisateur
- Gérer les paiements digitaux via **mobile money**

---

## ⚙️ Stack Technique

| Outil               | Version / Info               |
|---------------------|------------------------------|
| **Framework**       | Angular `^17.x`              |
| **Langage**         | TypeScript                   |
| **Routing**         | Angular Router               |
| **State Management**| NgRx *(optionnel)*           |
| **UI Kit**          | Angular Material / Tailwind CSS |
| **API**             | HttpClient + Interceptors    |
| **CI/CD**           | GitHub Actions *(à configurer)* |

---

## 📂 Structure du projet

```plaintext
Cynonia-front/
│
├── src/
│   ├── app/
│   │   ├── core/         # Services globaux, guards, interceptors
│   │   ├── shared/       # UI components, pipes, directives
│   │   ├── features/     # Réservations, événements, chat, etc.
│   │   ├── assets/       # Images, styles
│   │   └── environments/ # Config prod/dev
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
