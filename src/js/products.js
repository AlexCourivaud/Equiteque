/**
 * Module de gestion des produits
 * Gère l'affichage, la création, la modification et la suppression des produits
 */

const ProductsManager = {
  currentProducts: [],
  editingProductId: null,
  selectedProducts: [],
  selectedBackground: 'none',

  /**
   * Initialiser le gestionnaire de produits
   */
  async init() {
    await this.loadProducts();
    this.setupEventListeners();
  },

  /**
   * Charger tous les produits
   */
  async loadProducts() {
    this.currentProducts = await Storage.getProducts();
    this.renderProducts(this.currentProducts);
  },

  /**
   * Afficher les produits dans l'interface
   * @param {Array} products - Liste des produits à afficher
   */
  renderProducts(products) {
    const productsList = document.getElementById("products-list");
    const emptyState = document.getElementById("empty-state");

    if (products.length === 0) {
      productsList.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    productsList.style.display = "grid";
    emptyState.style.display = "none";

    productsList.innerHTML = products
      .map(
        (product) => `
            <div class="product-card" data-id="${product.id}" onclick="ProductsManager.toggleProductFromDiv('${product.id}', event)">
                <input
                    type="checkbox"
                    class="product-checkbox"
                    id="check-${product.id}"
                    data-product-id="${product.id}"
                    ${this.selectedProducts.includes(product.id) ? 'checked' : ''}
                    onclick="event.stopPropagation();"
                    onchange="ProductsManager.toggleProductFromCheckbox('${product.id}')"
                >
                <div class="product-info">
                    <h3>${this.escapeHtml(product.name)}</h3>
                    <p>Origine : ${this.escapeHtml(product.origin)}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-edit" onclick="event.stopPropagation(); ProductsManager.editProduct('${product.id}')">
                        Modifier
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
    
    this.updateSelectionUI();
  },

  /**
   * Configurer les écouteurs d'événements
   */
  setupEventListeners() {
    // Bouton nouveau produit
    document.getElementById("btn-new-product").addEventListener("click", () => {
      this.openProductModal();
    });

    // Bouton sélectionner tout
    document.getElementById("btn-select-all").addEventListener("click", () => {
      this.selectAllProducts();
    });

    // Bouton supprimer la sélection
    document.getElementById("btn-delete-selected").addEventListener("click", () => {
      this.deleteSelectedProducts();
    });

    // Recherche
    document.getElementById("search-input").addEventListener("input", (e) => {
      this.handleSearch(e.target.value);
    });

    // Fermer modal
    document.getElementById("close-modal").addEventListener("click", () => {
      this.closeProductModal();
    });

    document.getElementById("cancel-btn").addEventListener("click", () => {
      this.closeProductModal();
    });

    // Soumettre formulaire
    document.getElementById("product-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Aperçu en temps réel
    ["product-name", "product-origin"].forEach(
      (id) => {
        document.getElementById(id).addEventListener("input", () => {
          this.updatePreview();
        });
      },
    );
  },

  /**
   * Ouvrir le modal de produit
   * @param {Object} product - Produit à éditer (optionnel)
   */
  openProductModal(product = null) {
    const modal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const form = document.getElementById("product-form");

    if (product) {
      // Mode édition
      this.editingProductId = product.id;
      modalTitle.textContent = "Modifier le Produit";
      document.getElementById("product-name").value = product.name;
      document.getElementById("product-origin").value = product.origin;
      this.selectedBackground = product.backgroundImage || 'none';
    } else {
      this.selectedBackground = 'none';
      // Mode création
      this.editingProductId = null;
      modalTitle.textContent = "Nouveau Produit";
      form.reset();
    }

    this.updatePreview();
    this.updateBackgroundSelection();
    modal.classList.add("active");
  },

  /**
   * Fermer le modal de produit
   */
  closeProductModal() {
    const modal = document.getElementById("product-modal");
    modal.classList.remove("active");
    this.editingProductId = null;
  },

  /**
   * Mettre à jour l'aperçu de l'étiquette
   */
  updatePreview() {
    const name =
      document.getElementById("product-name").value || "Lentille Corail";
    const origin = document.getElementById("product-origin").value || "";

    const preview = document.getElementById("label-preview");
    
    // Ajouter l'image en haut de la zone droite si sélectionnée
    let backgroundImageHtml = '';
    if (this.selectedBackground && this.selectedBackground !== 'none') {
      backgroundImageHtml = `<img src="/assets/backgrounds/${encodeURIComponent(this.selectedBackground)}" class="label-background-image" alt="Background">`;
    }
    
    preview.innerHTML = `
            <div class="label-content-split">
                <div class="label-left">
                    <div class="label-name">${this.escapeHtml(name)}</div>
                    <div class="label-origin">ORIGINE : ${this.escapeHtml(origin).toUpperCase()}</div>
                    <div class="label-price-space"></div>
                </div>
                <div class="label-right">
                    ${backgroundImageHtml}
                    <div class="label-logos">
                        <div class="label-logo"><img src="/assets/Certification_bio_AB.jpg" alt="AB"></div>
                        <div class="label-logo"><img src="/assets/Eurofeuille_couleurAB.jpg" alt="EU"></div>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * Capitaliser la première lettre de chaque mot
   * @param {String} text - Texte à capitaliser
   * @returns {String} Texte capitalisé
   */
  capitalizeWords(text) {
    if (!text) return text;
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  /**
   * Gérer la soumission du formulaire
   */
  async handleSubmit() {
    const rawName = document.getElementById("product-name").value.trim();
    const rawOrigin = document.getElementById("product-origin").value.trim();

    const product = {
      name: this.capitalizeWords(rawName),
      origin: this.capitalizeWords(rawOrigin),
      backgroundImage: this.selectedBackground,
    };

    let result;
    if (this.editingProductId) {
      // Mise à jour
      result = await Storage.updateProduct(this.editingProductId, product);
    } else {
      // Création
      result = await Storage.addProduct(product);
    }

    if (result.success) {
      this.closeProductModal();
      await this.loadProducts();
    } else {
      alert("Erreur lors de la sauvegarde : " + result.error);
    }
  },

  /**
   * Éditer un produit
   * @param {String} id - ID du produit
   */
  async editProduct(id) {
    const product = this.currentProducts.find((p) => p.id === id);
    if (product) {
      this.openProductModal(product);
    }
  },

  /**
   * Basculer la sélection depuis la checkbox
   * @param {String} productId - ID du produit
   */
  toggleProductFromCheckbox(productId) {
    const checkbox = document.getElementById(`check-${productId}`);
    const index = this.selectedProducts.indexOf(productId);
    
    if (checkbox.checked && index === -1) {
      this.selectedProducts.push(productId);
    } else if (!checkbox.checked && index > -1) {
      this.selectedProducts.splice(index, 1);
    }

    this.updateSelectionUI();
  },

  /**
   * Basculer la sélection depuis le clic sur la div
   * @param {String} productId - ID du produit
   * @param {Event} event - Événement
   */
  toggleProductFromDiv(productId, event) {
    // Ne rien faire si on clique sur la checkbox elle-même
    if (event.target.type === 'checkbox') {
      return;
    }

    const checkbox = document.getElementById(`check-${productId}`);
    const index = this.selectedProducts.indexOf(productId);

    if (index > -1) {
      this.selectedProducts.splice(index, 1);
      checkbox.checked = false;
    } else {
      this.selectedProducts.push(productId);
      checkbox.checked = true;
    }

    this.updateSelectionUI();
  },

  /**
   * Sélectionner une image de fond
   * @param {String} imageName - Nom de l'image
   */
  selectBackground(imageName) {
    this.selectedBackground = imageName;
    this.updateBackgroundSelection();
    this.updatePreview();
  },

  /**
   * Mettre à jour la sélection visuelle de l'image de fond
   */
  updateBackgroundSelection() {
    const options = document.querySelectorAll('.background-option');
    options.forEach(option => {
      if (option.dataset.image === this.selectedBackground) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  },

  /**
   * Mettre à jour l'interface de sélection
   */
  updateSelectionUI() {
    const deleteBtn = document.getElementById("btn-delete-selected");
    const selectAllBtn = document.getElementById("btn-select-all");
    const countSpan = document.getElementById("selected-count");
    
    // Afficher le bouton "Sélectionner tout" s'il y a des produits
    if (this.currentProducts.length > 0) {
      selectAllBtn.style.display = "inline-flex";
      
      // Changer le texte selon l'état
      if (this.selectedProducts.length === this.currentProducts.length) {
        selectAllBtn.textContent = "Tout désélectionner";
      } else {
        selectAllBtn.textContent = "Sélectionner tout";
      }
    } else {
      selectAllBtn.style.display = "none";
    }
    
    // Afficher le bouton supprimer si des produits sont sélectionnés
    if (this.selectedProducts.length > 0) {
      deleteBtn.style.display = "inline-flex";
      countSpan.textContent = this.selectedProducts.length;
    } else {
      deleteBtn.style.display = "none";
    }
  },

  /**
   * Sélectionner ou désélectionner tous les produits
   */
  selectAllProducts() {
    if (this.selectedProducts.length === this.currentProducts.length) {
      // Tout désélectionner
      this.selectedProducts = [];
    } else {
      // Tout sélectionner
      this.selectedProducts = this.currentProducts.map(p => p.id);
    }
    
    // Mettre à jour les checkboxes
    this.currentProducts.forEach(product => {
      const checkbox = document.getElementById(`check-${product.id}`);
      if (checkbox) {
        checkbox.checked = this.selectedProducts.includes(product.id);
      }
    });
    
    this.updateSelectionUI();
  },

  /**
   * Supprimer les produits sélectionnés
   */
  async deleteSelectedProducts() {
    if (this.selectedProducts.length === 0) return;

    const count = this.selectedProducts.length;
    const message = count === 1
      ? "Êtes-vous sûr de vouloir supprimer ce produit ?"
      : `Êtes-vous sûr de vouloir supprimer ces ${count} produits ?`;

    if (confirm(message)) {
      let successCount = 0;
      let errorCount = 0;

      for (const productId of this.selectedProducts) {
        const result = await Storage.deleteProduct(productId);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      this.selectedProducts = [];
      await this.loadProducts();

      if (errorCount > 0) {
        alert(`${successCount} produit(s) supprimé(s), ${errorCount} erreur(s)`);
      }
    }
  },

  /**
   * Gérer la recherche
   * @param {String} query - Terme de recherche
   */
  async handleSearch(query) {
    const filteredProducts = await Storage.searchProducts(query);
    this.renderProducts(filteredProducts);
  },

  /**
   * Échapper les caractères HTML
   * @param {String} text - Texte à échapper
   * @returns {String} Texte échappé
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

// Made with Bob
