# 🎨 Icône de l'Application

## Pour créer l'icône Windows (.ico)

### Option 1 : Utiliser un outil en ligne (Recommandé)

1. Allez sur https://www.icoconverter.com/ ou https://convertio.co/fr/png-ico/
2. Uploadez votre logo (PNG, JPG, etc.)
3. Téléchargez le fichier `.ico` généré
4. Renommez-le en `icon.ico`
5. Placez-le dans ce dossier `build/`

### Option 2 : Utiliser ImageMagick (ligne de commande)

```bash
# Installer ImageMagick d'abord
# Puis convertir votre image
magick convert logo.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### Option 3 : Utiliser GIMP (gratuit)

1. Ouvrez votre logo dans GIMP
2. Redimensionnez à 256x256 pixels
3. Fichier → Exporter sous → Choisir `.ico`
4. Sauvegardez comme `icon.ico`

## Fichiers nécessaires

Pour que l'application fonctionne correctement, placez dans ce dossier :

- `icon.ico` - Icône Windows (256x256 ou multi-résolution)
- `icon.png` - Icône PNG (optionnel, 512x512 recommandé)

## Note

Si vous n'avez pas d'icône personnalisée, l'application utilisera l'icône par défaut d'Electron.
L'application fonctionnera quand même parfaitement !