<template>
  <div>
    <input v-model="query" placeholder="Entrez le nom du produit" />
    <button @click="fetchProductsByName">Chercher</button>

    <ul v-if="products.length">
      <li v-for="product in products" :key="product.id">
        <h2>{{ product.product_name }}</h2>
        <img
          :src="product.image_url"
          alt="Image du produit"
          v-if="product.image_url"
          @click="displayProtein(product)"
          style="cursor: pointer"
        />
      </li>
    </ul>

    <!-- Popup for displaying protein value -->
    <div
      v-if="showModal"
      style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      "
    >
      <h1>{{ productName }}</h1>
      Proteine pour 100g: {{ proteinValue }} g
      <div style="margin-top: 10px">
        <label for="quantity">Quantité du produit (en g) :</label>
        <input
          type="number"
          id="quantity"
          v-model="quantity"
          @input="calculateProteinForQuantity"
        />
      </div>
      <div v-if="calculatedProtein !== null" style="margin-top: 10px">
        Protéine pour {{ quantity }}g : {{ calculatedProtein.toFixed(2) }} g
      </div>
      <button @click="closePopup" style="margin-left: 20px">Fermer</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const BASE_URL = "https://world.openfoodfacts.org/cgi/search.pl";

export default {
  data() {
    return {
      products: [],
      query: "",
      showModal: false,
      proteinValue: null,
      productName: null,
      quantity: null,
      calculatedProtein: null,
    };
  },
  methods: {
    fetchProductsByName() {
      axios
        .get(BASE_URL, {
          params: {
            search_terms: this.query,
            action: "process",
            json: 1,
          },
        })
        .then((response) => {
          this.products = response.data.products;
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données:", error);
        });
    },
    displayProtein(product) {
      this.productName = product.product_name;
      this.proteinValue = product.nutriments.proteins_100g;
      this.showModal = true;
    },
    closePopup() {
      this.showModal = false;
      this.proteinValue = null;
    },
    calculateProteinForQuantity() {
      if (this.quantity && this.proteinValue) {
        this.calculatedProtein = (this.proteinValue / 100) * this.quantity;
      } else {
        this.calculatedProtein = null;
      }
    },
  },
};
</script>

<style scoped>
/* Vous pouvez ajouter des styles supplémentaires ici */
</style>
