import axios from "axios";
import { Product, ProductFormData } from "../types/product";
import { API_CONFIG } from "../config/api";
import { authService } from "./authService";
import { fileService } from "./fileService";
import { optimizeImage } from "../utils/imageUtils";

class ProductService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      ...API_CONFIG.HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async processImage(image: string | File): Promise<string> {
    // Если это уже URL (не base64), возвращаем как есть
    if (typeof image === "string" && !image.startsWith("data:")) {
      return image;
    }

    // Если это base64 строка, конвертируем в File
    if (typeof image === "string" && image.startsWith("data:")) {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: mimeType });
      const file = new File([blob], "image.jpg", { type: mimeType });
      image = file;
    }

    // Загружаем файл
    return await fileService.saveImage(image as File, "product");
  }

  async getProducts(): Promise<Product[]> {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    console.log("productService.getProductById - ID:", id);

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(
      id
    )}`;
    console.log("Request URL:", url);

    try {
      const response = await axios.get(url, { headers: this.getHeaders() });
      console.log("Get product response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting product:", error);
      throw error;
    }
  }

  async createProduct(product: ProductFormData): Promise<Product> {
    const formData = new FormData();

    // Обрабатываем изображение
    if (product.image) {
      const imageUrl = await this.processImage(product.image);
      formData.append("image", imageUrl);
    }

    // Добавляем остальные поля
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price.toString());
    formData.append("category", product.category);
    formData.append("unitOfMeasure", product.unitOfMeasure);
    if (product.stock !== undefined) {
      formData.append("stock", product.stock.toString());
    }
    if (product.isActive !== undefined) {
      formData.append("isActive", product.isActive.toString());
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}`,
      formData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async updateProduct(id: string, product: ProductFormData): Promise<Product> {
    const formData = new FormData();

    // Обрабатываем изображение
    if (product.image) {
      const imageUrl = await this.processImage(product.image);
      formData.append("image", imageUrl);
    }

    // Добавляем остальные поля
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price.toString());
    formData.append("category", product.category);
    formData.append("unitOfMeasure", product.unitOfMeasure);
    if (product.stock !== undefined) {
      formData.append("stock", product.stock.toString());
    }
    if (product.isActive !== undefined) {
      formData.append("isActive", product.isActive.toString());
    }

    const response = await axios.put(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)}`,
      formData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)}`,
      { headers: this.getHeaders() }
    );
  }

  private convertFormDataToProduct(
    formData: ProductFormData
  ): Omit<Product, "_id" | "id" | "createdAt" | "updatedAt"> {
    return {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      categoryId: formData.categoryId,
      image: typeof formData.image === "string" ? formData.image : undefined,
      stock: formData.stock,
      isActive: formData.isActive,
    };
  }
}

export const productService = new ProductService();
