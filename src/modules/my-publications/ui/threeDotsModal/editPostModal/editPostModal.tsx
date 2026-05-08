import React, { useEffect, useState } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Image 
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './editPostModal.styles';
import { ICONS } from '../../../../../shared/icons';
import { COLORS } from '../../../../../shared/constants';
import { IPost } from '../../../types/Post.type';
import { Input } from '../../../../../shared/ui/input';
import { RoundButton } from '../../../../../shared/ui/RoundButton';
import { getPostContent, getPostImages, getPostLinks } from '../../../../../shared/lib/model-helpers';

interface EditPostModalProps {
    isVisible: boolean;
    onClose: () => void;
    post?: IPost | null;
    onSubmitAction: (data: any) => void;
}

export function EditPostModal({ isVisible, onClose, post, onSubmitAction }: EditPostModalProps) {
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [baseTags, setBaseTags] = useState(["відпочинок", "натхнення", "життя", "природа", "читання", "спокій", "гармонія", "музика", "фільми", "подорожі"]);
    
    const { control, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            title: "",
            topic: "",
            content: "",
            links: [{ value: "" }],
            images: [] as string[],
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "links" });
    const selectedImages = watch("images");

    useEffect(() => {
        if (isVisible) {
            if (post) {
                reset({
                    title: post.title,
                    topic: post.topic || "",
                    content: getPostContent(post),
                    links: getPostLinks(post).length
                        ? getPostLinks(post).map((link) => ({ value: link }))
                        : [{ value: "" }],
                    images: getPostImages(post).map((image) => image.url)
                });
            } else {
                reset({ title: "", topic: "", content: "", links: [{ value: "" }], images: [] });
            }
        }
    }, [post, isVisible, reset]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            setValue("images", [...selectedImages, ...uris]);
        }
    };

    const handleTagPress = (tag: string) => {
        const currentContent = watch("content");
        setValue("content", `${currentContent} #${tag} `);
    };

    const addNewCustomTag = () => {
        if (newTag.trim()) {
            setBaseTags([...baseTags, newTag.trim()]);
            handleTagPress(newTag.trim());
            setNewTag("");
            setIsAddingTag(false);
        }
    };

    const onSubmit = (data: any) => {
        onSubmitAction(data);
        onClose();
    };

    return (
        <Modal visible={isVisible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {post ? "Редагування публікації" : "Створення публікації"}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
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
                                    <TouchableOpacity onPress={addNewCustomTag} style={{ marginLeft: 10 }}>
                                        <ICONS.round color={COLORS.plum || "#51455D"} />
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
                                        {value.split(/(\s+)/).map((part, index) => (
                                            <Text key={index} style={part.startsWith('#') ? { color: COLORS.plum, fontWeight: '600' } : { color: '#333' }}>
                                                {part}
                                            </Text>
                                        ))}
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
                                        <TouchableOpacity style={styles.addCircleInline} onPress={() => append({ value: "" })}>
                                            <Text style={styles.plus}>+</Text>
                                        </TouchableOpacity>
                                    )}
                                    {fields.length > 1 && (
                                        <TouchableOpacity 
                                            style={[styles.addCircleInline, { borderColor: COLORS.plum }]} 
                                            onPress={() => remove(index)}
                                        >
                                            <ICONS.cross width={14} height={14} color={COLORS.plum} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                            {selectedImages.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.previewImageLarge} />
                                    <TouchableOpacity 
                                        style={styles.deletePhotoBtn} 
                                        onPress={() => setValue("images", selectedImages.filter((_, i) => i !== index))}
                                    >
                                        <ICONS.trash color="black" width={18} height={18} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <View style={[styles.footer, { justifyContent: 'flex-end', gap: 10 }]}>
                            <RoundButton icon={<ICONS.image />} onPress={pickImage} />
                            <RoundButton icon={<ICONS.smile />} />
                            <TouchableOpacity 
                                style={[styles.publishBtn, { flex: 0, paddingHorizontal: 25 }]} 
                                onPress={handleSubmit(onSubmit)}
                            >
                                <Text style={styles.publishBtnText}>
                                    {post ? "Зберегти" : "Публікація"}
                                </Text>
                                <ICONS.Send color="white" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
