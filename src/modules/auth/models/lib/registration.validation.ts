import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup);

export const registrationValidator = yup.object().shape({
    email: yup.string()
      .email("Неверный формат email")
      .required("Обязательное поле")
      .min(10, "Минимум 10 символов")
      .max(100),
    password: yup.string()
      .password()
      .required("Обязательное поле")
      .min(5, "Минимум 5 символов")
      .max(50),
    passwordConfirm: yup.string()
      .required("Обязательное поле")
      .min(5, "Минимум 5 символов")
      .max(50).oneOf([yup.ref("password"), null], "Passwords must match")
});