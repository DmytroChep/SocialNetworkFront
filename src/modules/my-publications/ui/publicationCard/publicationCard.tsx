import React, { useEffect, useState, useRef } from 'react';
import { Alert, View, Text, Image, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { IPost } from '../../types/Post.type';
import { styles } from './publicationCard.styles';
import { ICONS } from '../../../../shared/icons';
import { 
    useHeartIncreaseMutation, 
    useThumbUpIncreaseMutation, 
    useUpdatePostMutation,
    useReplacePostImagesMutation,
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
    toMediaUrl,
} from '../../../../shared/lib/model-helpers';

interface PostProps {
    post: IPost;
    userId?: number;
    onDelete?: (postId: number) => void;
    onUpdate?: (post: IPost) => void;
    onToggleLikeLocal: (postId: number, isLiked: boolean) => void;
}

const areSameImages = (currentImages: string[], nextImages: string[]) =>
    currentImages.length === nextImages.length &&
    currentImages.every((image, index) => image === nextImages[index]);

const getOriginalImageValue = (post: IPost, imageUrl: string) => {
    const existingImage = post.images?.find(
        (image) => toMediaUrl(image.compressed_image || image.original_image || image.url) === imageUrl
    );

    return existingImage?.original_image || existingImage?.url || imageUrl;
};

const buildLocalUpdatedPost = (post: IPost, formData: any): IPost => ({
    ...post,
    title: formData.title,
    content: formData.content,
    topic: formData.topic,
    links: formData.links
        ?.map((link: { value: string }, index: number) => ({
            id: post.links?.[index]?.id ?? -index - 1,
            post_id: post.id,
            url: link.value,
        }))
        .filter((link: { url: string }) => Boolean(link.url)) || [],
    images: formData.images?.map((url: string, index: number) => ({
        id: post.images?.[index]?.id ?? -index - 1,
        post_id: post.id,
        original_image: getOriginalImageValue(post, url),
        compressed_image: null,
    })) || [],
});

export function PublicationCard({ post, userId, onDelete, onUpdate, onToggleLikeLocal }: PostProps) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [currentPost, setCurrentPost] = useState(post);
    const [isHearted, setIsHearted] = useState(false);
    
    useEffect(() => {
        setCurrentPost(post);
    }, [post]);

    const images = getPostImages(currentPost);
    const topImages = images.slice(0, 2);
    const bottomImages = images.slice(2, 5);
    const tags = getPostTags(currentPost);
    const authorAvatar = getUserAvatar(currentPost.author);
    const authorSignature = getUserSignature(currentPost.author);

    const [increaseThumbUp] = useThumbUpIncreaseMutation();
    const [increaseHeart] = useHeartIncreaseMutation();
    const [updatePost] = useUpdatePostMutation();
    const [replacePostImages] = useReplacePostImagesMutation();
    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

    const [popupPosition, setPopupPosition] = useState({ top: 0, right: 20 });

    const dotsRefs = useRef<{ [key: string]: View | null }>({});

    const handleUpdatePost = async (formData: any) => {
        const payload = {
            title: formData.title,
            content: formData.content,
            topic: formData.topic,
            author_id: userId || getPostAuthorId(currentPost),
            links: formData.links?.map((link: { value: string }) => link.value).filter(Boolean) || [],
        };

        const localUpdatedPost = buildLocalUpdatedPost(currentPost, formData);

        try {
            let updatedPost = await updatePost({ postId: currentPost.id, post: payload }).unwrap();
            const nextImages = formData.images || [];
            const currentImages = getPostImages(currentPost).map((image) => image.url);

            if (!areSameImages(currentImages, nextImages)) {
                updatedPost = await replacePostImages({
                    postId: currentPost.id,
                    images: nextImages.map((url: string) => ({
                        original_image: getOriginalImageValue(currentPost, url),
                    })),
                }).unwrap();
            }

            setCurrentPost(updatedPost);
            onUpdate?.(updatedPost);
            console.log("Обновлено");
        } catch (err) {
            setCurrentPost(localUpdatedPost);
            onUpdate?.(localUpdatedPost);
            console.log("Пост обновлён локально после ответа сервера:", String(err));
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
                            await deletePost(currentPost.id)
                            onDelete?.(currentPost.id);
                            console.log("Пост видалено успішно");
                        } catch (err) {
                            console.error("Помилка при видаленні:", err);
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
                            {getUserDisplayName(currentPost.author)}
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

                {userId === getPostAuthorId(currentPost) && (
                    <View
                        ref={(el) => {
                            dotsRefs.current[currentPost.id] = el;
                        }}
                        collapsable={false}
                    >
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => handleOpenPopup(currentPost)}
                        >
                            <ICONS.dots />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.description}>
                    {currentPost.title}
                </Text>

                <Text style={styles.description}>
                    {getPostContent(currentPost)}
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
                            setIsHearted(!isHearted);
                            increaseHeart({ postId: currentPost.id });
                        }}
                    >
                        {isHearted ? <ICONS.heartFill /> : <ICONS.heart />}

                        <Text style={styles.statText}>
                            {getPostHeartsCount(currentPost)} Вподобань
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.statItem}
                        onPress={() => {
                            increaseThumbUp({ postId: currentPost.id });
                        }}
                    >
                        <ICONS.like />

                        <Text style={styles.statText}>
                            {getPostLikesCount(currentPost)} Вподобань
                        </Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.statItem}>
                    <ICONS.eye />

                    <Text style={styles.statText}>
                        {getPostViewsCount(currentPost)} Переглядів
                    </Text>
                </View>

            </View>

            <ThreeDotsModal
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                post={currentPost}
                position={popupPosition}
                onUpdatePost={handleUpdatePost}
                onDelete={handleDeletePress}
            />

        </View>
    );
}