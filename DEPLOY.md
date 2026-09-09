# Cahier_algo — Déploiement Web (SaaS)

Ce dossier `public/` contient la version Web statique de SOFT-KEY, prête à
être servie telle quelle par Express (`app.use(express.static('public'))`).

## Fichiers

- `index.html` — structure HTML5 (menu, éditeur, console, modales)
- `style.css` — intégralité du design (thème sombre/clair, layout, modales)
- `app.js` — moteur d'interprétation + logique d'interface (menus,
  raccourcis, thème, fichiers, impression)
- `manifest.json` + `sw.js` + `icons/` — PWA (installation, hors-ligne),
  optionnels mais fonctionnels tels quels

Aucune dépendance Electron/Node côté client : tout repose sur les API
standard du navigateur (`FileReader`, `Blob`, `URL.createObjectURL`) pour
Ouvrir/Enregistrer/Exporter — rien à adapter de ce côté.

## Route serveur à implémenter

Le bouton d'en-tête **💻 Télécharger pour Windows (.exe)** pointe vers
`/download/win` (chemin absolu, résolu par rapport au domaine, pas au
dossier `public/`). Exemple minimal côté Express :

```js
app.get('/download/win', (req, res) => {
  res.download(path.join(__dirname, 'releases', 'Cahier_algo-Setup.exe'));
});
```

Adaptez le chemin réel de l'installeur `.exe` généré par le projet Electron
fourni séparément (`desktop-app/`, voir `npm run dist:win`).

## Personnalisation

Toute la personnalisation (nom de l'établissement, couleur, mode strict,
exercices, contenu de la fenêtre « À propos ») se fait uniquement dans le
bloc `INSTITUTION_CONFIG` en tête de `app.js` — jamais dans le reste du
fichier.
