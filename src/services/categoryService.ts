import axios from "axios";
import { Category } from "../types/category";
import { authService } from "./authService";

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

const API_URL = "http://localhost:3001/api";

class CategoryService {
  private getAuthHeaders() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Ошибка при загрузке категорий");
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await axios.get(`${API_URL}/categories/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (response.status !== 200) {
      throw new Error("Failed to fetch category");
    }
    return response.data;
  }

  async createCategory(
    category: Omit<
      Category,
      "_id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ): Promise<Category> {
    try {
      const response = await axios.post(`${API_URL}/categories`, category, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Ошибка при создании категории"
        );
      }
      throw new Error("Ошибка при создании категории");
    }
  }

  async updateCategory(
    id: string,
    category: Partial<Category>
  ): Promise<Category> {
    try {
      const response = await axios.put(
        `${API_URL}/categories/${id}`,
        category,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Ошибка при обновлении категории"
        );
      }
      throw new Error("Ошибка при обновлении категории");
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Ошибка при удалении категории"
        );
      }
      throw new Error("Ошибка при удалении категории");
    }
  }

  buildCategoryTree(categories: Category[]): Category[] {
    return categories.filter((category) => !category.parentId);
  }

  // Построить полное дерево категорий с вложенными подкатегориями
  buildFullCategoryTree(
    categories: Category[],
    parentId?: string
  ): CategoryWithChildren[] {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: this.buildFullCategoryTree(categories, category._id),
      }));
  }

  // Получить все категории и подкатегории в плоском списке, подходит для select-опций
  getAllCategoriesFlat(categories: Category[]): {
    id: string;
    name: string;
    level: number;
    isParent: boolean;
  }[] {
    // Строим дерево категорий
    const categoryTree = this.buildFullCategoryTree(categories);

    // Рекурсивно проходим по дереву и создаем плоский список
    const flattenCategories = (
      categoryList: CategoryWithChildren[],
      level = 0,
      result: {
        id: string;
        name: string;
        level: number;
        isParent: boolean;
      }[] = []
    ) => {
      categoryList.forEach((category) => {
        const hasChildren = !!(
          category.children && category.children.length > 0
        );

        // Добавляем текущую категорию
        result.push({
          id: category._id,
          name: category.name,
          level,
          isParent: hasChildren,
        });

        // Если есть подкатегории, рекурсивно добавляем их
        if (hasChildren && category.children) {
          flattenCategories(category.children, level + 1, result);
        }
      });

      return result;
    };

    return flattenCategories(categoryTree);
  }

  getCategoryPath(categories: Category[], categoryId: string): Category[] {
    const path: Category[] = [];
    let currentCategory = categories.find((cat) => cat._id === categoryId);

    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = categories.find(
        (cat) => cat._id === currentCategory?.parentId
      );
    }

    return path;
  }
}

export const categoryService = new CategoryService();
