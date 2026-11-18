// Catálogo da loja no servidor: os preços válidos ficam aqui (o navegador não decide o valor).
// Mantenha igual a src/data/storeProducts.ts.
export const STORE_CATALOG = {
  dorot: {
    title: 'DOROT',
    formats: {
      impresso: { label: 'Impresso', price: 49.9, kind: 'physical' },
      pdf: { label: 'Digital (PDF)', price: 19.9, kind: 'digital' },
    },
  },
};

export function getStoreItem(productId, formatId) {
  const product = STORE_CATALOG[productId];
  const format = product && product.formats[formatId];
  return product && format ? { product, format } : null;
}
