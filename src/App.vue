<template>
  <div>
    <input v-model="query" placeholder="Entrez le nom du produit" />
    <button @click="fetchProductsByName">Chercher</button>

    <!-- Historique des protéines -->
    <div v-if="records.length" style="margin-top: 20px">
      <h3>Historique des protéines :</h3>
      <ul>
        <li v-for="record in records" :key="record.id">
          {{ record.date }}: {{ record.protein }} g pour {{ record.quantity }}g
          <button @click="beginEditRecord(record)">Modifier</button>
          <button @click="deleteRecord(record.id)">Supprimer</button>
          <div v-if="recordToEdit && recordToEdit.id === record.id">
            Quantité (g):
            <input
              v-model.number="recordToEdit.quantity"
              type="number"
              @input="recalculateProtein"
            />
            Protéines (g):
            <input v-model.number="recordToEdit.protein" type="text" readonly />
            <button @click="commitEdit">Valider</button>
            <button @click="cancelEdit">Annuler</button>
          </div>
        </li>
      </ul>
    </div>

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

    <!-- Popup pour affichage de la valeur en protéines -->
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
      Protein per 100g: {{ proteinValue }} g
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
      <button @click="storeRecord" style="margin-top: 20px">
        Stocker cette valeur
      </button>
      <button @click="closePopup" style="margin-top: 20px">Fermer</button>
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
      quantity: null,
      calculatedProtein: null,
      records: [],
      recordToEdit: null,
    };
  },
  created() {
    this.loadRecords();
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
      this.proteinValue = product.nutriments.proteins_100g;
      this.showModal = true;
    },
    calculateProteinForQuantity() {
      if (this.quantity && this.proteinValue) {
        this.calculatedProtein = (this.proteinValue / 100) * this.quantity;
      } else {
        this.calculatedProtein = null;
      }
    },
    storeRecord() {
      const record = {
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10),
        protein: this.calculatedProtein.toFixed(2),
        quantity: this.quantity,
      };
      this.records.push(record);
      localStorage.setItem("proteinRecords", JSON.stringify(this.records));
    },
    loadRecords() {
      const storedRecords = localStorage.getItem("proteinRecords");
      if (storedRecords) {
        this.records = JSON.parse(storedRecords);
      }
    },
    beginEditRecord(record) {
      this.recordToEdit = { ...record };
    },
    recalculateProtein() {
      if (this.recordToEdit.quantity && this.proteinValue) {
        this.recordToEdit.protein = (
          (this.proteinValue / 100) *
          this.recordToEdit.quantity
        ).toFixed(2);
      }
    },
    commitEdit() {
      const index = this.records.findIndex(
        (r) => r.id === this.recordToEdit.id
      );
      if (index !== -1) {
        this.records.splice(index, 1, this.recordToEdit);
        localStorage.setItem("proteinRecords", JSON.stringify(this.records));
      }
      this.recordToEdit = null;
    },
    cancelEdit() {
      this.recordToEdit = null;
    },
    deleteRecord(recordId) {
      const index = this.records.findIndex((r) => r.id === recordId);
      if (index !== -1) {
        this.records.splice(index, 1);
        localStorage.setItem("proteinRecords", JSON.stringify(this.records));
      }
    },
    closePopup() {
      this.showModal = false;
      this.proteinValue = null;
      this.quantity = null;
      this.calculatedProtein = null;
    },
  },
};
</script>

<style scoped>
/* Votre CSS ici */
</style>
