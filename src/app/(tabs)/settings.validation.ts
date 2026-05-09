import * as yup from "yup";

const ERROR_MESSAGES = {
  required: "Обов'язкове поле",
  email: "Невірний формат email",
  passwordMin: "Мінімум 6 символів",
  passwordsMatch: "Паролі не збігаються",
  dateFormat: "Формат має бути РРРР-ММ-ДД",
  invalidFile: "Некоректний формат файлу",
};

export const settingsValidator = yup.object({
  authorName: yup.string().trim().required(ERROR_MESSAGES.required),
  userName: yup.string().trim().required(ERROR_MESSAGES.required),
  birthDate: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .test("date-format", ERROR_MESSAGES.dateFormat, (value) => {
      if (!value) return true;
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }),
  avatar: yup
    .string()
    .nullable()
    .notRequired()
    .transform((value) => (value === "" ? null : value))
    .test("is-valid-path", ERROR_MESSAGES.invalidFile, (value) => {
      if (!value || value === "ignore_this_field") return true;
      return value.startsWith("data:image") || value.startsWith("file://") || value.startsWith("http");
    }),
  signature: yup
    .string()
    .ensure()
    .nullable()
    .notRequired()
    .transform((value) => (value === "" ? null : value)),
  email: yup.string().lowercase().email(ERROR_MESSAGES.email).required(ERROR_MESSAGES.required),
  password: yup
    .string()
    .ensure()
    .test("min-length", ERROR_MESSAGES.passwordMin, (value) => {
      if (!value) return true;
      return value.length >= 6;
    }),
  confirmPassword: yup
    .string()
    .ensure()
    .when("password", {
      is: (value: string) => value && value.length > 0,
      then: (schema) => schema.required(ERROR_MESSAGES.required).oneOf([yup.ref("password")], ERROR_MESSAGES.passwordsMatch),
      otherwise: (schema) => schema.notRequired(),
    }),
  usePseudonym: yup.boolean().default(false),
  useSignature: yup.boolean().default(false),
}).required();

export type SettingsFormInputs = yup.InferType<typeof settingsValidator>;
