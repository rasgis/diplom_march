export interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
