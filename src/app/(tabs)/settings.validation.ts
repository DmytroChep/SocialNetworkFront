import * as yup from "yup";

const ERROR_MESSAGES = {
  required: "Обов'язкове поле",
  email: "Невірний формат email",
  passwordMin: "Мінімум 6 символів",
};

export const settingsValidator = yup.object({
  authorName: yup.string().required(ERROR_MESSAGES.required),
  userName: yup.string().required(ERROR_MESSAGES.required), 
  birthDate: yup.string().nullable().defined(), 
  avatar: yup
  .string()
  .required('Будь ласка, оберіть зображення')
  .test('is-valid-path', 'Некоректний формат файлу', (value) => {
    if (!value) return false;
    return value.startsWith('data:image') || value.startsWith('file://') || value.startsWith('http');
  }),
  email: yup.string().email(ERROR_MESSAGES.email).required(ERROR_MESSAGES.required),
  password: yup
    .string()
    .ensure()
    .default("")
    .test("min-length", ERROR_MESSAGES.passwordMin, (val) => !val || val.length >= 6),
  confirmPassword: yup
    .string()
    .ensure()
    .default("")
    .oneOf([yup.ref('password')], 'Паролі не збігаються'),
  usePseudonym: yup.boolean().required().default(false),
  useSignature: yup.boolean().required().default(false),
}).required();

export type SettingsFormInputs = yup.InferType<typeof settingsValidator>;