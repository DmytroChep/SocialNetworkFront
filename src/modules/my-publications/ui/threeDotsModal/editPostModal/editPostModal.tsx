import React, { useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { styles } from './editPostModal.styles';
import { ICONS } from '../../../../shared/icons';
import { IPost } from '../../types/Post.type';

interface EditPostModalProps {
    isVisible: boolean;
    onClose: () => void;
    post: IPost | null;
}

export function EditPostModal = ({ isVisible, onClose, post }: EditPostModalProps) => {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            title: "",
            description: "",
            content: "",
            links: [{ value: "" }],
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "links" });

    useEffect(() => {
        if (post && isVisible) {
            reset({
                title: post.title,
                description: post.description,
                content: post.description,
                links: post.links?.length 
                    ? post.links.map(l => ({ value: l.url })) 
                    : [{ value: "" }],
            });
        }
    }, [post, isVisible]);

    const onSubmit = (data: any) => {
        console.log("Оновлені дані:", data);
        onClose();
    };

    if (!post) {
        return null;
    }

    return(
       <Modal visible={isVisible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            Редактувати 
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
                                        <ICONS.round color="#51455D" />
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
                                        {/* Фіолетові теги */}
                                        {value?.split(/(\s+)/).map((part: string, index: number) => {
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

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
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
                            <TouchableOpacity 
                                style={[styles.publishBtn, { flex: 0, paddingHorizontal: 25 }]} 
                                onPress={handleSubmit(onSubmit)}
                            >
                                {/* Змінюємо текст кнопки */}
                                <Text style={styles.publishBtnText}>
                                    {post ? "Зберегти" : "Публікація"}
                                </Text>
                                <ICONS.Send />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}