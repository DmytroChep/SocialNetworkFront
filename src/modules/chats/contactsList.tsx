import React, { useState } from "react";
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity } from "react-native";
import { ICONS } from "../../shared/icons";
import { useUserContext } from "../../shared/context/user-context";
import { toMediaUrl } from "../../shared/lib/model-helpers";
import { styles } from "./contactList.styles"; // Імпорт винесених стилей

interface ContactType {
    id: string;
    name: string;
    avatar: string;
}

export function ContactsList() {
    const { user } = useUserContext();
    const [searchQuery, setSearchQuery] = useState<string>("");

    const friends: ContactType[] = (user as any)?.friends || [
        { id: "1", name: "Jane Cooper", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
        { id: "2", name: "Cameron Williamson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e" },
        { id: "3", name: "Leslie Alexander", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80" },
        { id: "4", name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
        { id: "5", name: "Jacob Jones", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6" },
        { id: "6", name: "Brooklyn Simmons", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9" },
        { id: "7", name: "Brooklyn Simmons", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9" },
    ];

    const filteredContacts = friends.filter((contact: ContactType) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <ICONS.people width={20} height={20} stroke="#8E8E93" />
                <Text style={styles.cardTitle}>Контакти</Text>
            </View>

            <View style={styles.searchWrapper}>
                <ICONS.search width={18} height={18} stroke="#8E8E93" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Пошук"
                    placeholderTextColor="#8E8E93"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollPadding}
            >
                {filteredContacts.length === 0 ? (
                    <Text style={styles.noResultsText}>Нікого не знайдено</Text>
                ) : (
                    filteredContacts.map((contact) => (
                        <TouchableOpacity key={contact.id} style={styles.contactItem}>
                            <Image
                                source={{ uri: toMediaUrl?.(contact.avatar) || contact.avatar }}
                                style={styles.avatar}
                            />
                            <Text style={styles.contactName}>{contact.name}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}