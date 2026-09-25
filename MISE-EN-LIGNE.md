# Mettre Kaury Motion en ligne

Tout est prêt dans le code. Il reste quatre gestes à faire sur tes comptes, parce qu'ils demandent tes accès.

## 1. Créer le dépôt GitHub (10 secondes)

1. Va sur https://github.com/new
2. Nom : `kaury-motion`, visibilité **Public**, et **ne coche rien** (ni README, ni licence).
3. Clique **Create repository**, puis dis à Claude « le dépôt est créé » : il y pousse tout le projet.

## 2. Publier le studio en ligne (GitHub Pages)

1. Dans le dépôt : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Au prochain envoi sur `main`, le studio est en ligne sur `https://theoblondel.github.io/kaury-motion/`.

### Avec ton adresse `motion.kaury.studio` (facultatif)

1. Chez ton hébergeur de domaine, ajoute un enregistrement **CNAME** : nom `motion`, valeur `theoblondel.github.io`.
2. Dans **Settings → Pages → Custom domain**, écris `motion.kaury.studio` et coche **Enforce HTTPS** quand c'est proposé.

## 3. Publier sur npm (pour `npm install kaury-motion`)

1. Crée un compte sur https://www.npmjs.com (gratuit). Le nom `kaury-motion` est libre.
2. Sur npm : **Access Tokens → Generate New Token → Automation**, copie le jeton.
3. Dans le dépôt GitHub : **Settings → Secrets and variables → Actions → New repository secret**, nom `NPM_TOKEN`, colle le jeton.
4. Crée une release (**Releases → Draft a new release**, tag `v0.1.0`). La publication sur npm se lance toute seule.

## 4. Épingler le dépôt sur ton profil

Sur https://github.com/theoblondel : **Customize your pins**, coche `kaury-motion`.

## Ce qui tourne tout seul ensuite

- **Tests** : à chaque envoi, GitHub vérifie le framework (26 tests) et le studio (chaque effet, chaque export, le panier, l'image perso, le mobile).
- **Studio en ligne** : chaque envoi sur `main` met le site à jour.
- **npm** : chaque nouvelle release publie une nouvelle version.
