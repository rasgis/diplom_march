import axios from "axios";
import { Product } from "../types/product";

const API_URL = "http://localhost:3001";

class ProductService {
  async getProducts(): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  }

  async createProduct(
    product: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const response = await axios.post(`${API_URL}/products`, product);
    return response.data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await axios.put(`${API_URL}/products/${id}`, product);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  }
}

export const productService = new ProductService();
