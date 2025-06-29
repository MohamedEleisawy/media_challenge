import React from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import globalStyles from '@/styles/globalStyles';

const actualitesPhotos = [
  {
    id: '1',
    type: 'photo',
    title: 'Annonce',
    source: require('../assets/images/image1.png'),
    description: '“Une communauté plus forte”',
    date: '05/06/25',
  },
  {
    id: '3',
    type: 'photo',
    title: 'Annonce',
    source: require('../assets/images/image2.png'),
    description: '“Contrepoint fête ses 1 an !”',
    date: '19/05/25',
  },
];

const actualiteVideo = {
  id: '2',
  type: 'video',
  title: 'Reportage',
  source: require('../assets/images/nettoyagefoyer.mp4'),
  description: '“Qu’est ce que le vivre ensemble ?”',
  date: '20/06/25',
};

export default function ActualitesScreen() {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.squareBlock}>
      <View style={styles.headerRow}>
        <Text style={styles.headerType}>{item.title}</Text>
        <Text style={styles.headerDate}>{item.date}</Text>
      </View>
      <View style={styles.headerLine} />
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
    <View style={styles.container}>
      <View style={globalStyles.containerButton}>
        <Text style={globalStyles.TitleBlue}>Mes </Text>
        <View style={globalStyles.containerButtonBlue}>
          <Text style={globalStyles.TitleWhite}>actualités</Text>
        </View>
      </View>

      {/* Titre de la vidéo */}
      <View style={styles.headerRow}>
        <Text style={styles.headerType}>{actualiteVideo.title}</Text>
        <Text style={styles.headerDate}>{actualiteVideo.date}</Text>
      </View>
      <View style={styles.headerLine} />

      {/* Vidéo centrée dans un bloc 16:9 */}
      <View style={styles.videoBlock}>
        <Video
          source={actualiteVideo.source}
          style={styles.videoPortrait}
          useNativeControls
          resizeMode="cover"
          isLooping
        />
        <View style={styles.textOverlay}>
          <Text style={styles.overlayText}>{actualiteVideo.description}</Text>
        </View>
      </View>

      {/* Bloc Annonce */}
      <View style={styles.annonceContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerType}>Annonce</Text>
          <Text style={styles.headerDate}>15/06/25</Text>
        </View>
        <View style={styles.headerLine} />
        <Text style={styles.annonceTitle}>
          Nouveaux formats : des podcasts pour aller plus loin
        </Text>
        <Text style={styles.annonceDescription}>
          Après les récits écrits, Contrepoint lance sa série de podcasts mensuels, donnant la parole directement aux témoins, aux chercheurs et aux acteurs associatifs.
        </Text>
        <Text style={styles.podcast}>
          <Text style={styles.icon}>🎙️ </Text>
          <Text>
            Le premier épisode{' '}
            <Text style={styles.episodeTitle}>
              « Vivre sous pression : quand le quartier se referme »
            </Text>{' '}
            est disponible dès aujourd'hui sur toutes les plateformes.
          </Text>
        </Text>
      </View>

      {/* Liste des autres actualités */}
      <FlatList
        data={actualitesPhotos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  squareBlock: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  videoBlock: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  videoPortrait: {
    height: '100%',
    aspectRatio: 9 / 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerType: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#000',
  },
  headerDate: {
    fontSize: 15,
    color: '#666',
  },
  headerLine: {
    height: 1,
    backgroundColor: '#222',
    opacity: 0.2,
    marginBottom: 10,
  },
  media: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
  },
  annonceContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fff',
    elevation: 2,
  },
  annonceTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  annonceDescription: {
    fontSize: 15,
    marginBottom: 10,
    color: '#222',
  },
  podcast: {
    fontSize: 15,
    color: '#222',
  },
  icon: {
    fontSize: 17,
  },
  episodeTitle: {
    fontWeight: 'bold',
  },
});
