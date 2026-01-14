import { productsMock } from "./productsMock";

export function getProducts() {
  return Promise.resolve(productsMock);
}

export function getProductById(id) {
  const product = productsMock.find((p) => p.id === id);
  return product
    ? Promise.resolve(product)
    : Promise.reject(new Error("Producto no encontrado"));
}