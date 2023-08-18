import OpenFoodFactsAdapter from "@/adapters/OpenFoodFactsAdapter";

export const fetchProductsByName = async (query) => {
  return OpenFoodFactsAdapter.fetchProducts(query);
};
