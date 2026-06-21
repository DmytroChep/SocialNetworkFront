import { View, Text, Image, TouchableOpacity } from "react-native";
import { styles } from "./albumCard.styles";
import { RoundButton } from "../../../shared/ui/RoundButton";
import { ICONS } from "../../../shared/icons";
import { COLORS } from "../../../shared/constants";
import { toMediaUrl } from "../../../shared/lib/model-helpers";

export function AlbumCard({ element, onOpenPopup, onAddImages, readonly = false }: any) {
    return (
        <View style={[styles.albumsExists, { backgroundColor: '#fff', marginBottom: 12 }]}>
            <View style={styles.header}>
                <Text style={styles.albumsText}>{element.name}</Text>
                <View style={styles.iconsheaderView}>
                </View>
            </View>

            <View style={styles.topic}>
                <Text style={{ fontSize: 16 }}>{element.theme}</Text>
                <Text style={{ fontSize: 16, color: COLORS.blue50 }}>{element.year} рік</Text>
            </View>

            <View style={styles.hr} />

            <View style={styles.photo}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>Фотографії</Text>
                <View style={styles.avatarsView}>
                    {element.images?.map((image: any) => (
                        <Image
                            key={image.id}
                            source={{ uri: toMediaUrl(image.image, 'post', element.user_id || element.user?.id || element.ownerId) }}
                            style={{ width: 140, height: 140, borderRadius: 8 }}
                        />
                    ))}
                    {!readonly && (
                        <TouchableOpacity style={styles.addPhoto} onPress={onAddImages}>
                            <ICONS.plus />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}
