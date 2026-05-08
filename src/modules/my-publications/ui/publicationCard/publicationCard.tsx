import React, { useState, useRef } from 'react';
import { Alert, View, Text, Image, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { IPost } from '../../types/Post.type';
import { styles } from './publicationCard.styles';
import { ICONS } from '../../../../shared/icons';
import { 
    useHeartIncreaseMutation, 
    useThumbUpIncreaseMutation, 
    useUpdatePostMutation,
    useDeletePostMutation
} from '../../../../shared/api/baseApi';
import { ThreeDotsModal } from '../threeDotsModal/threeDotsModal';
import {
    getPostAuthorId,
    getPostContent,
    getPostHeartsCount,
    getPostImages,
    getPostLikesCount,
    getPostTags,
    getPostViewsCount,
    getUserAvatar,
    getUserDisplayName,
    getUserSignature,
} from '../../../../shared/lib/model-helpers';

interface PostProps {
    post: IPost;
    userId?: number;
    onDelete?: (postId: number) => void;
}

export function PublicationCard({ post, userId, onDelete }: PostProps) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    
    const images = getPostImages(post);
    const topImages = images.slice(0, 2);
    const bottomImages = images.slice(2, 5);
    const tags = getPostTags(post);
    const authorAvatar = getUserAvatar(post.author);
    const authorSignature = getUserSignature(post.author);

    const [increaseThumbUp] = useThumbUpIncreaseMutation();
    const [increaseHeart] = useHeartIncreaseMutation();
    const [updatePost] = useUpdatePostMutation();
    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

    const [popupPosition, setPopupPosition] = useState({ top: 0, right: 20 });

    const dotsRefs = useRef<{ [key: string]: View | null }>({});

    const handleUpdatePost = async (formData: any) => {
        const payload = {
            title: formData.title,
            content: formData.content,
            topic: formData.topic,
            author_id: userId || getPostAuthorId(post),
            links: formData.links?.map((link: { value: string }) => link.value).filter(Boolean) || [],
            images: formData.images?.map((url: string) => ({ original_image: url })) || [],
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
                        {authorAvatar ? (
                            <Image source={{ uri: authorAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatar} />
                        )}
                        <View style={styles.statusDot} />
                    </View>

                    <View>
                        <Text style={styles.userName}>
                            {getUserDisplayName(post.author)}
                        </Text>

                        {authorSignature && (
                            <Image
                                source={{ uri: authorSignature }}
                                style={styles.signature}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </View>

                {userId === getPostAuthorId(post) && (
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
                    {getPostContent(post)}
                </Text>

                <View style={styles.hashtagContainer}>
                    {tags.map((tag) => (
                        <Text
                            key={tag}
                            style={styles.hashtag}
                        >
                            #{tag}
                        </Text>
                    ))}
                </View>
            </View>

            <View style={styles.gridContainer}>

                <View style={styles.topRow}>
                    {topImages.map((img, index) => (
                        <Image
                            key={`top-${img.id}-${index}`}
                            source={{ uri: img.url }}
                            style={styles.largeImage}
                        />
                    ))}
                </View>

                {bottomImages.length > 0 && (
                    <View style={styles.bottomRow}>
                        {bottomImages.map((img, index) => (
                            <Image
                                key={`bottom-${img.id}-${index}`}
                                source={{ uri: img.url }}
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
                            {getPostHeartsCount(post)} Вподобань
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
                            {getPostLikesCount(post)} Вподобань
                        </Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.statItem}>
                    <ICONS.eye />

                    <Text style={styles.statText}>
                        {getPostViewsCount(post)} Переглядів
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
