import React, { useEffect } from "react";
import { ActivityIndicator, View, Text, Modal, TouchableOpacity } from "react-native";
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
    reset,
  } = useForm<FirstEnterForm>({
    resolver: yupResolver(firstEnterValidator),
    defaultValues: {
      authorName: "",
      userName: "",
    },
  });

  const [updateUser, { isLoading }] = useUpdateMutation();
  const { data: meData } = useMeQuery();

  useEffect(() => {
    if (!meData) return;

    reset({
      authorName: meData.profile?.pseudonym || meData.first_name || "",
      userName: meData.username || "",
    });
  }, [meData, reset]);

  const onSubmit = async (formData: FirstEnterForm) => {
    if (!meData?.id) return;

    const body: IPartialUser = {
      first_name: formData.authorName,
      username: formData.userName.replace(/^@/, ""),
      pseudonym: formData.authorName,
      is_text_signature: true,
      profile: {
        pseudonym: formData.authorName,
        is_text_signature: true,
      },
    };

    await updateUser({ userId: meData.id, body }).unwrap();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => {}}
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
                      onChangeText={(text) => onChange(text.replace(/^@/, ""))}
                      value={value ? `@${value.replace(/^@/, "")}` : ""}
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
                title={isLoading ? "Збереження..." : "Продовжити"}
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
                titleStyle={styles.buttonText}
                disabled={isLoading || !meData?.id}
              />
              {isLoading && <ActivityIndicator style={{ marginTop: 12 }} />}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
