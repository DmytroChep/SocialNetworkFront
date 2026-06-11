import { Text, TextInput, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { CodeConfirmationModalProps } from "./codeConfirmationModal.types";
import { styles } from "./codeConfirmationModal.styles";
import { useRef, useState } from "react";
import { Button } from "../button";
import { useLazyCheckIsCodeExistsQuery } from "../../api/baseApi";
import { useRouter } from "expo-router";

export function CodeConfirmationModal(props: CodeConfirmationModalProps) {
    const { title, email, setStep, onConfirm } = props;
    const router = useRouter();
    
    const [codeValues, setCodeValues] = useState<string[]>(new Array(6).fill(""));
    const [localError, setLocalError] = useState<string | null>(null);
    const [checkIsCodeExists, { error: serverError, isLoading, isError }] = useLazyCheckIsCodeExistsQuery();

    const inputsRef = useRef<(TextInput | null)[]>([]);

    const handleInputChange = (text: string, index: number) => {
        if (localError) setLocalError(null);
        
        const newCode = [...codeValues];
        newCode[index] = text;
        setCodeValues(newCode);

        if (text.length > 0 && index < 5) {
            inputsRef.current[index + 1]?.focus();
        } else if (text.length === 0 && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleConfirm = async () => {
        const fullCode = codeValues.join("");
        if (fullCode.length === 6) {
            try {
                // CodeConfirmationModal.tsx
                const response = await checkIsCodeExists({ 
                    code: fullCode, 
                    email: email  // props.email
                }).unwrap();
                if (response) {
                        if (onConfirm) {
                            await onConfirm(); // тепер onConfirm є і для реєстрації, і для паролю
                        } else {
                            router.replace("(tabs)/main");
                        }
                } else {
                    setLocalError("Невірний код");
                }
            } catch (err) {
                setLocalError("Помилка підтвердження коду");
            }
        }
    };

    const getErrorMessage = () => {
        if (localError) return localError;
        if (!serverError) return null;
        if ('data' in serverError) {
            const errorData = serverError.data as any;
            return errorData?.message || "Невірний код або помилка сервера";
        }
        return "Сталася помилка. Спробуйте ще раз";
    };

    return (
        <View style={styles.modal}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>
                Ми надіслали 6-значний код на вашу пошту {"\n"} ({email}). 
                Введіть його нижче, щоб підтвердити дію
            </Text>

            <View style={styles.confirmCodeView}>
                <Text style={styles.codeTitle}>Код підтвердження</Text>
                <View style={styles.codeViewInputs}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <TextInput
                            key={index}
                            ref={(el) => { inputsRef.current[index] = el; }}
                            keyboardType="number-pad"
                            placeholder="_"
                            style={styles.input}
                            maxLength={1}
                            value={codeValues[index]}
                            onChangeText={(text) => handleInputChange(text, index)}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.buttonView}>
                {(isError || localError) && (
                    <Text style={{ color: "red", marginBottom: 10, textAlign: 'center' }}>
                        {getErrorMessage()}
                    </Text>
                )}
                
                <Button 
                    title={isLoading ? "Перевірка..." : "Підтвердити"} 
                    onPress={handleConfirm} 
                    disabled={isLoading || codeValues.join("").length < 6}
                    style={[
                        styles.button, 
                        (isLoading || codeValues.join("").length < 6) && { opacity: 0.6 }
                    ]}
                />
                
                {isLoading && <ActivityIndicator style={{ marginTop: 5 }} color="#000" />}
                
                <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 15 }}>
                    <Text style={{ color: '#8E8E93', textAlign: 'center' }}>Назад</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}