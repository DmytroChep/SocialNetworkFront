import { View, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { styles } from "./form.styles";
import { registrationValidator } from "../../../modules/auth/models/lib/registration.validation";
import { Input } from "../input";
import { Button } from "../button";
import { Link, useRouter } from "expo-router";
import { IAuthUser } from "../../context/types";
import { useRegistrationMutation } from "../../api/baseApi";

interface RegistrationForm {
  email: string;
  password: string;
  passwordConfirm: string;
}

export function RegistrationForm() {
  const { 
    handleSubmit, 
    control, 
    formState: { errors } 
  } = useForm<RegistrationForm>({
    resolver: yupResolver(registrationValidator),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const router = useRouter()

  const [registerUser, { isLoading }] = useRegistrationMutation();

  const onSubmit = async (data: RegistrationForm) => {
    try {
      const { passwordConfirm, ...body } = data;
      const result = await registerUser(body).unwrap();
      console.log('Успех:', result);
      router.replace('/(tabs)/main');
    } catch (error) {
      console.log('Ошибка сервера:', error);
    }
  };

  const onError = (errors: any) => {
    console.log("Validation Errors:", errors);
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="registration" style={styles.choosedTitle}>Реєстрація</Link>
        <Link href="login" style={styles.title}>Авторизація</Link>
      </View>

      <Text style={styles.welcomeTitle}>Приєднуйся до World IT</Text>

      <View style={styles.formFields}>
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              onChangeText={onChange}
              value={value}
              placeholder="you@example.com"
              inputMode="email"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              label="Електронна пошта"
              error={error?.message} 
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input.Password 
              onChangeText={onChange} 
              value={value}           
              label="Пароль"
              error={error?.message}
            />
          )}
        />

        <Controller
          name="passwordConfirm"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input.Password 
              onChangeText={onChange} 
              value={value}           
              label="Повтори пароль"
              placeholder="Повтори пароль"
              error={error?.message}
            />
          )}
        />
      </View>

      <Button 
        onPress={handleSubmit(onSubmit, onError)} 
        title="Створити акаунт" 
        style={styles.button} 
      />
    </View>
  );
}