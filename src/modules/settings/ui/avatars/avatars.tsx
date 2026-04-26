import { View, Text, ScrollView, Image } from "react-native";
import { styles } from "./avatars.styles";
import { Button } from "../../../../shared/ui/button";
import { ICONS } from "../../../../shared/icons";
import { COLORS } from "../../../../shared/constants";
import { useUserContext } from "../../../../shared/context/user-context";
import { useRouter } from "expo-router";
import { RoundButton } from "../../../../shared/ui/RoundButton";

export function Avatars() {
    const { user } = useUserContext();
    const router = useRouter();

    if (!user) {
        router.replace("/registration");
        return null;
    }

    const hasAvatars = user.avatars && user.avatars.length > 0;
    const avatars = hasAvatars ? user.avatars.toReversed() : [];


    return (
        <View style={styles.container}>
            {!hasAvatars ? (
                <View style={styles.section}>
                    <View style={styles.emptyContainer}>
                        <RoundButton icon={<ICONS.plus />} />
                        <Text style={styles.emptyText}>Немає ще жодного альбому</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.section}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Мої альбомы</Text>
                        <Button
                            title="Додати фото"
                            style={{
                                backgroundColor: "white",
                                borderWidth: 1,
                                borderColor: COLORS.plum,
                            }}
                            titleStyle={{
                                color: COLORS.plum,
                                fontWeight: "500",
                            }}
                            iconLeft={<ICONS.image />}
                        />
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.avatarsScroll}
                    >
                        {avatars.map((avatar) => (
                            <View key={avatar.id} style={styles.avatarCard}>
                                <Image
                                    source={{
                                        uri: `http://10.0.2.2:8000${avatar.image}`,
                                    }}
                                    style={styles.avatarImage}
                                    width={200}
                                    height={200}
                                />
                                <View style={styles.cardActions}>
                                    <RoundButton
                                        icon={<ICONS.eye />}
                                        style={styles.actionButton}
                                    />
                                    <RoundButton
                                        icon={<ICONS.trash />}
                                        style={styles.actionButton}
                                    />
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}