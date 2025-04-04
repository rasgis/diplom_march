export interface User {
  id: string;
  name: string;
  email: string;
  login: string;
  role: "user" | "admin";
}
