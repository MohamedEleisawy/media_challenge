import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LogBox } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion, onSnapshot, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import globalStyles from '@/styles/globalStyles';

const Anecdote = () => {
    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    }, []);
    const [anecdotes, setAnecdotes] = useState([]);
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'anecdotes'), (snapshot) => {
            const updatedAnecdotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnecdotes(updatedAnecdotes);
        });
        return () => unsubscribe();
    }, []);

    const handleEmojiPress = async (anecdoteId, emoji) => {
        if (!user) return;
        try {
            const anecdoteRef = doc(db, 'anecdotes', anecdoteId);
            await updateDoc(anecdoteRef, {
                [`reactions.${emoji}`]: arrayUnion(user.uid)
            });
        } catch (err) {
            console.error("Error updating document: ", err);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.authorRow}>
                <Text style={styles.authorIcon}>👤</Text>
                <Text style={styles.author}>{item.author}</Text>
            </View>
            <Text style={styles.text}>{item.text}</Text>
            <View style={styles.reactions}>
                {['🥰', '😂', '😯', '😢', '😡'].map((emoji) => (
                    <TouchableOpacity
                        key={emoji}
                        style={styles.emojiButton}
                        onPress={() => handleEmojiPress(item.id, emoji)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.emoji}>{emoji}</Text>
                        <Text style={styles.reactionCount}>{item.reactions?.[emoji]?.length || 0}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={globalStyles.containerButton}>
                <Text style={globalStyles.TitleBlue}>Toutes les</Text>
                <View style={globalStyles.containerButtonBlue}>
                    <Text style={globalStyles.TitleWhite}>anecdotes</Text>
                </View>
            </View>
            <FlatList
                data={anecdotes}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: 10,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#35518A',
    },
    badge: {
        backgroundColor: '#35518A',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 5,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(254, 242, 186, 0.34)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    authorIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    author: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#35518A',
    },
    text: {
        fontSize: 16,
        marginBottom: 12,
        color: '#222',
    },
    reactions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 4,
    },
    emojiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 20,
        backgroundColor: '#E5ECFA',
        marginRight: 8,
    },
    emoji: {
        fontSize: 18,
    },
    reactionCount: {
        marginLeft: 4,
        fontSize: 13,
        color: '#35518A',
        fontWeight: '500',
    },
});

export default Anecdote;
