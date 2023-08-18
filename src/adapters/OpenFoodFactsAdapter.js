import axios from "axios";

const BASE_URL = "https://world.openfoodfacts.org/cgi/search.pl";

const fetchProducts = async (query) => {
  const response = await axios.get(BASE_URL, {
    params: {
      search_terms: query,
      action: "process",
      json: 1,
    },
  });
  return response.data.products;
};

export default { fetchProducts };
