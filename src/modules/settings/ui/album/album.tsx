import { View, Text } from "react-native";
import { useState } from "react";
import { useUserContext } from "../../../../shared/context/user-context";
import { styles } from "./album.styles";
import { RoundButton } from "../../../../shared/ui/RoundButton";
import { ICONS } from "../../../../shared/icons";
import { CreateAlbumModal } from "../redact-album-modal/redactalbumModal";
import { AlbumPopUp } from "../albumPopUp/albumPopUp";
import { COLORS } from "../../../../shared/constants";

export function Albums() {
    const { user } = useUserContext();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isRedactPopupOpen, setIsRedactPopupOpen] = useState<boolean>(false);

    if (!user) {
        return null;
    }

    return (
        <View style={styles.albumsParentView}>
            {user.albums?.length === 0 ? (
                <View style={styles.albums}>
                    <Text style={styles.albumsText}>Немає ще жодного альбому</Text>
                    <RoundButton 
                        icon={<ICONS.plus />} 
                        onPress={() => setIsModalOpen(true)} 
                    />
                </View>
            ) : (

                <View style={{gap: 16}}>
                    <View style={styles.albums}>
                        <Text style={styles.albumsText}>Додати альбом</Text>
                        <RoundButton 
                            icon={<ICONS.plus />} 
                            onPress={() => setIsModalOpen(true)} 
                        />
                    </View>
                    <View>
                        <AlbumPopUp
                            isVisible={isRedactPopupOpen}
                            onClose={() => setIsRedactPopupOpen(false)}
                        />
                    </View>
                    {user.albums?.map((element, index) => (
                        <View key={index} style={styles.albumsExists}>
                            <View style={styles.header}>
                                <Text style={styles.albumsText}>{element.name}</Text>
                                <View style={styles.iconsheaderView}>
                                    <RoundButton icon={<ICONS.eye />} />
                                    <ICONS.dots onPress={() => {setIsRedactPopupOpen(!isModalOpen)}}/>
                                </View>
                            </View>
                            <View style={styles.topic}>
                                <Text style={{fontSize: 16, }}>{element.topic}</Text>
                                <Text style={{fontSize: 16, color: COLORS.blue50}}>{element.year} рік</Text>
                            </View>
                            <View style={styles.hr}/>
                            <View style={styles.photo}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Фотографії</Text>
                                <View style={styles.avatarsView}>
                                    <View style={styles.addPhoto}>
                                        <RoundButton icon={<ICONS.plus />}/>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                    
                </View>

            )}


            <CreateAlbumModal 
                visible={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </View>
    );
}