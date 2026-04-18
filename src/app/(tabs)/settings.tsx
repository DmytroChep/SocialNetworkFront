import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Controller, useForm, SubmitHandler } from "react-hook-form"; 
import { yupResolver } from "@hookform/resolvers/yup";

import { RadioTabs } from "../../shared/ui/RadioTab";
import { Input } from "../../shared/ui/input";
import { RoundButton } from "../../shared/ui/RoundButton";
import { Button } from "../../shared/ui/button"; 
import { ICONS } from "../../shared/icons";
import { COLORS } from "../../shared/constants";

import { styles } from "./settings.styles";
import { settingsValidator, SettingsFormInputs } from "./settings.validation";
import { useMeQuery, useUpdateMutation } from "../../shared/api/baseApi";

export default function ProfileScreen() {
  const { data: user, isLoading: isUserLoading } = useMeQuery(undefined, {pollingInterval: 3000,});
  const [updateUser, { isLoading: isUpdating }] = useUpdateMutation();

  const [isEditingCard, setIsEditingCard] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingSignature, setIsEditingSignature] = useState(false);

  const { handleSubmit, control, reset } = useForm<SettingsFormInputs>({
    resolver: yupResolver(settingsValidator),
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

  useEffect(() => {
    if (user) {
      reset({
        authorName: user.authorName || '',
        userName: user.userName || '',
        email: user.email || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        usePseudonym: !!user.authorName,
        useSignature: !!user.sign,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<SettingsFormInputs> = async (data) => {
    if (!user?.id) return;

    let finalDate = null;
    if (data.birthDate) {
      const dateObj = new Date(data.birthDate);
      if (!isNaN(dateObj.getTime())) {
        finalDate = dateObj.toISOString();
      }
    }

    try {
      await updateUser({
        userId: user.id,
        body: {
          authorName: data.authorName,
          userName: data.userName,
          email: data.email,
          birthDate: finalDate as any, 
          sign: data.useSignature ? data.authorName : '',
        }
      }).unwrap();
      
      setIsEditingCard(false);
      setIsEditingInfo(false);
      setIsEditingPassword(false);
      setIsEditingSignature(false);
      reset({
        ...data,
        password: '',
        confirmPassword: '',
      });
    } catch (e) {
      Alert.alert("Помилка", "Не вдалося зберегти зміни");
    }
  };

  const isLoading = isUserLoading || isUpdating;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.plum50 }}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
                        
                        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', marginBottom: 20 }} />

                        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 25 }}>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <ICONS.plus color={COLORS.blue10} />
                            <Text style={{ color: '#1C1C1E', fontWeight: '500' }}>Додайте фото</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <ICONS.image color={COLORS.blue10} />
                            <Text style={{ color: '#1C1C1E', fontWeight: '500' }}>Оберіть фото</Text>
                          </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 15 }}>
                          {user?.authorName || 'Lina Li'}
                        </Text>

                        <View style={{ width: '100%' }}>
                          <Controller
                            name="userName"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                              <Input 
                                label="Ім’я користувача"
                                value={value ? `@${value.replace('@', '')}` : ''} 
                                onChangeText={(text) => onChange(text.replace('@', ''))} 
                                error={error?.message}
                                editable={true} 
                              />
                            )}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.avatarSection, { alignItems: 'center' }]}>
                        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E0E0', marginBottom: 12 }} />
                        <Text style={[styles.name, { fontSize: 20, fontWeight: '700' }]}>
                          {user?.authorName || ''}
                        </Text>
                        <Text style={[styles.handle, { color: '#8E8E93' }]}>@{user?.userName}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Особиста інформація</Text>
                      {isEditingInfo ? (
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Зберегти' />
                      ) : (
                        <RoundButton onPress={() => setIsEditingInfo(true)} icon={<ICONS.edit />} />
                      )}
                    </View>

                    {(['authorName', 'birthDate', 'email'] as const).map((fieldName) => (
                      <Controller
                        key={fieldName}
                        name={fieldName}
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                          <Input 
                            label={
                              fieldName === 'authorName' ? "Ім'я автора" :
                              fieldName === 'birthDate' ? "Дата народження" : "Електронна адреса"
                            }
                            placeholder={fieldName === 'birthDate' ? "YYYY-MM-DD" : ""}
                            value={value?.toString() || ''} 
                            onChangeText={onChange} 
                            error={error?.message}
                            editable={isEditingInfo} 
                            inputMode={fieldName === 'email' ? 'email' : 'text'}
                            inputContainerStyle={{ opacity: isEditingInfo ? 1 : 0.6 }} 
                          />
                        )}
                      />
                    ))}
                  </View>

                  {!isEditingPassword ? (
                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Пароль</Text>
                        <RoundButton onPress={() => setIsEditingPassword(true)} icon={<ICONS.edit />} />
                      </View>
                      <Controller
                        name="password"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                          <Input.Password 
                            label="Новий пароль" 
                            value={value || ''} 
                            onChangeText={onChange} 
                            error={error?.message} 
                            editable={true}
                          />
                        )}
                      />
                    </View>
                  ) : (
                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Пароль</Text>
                        <Button.SaveButton onPress={handleSubmit(onSubmit)} title='Змінити пароль' />
                      </View>
                      <View style={{gap: 16}}>
                        <Controller
                          name="password"
                          control={control}
                          render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <Input.Password 
                              label="Новий пароль" 
                              value={value || ''} 
                              onChangeText={onChange} 
                              error={error?.message} 
                              editable={true}
                            />
                          )}
                        />
                        <Controller
                          name="confirmPassword"
                          control={control}
                          render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <Input.Password 
                              label="Підтвердьте новий пароль" 
                              value={value || ''} 
                              onChangeText={onChange} 
                              error={error?.message} 
                              editable={true}
                            />
                          )}
                        />
                      </View>
                    </View>
                  )}

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
                          activeOpacity={isEditingSignature ? 0.7 : 1}
                        >
                          {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
                          <Text style={styles.checkboxLabel}>Псевдонім автора</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <Text style={[styles.signatureText, { marginLeft: 32, color: '#8E8E93', marginBottom: 15 }]}>
                      {user?.authorName}
                    </Text>

                    <Controller
                      name="useSignature"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity 
                          style={[styles.checkboxRow, { opacity: isEditingSignature ? 1 : 0.6 }]} 
                          onPress={() => isEditingSignature && onChange(!value)}
                          activeOpacity={isEditingSignature ? 0.7 : 1}
                        >
                          {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
                          <Text style={styles.checkboxLabel}>Мій електронний підпис</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                  
                  {isLoading && <ActivityIndicator color={COLORS.darkBlue} style={{ marginVertical: 20 }} />}
                </View>
              ) 
            },
            { 
              title: "Альбоми", 
              content: (
                <View style={styles.placeholder}>
                  <Text style={{ textAlign: 'center', marginTop: 50 }}>Тут будуть альбоми</Text>
                </View>
              ) 
            }
          ]}
        />
      </ScrollView>
    </View>
  );
}