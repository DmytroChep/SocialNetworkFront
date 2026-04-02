import * as yup from "yup";

export const loginValidator = yup.object({
    email: yup.string()
      .email("Неверный формат email")
      .required("Обязательное поле")
      .min(10, "Минимум 10 символов")
      .max(100),
    password: yup.string()
      .required("Обязательное поле")
      .min(5, "Минимум 5 символов")
      .max(50)
});