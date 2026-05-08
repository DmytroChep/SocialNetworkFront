import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dropdown } from 'react-native-element-dropdown';

import { styles } from './redactAlbumModal.styles';
import { Input } from '../../../../shared/ui/input';
import { Button } from '../../../../shared/ui/button';
import { COLORS } from '../../../../shared/constants';
import { useCreateAlbumMutation, useUpdateAlbumMutation, useGetAllHashtagsQuery } from '../../../../shared/api/baseApi';
import { useUserContext } from '../../../../shared/context/user-context';
import { IAlbum } from '../../../../shared/context/types';

const albumSchema = yup.object().shape({
  name: yup.string().required("Обов'язкове поле"),
  theme: yup.string().nullable().required("Оберіть тему"),
  year: yup.string().required("Обов'язкове поле"),
});

type AlbumFormData = {
  name: string;
  theme: string;
  year: string;
};

interface CreateAlbumModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: IAlbum;
}



export function CreateAlbumModal({ visible, onClose, initialData }: CreateAlbumModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useUserContext();
  const [createAlbum, { isLoading: isCreateLoading }] = useCreateAlbumMutation();
  const [updateAlbum, { isLoading: isUpdateLoading }] = useUpdateAlbumMutation();
  const { data: hashTags } = useGetAllHashtagsQuery();
  const { control, handleSubmit, reset } = useForm<AlbumFormData>({
    resolver: yupResolver(albumSchema),
    defaultValues: {
      name: initialData?.name || '',
      theme: initialData?.theme || '',
      year: initialData?.year?.toString() || ''
    }
  });

  useEffect(() => {
    if (visible && initialData) {
      reset({
        name: initialData.name,
        theme: initialData.theme || '',
        year: initialData.year?.toString() || ''
      });
    } else if (visible) {
      reset({
        name: '',
        theme: '',
        year: ''
      });
    }
  }, [visible, initialData, reset]);

  const isLoading = isCreateLoading || isUpdateLoading;
  const isEditMode = !!initialData;

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      setServerError("Користувач не авторизований");
      return;
    }

    setServerError(null);
    try {
      if (isEditMode && initialData && initialData.id) {
        await updateAlbum({
          id: initialData.id,
          body: {
            name: data.name,
            theme: data.theme,
            year: Number(data.year),
          }
        }).unwrap();
      } else {
        await createAlbum({
          name: data.name,
          theme: data.theme,
          year: Number(data.year),
          profile_id: user.profile?.id,
        }).unwrap();
      }
      
      reset();
      onClose();
    } catch (error: any) {
      setServerError(error?.data?.message || `Помилка при ${isEditMode ? 'редагуванні' : 'створенні'} альбому`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title}>{isEditMode ? 'Редагувати альбом' : 'Створити альбом'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={styles.formFields}>
              <Controller
                name="name"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Назва альбому"
                    onChangeText={onChange}
                    value={value}
                    error={error?.message}
                    placeholder="Введіть назву альбому"
                  />
                )}
              />

              <Controller
                name="theme" 
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Оберіть тему</Text>
                    <Dropdown
                        style={[styles.dropdown, error && { borderColor: COLORS.lightRed }]}
                        placeholderStyle={styles.placeholder}
                        selectedTextStyle={styles.dropdownText}
                        containerStyle={styles.dropdownContainer}
                        itemTextStyle={styles.dropdownItemText}
                        activeColor={COLORS.blue20 || '#F3F4F6'}
                        
                        data={(hashTags || []).map(hashtag => ({
                          label: hashtag.name,
                          value: hashtag.name
                        }))}
                        
                        labelField="label"
                        valueField="value"
                        
                        placeholder="Оберіть тему"
                        value={value}
                        onChange={item => {
                          onChange(item.value);
                        }}
                        renderRightIcon={() => (
                          <Text style={styles.chevron}>⌄</Text>
                        )}
                      />
                    {error && <Text style={styles.errorText}>{error.message}</Text>}
                  </View>
                )}
              />

              <Controller
                name="year"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Рік альбому"
                    onChangeText={onChange}
                    value={value}
                    error={error?.message}
                    placeholder="Введіть рік альбому"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </ScrollView>

          {serverError && (
            <Text style={{ color: COLORS.lightRed, marginBottom: 10, fontSize: 14 }}>
              {serverError}
            </Text>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            
            <Button
              title={isLoading ? "Збереження..." : isEditMode ? "Оновити" : "Зберегти"}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
