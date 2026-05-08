import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { styles } from "./firstEnterModal.styles";
import { firstEnterValidator } from "./firstEnterModal.validation";
import { Button } from "../button";
import { Input } from "../input";
import { ICONS } from "../../icons";
import { useMeQuery, useUpdateMutation } from "../../api/baseApi";
import { IPartialUser } from "../../context/types/partial-user.type";

interface FirstEnterForm {
  authorName: string;
  userName: string;
}

interface FirstEnterModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FirstEnterModal({ visible, onClose }: FirstEnterModalProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FirstEnterForm>({
    resolver: yupResolver(firstEnterValidator),
    defaultValues: {
      authorName: "",
      userName: "",
    },
  });

  const [updateUser, { error }] = useUpdateMutation();
  const { data: meData } = useMeQuery();

  const onSubmit = (formData: FirstEnterForm) => {
    const body: IPartialUser = {
      first_name: formData.authorName,
      username: formData.userName,
      pseudonym: formData.authorName,
      is_text_signature: true,
      profile: {
        pseudonym: formData.authorName,
        is_text_signature: true,
      },
    };

    updateUser({ userId: meData?.id ?? 1, body });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.modalContainer}>

            <Text style={styles.title}>Додай деталі про себе</Text>

            <View style={styles.form}>
              <Controller
                name="authorName"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Псевдонім автора"
                    placeholder="Введіть Псевдонім автора"
                    onChangeText={onChange}
                    value={value}
                    error={error?.message}
                    labelStyle={styles.label}
                  />
                )}
              />
              <Controller
                name="userName"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View>
                    <Input
                      label="Ім'я користувача"
                      placeholder="Введіть Ім'я користувача"
                      onChangeText={onChange}
                      value={value}
                      error={error?.message}
                      labelStyle={styles.label}
                    />
                    <Text style={styles.helperText}>
                      Або оберіть:{" "}
                      <Text style={styles.greenText}>
                        (Запропоновані варіанти відповідно до Ім'я та Прізвища)
                      </Text>
                    </Text>
                  </View>
                )}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Продовжити"
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
                titleStyle={styles.buttonText}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
