import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Controller, useForm, SubmitHandler } from "react-hook-form"; 
import { yupResolver } from "@hookform/resolvers/yup";
import { BlurView } from 'expo-blur';
import { RadioTabs } from "../../shared/ui/RadioTab";
import { Input } from "../../shared/ui/input";
import { RoundButton } from "../../shared/ui/RoundButton";
import { Button } from "../../shared/ui/button"; 
import { ICONS } from "../../shared/icons";
import { COLORS } from "../../shared/constants";
import { styles } from "./settings.styles";
import { settingsValidator, SettingsFormInputs } from "./settings.validation";
import { useMeQuery, useUpdateAvatarMutation, useUpdateMutation, useLazySendCodeVerifyQuery } from "../../shared/api/baseApi";
import { AvatarField } from '../../modules/settings/ui/avatar-field';
import { CodeConfirmationModal } from '../../shared/ui/codeConfirmationModal';
import * as FileSystem from 'expo-file-system/legacy';
import { Avatars } from '../../modules/settings/ui/avatars/avatars';
import { Albums } from '../../modules/settings/ui/album/album';

export default function ProfileScreen() {
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const isAnyEditing = isEditingCard || isEditingInfo || isEditingPassword || isEditingSignature;

  // Отримуємо дані користувача
  const { data: user, isLoading: isUserLoading } = useMeQuery(undefined, { 
    pollingInterval: isAnyEditing ? 0 : 3000 
  });
  
  const [updateUser, { isLoading: isUpdating }] = useUpdateMutation();
  const [updateAvatar, { isLoading: isAvatarUpdating }] = useUpdateAvatarMutation();
  const [sendCode, { isLoading: isSendingCode }] = useLazySendCodeVerifyQuery();

  const [step, setStep] = useState(1);

  const { handleSubmit, control, reset, getValues, watch } = useForm<SettingsFormInputs>({
    // Використовуємо as any, щоб уникнути конфліктів типів Yup та Hook Form
    resolver: yupResolver(settingsValidator) as any,
    defaultValues: {
      authorName: '',
      userName: '',
      birthDate: '',
      email: '',
      password: '',
      confirmPassword: '',
      usePseudonym: false,
      useSignature: false,
    }
  });

  const watchedAuthorName = watch('authorName');

  // Синхронізація даних БД з формою
  useEffect(() => {
    if (user && !isAnyEditing && !isUpdating && !isAvatarUpdating) {
      const formatBirthDate = (dateVal: any) => {
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
        birthDate: formatBirthDate(user.birthDate),
        usePseudonym: !!user.authorName,
        useSignature: !!user.sign,
        password: '',
        confirmPassword: '',
      });
      setLocalAvatar(null);
    }
  }, [user, isAnyEditing, isUpdating, isAvatarUpdating]);

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
          authorName: data.authorName,
          userName: data.userName,
          email: data.email,
          birthDate: finalDate,
          sign: data.useSignature ? data.authorName : '',
        } as any
      }).unwrap();

      // 4. Логіка зміни пароля
      if (isEditingPassword && data.password) {
        await sendCode({ gmail: user.email }).unwrap();
        setStep(2);
      } else {
        setIsEditingCard(false);
        setIsEditingInfo(false);
        setIsEditingPassword(false);
        setIsEditingSignature(false);
        setLocalAvatar(null);
      }
    } catch (e) {
      console.error("Submission error:", e);
    }
  };

  const isLoading = isUserLoading || isUpdating || isAvatarUpdating || isSendingCode;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.plum50 }}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RadioTabs
          radioTabsArray={[
            {
              title: "Особиста Інформація",
              content: (
                <View>
                  {/* Блок 1: Картка профілю */}
                  <View style={[styles.card, { paddingVertical: isEditingCard ? 20 : 24 }]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Картка профілю</Text>
                      {isEditingCard ? (
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Зберегти' />
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
                            <Text style={{ color: '#1C1C1E', fontWeight: '500' }}>Додайте</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <ICONS.image color={COLORS.blue10} />
                            <Text style={{ color: '#1C1C1E', fontWeight: '500' }}>Оберіть</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%' }}>
                          <Controller
                            name="userName"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                              <Input
                                label="Ім’я користувача"
                                value={value ? `@${value.replace(/^@/, '')}` : ''}
                                onChangeText={(text) => onChange(text.replace(/^@/, ''))}
                                error={error?.message}
                              />
                            )}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.avatarSection, { alignItems: 'center' }]}>
                        <AvatarField value={user?.currentAvatar?.image} onChange={() => {}} disabled />
                        <Text style={[styles.name, { fontSize: 20, fontWeight: '700' }]}>{user?.authorName || ''}</Text>
                        <Text style={[styles.handle, { color: '#8E8E93' }]}>@{user?.userName}</Text>
                      </View>
                    )}
                  </View>

                  {/* Блок 2: Особиста інформація */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Особиста інформація</Text>
                      {isEditingInfo ? (
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Зберегти' />
                      ) : (
                        <RoundButton onPress={() => setIsEditingInfo(true)} icon={<ICONS.edit />} />
                      )}
                    </View>
                    
                    <Controller
                      name="authorName"
                      control={control}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Input label="Ім'я автора" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />
                      )}
                    />

                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Input label="Дата народження" placeholder="YYYY-MM-DD" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />
                      )}
                    />

                    <Controller
                      name="email"
                      control={control}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Input label="Електронна адреса" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />
                      )}
                    />
                  </View>

                  {/* Блок 3: Пароль */}
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
                        <Input.Password label="Новий пароль" placeholder="Введи пароль" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingPassword} />
                      )}
                    />
                    {isEditingPassword && (
                      <View style={{ marginTop: 16 }}>
                        <Controller
                          name="confirmPassword"
                          control={control}
                          render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <Input.Password label="Підтвердьте новий пароль" placeholder="Введи пароль" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={true} />
                          )}
                        />
                      </View>
                    )}
                  </View>

                  {/* Блок 4: Варіанти підпису */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Варіанти подпису</Text>
                      {isEditingSignature ? (
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Зберегти' />
                      ) : (
                        <RoundButton onPress={() => setIsEditingSignature(true)} icon={<ICONS.edit />} />
                      )}
                    </View>
                    
                    <Controller
                      name="usePseudonym"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                          style={[styles.checkboxRow, { opacity: isEditingSignature ? 1 : 0.6 }]}
                          onPress={() => isEditingSignature && onChange(!value)}
                        >
                          {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
                          <Text style={styles.checkboxLabel}>Псевдонім автора</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <Text style={[styles.signatureText, { marginLeft: 32, color: '#8E8E93', marginBottom: 15 }]}>
                      {watchedAuthorName || user?.authorName}
                    </Text>

                    <Controller
                      name="useSignature"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                          style={[styles.checkboxRow, { opacity: isEditingSignature ? 1 : 0.6 }]}
                          onPress={() => isEditingSignature && onChange(!value)}
                        >
                          {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
                          <Text style={styles.checkboxLabel}>Мій електронний подпис</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>

                  {isLoading && <ActivityIndicator color={COLORS.blue10} style={{ marginVertical: 20 }} />}
                </View>
              )
            },
            {
              title: "Альбоми",
              content: (
                <View>
                  <Avatars />
                  <Albums />
                </View>
              )
            }
          ]}
        />
      </ScrollView>

      {/* Модалка підтвердження */}
      {step === 2 && (
        <View style={StyleSheet.absoluteFill}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={localStyles.modalOverlay}>
            <CodeConfirmationModal 
              title="Підтвердження"
              email={user?.email || ''}
              setStep={setStep}
              onConfirm={async () => {
                const values = getValues();
                await updateUser({ userId: user?.id!, body: { password: values.password } as any }).unwrap();
                setStep(1);
                setIsEditingPassword(false);
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  }
});