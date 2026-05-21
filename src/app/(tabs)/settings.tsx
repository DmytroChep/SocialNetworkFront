import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system/legacy";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";

import { Albums } from "../../modules/settings/ui/album/album";
import { AvatarField } from "../../modules/settings/ui/avatar-field";
import { Avatars } from "../../modules/settings/ui/avatars/avatars";
import { useLazySendCodeVerifyQuery, useMeQuery, useUpdateAvatarMutation, useUpdateMutation } from "../../shared/api/baseApi";
import { COLORS } from "../../shared/constants";
import { ICONS } from "../../shared/icons";
import {
  getUserAvatar,
  getUserDisplayName,
  getUserHandle,
} from "../../shared/lib/model-helpers";
import { Button } from "../../shared/ui/button";
import { CodeConfirmationModal } from "../../shared/ui/codeConfirmationModal";
import { Input } from "../../shared/ui/input";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { RoundButton } from "../../shared/ui/RoundButton";
import { styles } from "./settings.styles";
import { settingsValidator, SettingsFormInputs } from "./settings.validation";

function formatBirthDate(dateValue: unknown): string {
  if (!dateValue) return "";

  const date = new Date(Number.isNaN(Number(dateValue)) ? String(dateValue) : Number(dateValue));

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
}

export default function ProfileScreen() {
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const signatureRef = useRef<SignatureViewRef>(null);
  const isAnyEditing = isEditingCard || isEditingInfo || isEditingPassword || isEditingSignature;

  // Отримуємо дані користувача
  const { data: user, isLoading: isUserLoading } = useMeQuery(undefined, { 
    pollingInterval: isAnyEditing ? 0 : 3000 
  });
  
  const [updateUser, { isLoading: isUpdating }] = useUpdateMutation();
  const [updateAvatar, { isLoading: isAvatarUpdating }] = useUpdateAvatarMutation();
  const [sendCode, { isLoading: isSendingCode }] = useLazySendCodeVerifyQuery();

  const { handleSubmit, control, reset, getValues, watch, setValue } = useForm<SettingsFormInputs>({
    // Використовуємо as any, щоб уникнути конфліктів типів Yup та Hook Form
    resolver: yupResolver(settingsValidator) as any,
    defaultValues: {
      authorName: "",
      userName: "",
      birthDate: "",
      email: "",
      password: "",
      confirmPassword: "",
      usePseudonym: false,
      useSignature: false,
      avatar: "",
      signature: "",
    },
  });

  const watchedAuthorName = watch('authorName');
  const watchedUseSignature = watch('useSignature');
  const watchedSignature = watch('signature');

  useEffect(() => {
    if (user && !isAnyEditing && !isUpdating && !isAvatarUpdating) {
      const formatBirthDateLocal = (dateVal: any) => {
        if (!dateVal) return '';
        try {
          // Обробка і ISO рядка, і Timestamp числа
          const d = new Date(isNaN(Number(dateVal)) ? dateVal : Number(dateVal));
          return d.toISOString().split('T')[0];
        } catch (e) {
          return '';
        }
      };

      reset({
        authorName: user.authorName || '',
        userName: user.userName || '',
        email: user.email || '',
        birthDate: formatBirthDateLocal(user.birthDate),
        usePseudonym: !!user.authorName,
        useSignature: !!user.signatureImage,
        password: '',
        confirmPassword: '',
        avatar: user.currentAvatar?.image || '',
      });
    }
  }, [user, reset, isAnyEditing, isUpdating, isAvatarUpdating]);

  const closeEditing = () => {
    setIsEditingCard(false);
    setIsEditingInfo(false);
    setIsEditingPassword(false);
    setIsEditingSignature(false);
  };

  const handleSaveSignature = handleSubmit((data) => onSubmit(data));
  const handleSignature = (sig: string) => setValue('signature', sig);
  const handleEmpty = () => console.log('Empty signature');

  const onSubmit: SubmitHandler<SettingsFormInputs> = async (data) => {
    if (!user?.id) return;

    try {
      // 1. Оновлення аватара
      if (localAvatar && localAvatar.startsWith('file://')) {
        const base64 = await FileSystem.readAsStringAsync(localAvatar, {
          encoding: 'base64', 
        });
        await updateAvatar({ userId: user.id, image: `data:image/jpeg;base64,${base64}` }).unwrap();
      }

      // 2. Підготовка дати
      let finalDate: string | null = null;
      if (data.birthDate && data.birthDate.trim().length >= 10) {
        const dateObj = new Date(`${data.birthDate}T00:00:00Z`);
        if (!isNaN(dateObj.getTime())) {
          finalDate = dateObj.toISOString();
        }
      }

      // 3. Оновлення профілю (as any для ігнорування несумісності Prisma типів)
      await updateUser({
        userId: user.id,
        body: {
          username: data.userName,
          first_name: data.authorName,
          email: data.email,
          birth_date: finalDate,
          pseudonym: data.usePseudonym ? data.authorName : undefined,
          signature: data.useSignature ? data.signature : undefined,
          is_text_signature: data.usePseudonym,
          is_image_signature: data.useSignature,
          profile: {
            birth_date: finalDate,
            pseudonym: data.usePseudonym ? data.authorName : undefined,
            signature: data.useSignature ? data.signature : undefined,
            is_text_signature: data.usePseudonym,
            is_image_signature: data.useSignature,
          },
        },
      } as any).unwrap();

      if (isEditingPassword && data.password) {
        await sendCode({ gmail: data.email || user.email }).unwrap();
        setStep(2);
      } else {
        closeEditing();
      }
    } catch (e) {
      console.error("Submission error:", e);
    }
  };

  const isLoading = isUserLoading || isUpdating || isAvatarUpdating || isSendingCode;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.plum50 }}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled}>
        <RadioTabs
          radioTabsArray={[
            {
              title: "Особиста Інформація",
              content: (
                <View>
                  <View style={[styles.card, { paddingVertical: isEditingCard ? 20 : 24 }]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Картка профілю</Text>
                      {isEditingCard ? (
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title="Зберегти" />
                      ) : (
                        <RoundButton onPress={() => setIsEditingCard(true)} icon={<ICONS.edit />} />
                      )}
                    </View>

                    {isEditingCard ? (
                      <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ color: '#1C1C1E', fontSize: 16, marginBottom: 15 }}>
                          Оберіть або завантажте фото профілю
                        </Text>
                        <AvatarField 
                          value={localAvatar || user?.currentAvatar?.image} 
                          onChange={(val) => setLocalAvatar(val)} 
                          disabled={false} 
                        />
                        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 25, marginTop: 10 }}>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <ICONS.plus color={COLORS.blue10} />
                            <Text style={{ color: '#1C1C1E', fontWeight: '500' }}>Додайте фото</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <ICONS.image color={COLORS.blue10} />
                            <Text style={{ color: '#1C1C1E', fontWeight: '500' }}>Оберіть фото</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%' }}>
                          <Controller
                            name="userName"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                              <Input
                                label="Ім'я користувача"
                                value={value ? `@${value.replace(/^@/, "")}` : ""}
                                onChangeText={(text) => onChange(text.replace(/^@/, ""))}
                                error={error?.message}
                              />
                            )}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.avatarSection}>
                        <AvatarField value={getUserAvatar(user)} onChange={() => {}} disabled />
                        <Text style={[styles.name, { fontSize: 20, fontWeight: "700" }]}>{getUserDisplayName(user)}</Text>
                        <Text style={[styles.handle, { color: "#8E8E93" }]}>@{getUserHandle(user)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Особиста інформація</Text>
                      {isEditingInfo ? (
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title="Зберегти" />
                      ) : (
                        <RoundButton onPress={() => setIsEditingInfo(true)} icon={<ICONS.edit />} />
                      )}
                    </View>

                    <Controller
                      name="authorName"
                      control={control}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Input label="Ім'я автора" value={value ?? ""} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />
                      )}
                    />
                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Input label="Дата народження" placeholder="YYYY-MM-DD" value={value ?? ""} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />
                      )}
                    />
                    <Controller
                      name="email"
                      control={control}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Input label="Електронна адреса" value={value ?? ""} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />
                      )}
                    />
                  </View>

                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Пароль</Text>
                      {isEditingPassword ? (
                         <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Зберегти' />
                      ) : (
                        <RoundButton onPress={() => setIsEditingPassword(true)} icon={<ICONS.edit />} />
                      )}
                    </View>

                    <Controller
                      name="password"
                      control={control}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Input.Password label="Новий пароль" placeholder="Введи пароль" value={value ?? ""} onChangeText={onChange} error={error?.message} editable={isEditingPassword} />
                      )}
                    />
                    {isEditingPassword && (
                      <View style={{ marginTop: 16 }}>
                        <Controller
                          name="confirmPassword"
                          control={control}
                          render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <Input.Password label="Підтвердьте новий пароль" placeholder="Введи пароль" value={value ?? ""} onChangeText={onChange} error={error?.message} editable />
                          )}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Варіанти підпису</Text>
                      {isEditingSignature ? (
                        <Button.SaveButton onPress={handleSaveSignature} title="Зберегти" />
                      ) : (
                        <RoundButton onPress={() => setIsEditingSignature(true)} icon={<ICONS.edit />} />
                      )}
                    </View>

                    <Controller
                      name="usePseudonym"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity style={[styles.checkboxRow, { opacity: isEditingSignature ? 1 : 0.6 }]} onPress={() => isEditingSignature && onChange(!value)}>
                          {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
                          <Text style={styles.checkboxLabel}>Псевдонім автора</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <Text style={[styles.signatureText, { color: "#8E8E93", marginBottom: 15 }]}>
                      {watchedAuthorName || getUserDisplayName(user)}
                    </Text>

                    <Controller
                      name="useSignature"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity style={[styles.checkboxRow, { opacity: isEditingSignature ? 1 : 0.6 }]} onPress={() => isEditingSignature && onChange(!value)}>
                          {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
                          <Text style={styles.checkboxLabel}>Мій електронний підпис</Text>
                        </TouchableOpacity>
                      )}
                    />

                    {watchedUseSignature && (
                      <View style={{ marginTop: 10 }}>
                        {isEditingSignature ? (
                          <View style={{ height: 220, width: "100%" }}>
                            <Text style={{ fontSize: 12, color: "#8E8E93", marginBottom: 5, paddingLeft: 32 }}>Намалюйте підпис:</Text>
                            <View style={localStyles.canvasBorder}>
                              <SignatureScreen
                                ref={signatureRef}
                                onBegin={() => setScrollEnabled(false)} 
                                onEnd={() => {
                                  setScrollEnabled(true);
                                  signatureRef.current?.readSignature();
                                }}
                                onOK={handleSignature}
                                onEmpty={handleEmpty}
                                autoClear={false}
                                descriptionText=""
                                webStyle={signatureCanvasStyle}
                              />
                            </View>
                            <TouchableOpacity onPress={() => signatureRef.current?.clearSignature()} style={{ alignSelf: "center", marginTop: 10 }}>
                              <Text style={{ color: COLORS.blue10, fontWeight: "600" }}>Очистити поле</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={{ height: 80, justifyContent: "center", paddingLeft: 32 }}>
                            {watchedSignature ? (
                              <Image source={{ uri: watchedSignature }} style={{ width: 200, height: 60, resizeMode: "contain" }} />
                            ) : (
                              <Text style={{ color: "#8E8E93", fontStyle: "italic" }}>Підпис відсутній</Text>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {isLoading && <ActivityIndicator color={COLORS.blue10} style={{ marginVertical: 20 }} />}
                </View>
              ),
            },
            {
              title: "Альбоми",
              content: (
                <View style={{ paddingVertical: 16 }}>
                  <Avatars />
                  <Albums />
                </View>
              ),
            },
          ]}
        />
      </ScrollView>

      {step === 2 && (
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={localStyles.modalOverlay}>
            <CodeConfirmationModal
              title="Підтвердження"
              email={user?.email || ""}
              setStep={setStep}
              onConfirm={async () => {
                const values = getValues();
                await updateUser({ userId: user?.id!, body: { password: values.password } }).unwrap();
                setStep(1);
                closeEditing();
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const signatureCanvasStyle = `
  .m-signature-pad--footer { display: none; margin: 0px; }
  body,html { width: 100%; height: 100%; background-color: transparent; }
`;

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
  },
  canvasBorder: {
    flex: 1,
    marginLeft: 32,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
});