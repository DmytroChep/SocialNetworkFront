import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system/legacy";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";

import { Albums } from "../../modules/settings/ui/album/album";
import { AvatarField } from "../../modules/settings/ui/avatar-field";
import { Avatars } from "../../modules/settings/ui/avatars/avatars";

import {
  useLazySendCodeVerifyQuery,
  useMeQuery,
  useUpdateAvatarMutation,
  useUpdateMutation,
} from "../../shared/api/baseApi";

import { COLORS } from "../../shared/constants";
import { ICONS } from "../../shared/icons";

import {
  getUserAvatar,
  getUserDisplayName,
  getUserHandle,
  getUserSignature,
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
  try {
    const date = new Date(dateValue as any);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

async function prepareAvatarImage(avatar: string): Promise<string | null> {
  if (!avatar) return null;
  if (avatar.startsWith("data:image/")) return avatar;

  if (avatar.startsWith("file://")) {
    try {
      const base64 = await FileSystem.readAsStringAsync(avatar, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      return null;
    }
  }
  return null;
}

export default function ProfileScreen() {
  const [editingSection, setEditingSection] = useState<
    "card" | "info" | "password" | "signature" | null
  >(null);

  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const initialized = useRef(false);
  const signatureRef = useRef<SignatureViewRef | null>(null);

  const { data: user, isLoading: isUserLoading, refetch } = useMeQuery();

  const [updateUser, { isLoading: isUpdating }] = useUpdateMutation();
  const [updateAvatar, { isLoading: isAvatarUpdating }] = useUpdateAvatarMutation();
  const [sendCode, { isLoading: isSendingCode }] = useLazySendCodeVerifyQuery();

  const { control, reset, getValues, watch, setValue, trigger } = useForm<SettingsFormInputs>({
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

  const watchedAuthorName = watch("authorName");
  const watchedUseSignature = watch("useSignature");
  const watchedSignature = watch("signature");

  useEffect(() => {
    if (!user || initialized.current) return;

    initialized.current = true;
    const signature = getUserSignature(user);

    reset({
      authorName: user.first_name || user.profile?.pseudonym || "",
      userName: user.username || "",
      email: user.email || "",
      birthDate: formatBirthDate(user.birthDate || user.profile?.birth_date),
      usePseudonym: !!user.profile?.pseudonym,
      useSignature: !!signature,
      signature: signature || "",
      password: "",
      confirmPassword: "",
      avatar: user.currentAvatar?.image || user.profile?.avatar || user.avatar || "",
    });
  }, [user, reset]);

  const handleCloseEditing = () => {
    setEditingSection(null);
    setLocalAvatar(null);
  };

  const handleSignature = (sig: string) => {
    setValue("signature", sig);
  };

  const handleSectionSave = async () => {
    let fieldsToValidate: (keyof SettingsFormInputs)[] = [];

    if (editingSection === "card") {
      fieldsToValidate = ["userName"];
    } else if (editingSection === "info") {
      fieldsToValidate = ["authorName", "birthDate", "email"];
    } else if (editingSection === "signature") {
      fieldsToValidate = ["usePseudonym", "useSignature", "signature"];
    }

    if (fieldsToValidate.length > 0) {
      const isSectionValid = await trigger(fieldsToValidate);
      if (!isSectionValid) return;
    }

    const data = getValues();

    try {
      if (!user?.id) return;

      if (localAvatar) {
        const avatarImage = await prepareAvatarImage(localAvatar);
        if (avatarImage) {
          await updateAvatar({
            userId: user.id,
            image: avatarImage,
          }).unwrap();
        }
      }

      let finalDate: string | null = null;
      if (data.birthDate && data.birthDate.length >= 10) {
        const parsedDate = new Date(`${data.birthDate}T00:00:00Z`);
        if (!Number.isNaN(parsedDate.getTime())) {
          finalDate = parsedDate.toISOString();
        }
      }

      const body = {
        username: data.userName,
        first_name: data.authorName,
        email: data.email,
        birthDate: finalDate,
        profile: {
          pseudonym: data.usePseudonym ? data.authorName : null,
          signature: data.useSignature ? data.signature : null,
          is_text_signature: data.usePseudonym,
          is_image_signature: data.useSignature,
          birth_date: finalDate,
        },
      };

      await updateUser({
        userId: user.id,
        body: body as any,
      }).unwrap();

      await refetch();

      if (editingSection === "password" && data.password) {
        await sendCode({
          gmail: data.email || user.email,
        }).unwrap();
        setStep(2);
        return;
      }

      handleCloseEditing();
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = isUserLoading || isUpdating || isAvatarUpdating || isSendingCode;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.plum50 }}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        <RadioTabs
          radioTabsArray={[
            {
              title: "Особиста Інформація",
              content: (
                <View>
                  <ProfileCard
                    user={user}
                    isEditing={editingSection === "card"}
                    localAvatar={localAvatar}
                    onEditPress={() => setEditingSection("card")}
                    onAvatarChange={setLocalAvatar}
                    control={control}
                    watch={watch}
                    onSave={handleSectionSave}
                  />

                  <PersonalInfoCard
                    isEditing={editingSection === "info"}
                    onEditPress={() => setEditingSection("info")}
                    control={control}
                    onSave={handleSectionSave}
                  />

                  <SignatureCard
                    isEditing={editingSection === "signature"}
                    onEditPress={() => setEditingSection("signature")}
                    control={control}
                    watch={watch}
                    user={user}
                    signatureRef={signatureRef}
                    scrollEnabled={scrollEnabled}
                    setScrollEnabled={setScrollEnabled}
                    onSignature={handleSignature}
                    onSave={handleSectionSave}
                  />

                  {isLoading && (
                    <ActivityIndicator
                      color={COLORS.blue10}
                      style={{ marginVertical: 20 }}
                    />
                  )}
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
        <PasswordConfirmationModal
          user={user}
          getValues={getValues}
          updateUser={updateUser}
          refetch={refetch}
          onClose={() => {
            setStep(1);
            handleCloseEditing();
          }}
        />
      )}
    </View>
  );
}

interface ProfileCardProps {
  user: any;
  isEditing: boolean;
  localAvatar: string | null;
  control: any;
  watch: any;
  onEditPress: () => void;
  onAvatarChange: (avatar: string) => void;
  onSave: () => void;
}

function ProfileCard({
  user,
  isEditing,
  localAvatar,
  control,
  onEditPress,
  onAvatarChange,
  onSave,
}: ProfileCardProps) {
  return (
    <View style={[styles.card, { paddingVertical: isEditing ? 20 : 24 }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Картка профілю</Text>
        {isEditing ? (
          <Button.SaveButton onPress={onSave} title="Зберегти" />
        ) : (
          <RoundButton onPress={onEditPress} icon={<ICONS.edit />} />
        )}
      </View>

      {isEditing ? (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <AvatarField
            value={localAvatar || user?.currentAvatar?.image}
            onChange={onAvatarChange}
            disabled={false}
          />

          <View style={{ width: "100%", marginTop: 20 }}>
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
          <AvatarField
            value={getUserAvatar(user)}
            onChange={() => {}}
            disabled
          />
          <Text style={[styles.name, { fontSize: 20, fontWeight: "700" }]}>
            {getUserDisplayName(user)}
          </Text>
          <Text style={[styles.handle, { color: "#8E8E93" }]}>
            @{getUserHandle(user)}
          </Text>
        </View>
      )}
    </View>
  );
}

interface PersonalInfoCardProps {
  isEditing: boolean;
  control: any;
  onEditPress: () => void;
  onSave: () => void;
}

function PersonalInfoCard({ isEditing, control, onEditPress, onSave }: PersonalInfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Особиста інформація</Text>
        {isEditing ? (
          <Button.SaveButton onPress={onSave} title="Зберегти" />
        ) : (
          <RoundButton onPress={onEditPress} icon={<ICONS.edit />} />
        )}
      </View>

      <Controller
        name="authorName"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            label="Ім'я автора"
            value={value ?? ""}
            onChangeText={onChange}
            error={error?.message}
            editable={isEditing}
          />
        )}
      />

      <Controller
        name="birthDate"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            label="Дата народження"
            placeholder="YYYY-MM-DD"
            value={value ?? ""}
            onChangeText={onChange}
            error={error?.message}
            editable={isEditing}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            label="Email"
            value={value ?? ""}
            onChangeText={onChange}
            error={error?.message}
            editable={isEditing}
          />
        )}
      />
    </View>
  );
}

interface SignatureCardProps {
  isEditing: boolean;
  control: any;
  watch: any;
  user: any;
  signatureRef: React.RefObject<SignatureViewRef | null>;
  scrollEnabled: boolean;
  setScrollEnabled: (enabled: boolean) => void;
  onSignature: (sig: string) => void;
  onEditPress: () => void;
  onSave: () => void;
}

function SignatureCard({
  isEditing,
  control,
  watch,
  user,
  signatureRef,
  scrollEnabled,
  setScrollEnabled,
  onSignature,
  onEditPress,
  onSave,
}: SignatureCardProps) {
  const watchedAuthorName = watch("authorName");
  const watchedUseSignature = watch("useSignature");
  const watchedSignature = watch("signature");

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Варіанти підпису</Text>
        {isEditing ? (
          <Button.SaveButton onPress={onSave} title="Зберегти" />
        ) : (
          <RoundButton onPress={onEditPress} icon={<ICONS.edit />} />
        )}
      </View>

      <Controller
        name="usePseudonym"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              if (isEditing) onChange(!value);
            }}
            disabled={!isEditing}
          >
            {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
            <Text style={styles.checkboxLabel}>Псевдонім автора</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={[styles.signatureText, { color: "#8E8E93" }]}>
        {watchedAuthorName || getUserDisplayName(user)}
      </Text>

      <Controller
        name="useSignature"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              if (isEditing) onChange(!value);
            }}
            disabled={!isEditing}
          >
            {value ? <ICONS.checkbox /> : <ICONS.checkboxOutline />}
            <Text style={styles.checkboxLabel}>Мій електронний підпис</Text>
          </TouchableOpacity>
        )}
      />

      {watchedUseSignature && (
        <View style={{ marginTop: 10 }}>
          {isEditing ? (
            <View style={{ height: 220, width: "100%" }}>
              <View style={localStyles.canvasBorder}>
                <SignatureScreen
                  ref={signatureRef}
                  onBegin={() => setScrollEnabled(false)}
                  onEnd={() => {
                    setScrollEnabled(true);
                    signatureRef.current?.readSignature();
                  }}
                  onOK={onSignature}
                  autoClear={false}
                  descriptionText=""
                  webStyle={signatureCanvasStyle}
                />
              </View>

              <TouchableOpacity
                onPress={() => signatureRef.current?.clearSignature()}
                style={{ alignSelf: "center", marginTop: 10 }}
              >
                <Text style={{ color: COLORS.blue10, fontWeight: "600" }}>
                  Очистити
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ height: 80, justifyContent: "center" }}>
              {watchedSignature ? (
                <Image
                  source={{ uri: watchedSignature }}
                  style={{ width: 200, height: 60, resizeMode: "contain" }}
                />
              ) : (
                <Text style={{ color: "#8E8E93" }}>Підпис відсутній</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface PasswordConfirmationModalProps {
  user: any;
  getValues: any;
  updateUser: any;
  refetch: any;
  onClose: () => void;
}

function PasswordConfirmationModal({
  user,
  getValues,
  updateUser,
  refetch,
  onClose,
}: PasswordConfirmationModalProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={localStyles.modalOverlay}>
        <CodeConfirmationModal
          title="Підтвердження"
          email={user?.email || ""}
          setStep={() => {}}
          onConfirm={async () => {
            try {
              const values = getValues();
              await updateUser({
                userId: user?.id!,
                body: {
                  password: values.password,
                } as any,
              }).unwrap();

              await refetch();
              onClose();
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </View>
    </View>
  );
}

const signatureCanvasStyle = `
  .m-signature-pad--footer {
    display: none;
    margin: 0;
  }
  body, html {
    width: 100%;
    height: 100%;
    background-color: transparent;
  }
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
