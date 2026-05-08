import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from "react-native";
import { Controller, useForm, SubmitHandler } from "react-hook-form"; 
import { yupResolver } from "@hookform/resolvers/yup";
import { BlurView } from 'expo-blur';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import * as FileSystem from 'expo-file-system/legacy';

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
import { Avatars } from '../../modules/settings/ui/avatars/avatars';
import { Albums } from '../../modules/settings/ui/album/album';
import {
  getUserAvatar,
  getUserBirthDate,
  getUserDisplayName,
  getUserHandle,
  getUserSignature,
} from '../../shared/lib/model-helpers';

export default function ProfileScreen() {
  const [isEditingCard, setIsEditingCard] = useState<boolean>(false);
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
  const [isEditingSignature, setIsEditingSignature] = useState<boolean>(false);
  
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const signatureRef = useRef<SignatureViewRef>(null);

  const isAnyEditing = isEditingCard || isEditingInfo || isEditingPassword || isEditingSignature;

  const { data: user, isLoading: isUserLoading } = useMeQuery(undefined, { 
    pollingInterval: isAnyEditing ? 0 : 3000 
  });
  
  const [updateUser, { isLoading: isUpdating }] = useUpdateMutation();
  const [updateAvatar, { isLoading: isAvatarUpdating }] = useUpdateAvatarMutation();
  const [sendCode, { isLoading: isSendingCode }] = useLazySendCodeVerifyQuery();

  const [step, setStep] = useState(1);

  const { handleSubmit, control, reset, getValues, watch, setValue } = useForm<SettingsFormInputs>({
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
      avatar: '',
      signature: '',
    }
  });

  const watchedUseSignature = watch('useSignature');
  const watchedSignature = watch('signature');

  useEffect(() => {
    if (user && !isAnyEditing && !isUpdating && !isAvatarUpdating) {
      const formatBirthDate = (dateVal: any) => {
        if (!dateVal) return '';
        try {
          const d = new Date(isNaN(Number(dateVal)) ? dateVal : Number(dateVal));
          return d.toISOString().split('T')[0];
        } catch (e) { return ''; }
      };

      reset({
        authorName: getUserDisplayName(user),
        userName: getUserHandle(user),
        email: user.email || '',
        birthDate: formatBirthDate(getUserBirthDate(user)),
        usePseudonym: !!user.profile?.pseudonym || !!user.authorName,
        useSignature: !!getUserSignature(user),
        password: '',
        confirmPassword: '',
        avatar: getUserAvatar(user) || '',
        signature: getUserSignature(user) || '',
      });
    }
  }, [user, reset, isAnyEditing]);

  const handleSignature = (signature: string) => {
    setValue('signature', signature);
  };

  const handleEmpty = () => {
    setValue('signature', '');
  };

  const handleSaveSignature = () => {
    // Якщо увімкнено підпис, зчитуємо його з канвасу
    if (watchedUseSignature && signatureRef.current) {
      signatureRef.current.readSignature();
    }
    // Даємо затримку для оновлення значення у формі перед сабмітом
    setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 200);
  };

  const onSubmit: SubmitHandler<SettingsFormInputs> = async (data) => {
    if (!user?.id) return;

    try {
      if (localAvatar && localAvatar.startsWith('file://')) {
        const base64 = await FileSystem.readAsStringAsync(localAvatar, { encoding: 'base64' });
        await updateAvatar({ userId: user.id, image: `data:image/jpeg;base64,${base64}` }).unwrap();
      }

      let finalDate: string | null = null;
      if (data.birthDate && data.birthDate.trim().length >= 10) {
        const dateObj = new Date(`${data.birthDate}T00:00:00Z`);
        if (!isNaN(dateObj.getTime())) finalDate = dateObj.toISOString();
      }

      await updateUser({
        userId: user.id,
        body: {
          username: data.userName,
          first_name: data.authorName,
          email: data.email,
          birth_date: finalDate,
          pseudonym: data.usePseudonym ? data.authorName : null,
          signature: data.useSignature ? data.signature : null,
          is_text_signature: data.usePseudonym,
          is_image_signature: data.useSignature,
          profile: {
            birth_date: finalDate,
            pseudonym: data.usePseudonym ? data.authorName : null,
            signature: data.useSignature ? data.signature : null,
            is_text_signature: data.usePseudonym,
            is_image_signature: data.useSignature,
          },
        }
      }).unwrap();

      if (isEditingPassword && data.password) {
        await sendCode({ gmail: user.email }).unwrap();
        setStep(2);
      } else {
        setIsEditingCard(false);
        setIsEditingInfo(false);
        setIsEditingPassword(false);
        setIsEditingSignature(false);
      }
    } catch (e) {
      console.error("Submission error:", e);
      // Закриваємо режим редагування навіть при помилці, щоб "розблокувати" UI
      setIsEditingSignature(false);
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
                  {/* КАРТКА ПРОФІЛЮ */}
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
                        <AvatarField value={localAvatar || getUserAvatar(user)} onChange={(val) => setLocalAvatar(val)} disabled={false} />
                        <View style={{ width: '100%', marginTop: 20 }}>
                          <Controller
                            name="userName"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                              <Input label="Ім’я користувача" value={value ? `@${value.replace('@', '')}` : ''} onChangeText={(text) => onChange(text.replace('@', ''))} error={error?.message} />
                            )}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.avatarSection, { alignItems: 'center' }]}>
                        <AvatarField value={getUserAvatar(user)} onChange={() => {}} disabled />
                        <Text style={[styles.name, { fontSize: 20, fontWeight: '700' }]}>{getUserDisplayName(user)}</Text>
                        <Text style={[styles.handle, { color: '#8E8E93' }]}>@{getUserHandle(user)}</Text>
                      </View>
                    )}
                  </View>

                  {/* ОСОБИСТА ІНФОРМАЦІЯ */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Особиста інформація</Text>
                      {isEditingInfo ? (
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Зберегти' />
                      ) : (
                        <RoundButton onPress={() => setIsEditingInfo(true)} icon={<ICONS.edit />} />
                      )}
                    </View>
                    <Controller name="authorName" control={control} render={({ field: { onChange, value }, fieldState: { error } }) => <Input label="Ім'я автора" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />} />
                    <Controller name="birthDate" control={control} render={({ field: { onChange, value }, fieldState: { error } }) => <Input label="Дата народження" placeholder="YYYY-MM-DD" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />} />
                    <Controller name="email" control={control} render={({ field: { onChange, value }, fieldState: { error } }) => <Input label="Електронна адреса" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingInfo} />} />
                  </View>

                  {/* ПАРОЛЬ */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Пароль</Text>
                      {isEditingPassword ? <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Зберегти' /> : <RoundButton onPress={() => setIsEditingPassword(true)} icon={<ICONS.edit />} />}
                    </View>
                    <Controller name="password" control={control} render={({ field: { onChange, value }, fieldState: { error } }) => <Input.Password label="Новий пароль" placeholder="Введи пароль" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={isEditingPassword} />} />
                    {isEditingPassword && (
                      <View style={{ marginTop: 16 }}>
                        <Controller name="confirmPassword" control={control} render={({ field: { onChange, value }, fieldState: { error } }) => <Input.Password label="Підтвердьте новий пароль" placeholder="Введи пароль" value={value ?? ''} onChangeText={onChange} error={error?.message} editable={true} />} />
                      </View>
                    )}
                  </View>

                  {/* ВАРІАНТИ ПІДПИСУ */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Варіанти підпису</Text>
                      {isEditingSignature ? (
                        <Button.SaveButton onPress={handleSaveSignature} title='Зберегти' />
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
                    <Text style={[styles.signatureText, { marginLeft: 32, color: '#8E8E93', marginBottom: 15 }]}>{getUserDisplayName(user)}</Text>

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
                          <View style={{ height: 220, width: '100%' }}>
                            <Text style={{ fontSize: 12, color: '#8E8E93', marginBottom: 5, paddingLeft: 32 }}>Намалюйте підпис:</Text>
                            <View style={localStyles.canvasBorder}>
                              <SignatureScreen
                                ref={signatureRef}
                                onEnd={() => signatureRef.current?.readSignature()}
                                onOK={handleSignature}
                                onEmpty={handleEmpty}
                                autoClear={false}
                                descriptionText=""
                                webStyle={signatureCanvasStyle}
                              />
                            </View>
                            <TouchableOpacity onPress={() => signatureRef.current?.clearSignature()} style={{ alignSelf: 'center', marginTop: 10 }}>
                                <Text style={{ color: COLORS.blue10, fontWeight: '600' }}>Очистити поле</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={{ paddingLeft: 32, height: 80, justifyContent: 'center' }}>
                            {watchedSignature ? (
                              <Image source={{ uri: watchedSignature }} style={{ width: 200, height: 60, resizeMode: 'contain' }} />
                            ) : (
                              <Text style={{ color: '#8E8E93', fontStyle: 'italic' }}>Підпис відсутній</Text>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {isLoading && <ActivityIndicator color={COLORS.blue10} style={{ marginVertical: 20 }} />}
                </View>
              )
            },
            {
              title: "Альбоми",
              content: (
                <View style={{paddingVertical: 16}}>
                  <Avatars />
                  <Albums />
                </View>
              )
            }
          ]}
        />
      </ScrollView>

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
                await updateUser({ userId: user?.id!, body: { password: values.password } }).unwrap();
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

const signatureCanvasStyle = `
  .m-signature-pad--footer { display: none; margin: 0px; }
  body,html { width: 100%; height: 100%; background-color: transparent; }
`;

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  canvasBorder: {
    flex: 1,
    marginLeft: 32,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff'
  }
});
