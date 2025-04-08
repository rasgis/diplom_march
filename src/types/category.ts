export interface Category {
  _id: string;
  id?: string;
  name: string;
  image?: string;
  parentId?: string;
  slug?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
