import * as yup from "yup";

export const loginValidator = yup.object({
    email: yup.string()
      .email("Неправильний формат email")
      .required("Обов'язкове поле")
      .min(10, "Мінімум 10 символів")
      .max(100),
    password: yup.string()
      .required("Обов'язкове поле")
      .min(5, "Мінімум 5 символів")
      .max(50)
});