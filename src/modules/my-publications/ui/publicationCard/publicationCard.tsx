import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { IPost } from '../../types/Post.type';
import { styles } from './publicationCard.styles';
import { ICONS } from '../../../../shared/icons';
import { ip } from '../../../../config/ip';
import { 
    useHeartIncreaseMutation, 
    useThumbUpIncreaseMutation, 
    useUpdatePostMutation,
    useDeletePostMutation
} from '../../../../shared/api/baseApi';
import { ThreeDotsModal } from '../threeDotsModal/threeDotsModal';
import { Alert } from "react-native";

interface PostProps {
    post: IPost;
    userId: number;
    onDelete?: (postId: number) => void;
}

export function PublicationCard({ post, userId, onDelete }: PostProps) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const topImages = post.images.slice(0, 2);
    const bottomImages = post.images.slice(2, 5);

    const [increaseThumbUp] = useThumbUpIncreaseMutation();
    const [increaseHeart] = useHeartIncreaseMutation();
    const [updatePost] = useUpdatePostMutation();
    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

    const [popupPosition, setPopupPosition] = useState({ top: 0, right: 20 });

    const dotsRefs = useRef<{ [key: string]: View | null }>({});

    const handleUpdatePost = async (formData: any) => {
            const payload = {
            title: formData.title,
            description: formData.content,
            topic: formData.topic,
            link: formData.links?.map((l: any) => l.value).filter(Boolean).join(", "),
            images: formData.images?.map((url: string) => ({ url })) || []
        };

        try {
            await updatePost({ postId: post.id, post: payload }).unwrap();
            console.log("Обновлено");
        } catch (err) {
            console.error("Ошибка при обновлении:", err);
        }
    };

    const handleOpenPopup = (element: IPost) => {
        dotsRefs.current[element.id]?.measureInWindow((x, y, width, height) => {

            const statusBarHeight =
                Platform.OS === 'android'
                    ? StatusBar.currentHeight || 0
                    : 0;

            setPopupPosition({
                top: y - statusBarHeight - 10,
                right: -90
            });

            setIsMenuVisible(true);
        });
    };

    const handleDeletePress = () => {
        Alert.alert(
            "Видалення",
            "Ви впевнені, що хочете видалити цю публікацію?",
            [
                { text: "Скасувати", style: "cancel" },
                { 
                    text: "Видалити", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await deletePost(post.id).unwrap();
                            onDelete?.(post.id);
                            console.log("Пост видалено успішно");
                        } catch (err) {
                            console.error("Помилка при видаленні:", err);
                            Alert.alert("Помилка", "не вдалося видалити пост");
                        }
                    } 
                }
            ]
        );
    };

    return (
        <View style={styles.card}>

            <View style={styles.header}>

                <View style={styles.headerLeft}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: `http://${ip}:8000${post.author.currentAvatar.image}` }}
                            style={styles.avatar}
                        />
                        <View style={styles.statusDot} />
                    </View>

                    <View>
                        <Text style={styles.userName}>
                            {post.author.authorName}
                        </Text>

                        {post.author.signatureImage && (
                            <Image
                                source={{ uri: `http://${ip}:8000${post.author.signatureImage}` }}
                                style={styles.signature}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </View>

                {userId === post.author.id && (
                    <View
                        ref={(el) => {
                            dotsRefs.current[post.id] = el;
                        }}
                        collapsable={false}
                    >
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => handleOpenPopup(post)}
                        >
                            <ICONS.dots />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.description}>
                    {post.title}
                </Text>

                <Text style={styles.description}>
                    {post.description}
                </Text>

                <View style={styles.hashtagContainer}>
                    {post.hashtags.map((item) => (
                        <Text
                            key={item.hashtagId}
                            style={styles.hashtag}
                        >
                            #{item.hashtag.title}
                        </Text>
                    ))}
                </View>
            </View>

            <View style={styles.gridContainer}>

                <View style={styles.topRow}>
                    {topImages.map((img, index) => (
                        <Image
                            key={`top-${index}`}
                            source={{ uri: img.url }}
                            style={styles.largeImage}
                        />
                    ))}
                </View>

                {bottomImages.length > 0 && (
                    <View style={styles.bottomRow}>
                        {bottomImages.map((img, index) => (
                            <Image
                                key={`bottom-${index}`}
                                source={{ uri: `http://${ip}:8000${img.url}` }}
                                style={styles.smallImage}
                            />
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.footer}>

                <View style={styles.statsRow}>

                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() => {
                            increaseHeart({ postId: post.id });
                        }}
                    >
                        <ICONS.heart />

                        <Text style={styles.statText}>
                            {post.heartCount} Вподобань
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() => {
                            increaseThumbUp({ postId: post.id });
                        }}
                    >
                        <ICONS.like />

                        <Text style={styles.statText}>
                            {post.thumbsUpCount} Вподобань
                        </Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.statItem}>
                    <ICONS.eye />

                    <Text style={styles.statText}>
                        {post.views} Переглядів
                    </Text>
                </View>

            </View>

            <ThreeDotsModal
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                post={post}
                position={popupPosition}
                onUpdatePost={handleUpdatePost}
                onDelete={handleDeletePress}
            />

        </View>
    );
}