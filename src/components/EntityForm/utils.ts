import {
  EntityType,
  FormValues,
  ProductFormValues,
  CategoryFormValues,
  UserFormValues,
} from "./types";
import { INITIAL_VALUES } from "./constants";

// Получение начальных значений в зависимости от типа сущности
export const getInitialValues = (entityType: EntityType, entityData?: any) => {
  if (!entityData) {
    // Если данных нет, возвращаем пустые значения
    if (entityType === "product") {
      return {
        name: "",
        description: "",
        image: "",
        price: 0,
        categoryId: "",
        unitOfMeasure: "шт",
      };
    }

    if (entityType === "category") {
      return {
        name: "",
        description: "",
        image: "",
        parentId: "",
      };
    }

    return {
      name: "",
      description: "",
      image: "",
    };
  }

  // Если данные есть, извлекаем их корректно
  const baseValues = {
    name: entityData.name || "",
    description: entityData.description || "",
    image: entityData.image || "",
  };

  if (entityType === "product") {
    const productValues = {
      ...baseValues,
      price: entityData.price || 0,
      categoryId: "",
      unitOfMeasure: entityData.unitOfMeasure || "шт",
    };

    // Для поля categoryId нужно учесть разные форматы данных
    if (typeof entityData.category === "object" && entityData.category) {
      productValues.categoryId =
        entityData.category._id || entityData.category.id || "";
    } else {
      productValues.categoryId =
        entityData.categoryId || entityData.category || "";
    }

    return productValues;
  }

  if (entityType === "category") {
    return {
      ...baseValues,
      parentId: entityData.parentId || "",
    };
  }

  return baseValues;
};

// Получение заголовка формы в зависимости от типа сущности
export const getTitleByEntityType = (
  entityType: EntityType,
  entityData?: any
) => {
  const titles = {
    product: entityData ? "Редактировать товар" : "Добавить товар",
    category: entityData ? "Редактировать категорию" : "Добавить категорию",
    user: entityData ? "Редактировать пользователя" : "Добавить пользователя",
  };

  return titles[entityType];
};
