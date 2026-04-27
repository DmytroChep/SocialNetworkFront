import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useForm, Controller } from 'react-hook-form';
import { styles } from './editAlbumModal.styles';

interface EditAlbumModalProps {
    visible: boolean;
    onClose: () => void;
    albumData?: {
        id: string;
        name: string;
        topic: string;
        year: string;
    } | null;
}

export function EditAlbumModal({ visible, onClose, albumData }: EditAlbumModalProps) {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
        name: '',
        topic: '',
        year: '',
        }
    });

    useEffect(() => {
        if (albumData) {
        reset({
            name: albumData.name,
            topic: albumData.topic,
            year: String(albumData.year),
        });
        } else {
        reset({ name: '', topic: '', year: '' });
        }
    }, [albumData, visible]);

    const onSubmit = (data: any) => {
        if (albumData) {
        console.log("Оновлюємо альбом з ID:", albumData.id, data);
        } else {
        console.log("Створюємо новий альбом:", data);
        }
        onClose();
    };

    return (
        <Modal 
        isVisible={visible} 
        onBackdropPress={onClose}
        style={styles.modalBottom}
        >
            <View style={styles.container}>
                <Text style={styles.title}>
                    {albumData ? "Редагувати альбом" : "Створити альбом"}
                </Text>

                <Text style={styles.label}>Назва альбому</Text>

                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                        <TextInput 
                        style={styles.input} 
                        placeholder="Наприклад: Мій випускний" 
                        value={value} 
                        onChangeText={onChange} 
                        />
                    )}
                />

                <Text style={styles.label}>Оберіть тему</Text>

                <Controller
                    control={control}
                    name="topic"
                    render={({ field: { onChange, value } }) => (
                        <TextInput 
                        style={styles.input} 
                        placeholder="Тема альбому" 
                        value={value} 
                        onChangeText={onChange} 
                        />
                    )}
                />

                <Text style={styles.label}>Рік</Text>

                <Controller
                    control={control}
                    name="year"
                    render={({ field: { onChange, value } }) => (
                        <TextInput 
                        style={styles.input} 
                        placeholder="2024" 
                        keyboardType="number-pad"
                        value={value} 
                        onChangeText={onChange} 
                        />
                    )}
                />

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelText}>Скасувати</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.saveText}>Зберегти</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}



