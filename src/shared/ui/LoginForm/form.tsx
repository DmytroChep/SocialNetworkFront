import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useRouter } from "expo-router";
import { styles } from "./form.styles";
import { loginValidator } from "../../../modules/auth/models/lib/login.validation";
import { Input } from "../input";
import { Button } from "../button";
import { useLoginMutation } from "../../api/baseApi";
import { useUserContext } from "../../context/user-context";
import { COLORS } from "../../constants";

interface LoginFormInputs {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { setToken, token } = useUserContext();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loginUser, { isLoading }] = useLoginMutation();

  const { handleSubmit, control } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginValidator),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (token && justLoggedIn) {
      router.replace("/(tabs)/main");
    }
  }, [token, justLoggedIn]);

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      const result = await loginUser(data).unwrap();
      if (result && typeof result === "string" && result.split(".").length > 2) {
        setToken(result); // просто сохраняем — useEffect выше сделает navigate
        setJustLoggedIn(true);
      } else {
        setServerError(result);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Невірний логін або пароль";
      setServerError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="registration" style={styles.title}>
          Реєстрація
        </Link>
        <Link href="login" style={styles.choosedTitle}>
          Авторизація
        </Link>
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
      {serverError && (
        <View>
          <Text style={{ color: COLORS.lightRed, marginBottom: 10 }}>
            {serverError}
          </Text>
        </View>
      )}
      <Button
        onPress={handleSubmit(onSubmit)}
        title={isLoading ? "Вхід..." : "Увійти"}
        disabled={isLoading}
        style={[styles.button]}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 10 }} color="#000" />}
    </View>
  );
}