# RideScore — Application Android (Play Store)

Ce dépôt contient RideScore : évaluation météo pour motards (score de roulage,
densité de l'air, voyants d'équipement), en deux versions qui partagent le même
code :

- `index.html` (racine) : version web.
- `mobile-app/` : projet Capacitor qui embarque une copie de la page dans une
  app Android native (WebView + bandeau publicitaire AdMob).

## Nouveauté : design modernisé (2026)

L'interface a été refaite dans un style inspiré de Google Weather / Apple
Weather / Windy : fond dégradé profond, cartes "glass" avec flou d'arrière-plan,
jauges et voyants avec halos colorés, typographie Inter/Manrope. Mode sombre
uniquement, palette bleu nuit / turquoise / vert / orange / rouge, conforme au
cahier des charges V4. **Aucune logique de calcul n'a été modifiée** (score,
densité de l'air, appels API Open-Meteo) — seul l'habillage visuel a changé.

## 1. Structure du dépôt

```
RideScore2/
├── index.html                (site web, design modernisé)
├── ridescore-logo.png        (logo conservé)
├── play-store-icon-512.png   (icône 512x512 pour la fiche Play Store)
├── .github/workflows/build-mobile-release.yml   (CI de build APK/AAB)
└── mobile-app/
    ├── android/               (projet Android natif, Capacitor)
    ├── www/                   (copie de la page, design modernisé + AdMob)
    ├── package.json
    ├── capacitor.config.json
    └── .gitignore
```

## 2. Configurer les secrets GitHub (obligatoire avant tout build signé)

Le workflow `.github/workflows/build-mobile-release.yml` compile l'APK et
l'AAB signés automatiquement sur les serveurs GitHub. Il a besoin d'un
keystore de signature Android, qui n'existe pas encore pour ce dépôt (il
n'a pas été transféré depuis `densite-air`).

Deux options :

**A. Réutiliser le keystore existant du site densite-air** (recommandé si tu
veux publier la même app / le même `applicationId` sur le Play Store) : va
dans **Settings → Secrets and variables → Actions** du dépôt `densite-air`,
récupère (ou régénère depuis ton stockage sécurisé) les 4 secrets, et
recrée-les à l'identique ici :

| Nom du secret               | Valeur                                              |
|------------------------------|------------------------------------------------------|
| `RIDESCORE_KEYSTORE_BASE64`  | contenu base64 du fichier `.keystore`                |
| `RIDESCORE_KEYSTORE_PASSWORD`| mot de passe du keystore                             |
| `RIDESCORE_KEY_ALIAS`        | `ridescore`                                          |
| `RIDESCORE_KEY_PASSWORD`     | mot de passe de la clé                               |

**B. Générer un nouveau keystore** (si RideScore2 est une app distincte du
Play Store) :
```bash
keytool -genkeypair -v -keystore ridescore-release.keystore \
  -alias ridescore -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 ridescore-release.keystore > ridescore-release.keystore.b64
```
Puis crée les 4 secrets ci-dessus avec les valeurs choisies.

⚠️ Ne commite **jamais** le fichier `.keystore` dans le dépôt (il est public).

## 3. Lancer la compilation (APK + AAB)

**Option A — via un tag (crée une Release avec liens de téléchargement) :**
```bash
git tag mobile-v1.0.0
git push origin mobile-v1.0.0
```
Après 3-5 minutes, onglet **Releases** : `app-release.aab` (à uploader sur le
Play Console) et `app-release.apk` (à installer/tester directement).

**Option B — manuellement :**
Onglet **Actions** → "Build RideScore Android (APK + AAB)" → **Run workflow**.
Fichiers disponibles dans l'onglet **Artifacts** (valable 90 jours).

## 4. Publier sur le Play Store

1. Compte Google Play Console (25$ si pas déjà fait).
2. Nouvelle fiche : description, catégorie, captures d'écran, icône
   `play-store-icon-512.png`.
3. Politique de confidentialité obligatoire (AdMob = collecte d'identifiants
   publicitaires, à déclarer dans "Sécurité des données").
4. Upload du `.aab` sur un track de test interne ou de production.
5. Lier l'app publiée à l'app AdMob (`ca-app-pub-3209259150498249`) dans la
   console AdMob.

## 5. Garde le keystore précieusement

Indispensable pour toute future mise à jour Play Store. À sauvegarder dans un
gestionnaire de mots de passe ou un stockage externe sécurisé.
