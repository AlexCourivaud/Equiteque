/**
 * Module de gestion du stockage des produits
 * Utilise LocalStorage du navigateur (application web pure)
 */

const Storage = {
  // Clé pour le stockage dans LocalStorage
  STORAGE_KEY: "equiteque_products",

  /**
   * Récupérer tous les produits depuis LocalStorage
   * @returns {Promise<Array>} Liste des produits
   */
  async getProducts() {
    try {
      // Lire depuis LocalStorage
      const data = localStorage.getItem(this.STORAGE_KEY);

      // Si pas de données, retourner tableau vide
      if (!data) {
        return [];
      }

      // Parser le JSON
      const products = JSON.parse(data);
      return products || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      return [];
    }
  },

  /**
   * Sauvegarder tous les produits dans LocalStorage
   * @param {Array} products - Liste des produits à sauvegarder
   * @returns {Promise<Object>} Résultat de la sauvegarde
   */
  async saveProducts(products) {
    try {
      // Convertir en JSON et sauvegarder dans LocalStorage
      const jsonData = JSON.stringify(products);
      localStorage.setItem(this.STORAGE_KEY, jsonData);

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des produits:", error);

      // Vérifier si c'est une erreur de quota dépassé
      if (error.name === "QuotaExceededError") {
        return {
          success: false,
          error:
            "Espace de stockage insuffisant. Veuillez supprimer des produits.",
        };
      }

      return { success: false, error: error.message };
    }
  },

  /**
   * Ajouter un nouveau produit
   * @param {Object} product - Produit à ajouter
   * @returns {Promise<Object>} Résultat de l'ajout
   */
  async addProduct(product) {
    const products = await this.getProducts();

    // Générer un ID unique
    product.id = Date.now().toString();
    product.createdAt = new Date().toISOString();

    products.push(product);
    return await this.saveProducts(products);
  },

  /**
   * Mettre à jour un produit existant
   * @param {String} id - ID du produit
   * @param {Object} updatedProduct - Données mises à jour
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  async updateProduct(id, updatedProduct) {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, error: "Produit non trouvé" };
    }

    products[index] = {
      ...products[index],
      ...updatedProduct,
      updatedAt: new Date().toISOString(),
    };

    return await this.saveProducts(products);
  },

  /**
   * Supprimer un produit
   * @param {String} id - ID du produit à supprimer
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async deleteProduct(id) {
    const products = await this.getProducts();
    const filteredProducts = products.filter((p) => p.id !== id);

    if (filteredProducts.length === products.length) {
      return { success: false, error: "Produit non trouvé" };
    }

    return await this.saveProducts(filteredProducts);
  },

  /**
   * Rechercher des produits
   * @param {String} query - Terme de recherche
   * @returns {Promise<Array>} Produits correspondants
   */
  async searchProducts(query) {
    const products = await this.getProducts();

    if (!query || query.trim() === "") {
      return products;
    }

    const searchTerm = query.toLowerCase().trim();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.origin.toLowerCase().includes(searchTerm),
    );
  },

  /**
   * Exporter les produits en JSON (pour sauvegarde)
   * @returns {Promise<String>} JSON des produits
   */
  async exportToJSON() {
    const products = await this.getProducts();
    return JSON.stringify(products, null, 2);
  },

  /**
   * Importer des produits depuis JSON
   * @param {String} jsonData - Données JSON à importer
   * @returns {Promise<Object>} Résultat de l'import
   */
  async importFromJSON(jsonData) {
    try {
      const products = JSON.parse(jsonData);

      if (!Array.isArray(products)) {
        return { success: false, error: "Format JSON invalide" };
      }

      return await this.saveProducts(products);
    } catch (error) {
      return {
        success: false,
        error: "Erreur lors de l'import: " + error.message,
      };
    }
  },

  /**
   * Effacer toutes les données (avec confirmation)
   * @returns {Promise<Object>} Résultat de l'effacement
   */
  async clearAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Made with Bob - Version Web Pure (LocalStorage)
