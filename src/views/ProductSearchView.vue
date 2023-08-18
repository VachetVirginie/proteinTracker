<template>
  <div class="container">
    <div class="search-section">
      <input v-model="query" placeholder="Entrez le nom du produit" />
      <button @click="searchProducts">Chercher</button>
    </div>
    <div v-if="records.length" style="margin-top: 20px">
      <h3>Historique des protéines :</h3>
      <ul>
        <li v-for="record in records" :key="record.id">
          <h3>{{ record.productName }} ({{ record.date }})</h3>
          {{ record.protein }} g pour {{ record.quantity }}g
          <button @click="beginEditRecord(record)">Modifier</button>
          <button @click="handleDeleteRecord(record.id)">Supprimer</button>
          <div v-if="recordToEdit && recordToEdit.id === record.id">
            Quantité (g):
            <input
              v-model.number="recordToEdit.quantity"
              type="number"
              @input="recalculateProteinForRecord"
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
          class="img-product"
          :src="product.image_url"
          alt="Image du produit"
          v-if="product.image_url"
          @click="displayProtein(product)"
        />
      </li>
    </ul>
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      <div v-if="showModal" class="modal">
        Protein pour 100g: {{ proteinValue }} g
        <div style="margin-top: 10px">
          <label for="quantity">Quantité du produit (en g) :</label>
          <input
            type="number"
            id="quantity"
            v-model="quantity"
            @input="calculateProteinForQuantity"
          />
        </div>
        <div v-if="calculatedProtein !== 0" style="margin-top: 10px">
          Protéine pour {{ quantity }}g : {{ calculatedProtein.toFixed(2) }} g
        </div>
        <button @click="storeRecord" style="margin-top: 20px">Ajouter</button>
        <button @click="closePopup" style="margin-top: 20px">Fermer</button>
      </div>
    </div>
  </div>
  <div v-if="isLoading" class="loader"></div>
</template>

<script>
import { fetchProductsByName } from "@/use-cases/FetchProducts";
import { storeProteinRecord } from "@/use-cases/StoreProteinRecord";
import Product from "@/entities/Product";
import LocalStorageRepository from "@/repositories/LocalStorageRepository";

export default {
  data() {
    return {
      products: [],
      query: "",
      showModal: false,
      proteinValue: null,
      quantity: null,
      calculatedProtein: 0,
      records: [],
      recordToEdit: null,
      currentProduct: null,
      isLoading: false,
    };
  },
  created() {
    this.records = LocalStorageRepository.getRecords();
  },
  methods: {
    async searchProducts() {
      this.isLoading = true;
      this.products = await fetchProductsByName(this.query).then((response) => {
        this.isLoading = false;
        return response;
      });
    },
    displayProtein(product) {
      const productEntity = new Product(
        product.product_name,
        product.nutriments.proteins_100g
      );
      this.currentProduct = productEntity;
      this.proteinValue = productEntity.proteinPer100g;
      this.productName = productEntity.productName;
      this.showModal = true;
    },
    saveRecord() {
      storeProteinRecord(
        this.currentProduct.productName,
        this.proteinValue,
        this.quantity
      );
      this.records = LocalStorageRepository.getRecords();
      this.closePopup();
    },
    closePopup() {
      this.showModal = false;
      this.proteinValue = null;
      this.quantity = null;
      this.calculatedProtein = 0;
    },
    beginEditRecord(record) {
      this.recordToEdit = { ...record };
    },
    recalculateProteinForRecord() {
      if (this.recordToEdit.quantity) {
        this.recordToEdit.protein = (
          (this.recordToEdit.proteinPer100g / 100) *
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
        LocalStorageRepository.updateRecords(this.records);
      }
      this.recordToEdit = null;
    },
    cancelEdit() {
      this.recordToEdit = null;
    },

    handleDeleteRecord(recordId) {
      LocalStorageRepository.deleteRecord(recordId);
      this.loadRecords();
    },

    loadRecords() {
      this.records = LocalStorageRepository.getRecords();
    },

    calculateProteinForQuantity() {
      if (this.quantity && this.proteinValue) {
        this.calculatedProtein = (this.proteinValue / 100) * this.quantity;
      } else {
        this.calculatedProtein = 0;
      }
    },
    storeRecord() {
      console.log(this.proteinValue);
      const record = {
        id: Date.now().toString(),
        productName: this.productName,
        date: new Date().toISOString().slice(0, 10),
        protein: this.calculatedProtein.toFixed(2),
        proteinPer100g: this.proteinValue,
        quantity: this.quantity,
      };
      this.records.push(record);
      LocalStorageRepository.saveRecord(record);
      this.closePopup();
    },
  },
};
</script>

<style scoped>
.container {
  font-family: "Arial", sans-serif;
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
}

h3 {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

input,
button {
  margin: 10px 0;
  padding: 8px 12px;
  font-size: 16px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  border: 1px solid #ccc;
  padding: 15px;
  margin: 10px 0;
  border-radius: 4px;
  position: relative;
}

img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 500px;
  z-index: 1000;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.img-product {
  width: 10%;
  height: 10%;
  border-radius: 4px;
  margin-right: 10px;
  margin-left: 45%;
}

.search-section {
  display: flex;
  justify-content: space-around;
}

.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
