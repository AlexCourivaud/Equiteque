#!/usr/bin/env node

/**
 * Serveur HTTP simple pour Equiteque
 * Lance l'application web et ouvre le navigateur automatiquement
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Types MIME pour les fichiers
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// Créer le serveur HTTP
const server = http.createServer((req, res) => {
  // Nettoyer l'URL
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(DIST_DIR, filePath);

  // Vérifier si le fichier existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Fichier non trouvé
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Fichier non trouvé</h1>');
      return;
    }

    // Lire et servir le fichier
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Erreur serveur</h1>');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('   EQUITEQUE - Application démarrée');
  console.log('========================================');
  console.log('');
  console.log(`✓ Serveur lancé sur http://localhost:${PORT}`);
  console.log('');
  console.log('L\'application va s\'ouvrir dans votre navigateur...');
  console.log('');
  console.log('Pour arrêter : Fermez cette fenêtre ou appuyez sur Ctrl+C');
  console.log('');
  console.log('========================================');
  console.log('');

  // Ouvrir le navigateur automatiquement
  const url = `http://localhost:${PORT}`;
  const command = process.platform === 'win32' 
    ? `start ${url}` 
    : process.platform === 'darwin' 
    ? `open ${url}` 
    : `xdg-open ${url}`;

  setTimeout(() => {
    exec(command, (error) => {
      if (error) {
        console.log(`Ouvrez manuellement : ${url}`);
      }
    });
  }, 1000);
});

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\n\nArrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté. Au revoir !');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

// Made with Bob
