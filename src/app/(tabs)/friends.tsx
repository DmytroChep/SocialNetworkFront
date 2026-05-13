import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { IRadioTab } from "../../shared/ui/RadioTab/radioTab.types";
import { FONTS } from "../../shared/constants/fonts";
import { styles } from "./friends.styles";
// Імпортуємо твою нову модалку
import { DeleteFriendModal } from '../../modules/friends/friendsDeletePopUp/friendsDeletePopUp';

const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
            {title}
        </Text>
        <TouchableOpacity>
            <Text style={[styles.seeAll, { fontFamily: FONTS["GTWalsheimPro-Regular"], color: "#543C52"}]}>
                Дивитись всі
            </Text>
        </TouchableOpacity>
    </View>
);

// Додали пропс onSecondaryPress
const FriendCard = ({ name, handle, avatar, primaryText, secondaryText, onSecondaryPress }: any) => (
    <View style={styles.card}>
        <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.statusIndicator} />
        </View>
        <Text style={[styles.name, { fontFamily: FONTS["GTWalsheimPro-Regular"], color: "#070A1C" }]}>{name}</Text>
        <Text style={[styles.handle, { fontFamily: FONTS["GTWalsheimPro-Regular"], color: "#070A1C" }]}>{handle}</Text>
        
        <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryBtn}>
                <Text style={[styles.primaryBtnText, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
                    {primaryText}
                </Text>
            </TouchableOpacity>
            {/* Викликаємо функцію видалення */}
            <TouchableOpacity style={styles.outlineBtn} onPress={onSecondaryPress}>
                <Text style={[styles.outlineBtnText, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
                    {secondaryText}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

export default function Friends() {
    const [friends, setFriends] = useState([
        { id: 1, name: "Yehor Aung", handle: "@thelili", avatar: "https://i.postimg.cc/0y93rTHc/image.png" },
        { id: 2, name: "Ann Ann", handle: "@thelili", avatar: "https://i.postimg.cc/6Q3mfdK4/image.png" },
    ]);

    const [isModalVisible, setModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const openDeleteModal = (id: number) => {
        setUserToDelete(id);
        setModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            setFriends(prev => prev.filter(user => user.id !== userToDelete));
            setModalVisible(false);
            setUserToDelete(null);
        }
    };

    const MainContent = () => (
        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.blockFriends}>
                <SectionHeader title="Запити"/>
                {friends.map((user) => (
                    <FriendCard 
                        key={`req-${user.id}`} 
                        {...user} 
                        primaryText="Підтвердити" 
                        secondaryText="Видалити" 
                        onSecondaryPress={() => openDeleteModal(user.id)}
                    />
                ))}
            </View>

            <View style={styles.blockFriends}>
                <SectionHeader title="Рекомендації" />
                {friends.map((user) => (
                    <FriendCard 
                        key={`rec-${user.id}`} 
                        {...user} 
                        primaryText="Додати" 
                        secondaryText="Видалити" 
                        onSecondaryPress={() => openDeleteModal(user.id)}
                    />
                ))}
            </View>

            <View style={styles.blockFriends}>
                <SectionHeader title="Всі друзі" />
                {friends.map((user) => (
                    <FriendCard 
                        key={`all-${user.id}`} 
                        {...user} 
                        primaryText="Повідомлення" 
                        secondaryText="Видалити" 
                        onSecondaryPress={() => openDeleteModal(user.id)}
                    />
                ))}
            </View>
        </ScrollView>
    );

    const radioTabsArray: IRadioTab[] = [
        { title: "Головна", content: <MainContent /> },
        { title: "Запити", content: <View style={styles.centered}><Text>Тут будуть запити</Text></View> },
        { title: "Рекомендації", content: <View style={styles.centered}><Text>Тут будуть рекомендації</Text></View> },
        { title: "Всі друзі", content: <View style={styles.centered}><Text>Тут будуть всі друзі</Text></View> },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={["left", "right"]}>
            <View style={{ flex: 1 }}>
                <RadioTabs radioTabsArray={radioTabsArray} />
            </View>

            <DeleteFriendModal 
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={handleConfirmDelete}
            />
        </SafeAreaView>
    );
}