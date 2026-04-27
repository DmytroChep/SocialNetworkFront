import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dropdown } from 'react-native-element-dropdown';

import { styles } from './redactAlbumModal.styles';
import { Input } from '../../../../shared/ui/input';
import { Button } from '../../../../shared/ui/button';
import { COLORS } from '../../../../shared/constants';
import { useCreateAlbumMutation, useGetAllHashtagsQuery } from '../../../../shared/api/baseApi';
import { useUserContext } from '../../../../shared/context/user-context'; // Импортируй свой контекст

// Валидация под IAlbum (используем topic вместо theme)
const albumSchema = yup.object().shape({
  name: yup.string().required("Обов'язкове поле"),
  topic: yup.string().required("Оберіть тему"),
  year: yup.string().required("Обов'язкове поле"),
});

type AlbumFormData = Omit<IAlbum, 'id' | 'userId'>;

interface CreateAlbumModalProps {
  visible: boolean;
  onClose: () => void;
}



export function CreateAlbumModal({ visible, onClose }: CreateAlbumModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { user } = useUserContext();
  const [createAlbum, { isLoading }] = useCreateAlbumMutation(); 
  const {data:hashTags} = useGetAllHashtagsQuery()
  const { control, handleSubmit, reset } = useForm<AlbumFormData>({
    resolver: yupResolver(albumSchema),
    defaultValues: {
      name: '',
      topic: '',
      year: ''
    }
  });
  console.log(hashTags)

  const onSubmit = async (data: AlbumFormData) => {
    if (!user?.id) {
      setServerError("Користувач не авторизований");
      return;
    }

    setServerError(null);
    try {
      await createAlbum({
        ...data,
        userId: user.id
      }).unwrap();
      
      reset();
      onClose();
    } catch (error: any) {
      setServerError(error?.data?.message || "Помилка при створенні альбому");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Створити альбом</Text>
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
                name="topic"
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
                      
                      // Якщо hashTags порожні, підставляємо тимчасовий список, щоб можна було клацнути
                      data={hashTags && hashTags.length > 0 
                        ? hashTags.map(h => ({ label: h.title, value: h.title }))
                        : [
                            { label: 'Природа', value: 'Природа' },
                            { label: 'Подорожі', value: 'Подорожі' },
                            { label: 'Сім\'я', value: 'Сім\'я' }
                          ]
                      }
                      
                      labelField="label"
                      valueField="value"
                      placeholder="Оберіть тему"
                      value={value}
                      onChange={item => {
                        onChange(item.value);
                      }}
                      flatListProps={{
                        nestedScrollEnabled: true,
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
              title={isLoading ? "Збереження..." : "Зберегти"}
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

export interface IAlbum {
  id: number;
  name: string;
  topic: string;
  year: string;
  userId: number;
}