import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadioTabs } from "../../shared/ui/RadioTab";
import { IRadioTab } from "../../shared/ui/RadioTab/radioTab.types";
import { FONTS } from "../../shared/constants/fonts";
import { styles } from "./friends.styles";


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

const FriendCard = ({ name, handle, avatar, primaryText, secondaryText }: any) => (
    <View style={styles.card}>
        <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.statusIndicator} />
        </View>
        <Text style={[styles.name, { fontFamily: FONTS["GTWalsheimPro-Regular"], color: "#070A1C" }]}>
            {name}
        </Text>
        <Text style={[styles.handle, { fontFamily: FONTS["GTWalsheimPro-Regular"], color: "#070A1C" }]}>
            {handle}
        </Text>
        
        <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryBtn}>
                <Text style={[styles.primaryBtnText, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
                    {primaryText}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn}>
                <Text style={[styles.outlineBtnText, { fontFamily: FONTS["GTWalsheimPro-Medium"] }]}>
                    {secondaryText}
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);


export default function Friends() {
    const mockUsers = [
        { name: "Yehor Aung", handle: "@thelili", avatar: "https://i.postimg.cc/0y93rTHc/image.png" },
        { name: "Ann Ann", handle: "@thelili", avatar: "https://i.postimg.cc/6Q3mfdK4/image.png" },
    ];

    const MainContent = () => (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.blockFriends]}>
                <SectionHeader title="Запити"/>
                {mockUsers.map((user, i) => (
                    <FriendCard key={`req-main-${i}`} {...user} primaryText="Підтвердити" secondaryText="Видалити" />
                ))}
            </View>

            <View style={[styles.blockFriends]}>
                <SectionHeader title="Рекомендації" />
                {mockUsers.map((user, i) => (
                    <FriendCard key={`rec-main-${i}`} {...user} primaryText="Додати" secondaryText="Видалити" />
                ))}
            </View>
            
            <View style={[styles.blockFriends]}>
                <SectionHeader title="Всі друзі" />
                {mockUsers.map((user, i) => (
                    <FriendCard key={`all-main-${i}`} {...user} primaryText="Повідомлення" secondaryText="Видалити" />
                ))}
            </View>
        </ScrollView>
    );

    const RequestsContent = () => (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.blockFriends]}>
                <SectionHeader title="Всі запити"/>
                {mockUsers.map((user, i) => (
                    <FriendCard key={`req-page-${i}`} {...user} primaryText="Підтвердити" secondaryText="Видалити" />
                ))}
            </View>
        </ScrollView>
    );

    const RecommendationsContent = () => (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.blockFriends]}>
                <SectionHeader title="Рекомендації для вас"/>
                {mockUsers.map((user, i) => (
                    <FriendCard key={`rec-page-${i}`} {...user} primaryText="Додати" secondaryText="Видалити" />
                ))}
            </View>
        </ScrollView>
    );

    const AllFriendsContent = () => (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.blockFriends]}>
                <SectionHeader title="Ваші друзі"/>
                {mockUsers.map((user, i) => (
                    <FriendCard key={`all-page-${i}`} {...user} primaryText="Повідомлення" secondaryText="Видалити" />
                ))}
            </View>
        </ScrollView>
    );

    const radioTabsArray: IRadioTab[] = [
        { title: "Головна", content: <MainContent /> },
        { title: "Запити", content: <RequestsContent /> },
        { title: "Рекомендації", content: <RecommendationsContent /> },
        { title: "Всі друзі", content: <AllFriendsContent /> },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={["left", "right"]}>
            <View style={{ flex: 1 }}>
                <RadioTabs radioTabsArray={radioTabsArray} />
            </View>
        </SafeAreaView>
    );
}