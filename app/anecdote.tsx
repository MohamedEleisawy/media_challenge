import { useTheme } from '@/components/ui/Theme';
import { useGlobalStyles } from '@/styles/globalStyles';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, LogBox, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

const Anecdote = () => {
    const theme = useTheme();
    const globalStyles = useGlobalStyles();
    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    }, []);

    const [anecdotes, setAnecdotes] = useState([]);
    const auth = getAuth();
    const user = auth.currentUser;


    const EMOJIS = ['🥰', '😂', '😯', '😢', '😡'];

    const handleEmojiPress = async (anecdoteId, emoji) => {
        if (!user) {
            // Affichage d'un message d'erreur si l'utilisateur n'est pas connecté
            Alert.alert(
                'Connexion requise', 
                'Vous devez être connecté pour réagir aux anecdotes. Connectez-vous pour participer !',
                [
                    { text: 'OK', style: 'default' }
                ]
            );
            return;
        }
        
        try {
            const anecdoteRef = doc(db, 'anecdotes', anecdoteId);

            // 1. Récupérer les réactions actuelles
            const anecdoteSnap = await getDoc(anecdoteRef);
            const data = anecdoteSnap.data();
            const currentReactions = data.reactions || {};

            // 2. Vérifier si l'utilisateur a déjà réagi avec cet emoji
            const userAlreadyReacted = (currentReactions[emoji] || []).includes(user.uid);

            // 3. Retirer l'utilisateur de toutes les réactions
            const newReactions = {};
            EMOJIS.forEach(e => {
                newReactions[e] = (currentReactions[e] || []).filter(uid => uid !== user.uid);
            });

            // 4. S'il n'avait pas déjà réagi avec l'emoji, on l'ajoute
            if (!userAlreadyReacted) {
                newReactions[emoji].push(user.uid);
            }

            // 5. Mettre à jour les réactions
            await updateDoc(anecdoteRef, { reactions: newReactions });
        } catch (err) {
            console.error("Erreur lors de la mise à jour des réactions :", err);
            // Affichage d'un message d'erreur en cas de problème technique
            Alert.alert(
                'Erreur', 
                'Impossible d\'enregistrer votre réaction. Veuillez réessayer.',
                [
                    { text: 'OK', style: 'default' }
                ]
            );
        }
    };

    const handleReport = async (anecdote) => {
        if (!user) {
            Alert.alert('Connexion requise', 'Vous devez être connecté pour signaler un contenu.');
            return;
        }

        try {
            await addDoc(collection(db, 'reports'), {
                type: 'anecdote',
                contentId: anecdote.id,
                contentText: anecdote.text,
                authorId: anecdote.authorId,
                authorPseudo: anecdote.pseudo,
                reportedBy: user.uid,
                reportedAt: new Date(),
                status: 'pending'
            });

            Alert.alert('Signalement envoyé', 'L\'anecdote a été bien signalée. Merci de nous aider à maintenir une communauté respectueuse.');
        } catch (error) {
            console.error('Erreur signalement:', error);
            Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez réessayer.');
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'anecdotes'), async (snapshot) => {
            const anecdoteDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const anecdotesWithPseudo = await Promise.all(anecdoteDocs.map(async (anecdote) => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', anecdote.authorId));
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    const pseudo = typeof userData.pseudo === 'string' ? userData.pseudo : 'Inconnu';

                    return {
                        ...anecdote,
                        pseudo,
                    };
                } catch (err) {
                    console.error('Erreur en récupérant le pseudo:', err);
                    return {
                        ...anecdote,
                        pseudo: 'Inconnu',
                    };
                }
            }));

            setAnecdotes(anecdotesWithPseudo);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => {
        const pseudo = typeof item.pseudo === 'string' ? item.pseudo : 'Inconnu';

        return (
            <View style={[styles.card, { backgroundColor: theme.anecdoteCard }]}>
                <View style={styles.authorRow}>
                    <Text style={[styles.authorIcon, { color: theme.text }]}>👤</Text>
                    <Text style={[styles.author, { color: theme.primary }]}>{pseudo}</Text>
                    <TouchableOpacity onPress={() => handleReport(item)}>
                        <Ionicons name="flag" size={25} style={[styles.flag, { color: theme.primary }]} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.text, { color: theme.text }]}>{item.text}</Text>
                <View style={styles.reactions}>
                    {['🥰', '😂', '😯', '😢', '😡'].map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            style={styles.emojiContainer}
                            onPress={() => handleEmojiPress(item.id, emoji)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.emojiButton, { backgroundColor: theme.emojiButton }]}>
                                <Text style={styles.emoji}>{emoji}</Text>
                            </View>
                            <Text style={[styles.reactionCount, { color: theme.primary }]}>
                                {Array.isArray(item.reactions?.[emoji]) ? item.reactions[emoji].length : 0}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={globalStyles.containerButton}>
                <Text style={globalStyles.TitleBlue}>Toutes les</Text>
                <View style={globalStyles.containerButtonBlue}>
                    <Text style={globalStyles.TitleWhite}>anecdotes</Text>
                </View>
            </View>
            <FlatList
                data={anecdotes}
                renderItem={({ item }) => {
                    const pseudo = typeof item.pseudo === 'string' ? item.pseudo : 'Inconnu';

                    return (
                        <View style={[styles.card, { backgroundColor: theme.anecdoteCard }]}>
                            <View style={styles.authorRow}>
                                <Text style={[styles.authorIcon, { color: theme.text }]}>👤</Text>
                                <Text style={[styles.author, { color: theme.primary }]}>{pseudo}</Text>
                                <TouchableOpacity onPress={() => handleReport(item)}>
                                    <Ionicons name="flag" size={25} style={[styles.flag, { color: theme.primary }]} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.text, { color: theme.text }]}>{item.text}</Text>
                            <View style={styles.reactions}>
                                {['🥰', '😂', '😯', '😢', '😡'].map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={styles.emojiContainer}
                                        onPress={() => handleEmojiPress(item.id, emoji)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.emojiButton, { backgroundColor: theme.emojiButton }]}>
                                            <Text style={styles.emoji}>{emoji}</Text>
                                        </View>
                                        <Text style={[styles.reactionCount, { color: theme.primary }]}>
                                            {Array.isArray(item.reactions?.[emoji]) ? item.reactions[emoji].length : 0}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    );
                }}
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
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
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
    },
    text: {
        fontSize: 16,
        marginBottom: 12,
    },
    reactions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 4,
    },
    emojiContainer: {
        alignItems: 'center',
        marginRight: 8,
    },
    emojiButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 20,
        marginBottom: 2,
    },
    emoji: {
        fontSize: 18,
    },
    reactionCount: {
        fontSize: 10,
        fontWeight: '500',
    },
    flag: {
        position: 'absolute',
        left: 180,
        top: -0,
        zIndex: 1,
    },
});

export default Anecdote;
