import React, { useCallback } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ICONS } from "../../shared/icons";
import { styles } from "./profile.styles";
import { Button } from "../../shared/ui/button";
import {
    useGetUserByIdQuery,
    useGetUserPostsQuery,
} from "../../shared/api/baseApi";
import { useUserContext } from "../../shared/context/user-context";
import {
    getUserAlbums,
    getUserAvatar,
    getUserDisplayName,
    getUserHandle,
} from "../../shared/lib/model-helpers";
import { AlbumCard } from "../../modules/profile/albumCard/albumCard";
import { PublicationCard } from "../../modules/my-publications/ui/publicationCard/publicationCard";
import type { IPost } from "../../modules/my-publications/types/Post.type";

const DEFAULT_AVATAR = "https://i.postimg.cc/0y93rTHc/image.png";

export default function UserProfile() {
    const router = useRouter();
    const { user: currentUser } = useUserContext();
    const { id, name, handle, avatar } = useLocalSearchParams();
    const profileUserId = Number(id);

    const {
        data: profileUser,
        isLoading: isUserLoading,
        isError: isUserError,
    } = useGetUserByIdQuery(profileUserId, {
        skip: !profileUserId,
    });
    const { data: posts = [], isLoading: isPostsLoading } = useGetUserPostsQuery(
        { userId: profileUserId },
        { skip: !profileUserId },
    );

    const displayName = profileUser ? getUserDisplayName(profileUser) : String(name || "");
    const userHandle = profileUser
        ? getUserHandle(profileUser)
        : String(handle || "").replace(/^@/, "");
    const avatarUrl = profileUser ? getUserAvatar(profileUser) : String(avatar || "");
    const albums = profileUser ? getUserAlbums(profileUser) : [];

    const handleUpdatePost = useCallback((_updatedPost: IPost) => {}, []);
    const handleDeletePost = useCallback((_postId: number) => {}, []);

    if (!profileUserId) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>Профіль не знайдено</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isUserLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <ActivityIndicator />
                </View>
            </SafeAreaView>
        );
    }

    if (isUserError) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>Не вдалося завантажити профіль</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileCard}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ICONS.ArrowIcon />
                    </TouchableOpacity>

                    <View style={styles.firstSectionProfileView}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: avatarUrl || DEFAULT_AVATAR }} style={styles.avatar} />
                            <View style={styles.onlineBadge} />
                        </View>
                        <Text style={styles.userName}>{displayName || "Користувач"}</Text>
                        <Text style={styles.userHandle}>{userHandle ? `@${userHandle}` : ""}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{posts.length}</Text>
                            <Text style={styles.statLabel}>Дописи</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{albums.length}</Text>
                            <Text style={styles.statLabel}>Альбоми</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Друзі</Text>
                        </View>
                    </View>

                    <View style={styles.buttonGroup}>
                        <Button title="Повідомлення" style={styles.btnPrimary} titleStyle={styles.btnTextWhite} />
                        <Button title="Видалити" style={styles.btnSecondary} titleStyle={styles.btnTextDark} />
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <ICONS.image width={20} height={20} />
                            <Text style={styles.sectionTitle}>Альбоми</Text>
                        </View>
                    </View>

                    {albums.length > 0 ? (
                        albums.map((album) => (
                            <AlbumCard
                                key={album.id}
                                element={album}
                                onOpenPopup={() => {}}
                                readonly
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Альбомів поки немає</Text>
                    )}
                </View>

                <View style={styles.postsSection}>
                    {/* <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <ICONS.image width={20} height={20} />
                            <Text style={styles.sectionTitle}>Дописи</Text>
                        </View>
                    </View> */}

                    {isPostsLoading ? (
                        <ActivityIndicator style={{ marginVertical: 16 }} />
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <PublicationCard
                                key={post.id}
                                post={post}
                                userId={currentUser?.id}
                                onDelete={handleDeletePost}
                                onUpdate={handleUpdatePost}
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Дописів поки немає</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
