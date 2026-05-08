import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
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
}

export function PublicationCard({ post, userId }: PostProps) {
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
    const [deletePost] = useDeletePostMutation();
    
    const handleUpdatePost = async (formData: any) => {
        try {
            const payload = {
                postId: post.id,
                post: {
                    title: formData.title,
                    topic: formData.topic,
                    content: formData.content,
                    author_id: userId || getPostAuthorId(post),
                    links: formData.links?.map((link: { value: string }) => link.value).filter(Boolean) || [],
                    images: formData.images.map((url: string) => ({ original_image: url }))
                }
            };
            const response = await updatePost(payload).unwrap();
            console.log(`Допис оновлено успішно: ${response}`);
        } catch (error) {
            console.error("Помилка при оновленні допису:", error);
        }
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
                        <Text style={styles.userName}>{getUserDisplayName(post.author)}</Text>
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
                    <TouchableOpacity 
                        style={styles.menuButton} 
                        onPress={() => setIsMenuVisible(true)}
                    >
                        <ICONS.dots />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.description}>{post.title}</Text>
                <Text style={styles.description}>{getPostContent(post)}</Text>
                <View style={styles.hashtagContainer}>
                    {tags.map((tag) => (
                        <Text key={tag} style={styles.hashtag}>
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
                    <TouchableOpacity style={styles.statItem} onPress={() => {increaseHeart({postId: post.id})}}>
                        <ICONS.heart />
                        <Text style={styles.statText} >{getPostHeartsCount(post)} Вподобань</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={() => {increaseThumbUp({postId: post.id})}}>
                        <ICONS.like />
                        <Text style={styles.statText} >{getPostLikesCount(post)} Вподобань</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.statItem}>
                    <ICONS.eye />
                    <Text style={styles.statText}>{getPostViewsCount(post)} Переглядів</Text>
                </View>
            </View>

            <ThreeDotsModal 
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                post={post}
                onUpdatePost={handleUpdatePost}
                onDelete={async () => {
                    await deletePost(post.id).unwrap();
                }}
            />
        </View>
    );
}
