import axios from "axios";
import { Category, CategoryWithChildren } from "../types/category";

const API_URL = "http://localhost:3001";

class CategoryService {
  async getCategories(): Promise<Category[]> {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    if (response.status !== 200) {
      throw new Error("Failed to fetch category");
    }
    return response.data;
  }

  async createCategory(
    category: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<Category> {
    const response = await axios.post(`${API_URL}/categories`, category);
    return response.data;
  }

  async updateCategory(
    id: string,
    category: Partial<Category>
  ): Promise<Category> {
    const response = await axios.put(`${API_URL}/categories/${id}`, category);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await axios.delete(`${API_URL}/categories/${id}`);
  }

  buildCategoryTree(categories: Category[]): Category[] {
    return categories.filter((category) => !category.parentId);
  }

  getCategoryPath(categories: Category[], categoryId: string): Category[] {
    const path: Category[] = [];
    let currentCategory = categories.find((cat) => cat.id === categoryId);

    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = categories.find(
        (cat) => cat.id === currentCategory?.parentId
      );
    }

    return path;
  }
}

export const categoryService = new CategoryService();
