import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

export const categoryRoutes = express.Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.get("/:id", getCategory);
categoryRoutes.post("/", auth, upload.single("image"), createCategory);
categoryRoutes.put("/:id", auth, upload.single("image"), updateCategory);
categoryRoutes.delete("/:id", auth, deleteCategory);
