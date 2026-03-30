// =============================================
// DATA CONFIG — Group 63 E-Commerce
// Note: Product data now comes from the API (api.js)
// =============================================

const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "electronics", label: "Electronics" },
  { id: "clothing", label: "Clothing" },
  { id: "home", label: "Home & Living" },
  { id: "accessories", label: "Accessories" },
];

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.featured);
}

function getProductsByCategory(cat) {
  if (!cat || cat === "all") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === cat);
}

function searchProducts(query, cat) {
  let results = getProductsByCategory(cat);
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }
  return results;
}
