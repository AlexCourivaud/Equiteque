/**
 * Fichier principal de l'application
 * Initialise tous les modules et gère le cycle de vie de l'application
 */

// Attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Démarrage de l'application Equiteque Labels...");

  try {
    // Initialiser les modules
    await ProductsManager.init();
    PDFGenerator.init();

    console.log("Application initialisée avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
    alert("Erreur lors du démarrage de l'application. Veuillez redémarrer.");
  }
});

// Gestion des erreurs globales
window.addEventListener("error", (event) => {
  console.error("Erreur globale:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Promise rejetée:", event.reason);
});

// Made with Bob
