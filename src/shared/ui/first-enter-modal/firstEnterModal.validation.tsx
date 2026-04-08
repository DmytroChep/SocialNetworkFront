import * as yup from "yup";

export const firstEnterValidator = yup.object({
  authorName: yup.string().required("Введіть псевдоніс"),
  userName: yup.string().required("Введіть ім'я користувача"),
}).required();