import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Category } from "../../types";
import axios from "axios";

interface CategoryState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (categories?: Category[]) => {
    if (categories) {
      // Если переданы категории, обновляем их порядок
      await Promise.all(
        categories.map((category) =>
          axios.patch(`http://localhost:3001/categories/${category.id}`, {
            order: category.order,
          })
        )
      );
      return categories;
    }
    // Иначе получаем категории с сервера
    const response = await axios.get("http://localhost:3001/categories");
    return response.data;
  }
);

export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (
    category: Omit<
      Category,
      "id" | "slug" | "order" | "createdAt" | "updatedAt"
    >
  ) => {
    const response = await axios.post(
      "http://localhost:3001/categories",
      category
    );
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({
    id,
    category,
  }: {
    id: string;
    category: Omit<
      Category,
      "id" | "slug" | "order" | "createdAt" | "updatedAt"
    >;
  }) => {
    const response = await axios.patch(
      `http://localhost:3001/categories/${id}`,
      category
    );
    return response.data;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string) => {
    await axios.delete(`http://localhost:3001/categories/${id}`);
    return id;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка загрузки категорий";
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
