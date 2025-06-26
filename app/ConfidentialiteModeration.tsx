import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const ConfidentialiteModeration = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Confidentialité et Modération</Text>

    {/* 1. Protection des données personnelles */}
    <Text style={styles.sectionTitle}>1. Protection des données personnelles.</Text>
    <Text style={styles.paragraph}>
      Nous nous engageons à protéger la vie privée des utilisateurs de Contrepot. Voici les grandes lignes :
    </Text>
    <View style={styles.bulletList}>
      <Text style={styles.bulletItem}>
        • <Text style={styles.bold}>Collecte minimale :</Text> Nous ne collectons que les données strictement nécessaires au bon fonctionnement de l’application (ex : pseudo, mail, paramètres, préférences).
      </Text>
      <Text style={styles.bulletItem}>
        • <Text style={styles.bold}>Aucune vente de données :</Text> Vos données ne seront jamais vendues à des tiers.
      </Text>
      <Text style={styles.bulletItem}>
        • <Text style={styles.bold}>Stockage sécurisé :</Text> Les données sont stockées de manière sécurisée sur des serveurs protégés.
      </Text>
      <Text style={styles.bulletItem}>
        • <Text style={styles.bold}>Anonymat :</Text> L’application permet l’envoi d’anecdotes et de réactions anonymes, uniquement pour préserver votre vie privée.
      </Text>
    </View>

    {/* 2. Utilisation des données */}
    <Text style={styles.sectionTitle}>2. Utilisation des données.</Text>
    <View style={styles.bulletList}>
      <Text style={styles.bulletItem}>
        • Les données recueillies sont utilisées pour :
      </Text>
      <Text style={styles.subBulletItem}>
        ◦ Améliorer l’expérience utilisateur
      </Text>
      <Text style={styles.subBulletItem}>
        ◦ Afficher des statistiques ou des informations liées aux anecdotes
      </Text>
      <Text style={styles.bulletItem}>
        • Réalisation de statistiques d’utilisation anonymes. Vous restez donc non-identifiable et vos données ne seront jamais revendues, cédées ni louées.
      </Text>
    </View>

    {/* 3. Modération des contenus */}
    <Text style={styles.sectionTitle}>3. Modération des contenus.</Text>
    <View style={styles.bulletList}>
      <Text style={styles.bulletItem}>
        • Les contenus doivent être « respectueux » d’autrui (pas d’insultes, menaces, etc.).
      </Text>
      <Text style={styles.bulletItem}>
        • Certains contenus, s’ils sont perçus ou signalés comme inappropriés, peuvent être modérés ou supprimés sans préavis.
      </Text>
      <Text style={styles.bulletItem}>
        • Un système de signalement est disponible pour permettre à la communauté d’alerter l’équipe de modération.
      </Text>
      <Text style={styles.bulletItem}>
        • En cas de non-respect répété du règlement : suspension temporaire ou définitive du compte.
      </Text>
      <Text style={styles.bulletItem}>
        • Problématique ou signalement urgent : Nous contacter via la rubrique « Contact » du menu, sujet : Ban ou contenu.
      </Text>
    </View>

    {/* 4. Responsabilité */}
    <Text style={styles.sectionTitle}>4. Responsabilité.</Text>
    <Text style={styles.paragraph}>
      L’équipe ne saurait être responsable des contenus qui publient. Contrepot se réserve le droit de supprimer tout contenu ne respectant pas la charte.
    </Text>

    {/* 5. Mise à jour de la politique */}
    <Text style={styles.sectionTitle}>5. Mise à jour de la politique</Text>
    <Text style={styles.paragraph}>
      Cette politique peut être modifiée à tout moment. Nous informerons les utilisateurs en cas de modification importante.
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22315A',
    marginBottom: 18,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#22315A',
    marginTop: 16,
    marginBottom: 6,
    fontSize: 15,
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  subBulletItem: {
    fontSize: 14,
    color: '#333',
    marginLeft: 16,
    marginBottom: 2,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#22315A',
  },
});

export default ConfidentialiteModeration;
