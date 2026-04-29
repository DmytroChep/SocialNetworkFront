import React, { useState } from "react";
import { 
    Modal, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    StyleSheet 
} from "react-native";
import { Input } from "../../../shared/ui/input"; 
import { ICONS } from "../../../shared/icons";
import { RoundButton } from "../../../shared/ui/RoundButton";
import { styles } from "./createPostModal.styles";

interface CreatePostModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const CreatePostModal = ({ isVisible, onClose }: CreatePostModalProps) => {
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [content, setContent] = useState("");
    const [link, setLink] = useState("");


    const dummyTags = ["відпочинок", "натхнення", "життя", "природа", "читання", "спокій", "гармонія"];

    return (
        <Modal visible={isVisible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Створення публікації</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        
                        {/* Назва через твій Input */}
                        <Input 
                            label="Назва публікації"
                            placeholder="Природа, книга і спокій 🌿"
                            value={title}
                            onChangeText={setTitle}
                        />

                        {/* Тема через твій Input */}
                        <Input 
                            label="Тема публікації"
                            placeholder="Напишіть тему публікації"
                            value={topic}
                            onChangeText={setTopic}
                        />

                        {/* Блок тегів */}
                        <View style={styles.tagContainer}>
                            <View style={styles.tagList}>
                                {dummyTags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addCircle}>
                                    <Text style={styles.plus}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>


                        <View style={styles.contentInputContainer}>
                            <TextInput
                                multiline
                                placeholder="Інколи найкращі ідеї народжуються в тиші..."
                                style={styles.contentInput}
                                value={content}
                                onChangeText={setContent}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.linkRow}>
                            <View style={{ flex: 1 }}>
                                <Input 
                                    label="Посилання"
                                    placeholder="https://www.instagram.com/..."
                                    value={link}
                                    onChangeText={setLink}
                                />
                            </View>
                            <TouchableOpacity style={styles.addCircleInline}>
                                <Text style={styles.plus}>+</Text>
                            </TouchableOpacity>
                        </View>


                        <View style={styles.footer}>
                            <View style={styles.mediaButtons}>
                                <RoundButton icon={<ICONS.image />} />
                                <RoundButton icon={<ICONS.smile />} />
                            </View>

                            <TouchableOpacity style={styles.publishBtn}>
                                <Text style={styles.publishBtnText}>Публікація</Text>
                                <ICONS.Send/>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};