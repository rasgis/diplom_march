export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "email"
    | "password"
    | "url";
  label: string;
  required: boolean;
  options?: FieldOption[];
}

export type EntityType = "product" | "category" | "user";

// Типы для формы продукта
export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  unitOfMeasure: string;
}

// Типы для формы категории
export interface CategoryFormValues {
  name: string;
  description: string;
  image: string;
  parentId: string;
}

// Типы для формы пользователя
export interface UserFormValues {
  name: string;
  email: string;
  login: string;
  password: string;
  role: string;
}

export type FormValues =
  | ProductFormValues
  | CategoryFormValues
  | UserFormValues;

export interface EntityFormProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityData?: any; // Данные для редактирования
  afterSubmit?: () => void; // Функция, вызываемая после успешного сохранения
}
