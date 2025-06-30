import { useTheme } from '@/components/ui/Theme';
import { Audio, Video } from 'expo-av';

import React, { useEffect } from 'react';
import {
    FlatList,
    ImageBackground,
    LogBox,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const actualitesPhotos = [
  {
    id: '1',
    type: 'photo',
    title: 'Annonce',
    source: require('../assets/images/image1.jpg'),
    description: '"Une communauté plus forte"',
    date: '05/06/25',
  },
  {
    id: '3',
    type: 'photo',
    title: 'Annonce',
    source: require('../assets/images/image2.jpg'),
    description: '"Contrepoint fête ses 1 an !"',
    date: '19/05/25',
  },
];

const actualiteVideo = {
  id: '2',
  type: 'video',
  title: 'Reportage',
  source: require('../assets/images/ContrePointVideoMinorites.mp4'),
  description: '"Qu\'est ce que le vivre ensemble ?"',
  date: '20/06/25',
};

export default function ActualitesScreen() {
  const theme = useTheme();

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

    // Configuration audio pour permettre la lecture du son
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.log('Erreur configuration audio:', error);
      }
    };

    configureAudio();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.newsCard, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.typeChip, { backgroundColor: theme.primary }]}>
          <Text style={styles.headerType}>{item.title}</Text>
        </View>
        <Text style={[styles.headerDate, { color: theme.textSecondary }]}>
          {item.date}
        </Text>
      </View>

      <ImageBackground
        source={item.source}
        style={styles.media}
        resizeMode="cover"
      >
        <View style={styles.textOverlay}>
          <Text style={styles.overlayText}>{item.description}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={actualitesPhotos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* Titre section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nos </Text>
            <View
              style={[
                styles.sectionTitleHighlight,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={styles.sectionTitleWhite}>actualités</Text>
            </View>
          </View>

          {/* Bloc vidéo avec son activé */}
          <View style={[styles.videoContainer, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.headerRow}>
              <View style={[styles.typeChip, { backgroundColor: theme.accent }]}>
                <Text style={[styles.headerType, { color: theme.background }]}>
                  {actualiteVideo.title}
                </Text>
              </View>
              <Text style={[styles.headerDate, { color: theme.textSecondary }]}>
                {actualiteVideo.date}
              </Text>
            </View>

            <View style={styles.videoBlock}>
              <Video
                source={actualiteVideo.source}
                style={styles.video}
                useNativeControls
                resizeMode="cover"
                isLooping
                shouldPlay={false}
                isMuted={false}
                volume={1.0}
                rate={1.0}
                onError={(error) => console.log('Erreur vidéo:', error)}
                onLoad={() => console.log('Vidéo chargée')}
              />
              <View style={styles.textOverlay}>
                <Text style={styles.overlayText}>{actualiteVideo.description}</Text>
              </View>
            </View>
          </View>

          {/* Bloc Annonce Podcast */}
          <View
            style={[
              styles.annonceContainer,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.headerRow}>
              <View style={[styles.typeChip, { backgroundColor: theme.success }]}>
                <Text style={styles.headerType}>Annonce</Text>
              </View>
              <Text style={[styles.headerDate, { color: theme.textSecondary }]}>
                15/06/25
              </Text>
            </View>

            <Text style={[styles.annonceTitle, { color: theme.text }]}>
              Nouveaux formats : des podcasts pour aller plus loin
            </Text>
            <Text style={[styles.annonceDescription, { color: theme.textSecondary }]}>
              Après les récits écrits, Contrepoint lance sa série de podcasts mensuels...
            </Text>

            <View
              style={[
                styles.podcastHighlight,
                { backgroundColor: theme.primary + '20', borderColor: theme.primary },
              ]}
            >
              <Text style={styles.podcastIcon}>🎙️</Text>
              <View style={styles.podcastContent}>
                <Text style={[styles.podcastText, { color: theme.text }]}>
                  Le premier épisode{' '}
                  <Text style={[styles.episodeTitle, { color: theme.primary }]}>
                    « Vivre sous pression »
                  </Text>{' '}
                  est disponible dès aujourd'hui.
                </Text>
              </View>
            </View>
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitleHighlight: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 5,
  },
  sectionTitleWhite: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  newsCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoContainer: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  headerDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  videoBlock: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  media: {
    aspectRatio: 1,
    position: 'relative',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 1,
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  annonceContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  annonceTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    lineHeight: 24,
  },
  annonceDescription: {
    fontSize: 15,
    marginBottom: 15,
    lineHeight: 22,
  },
  podcastHighlight: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  podcastIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  podcastContent: {
    flex: 1,
  },
  podcastText: {
    fontSize: 14,
    lineHeight: 20,
  },
  episodeTitle: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingBottom: 20,
  },
});
