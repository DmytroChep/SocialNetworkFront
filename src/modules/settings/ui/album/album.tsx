import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, StatusBar, Platform } from "react-native";
import { useState, useRef } from "react"; 
import * as ImagePicker from "expo-image-picker";
import { useUserContext } from "../../../../shared/context/user-context";
import { styles } from "./album.styles";
import { RoundButton } from "../../../../shared/ui/RoundButton";
import { ICONS } from "../../../../shared/icons";
import { CreateAlbumModal } from "../redact-album-modal/redactalbumModal";
import { AlbumPopUp } from "../albumPopUp/albumPopUp";
import { COLORS } from "../../../../shared/constants";
import { useDeleteAlbumMutation, useAddAlbumImagesMutation, useDeleteAlbumImageMutation } from "../../../../shared/api/baseApi";
import { IAlbum } from "../../../../shared/context/types";
import { getUserAlbums, toMediaUrl } from "../../../../shared/lib/model-helpers";
import { imageAssetsToDataUris, LOW_QUALITY_IMAGE_PICKER_OPTIONS } from "../../../../shared/lib/image-upload";

export function Albums() {
    const { user } = useUserContext();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
    const [isAddingImages, setIsAddingImages] = useState<boolean>(false);
    
    const [popupPosition, setPopupPosition] = useState({ top: 0, right: 20 });
    const dotsRefs = useRef<{[key: string]: View | null}>({}); 

    const [deleteAlbum] = useDeleteAlbumMutation();
    const [addAlbumImages] = useAddAlbumImagesMutation();
    const [deleteAlbumImage] = useDeleteAlbumImageMutation();
    
    if (!user) {
        return null;
    }

    const albums = getUserAlbums(user);

    const handleOpenPopup = (element: IAlbum) => {
        setSelectedAlbum(element);
        
        dotsRefs.current[element.id!]?.measureInWindow((x, y, width, height) => {
            const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
            
            setPopupPosition({
                top: y - statusBarHeight, 
                right: 16 
            });
            setIsPopupOpen(true);
        });
    };

    const pickAndAddImages = async (album: IAlbum) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                allowsEditing: false,
                ...LOW_QUALITY_IMAGE_PICKER_OPTIONS,
            });

            if (!result.canceled && result.assets.length > 0) {
                setIsAddingImages(true);
                
                const images = imageAssetsToDataUris(result.assets).map((image) => ({ image }));

                await addAlbumImages({ 
                    albumId: album.id!,
                    name: album.name,
                    userId: user.id,
                    images 
                }).unwrap();
                
                setIsAddingImages(false);
            }
        } catch (error: any) {
            setIsAddingImages(false);
            console.error('Image upload error:', error);
        }
    };

    const handleDeleteImage = (imageId: number) => {
        const deleteAsync = async () => {
            try {
                await deleteAlbumImage(imageId).unwrap();
            } catch (error: any) {
                console.error('Image delete error:', error);
            }
        };
        deleteAsync();
    };

    const handleEditPress = () => {
        setIsPopupOpen(false);
        setIsEditModalOpen(true);
    };

    const handleDeletePress = async () => {
        try {
            await deleteAlbum(selectedAlbum.id).unwrap();
            setIsPopupOpen(false);
            setSelectedAlbum(null);
        } catch (error: any) {
            console.error('Album delete error:', error);
        }
    };


    return (
        <View style={styles.albumsParentView}>
            {albums.length === 0 ? (
                <View style={styles.albums}>
                    <Text style={styles.albumsText}>Немає ще жодного альбому</Text>
                    <RoundButton 
                        icon={<ICONS.plus />} 
                        onPress={() => setIsCreateModalOpen(true)} 
                    />
                </View>
            ) : (
                <View style={{gap: 16}}>
                    <View style={styles.albums}>
                        <Text style={styles.albumsText}>Додати альбом</Text>
                        <RoundButton 
                            icon={<ICONS.plus />} 
                            onPress={() => setIsCreateModalOpen(true)} 
                        />
                    </View>

                    <AlbumPopUp
                        isVisible={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        onEdit={handleEditPress}
                        onDelete={handleDeletePress}
                        position={popupPosition}
                    />

                    {albums.map((element) => (
                        <View key={element.id} style={styles.albumsExists}>
                            <View style={styles.header}>
                                <Text style={styles.albumsText}>{element.name}</Text>
                                <View style={styles.iconsheaderView}>
                                    <RoundButton icon={<ICONS.eye />} />
                                    
                                    <View 
                                        ref={(el) => { dotsRefs.current[element.id!] = el; }} 
                                        collapsable={false}
                                    >
                                        <TouchableOpacity onPress={() => handleOpenPopup(element)}>
                                            <ICONS.dots />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.topic}>
                                <Text style={{fontSize: 16}}>{element.theme}</Text>
                                <Text style={{fontSize: 16, color: COLORS.blue50}}>{element.year} рік</Text>
                            </View>
                            <View style={styles.hr}/>
                            <View style={styles.photo}>
                                <Text style={{fontSize: 16, fontWeight: '500'}}>Фотографії</Text>
                                <View style={styles.avatarsView}>
                                    {element.images && element.images.length > 0 && element.images.map((image) => {
                                                const imageUri = toMediaUrl(image.image, 'post', element.user_id || element.user?.id || element.ownerId);
                                                return (
                                                    <View key={image.id}>
                                                        {imageUri && (
                                                            <Image
                                                                source={{ uri: imageUri }}
                                                                style={{width: 162, height: 162, borderRadius: 8}}
                                                            />
                                                        )}
                                                        <View style={styles.cardActions}>
                                                            <RoundButton
                                                                icon={<ICONS.eye />}
                                                                style={styles.actionButton}
                                                            />
                                                            <RoundButton
                                                                onPress={() => handleDeleteImage(image.id)}
                                                                icon={<ICONS.trash />}
                                                                style={styles.actionButton}
                                                            />
                                                        </View>
                                                    </View>
                                                
                                                );
                                            }
                                    )}
                                    <View style={styles.addPhoto}>
                                        {isAddingImages ? (
                                            <ActivityIndicator color={COLORS.darkBlue} size="small" />
                                        ) : (
                                            <TouchableOpacity onPress={() => {
                                                if (element.id) {
                                                    pickAndAddImages(element);
                                                }
                                            }}>
                                                <ICONS.plus />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={{width:160, height: 160}}>

                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <CreateAlbumModal 
                visible={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />
            
            <CreateAlbumModal 
                visible={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                initialData={selectedAlbum}
            />
        </View>
    );
}
