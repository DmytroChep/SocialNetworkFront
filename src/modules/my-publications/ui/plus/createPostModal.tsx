import React, { useState } from "react";
import { 
    Modal, View, Text, TextInput, TouchableOpacity, 
    ScrollView, Image, Alert 
} from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./createPostModal.styles";
import { RoundButton } from "../../../../shared/ui/RoundButton";
import { ICONS } from "../../../../shared/icons";
import { Input } from "../../../../shared/ui/input";
import { COLORS } from "../../../../shared/constants";

interface IPostForm {
    title: string;
    topic: string;
    content: string;
    links: { value: string }[];
    tags: string[];
    images: string[];
}

export const CreatePostModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
    const [baseTags, setBaseTags] = useState(["відпочинок", "натхнення", "життя", "природа", "читання", "спокій", "гармонія", "музика", "фільми", "подорожі"]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState("");

    const { control, handleSubmit, reset, setValue, watch } = useForm<IPostForm>({
        defaultValues: {
            title: "", topic: "", content: "",
            links: [{ value: "" }],
            tags: [], images: []
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "links" });
    
    const selectedTags = watch("tags");
    const currentContent = watch("content");
    const selectedImages = watch("images");

    const handleTagPress = (tag: string) => {
        const tagString = `#${tag} `;
        if (!currentContent.includes(tagString)) {
            setValue("content", currentContent + tagString);
            if (!selectedTags.includes(tag)) {
                setValue("tags", [...selectedTags, tag]);
            }
        }
    };

    const addNewCustomTag = () => {
        if (newTag.trim()) {
            const cleanTag = newTag.replace("#", "").trim();
            if (!baseTags.includes(cleanTag)) {
                setBaseTags([...baseTags, cleanTag]);
            }
            setNewTag("");
            setIsAddingTag(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            setValue("images", [...selectedImages, ...uris]);
        }
    };

    const onSubmit = (data: any) => {
        console.log("Submit Data:", data);
        reset();
        onClose();
    };

    return (
        <Modal visible={isVisible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Створення публікації</Text>
                        <TouchableOpacity onPress={onClose}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style = {{gap: 15, marginBottom: 20}}>
                            <Controller control={control} name="title" render={({ field }) => (
                                <Input label="Назва публікації" placeholder="Назва..." value={field.value} onChangeText={field.onChange} />
                            )} />

                            <Controller control={control} name="topic" render={({ field }) => (
                                <Input label="Тема публікації" placeholder="Тема..." value={field.value} onChangeText={field.onChange} />
                            )} />
                        </View>


                        <View style={styles.tagContainer}>
                            <View style={styles.tagList}>
                                {baseTags.map((tag, i) => (
                                    <TouchableOpacity key={i} style={styles.tag} onPress={() => handleTagPress(tag)}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity style={styles.addCircle} onPress={() => setIsAddingTag(!isAddingTag)}>
                                    <Text style={styles.plus}>+</Text>
                                </TouchableOpacity>
                            </View>
                            {isAddingTag && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                    <TextInput 
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                                        placeholder="#" 
                                        value={newTag} 
                                        onChangeText={setNewTag} 
                                    />
                                    <TouchableOpacity onPress={addNewCustomTag} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, borderColor: "#000", borderWidth: 1, justifyContent: "center", alignItems: "center" }}>
                                        <Text style = {{fontSize: 20,}}>✓</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <Controller
                            control={control}
                            name="content"
                            render={({ field: { onChange, value } }) => (
                                <View style={styles.contentInputContainer}>
                                    <TextInput
                                        multiline
                                        style={styles.contentInput}
                                        onChangeText={onChange}
                                        placeholder="Інколи найкращі ідеї народжуються в тиші..."
                                        textAlignVertical="top"
                                    >
                                        {value.split(/(\s+)/).map((part, index) => {
                                            if (part.startsWith('#')) {
                                                return (
                                                    <Text key={index} style={{ color: COLORS.plum, fontWeight: '600' }}>
                                                        {part}
                                                    </Text>
                                                );
                                            }
                                            return <Text key={index} style={{ color: '#333' }}>{part}</Text>;
                                        })}
                                    </TextInput>
                                </View>
                            )}
                        />

                        <Text style={styles.label}>Посилання</Text>
                        {fields.map((item, index) => (
                            <View key={item.id} style={styles.linkRow}>
                                <Controller
                                    control={control}
                                    name={`links.${index}.value`}
                                    render={({ field }) => (
                                        <TextInput 
                                            style={[styles.input, { flex: 1, marginBottom: 10 }]} 
                                            placeholder="https://..." 
                                            value={field.value} 
                                            onChangeText={field.onChange} 
                                        />
                                    )}
                                />
                                
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 5 }}>
                                    {index === fields.length - 1 && (
                                        <TouchableOpacity 
                                            style={styles.addCircleInline} 
                                            onPress={() => append({ value: "" })}
                                        >
                                            <Text style={styles.plus}>+</Text>
                                        </TouchableOpacity>
                                    )}

                                    {fields.length > 1 && (
                                        <TouchableOpacity 
                                            style={[styles.addCircleInline, { borderColor: COLORS.plum || '#51455D' }]} 
                                            onPress={() => remove(index)}
                                        >
                                            <ICONS.cross width={14} height={14} color={COLORS.plum || '#51455D'} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}

                        <View style={{ gap: 10, marginBottom: 20 }}>
                            {selectedImages.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.previewImageLarge} />
                                    <TouchableOpacity 
                                        style={styles.deletePhotoBtn} 
                                        onPress={() => setValue("images", selectedImages.filter((_, i) => i !== index))}
                                    >
                                        <ICONS.trash color="black" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <View style={[styles.footer, { justifyContent: 'flex-end', gap: 10 }]}>
                            <RoundButton icon={<ICONS.image />} onPress={pickImage} />
                            <RoundButton icon={<ICONS.smile />} />
                            <TouchableOpacity style={[styles.publishBtn, { flex: 0, paddingHorizontal: 25 }]} onPress={handleSubmit(onSubmit)}>
                                <Text style={styles.publishBtnText}>Публікація</Text>
                                <ICONS.Send />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};