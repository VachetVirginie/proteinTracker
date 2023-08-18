export default class Product {
  constructor(productName, proteinPer100g) {
    this.productName = productName;
    this.proteinPer100g = proteinPer100g;
  }

  calculateProteinForQuantity(quantity) {
    return (this.proteinPer100g / 100) * quantity;
  }
}
