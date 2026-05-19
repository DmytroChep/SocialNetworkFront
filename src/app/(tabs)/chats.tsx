import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "../../shared/icons";
import { COLORS } from "../../shared/constants";
import { useState } from "react";
import { FONTS } from "../../shared/constants/fonts";
import { ContactsList } from "../../modules/chats/contactsList";	

const styles = StyleSheet.create({
    choosedTab: {
        
    },
    visible: {
        display: "flex",
        flex: 1,       // Додаємо, щоб компонент займав весь доступний простір
        width: "100%"  // Щоб картка розтягувалася по ширині екрану
    },
    hidden: {
        display: "none"
    },
    radioTabs: { 
        flex: 1,       // Змінюємо на flex: 1, щоб контент під табами не обрізався
        width: "100%",
        gap: 6, 
        paddingVertical: 8
    },
    tabs: {
        width: "100%",
        paddingHorizontal: 16,
        justifyContent: "space-between",
        flexDirection: "row",
        marginBottom: 8 // Невеликий відступ від табів до картки
    },
    tab: {
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    choosedRadioTabs: {
        alignItems: "center",
        paddingVertical: 8,
        justifyContent: "center",
        gap: 6,
        borderTopColor: COLORS.darkBlue,
        borderTopWidth: 2
    }
})

export default function Chats() {
    // 2. Замінюємо текстову заглушку на наш <ContactsList />
    const radioTabsArray = [
        { 
            title: "Контакти", 
            icon: <ICONS.people />, 
            content: <ContactsList/> 
        },
        { 
            title: "Повідмолення", 
            icon: <ICONS.chat />, 
            content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Повідмолення</Text></View> 
        },
        { 
            title: "Групові чати", 
            icon: <ICONS.chat />, 
            content: <View><Text style={{fontFamily: FONTS["GTWalsheimPro-Medium"]}}>Групові чати</Text></View> 
        },
    ];
    
    const [choosedTab, setChoosedTab] = useState<string>(radioTabsArray[0].title);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["left", "right"]}>
            <View style={{ flex: 1 }}>
                <View style={styles.radioTabs}>
                    {/* Рендер кнопок перемикання табів */}
                    <View style={styles.tabs}>
                        {radioTabsArray.map((element) => {
                            return (
                                <Pressable 
                                    key={element.title}
                                    style={
                                        choosedTab === element.title ? styles.choosedRadioTabs : styles.tab
                                    }
                                    onPress={() => setChoosedTab(element.title)}
                                >
                                    {element.icon}
                                    <Text>{element.title}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
        
                    {/* Рендер контенту обраного табу */}
                    {radioTabsArray.map((element) => {
                        return (
                            <View
                                key={element.title}
                                style={
                                    choosedTab === element.title ? styles.visible : styles.hidden
                                }
                            >
                                {element.content}
                            </View>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}