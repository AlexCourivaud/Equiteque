/**
 * Module de génération de PDF pour les étiquettes
 * Utilise jsPDF pour créer des planches d'étiquettes au format A4
 */

const PDFGenerator = {
  // Configuration des étiquettes (en mm)
  labelWidth: 150, // 15 cm
  labelHeight: 60, // 6 cm

  // Configuration page A4 (en mm)
  pageWidth: 210,
  pageHeight: 297,

  // Marges (en mm)
  marginTop: 10,
  marginLeft: 30,

  // Espacement entre étiquettes (en mm)
  labelSpacing: 6,

  // Nombre d'étiquettes par page
  labelsPerPage: 4,

  selectedProducts: [],
  allProducts: [],
  filteredProducts: [],
  currentPage: 1,
  itemsPerPage: 15,

  /**
   * Initialiser le générateur
   */
  init() {
    this.setupEventListeners();
  },

  /**
   * Configurer les écouteurs d'événements
   */
  setupEventListeners() {
    // Bouton générer étiquettes
    document
      .getElementById("btn-generate-labels")
      .addEventListener("click", () => {
        this.openGeneratorModal();
      });

    // Fermer modal générateur
    document.getElementById("close-generator").addEventListener("click", () => {
      this.closeGeneratorModal();
    });

    document
      .getElementById("cancel-generator")
      .addEventListener("click", () => {
        this.closeGeneratorModal();
      });

    // Générer PDF
    document.getElementById("generate-pdf").addEventListener("click", () => {
      this.generatePDF();
    });

    // Recherche dynamique
    document.getElementById("generator-search").addEventListener("input", (e) => {
      this.handleSearch(e.target.value);
    });

    // Tri
    document.getElementById("generator-sort").addEventListener("change", (e) => {
      this.handleSort(e.target.value);
    });
  },

  /**
   * Ouvrir le modal de génération
   */
  async openGeneratorModal() {
    const products = await Storage.getProducts();

    if (products.length === 0) {
      alert("Aucun produit disponible. Veuillez d'abord créer des produits.");
      return;
    }

    // Trier par plus récents par défaut
    this.allProducts = products.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    this.filteredProducts = [...this.allProducts];
    this.currentPage = 1;
    this.selectedProducts = [];

    // Réinitialiser les contrôles
    document.getElementById("generator-search").value = "";
    document.getElementById("generator-sort").value = "recent";

    this.renderGeneratorList();
    document.getElementById("generator-modal").classList.add("active");
    this.updateSummary();
  },

  /**
   * Fermer le modal de génération
   */
  closeGeneratorModal() {
    document.getElementById("generator-modal").classList.remove("active");
    this.selectedProducts = [];
    this.allProducts = [];
    this.filteredProducts = [];
    this.currentPage = 1;
  },

  /**
   * Afficher la liste des produits dans le générateur avec pagination
   */
  renderGeneratorList() {
    const generatorList = document.getElementById("generator-list");
    
    // Calculer la pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);

    generatorList.innerHTML = paginatedProducts
      .map(
        (product) => `
            <div class="generator-item" onclick="PDFGenerator.toggleProductFromDiv('${product.id}', event)">
                <input
                    type="checkbox"
                    id="gen-check-${product.id}"
                    data-product-id="${product.id}"
                    ${this.selectedProducts.includes(product.id) ? 'checked' : ''}
                    onclick="event.stopPropagation();"
                    onchange="PDFGenerator.toggleProductFromCheckbox('${product.id}')"
                >
                <div class="generator-item-info">
                    <h4>${this.escapeHtml(product.name)}</h4>
                    <p>${this.escapeHtml(product.origin)}</p>
                </div>
            </div>
        `,
      )
      .join("");

    this.renderPagination();
    this.updateSummary();
  },

  /**
   * Afficher la pagination
   */
  renderPagination() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const paginationDiv = document.getElementById("generator-pagination");

    if (totalPages <= 1) {
      paginationDiv.innerHTML = "";
      return;
    }

    let html = `
      <button class="pagination-btn" onclick="PDFGenerator.goToPage(1)" ${this.currentPage === 1 ? 'disabled' : ''}>
        ‹‹
      </button>
      <button class="pagination-btn" onclick="PDFGenerator.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
        ‹
      </button>
    `;

    // Afficher les numéros de page
    const maxButtons = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `
        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="PDFGenerator.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    html += `
      <button class="pagination-btn" onclick="PDFGenerator.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
        ›
      </button>
      <button class="pagination-btn" onclick="PDFGenerator.goToPage(${totalPages})" ${this.currentPage === totalPages ? 'disabled' : ''}>
        ››
      </button>
      <span class="pagination-info">Page ${this.currentPage} / ${totalPages}</span>
    `;

    paginationDiv.innerHTML = html;
  },

  /**
   * Aller à une page spécifique
   * @param {Number} page - Numéro de page
   */
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.renderGeneratorList();
  },

  /**
   * Basculer la sélection depuis la checkbox
   * @param {String} productId - ID du produit
   */
  toggleProductFromCheckbox(productId) {
    const checkbox = document.getElementById(`gen-check-${productId}`);
    const index = this.selectedProducts.indexOf(productId);
    
    if (checkbox.checked && index === -1) {
      this.selectedProducts.push(productId);
    } else if (!checkbox.checked && index > -1) {
      this.selectedProducts.splice(index, 1);
    }

    this.updateSummary();
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

    const checkbox = document.getElementById(`gen-check-${productId}`);
    const index = this.selectedProducts.indexOf(productId);

    if (index > -1) {
      this.selectedProducts.splice(index, 1);
      checkbox.checked = false;
    } else {
      this.selectedProducts.push(productId);
      checkbox.checked = true;
    }

    this.updateSummary();
  },

  /**
   * Gérer la recherche
   * @param {String} query - Terme de recherche
   */
  handleSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm === "") {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.origin.toLowerCase().includes(searchTerm)
      );
    }

    this.currentPage = 1;
    this.renderGeneratorList();
  },

  /**
   * Gérer le tri
   * @param {String} sortType - Type de tri
   */
  handleSort(sortType) {
    switch (sortType) {
      case "recent":
        this.filteredProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        break;
      case "name-asc":
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    this.currentPage = 1;
    this.renderGeneratorList();
  },

  /**
   * Mettre à jour le résumé (total étiquettes et pages)
   */
  updateSummary() {
    const totalLabels = this.selectedProducts.length;
    const totalPages = Math.ceil(totalLabels / this.labelsPerPage);

    document.getElementById("total-labels").textContent = totalLabels;
    document.getElementById("total-pages").textContent = totalPages;
  },

  /**
   * Générer le PDF
   */
  async generatePDF() {
    if (this.selectedProducts.length === 0) {
      alert("Veuillez sélectionner au moins un produit.");
      return;
    }

    try {
      // Charger jsPDF depuis CDN si nécessaire
      if (typeof jspdf === "undefined") {
        await this.loadJsPDF();
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Récupérer les produits sélectionnés
      const labels = this.selectedProducts.map(productId =>
        this.allProducts.find(p => p.id === productId)
      ).filter(p => p !== undefined);

      // Générer les pages
      let labelIndex = 0;
      let pageNumber = 0;

      while (labelIndex < labels.length) {
        if (pageNumber > 0) {
          doc.addPage();
        }

        // Dessiner jusqu'à 4 étiquettes par page
        for (
          let i = 0;
          i < this.labelsPerPage && labelIndex < labels.length;
          i++
        ) {
          const product = labels[labelIndex];
          const yPosition = this.marginTop + i * (this.labelHeight + this.labelSpacing);

          await this.drawLabel(doc, product, this.marginLeft, yPosition);
          labelIndex++;
        }

        pageNumber++;
      }

      // Sauvegarder le PDF
      const filename = `etiquettes_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);

      this.closeGeneratorModal();
      alert(
        `PDF généré avec succès !\n${labels.length} étiquette(s) sur ${pageNumber} page(s).`,
      );
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF : " + error.message);
    }
  },

  /**
   * Dessiner une étiquette sur le PDF
   * @param {Object} doc - Instance jsPDF
   * @param {Object} product - Produit à afficher
   * @param {Number} x - Position X
   * @param {Number} y - Position Y
   */
  async drawLabel(doc, product, x, y) {
    // Bordure de l'étiquette
    doc.setLineWidth(0.5);
    doc.rect(x, y, this.labelWidth, this.labelHeight);

    // Zone de texte à gauche (100mm de largeur)
    const textZoneWidth = 100;
    const textZoneCenterX = x + textZoneWidth / 2;
    
    // Nom du produit (centré, gras)
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(product.name, textZoneCenterX, y + 20, {
      maxWidth: textZoneWidth - 20,
      align: 'center'
    });

    // Ligne de séparation (seulement dans la zone de texte)
    doc.setLineWidth(0.3);
    doc.line(x + 10, y + 28, x + textZoneWidth - 10, y + 28);

    // Origine (centrée)
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const originText = `ORIGINE : ${product.origin.toUpperCase()}`;
    doc.text(originText, textZoneCenterX, y + 38, { align: 'center' });

    // Espace vide pour écrire le prix manuellement (à gauche, en bas)
    // (pas de texte)

    // ZONE DROITE (50mm) : Image + Logos bio
    const rightZoneX = x + textZoneWidth;
    const rightZoneWidth = this.labelWidth - textZoneWidth;

    // Image de fond en haut à droite si définie
    if (product.backgroundImage && product.backgroundImage !== 'none') {
      try {
        const bgImageData = await this.loadImage(`assets/backgrounds/${product.backgroundImage}`);
        
        // Créer une image temporaire pour obtenir les dimensions réelles
        const tempImg = new Image();
        await new Promise((resolve, reject) => {
          tempImg.onload = resolve;
          tempImg.onerror = reject;
          tempImg.src = bgImageData;
        });
        
        // Calculer les dimensions en préservant le ratio
        const maxWidth = 40;
        const maxHeight = 30;
        const imgRatio = tempImg.width / tempImg.height;
        
        let imgWidth, imgHeight;
        if (imgRatio > maxWidth / maxHeight) {
          // Image plus large que haute
          imgWidth = maxWidth;
          imgHeight = maxWidth / imgRatio;
        } else {
          // Image plus haute que large
          imgHeight = maxHeight;
          imgWidth = maxHeight * imgRatio;
        }
        
        // Position : en haut de la zone droite, centrée
        const imgX = rightZoneX + (rightZoneWidth - imgWidth) / 2;
        const imgY = y + 5;
        
        // Détecter le format de l'image
        const format = product.backgroundImage.toLowerCase().endsWith('.jpg') ||
                      product.backgroundImage.toLowerCase().endsWith('.jpeg') ? 'JPEG' : 'PNG';
        
        doc.addImage(bgImageData, format, imgX, imgY, imgWidth, imgHeight);
      } catch (error) {
        console.warn(`Impossible de charger l'image de fond: ${product.backgroundImage}`, error);
      }
    }

    // Logos bio (en bas de la zone droite, centrés)
    await this.drawLogos(doc, rightZoneX, y, rightZoneWidth);
  },

  /**
   * Dessiner les logos bio
   * @param {Object} doc - Instance jsPDF
   * @param {Number} x - Position X de la zone
   * @param {Number} y - Position Y de l'étiquette
   * @param {Number} zoneWidth - Largeur de la zone (optionnel, pour centrage)
   */
  async drawLogos(doc, x, y, zoneWidth = null) {
    try {
      // Dimensions des logos avec ratios corrects
      // Logo AB: ratio 0.72:1 (plus haut que large)
      const abHeight = 15;
      const abWidth = abHeight * 0.72; // ~10.8mm
      
      // Logo EU: ratio 1.5:1 (3:2, plus large que haut)
      const euHeight = 15;
      const euWidth = euHeight * 1.5; // 22.5mm
      
      const spacing = 2; // Espacement entre les logos
      const totalLogosWidth = abWidth + spacing + euWidth;

      // Si zoneWidth est fourni, centrer les logos dans cette zone
      let logosX;
      if (zoneWidth) {
        // Centrer dans la zone fournie
        logosX = x + (zoneWidth - totalLogosWidth) / 2;
      } else {
        // Position par défaut: en bas à droite avec marge de 10mm du bord droit
        const marginRight = 10;
        logosX = x + this.labelWidth - totalLogosWidth - marginRight;
      }
      
      // Position Y: en bas avec marge de 5mm
      const marginBottom = 5;
      const logosY = y + this.labelHeight - abHeight - marginBottom;

      // Logo AB (ratio 0.72:1)
      const logoAB = await this.loadImage("assets/Certification_bio_AB.jpg");
      doc.addImage(logoAB, "JPEG", logosX, logosY, abWidth, abHeight);

      // Logo EU (ratio 1.5:1, à droite du AB avec espacement)
      const logoEU = await this.loadImage("assets/Eurofeuille_couleurAB.jpg");
      doc.addImage(logoEU, "JPEG", logosX + abWidth + spacing, logosY, euWidth, euHeight);
    } catch (error) {
      console.error("Erreur lors du chargement des logos:", error);
      // Fallback: dessiner des rectangles de couleur si les images ne chargent pas
      const marginRight = 10;
      const marginBottom = 5;
      const abWidth = 10.8;
      const euWidth = 22.5;
      const fallbackX = x + this.labelWidth - (abWidth + 2 + euWidth) - marginRight;
      const fallbackY = y + this.labelHeight - 15 - marginBottom;
      
      doc.setFillColor(34, 139, 34);
      doc.rect(fallbackX, fallbackY, abWidth, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("AB", fallbackX + 2, fallbackY + 10);

      doc.setFillColor(0, 51, 153);
      doc.rect(fallbackX + abWidth + 2, fallbackY, euWidth, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("EU", fallbackX + abWidth + 8, fallbackY + 10);

      doc.setTextColor(0, 0, 0);
    }
  },

  /**
   * Charger une image en base64
   * @param {String} url - URL de l'image
   * @returns {Promise<String>} Image en base64
   */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      console.log("Tentative de chargement de l'image:", url);

      const img = new Image();

      // Ne pas utiliser crossOrigin pour les fichiers locaux
      // img.crossOrigin = "Anonymous";

      img.onload = () => {
        console.log(
          "Image chargée:",
          url,
          "Dimensions:",
          img.width,
          "x",
          img.height,
        );
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          // Remplir le canvas avec un fond blanc pour les PNG avec transparence
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, 0, 0);
          
          // Détecter le format de l'image
          const isPNG = url.toLowerCase().endsWith('.png');
          const format = isPNG ? 'image/png' : 'image/jpeg';
          const quality = isPNG ? 1.0 : 0.95;
          
          const dataURL = canvas.toDataURL(format, quality);
          console.log("Image convertie en base64, taille:", dataURL.length);
          resolve(dataURL);
        } catch (error) {
          console.error("Erreur lors de la conversion canvas:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error("Erreur lors du chargement de l'image:", url, error);
        reject(new Error(`Impossible de charger l'image: ${url}`));
      };

      img.src = url;
    });
  },

  /**
   * Charger jsPDF depuis CDN
   */
  async loadJsPDF() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
