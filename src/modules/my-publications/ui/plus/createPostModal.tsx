import React, { useMemo, useState } from "react";
import { 
    Modal, View, Text, TextInput, TouchableOpacity, 
    ScrollView, Image 
} from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./createPostModal.styles";
import { RoundButton } from "../../../../shared/ui/RoundButton";
import { ICONS } from "../../../../shared/icons";
import { Input } from "../../../../shared/ui/input";
import { COLORS } from "../../../../shared/constants";
import {
    useCreateHashtagMutation,
    useCreatePostMutation,
    useGetAllHashtagsQuery,
} from "../../../../shared/api/baseApi";
import { useUserContext } from "../../../../shared/context/user-context";
import { imageAssetsToDataUris, LOW_QUALITY_IMAGE_PICKER_OPTIONS } from "../../../../shared/lib/image-upload";

interface IPostForm {
    title: string;
    topic: string;
    content: string;
    links: { value: string }[];
    hashtags: string[];
    images: string[];
}

type HashtagOption = {
    id?: number;
    name?: string;
    title?: string;
};

const FALLBACK_TAGS = ["відпочинок", "натхнення", "життя", "природа"];

const normalizeTag = (value: string) => value.replace(/^#+/, "").trim().toLowerCase();

const getHashtagName = (tag: HashtagOption) =>
    normalizeTag(tag.name || tag.title || "");

const uniqueTags = (tags: string[]) =>
    Array.from(new Set(tags.map(normalizeTag).filter(Boolean)));

export const CreatePostModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [localTags, setLocalTags] = useState<string[]>([]);

    const [createPost] = useCreatePostMutation();
    const [createHashtag] = useCreateHashtagMutation();
    const { data: hashtags = [] } = useGetAllHashtagsQuery();
    const { user } = useUserContext();

    const { control, handleSubmit, reset, setValue, watch } = useForm<IPostForm>({
        defaultValues: {
            title: "", topic: "", content: "",
            links: [{ value: "" }],
            hashtags: [], 
            images: []
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "links" });
    
    const selectedTags = watch("hashtags");
    const currentContent = watch("content");
    const selectedImages = watch("images");

    const baseTags = useMemo(() => {
        const apiTags = uniqueTags((hashtags as HashtagOption[]).map(getHashtagName));
        return uniqueTags([
            ...(apiTags.length > 0 ? apiTags : FALLBACK_TAGS),
            ...localTags,
        ]);
    }, [hashtags, localTags]);

    const handleTagPress = (tag: string) => {
        const currentTags = watch("hashtags") || [];

        if (currentTags.includes(tag)) {
            setValue("hashtags", currentTags.filter(t => t !== tag));
        } else {
            setValue("hashtags", [...currentTags, tag]);
        }
    };

    const addNewCustomTag = async () => {
        const cleanTag = normalizeTag(newTag);
        if (!cleanTag) return;

        try {
            await createHashtag({ name: cleanTag }).unwrap();
        } catch {
            // If the tag already exists, selecting it locally is still fine.
        }

        setLocalTags((current) => uniqueTags([...current, cleanTag]));
        setValue("hashtags", uniqueTags([...(watch("hashtags") || []), cleanTag]));
        setNewTag("");
        setIsAddingTag(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            ...LOW_QUALITY_IMAGE_PICKER_OPTIONS,
        });

        if (!result.canceled) {
            const base64Images = imageAssetsToDataUris(result.assets);
            setValue("images", [...selectedImages, ...base64Images]);
        }
    };

    const onSubmit = async (data: IPostForm) => {
        const payload = {
            title: data.title.trim(),
            author_id: user?.id ? Number(user.id) : 2,
            content: data.content || "",
            topic: data.topic || null,
            hashtags: uniqueTags(data.hashtags),
            links: data.links?.map((link) => link.value).filter(Boolean) || [],
            images: data.images?.map((url) => ({ original_image: url })) || [],
        };

        try {
            await createPost(payload).unwrap();
            reset();
            onClose();
        } catch (err) {
            console.error("Помилка при створенні допису:", err);
        }
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
                        <View style={{ gap: 15, marginBottom: 20 }}>
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
                                    <TouchableOpacity key={i} style={[styles.tag, selectedTags?.includes(tag) && { backgroundColor: COLORS.plum, borderColor: COLORS.plum }]} onPress={() => handleTagPress(tag)}>
                                        <Text style={[styles.tagText, selectedTags?.includes(tag) && { color: '#fff' }]}>#{tag}</Text>
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
                                        <Text style={{ fontSize: 20 }}>✓</Text>
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
                                        style={[styles.contentInput, { minHeight: 120 }]} 
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="Інколи найкращі ідеї народжуються в тиші..."
                                        textAlignVertical="top"
                                    />

                                    <View style={{ 
                                        padding: 12, 
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        gap: 6,
                                    }}>
                                        {watch("hashtags")?.length > 0 ? (
                                            watch("hashtags").map((tag, index) => (
                                                <Text key={index} style={{ color: COLORS.plum, fontWeight: '700' }}>
                                                    #{tag}
                                                </Text>
                                            ))
                                        ) : (
                                            <Text style={{ color: '#BBB', fontSize: 13 }}>Теги з'являться тут...</Text>
                                        )}
                                    </View>
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
                            <TouchableOpacity style={[styles.publishBtn, { flex: 0, paddingHorizontal: 25 }]} onPress={handleSubmit(onSubmit, (errors) => console.log("Помилки валідації:", errors))}>
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
