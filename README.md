# 🏪 Equiteque - Gestion d'Étiquettes

Application web portable pour créer et imprimer des étiquettes de prix pour superette bio.

Créer avec l'agent IA : IBM Bob

**Version :** 2.0.0 | **Licence :** MIT | **Système :** Windows 10/11

---

## Table des matières

- [Guide Utilisateur](#-guide-utilisateur)
- [Pour les Développeurs](#️-pour-les-développeurs)
- [Structure du Projet](#-structure-du-projet)
- [Technologies](#-technologies)

---

# 👤 Guide Utilisateur

## 🚀 Démarrage Rapide

### 1️⃣ Première utilisation

1. **Extrayez** le dossier ZIP que vous avez reçu
2. **Placez** le dossier où vous voulez (Bureau, Documents, etc.)
3. **Double-cliquez** sur `LANCER_EQUITEQUE.bat`
4. L'application s'ouvre automatiquement dans votre navigateur !

### 2️⃣ Utilisations suivantes

**Double-cliquez simplement sur `LANCER_EQUITEQUE.bat`**

C'est tout ! 🎉

> **Note :** Node.js portable est déjà inclus dans le dossier — aucune installation requise.

---

## ✨ Fonctionnalités

- ✅ Créer et gérer des produits (nom, origine)
- ✅ Générer des planches d'étiquettes PDF (format A4)
- ✅ 4 étiquettes par page (15 × 6 cm)
- ✅ Images de fond personnalisables
- ✅ Aperçu en temps réel
- ✅ Recherche de produits
- ✅ Stockage local (données dans le navigateur)
- ✅ Fonctionne hors ligne
- ✅ Totalement portable (clé USB, etc.)

---

## 📱 Utilisation de l'Application

### Créer un Produit

1. Cliquez sur **"Nouveau Produit"**
2. Remplissez :
   - Nom du produit (ex: "Lentille Corail")
   - Origine (ex: "FRANCE")
3. Choisissez une image de fond (optionnel)
4. Cliquez sur **"Enregistrer"**

### Générer des Étiquettes PDF

1. Cliquez sur **"Générer Étiquettes"**
2. Cochez les produits à imprimer
3. Cliquez sur **"Générer PDF"**
4. Le PDF se télécharge automatiquement
5. Imprimez sur papier A4

**Format :** 4 étiquettes par page (15 × 6 cm)

### Modifier un Produit

1. Cliquez sur le bouton **"Modifier"** à côté du produit
2. Modifiez les informations
3. Cliquez sur **"Enregistrer"**

### Supprimer un ou plusieurs Produits

1. Cochez le(s) produit(s) à supprimer
2. Cliquez sur **"Supprimer la sélection"**
3. Confirmez la suppression

### Rechercher un Produit

Utilisez la barre de recherche en haut pour filtrer vos produits par nom ou origine.

---

## 💾 Vos Données

Vos produits sont sauvegardés **automatiquement** dans votre navigateur (LocalStorage).

- ✅ Les données restent même si vous fermez l'application
- ✅ Aucune connexion internet requise
- ⚠️ Les données sont liées à votre navigateur
- ⚠️ Si vous changez de navigateur, les données ne suivent pas

---

## 🛑 Arrêter l'Application

1. **Fermer la fenêtre noire** (terminal)
2. **Ou** appuyer sur `Ctrl+C` dans la fenêtre noire

---

## 📦 Transférer l'Application

### Sur une clé USB ou un autre PC

1. Copiez **tout le dossier** Equiteque
2. Sur l'autre PC, lancez `LANCER_EQUITEQUE.bat`

> **Note :** Les données ne se transfèrent pas automatiquement (elles restent dans le navigateur du PC d'origine).

---

## 🔧 Dépannage

### L'application ne se lance pas

1. Vérifiez que vous avez bien **extrait** le ZIP (pas juste ouvert)
2. Vérifiez que le dossier `nodejs-portable` est présent
3. Essayez clic droit → **"Exécuter en tant qu'administrateur"**
4. Vérifiez votre antivirus (il peut bloquer le `.bat`)

### Le navigateur ne s'ouvre pas automatiquement

Ouvrez manuellement votre navigateur et allez sur :

```
http://localhost:3000
```

### Erreur "Port déjà utilisé"

1. Fermez toutes les fenêtres noires (terminaux)
2. Relancez `LANCER_EQUITEQUE.bat`

### Les logos bio n'apparaissent pas dans les PDF

Vérifiez que vous passez bien par `LANCER_EQUITEQUE.bat` et non en ouvrant `index.html` directement.

---

## ⚙️ Configuration Requise

|                   |                                           |
| ----------------- | ----------------------------------------- |
| **Système**       | Windows 10 ou 11                          |
| **Navigateur**    | Chrome, Edge, Firefox (recommandé : Edge) |
| **Espace disque** | ~100 MB                                   |
| **Internet**      | Non requis                                |

---

# 🛠️ Pour les Développeurs

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvre l'application sur http://localhost:3000 avec hot reload.

## Build Production

```bash
npm run build
```

Crée une version optimisée dans le dossier `dist/`.

## Créer le Package Portable

Double-cliquez sur `package-portable-optimise.bat` — le script :

1. Build l'application (`npm run build`)
2. Copie `dist/`, `node.exe`, `server.js`, `LANCER_EQUITEQUE.bat`
3. Génère le ZIP `Equiteque-v2.0.0-Portable-Optimise.zip`

---

## 📁 Structure du Projet

```
equiteque/
├── src/                        # Code source
│   ├── index.html              # Page principale
│   ├── css/
│   │   └── style.css           # Styles
│   ├── js/
│   │   ├── app.js              # Initialisation
│   │   ├── products.js         # Gestion produits
│   │   ├── storage.js          # LocalStorage
│   │   └── pdf-generator.js    # Génération PDF (jsPDF)
│   └── assets/                 # Logos bio + images de fond
│
├── public/                     # Fichiers statiques (PWA)
│   ├── manifest.json
│   └── sw.js
│
├── dist/                       # Build de production (généré)
├── nodejs-portable/            # Node.js portable (node.exe)
│
├── server.js                   # Serveur HTTP Node.js (port 3000)
├── LANCER_EQUITEQUE.bat        # Lanceur utilisateur
├── package-portable-optimise.bat # Script de packaging
├── vite.config.js              # Config Vite
└── package.json
```

---

## 🔧 Technologies

|                |                                       |
| -------------- | ------------------------------------- |
| **Frontend**   | Vanilla JavaScript (pas de framework) |
| **Build Tool** | Vite                                  |
| **Serveur**    | Node.js HTTP natif                    |
| **Stockage**   | LocalStorage (navigateur)             |
| **PDF**        | jsPDF                                 |
| **PWA**        | Service Worker + Web Manifest         |

---

## 🎨 Personnalisation

### Changer les couleurs

Éditez [`src/css/style.css`](src/css/style.css) :

```css
:root {
  --primary-color: #2ecc71; /* Vert */
  --secondary-color: #3498db; /* Bleu */
}
```

### Modifier les logos bio

Remplacez les fichiers dans `src/assets/` :

- `Certification_bio_AB.jpg`
- `Eurofeuille_couleurAB.jpg`

### Ajouter des images de fond

Ajoutez vos images dans `src/assets/backgrounds/`.
