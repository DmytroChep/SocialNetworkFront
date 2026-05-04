import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { IPost } from '../../types/Post.type';
import { styles } from './publicationCard.styles';
import { ICONS } from '../../../../shared/icons';
import { ip } from '../../../../config/ip';
import { useHeartDecreaseMutation, useHeartIncreaseMutation, useThumbUpDecreaseMutation, useThumbUpIncreaseMutation } from '../../../../shared/api/baseApi';

interface PostProps {
    post: IPost;
    userId: number;
}

export function PublicationCard({ post, userId }: PostProps) {
    const topImages = post.images.slice(0, 2);
    const bottomImages = post.images.slice(2, 5);

    const [increaseThumbUp] = useThumbUpIncreaseMutation()
    const [increaseHeart] = useHeartIncreaseMutation()


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
                        <Text style={styles.userName}>{post.author.authorName}</Text>
                        {post.author.signatureImage && (
                            <Image 
                                source={{ uri: `http://${ip}:8000${post.author.signatureImage}` }} 
                                style={styles.signature}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    {userId === post.author.id ? <ICONS.dots /> : null}
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.description}>{post.title}</Text>
                <Text style={styles.description}>{post.description}</Text>
                <View style={styles.hashtagContainer}>
                    {post.hashtags.map((item) => (
                        <Text key={item.hashtagId} style={styles.hashtag}>
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
                    <TouchableOpacity style={styles.statItem} onPress={() => {increaseHeart({postId: post.id})}}>
                        <ICONS.heart />
                        <Text style={styles.statText} >{post.heartCount} Вподобань</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={() => {increaseThumbUp({postId: post.id})}}>
                        <ICONS.like />
                        <Text style={styles.statText} >{post.thumbsUpCount} Вподобань</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.statItem}>
                    <ICONS.eye />
                    <Text style={styles.statText}>{post.views} Переглядів</Text>
                </View>
            </View>
        </View>
    );
}