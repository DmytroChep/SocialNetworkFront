import React from "react-native";
import { View, Text, ActivityIndicator } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { styles } from "./form.styles";
import { registrationValidator } from "../../../modules/auth/models/lib/registration.validation";
import { Input } from "../input";
import { Button } from "../button";
import { Link, useRouter } from "expo-router";
import { IAuthUser } from "../../context/types";
import { useRegistrationMutation } from "../../api/baseApi";
import { useUserContext } from "../../context/user-context";
import { COLORS } from "../../constants";
import { useState } from "react";

interface RegistrationForm {
  email: string;
  password: string;
  passwordConfirm: string;
}

export function RegistrationForm() {
  const { 
    handleSubmit, 
    control, 
  } = useForm<RegistrationForm>({
    resolver: yupResolver(registrationValidator),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const router = useRouter();
  const [registerUser, { isLoading }] = useRegistrationMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const { setToken } = useUserContext();

  const onSubmit = async (data: RegistrationForm) => {
    setServerError(null);
    
    try {
      const { passwordConfirm, ...body } = data;
      const result = await registerUser(body).unwrap();
      
      if (result && typeof result === 'string' && result.split(".").length > 0) {
        setToken(result);
        console.log(result)
        router.replace('/(tabs)/main');
      } else {
        setServerError("Невірна відповідь сервера");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Помилка при реєстрації";
      setServerError(errorMessage);
    }
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

      {serverError && (
        <View>
          <Text style={{ color: COLORS.lightRed, marginBottom: 10 }}>{serverError}</Text>
        </View>
      )}

      <Button 
        onPress={handleSubmit(onSubmit)} 
        title={isLoading ? "Реєстрація..." : "Створити акаунт"} 
        disabled={isLoading}
        style={[styles.button, isLoading && { opacity: 0.7 }]} 
      />
      
      {isLoading && <ActivityIndicator style={{ marginTop: 10 }} color="#000" />}
    </View>
  );
}