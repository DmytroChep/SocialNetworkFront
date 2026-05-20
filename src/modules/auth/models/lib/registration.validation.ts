import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

export const registrationValidator = yup.object().shape({
    email: yup.string()
      .email("Неправильний формат email")
      .required("Обов'язкове поле")
      .min(10, "Мінімум 10 символів")
      .max(100),
    password: yup.string()
      .password() 
      .required("Обов'язкове поле")
      .min(5, "Мінімум 5 символів")
      .max(50),
    passwordConfirm: yup.string()
      .required("Обов'язкове поле")
      .min(5, "Мінімум 5 символів")
      .max(50)
      .oneOf([yup.ref("password")], "Паролі повинні збігатися")
});
