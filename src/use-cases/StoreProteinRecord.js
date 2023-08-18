import LocalStorageRepository from "@/repositories/LocalStorageRepository";

export const storeProteinRecord = (productName, proteinValue, quantity) => {
  const record = {
    id: Date.now().toString(),
    productName: productName,
    date: new Date().toISOString().slice(0, 10),
    protein: ((proteinValue / 100) * quantity).toFixed(2),
    proteinPer100g: proteinValue,
    quantity: quantity,
  };
  LocalStorageRepository.store(record);
};
