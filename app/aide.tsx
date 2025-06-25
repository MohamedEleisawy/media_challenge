import globalStyles from '@/styles/globalStyles';
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, Animated, Linking } from 'react-native';
import HeaderComponent from '@/components/HeaderComponent';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer, isExpanded, onPress }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const toggleChevron = () => {
    Animated.timing(rotationAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={() => { onPress(); toggleChevron(); }} style={styles.questionContainer}>
        <Text style={styles.questionText}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Text style={styles.chevron}>▶</Text>
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const FAQScreen = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const faqData = [
    {
      question: 'Puis-je publier de manière anonyme ?',
      answer: 'Non, la création d’un compte est nécessaire pour publier. Cela permet d’assurer un cadre sécurisé et respectueux pour tous.'
    },
    {
      question: 'Que faire si je vois un contenu choquant ou irrespectueux ?',
      answer: 'Vous pouvez le signaler facilement grâce à l’icône 🛑 en haut à droite de chaque anecdote. L’équipe de modération examinera le signalement rapidement.'
    },
    {
      question: 'Comment signaler un témoignage ?',
      answer: 'Cliquez sur l’icône (🛑) située en haut à droite de l’anecdote concernée. Cela enverra une alerte à notre équipe de modération.'
    },
    {
      question: 'Puis-je modifier ou supprimer mon anecdote après publication ?',
      answer: 'Oui, rendez-vous dans votre profil, puis dans l’onglet “Mes anecdotes” pour modifier ou supprimer un contenu.'
    },
    {
      question: 'Mon témoignage sera-t-il vérifié avant publication ?',
      answer: 'Oui, toutes les publications sont relues par nos modérateurs avant d’être visibles. Cela garantit un espace bienveillant et respectueux.'
    },
    {
      question: 'Qui modère les contenus ?',
      answer: 'Les contenus sont modérés par notre équipe dédiée. Elle veille au respect de la charte d’engagement, à la sécurité des échanges et à la qualité des contributions.'
    },
    {
      question: 'Comment sont utilisés mes témoignages ?',
      answer: 'Vos témoignages restent sur l’application et ne sont jamais utilisés à des fins commerciales. Certains témoignages peuvent être mis en avant (avec votre accord) pour inspirer la communauté ou alimenter nos réflexions collectives autour du vivre ensemble.'
    },
    {
      question: 'L’application est-elle gratuite ?',
      answer: 'Oui, toutes les fonctionnalités sont entièrement gratuites. L’objectif est de créer un espace accessible à toutes et tous.'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <HeaderComponent />
      <View style={styles.container}>
        <TouchableOpacity style={globalStyles.section} onPress={() => Linking.openURL('https://www.mes-allocs.fr/guides/aides-sociales/')}>
          <Text style={globalStyles.sectionTitle}>Numéros d'aides sociaux</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.section} onPress={() => Linking.openURL('https://www.service-public.fr/particuliers/vosdroits/F20706')}>
          <Text style={globalStyles.sectionTitle}>Permanences juridiques</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.faqContainer}>
        <View style={globalStyles.containerButton}>
          <Text style={globalStyles.TitleBlue}>Des </Text>
          <View style={globalStyles.containerButtonBlue}>
            <Text style={globalStyles.TitleWhite}>questions ?</Text>
          </View>
        </View>

        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isExpanded={expandedIndex === index}
            onPress={() => toggleExpand(index)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
 
  faqContainer: {
    marginTop: 20,
  },
  faqItem: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  questionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#202C53',
  },
  chevron: {
    fontSize: 18,
    color: '#0d47a1',
  },
  answerContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  answerText: {
    fontSize: 14,
    color: '#202C53',
  },
});

export default FAQScreen;
