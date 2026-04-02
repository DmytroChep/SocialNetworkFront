import { View, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { styles } from "./form.styles";
import { loginValidator } from "../../../modules/auth/models/lib/login.validation";
import { Input } from "../input";
import { Button } from "../button";
import { Link, useRouter } from "expo-router";

interface LoginForm {
  email: string;
  password: string;
}

export function LoginForm() {
  const { 
    handleSubmit, 
    control, 
    formState: { errors } 
  } = useForm<LoginForm>({
    resolver: yupResolver(loginValidator),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    try {

      console.log(data)
      const response = await fetch('http://10.0.2.2:8000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data), 
      });

      const result = await response.json();

      if (!response.ok) {
        console.log('Ошибка сервера:', result);
        return;
      }

      console.log('Успех! Ответ от бэка:', result);
      router.replace('/(tabs)/main')

    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  const onError = (errors: any) => {
    console.log("Validation Errors:", errors);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="registration" style={styles.title}>Реєстрація</Link>
        <Link href="login" style={styles.choosedTitle}>Авторизація</Link>
      </View>

      <Text style={styles.welcomeTitle}>Раді тебе знову бачити!</Text>

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
      </View>

      <Button 
        onPress={handleSubmit(onSubmit, onError)} 
        title="Увійти" 
        style={styles.button} 
      />
    </View>
  );
}