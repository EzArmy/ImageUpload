// GalleryScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, StatusBar, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { getStorageImages } from '../firebase/firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const IMAGE_WIDTH = 250;
const IMAGES_PER_ROW = Math.floor(width / IMAGE_WIDTH);
const statusBarHeight = StatusBar.currentHeight || 0;

const GalleryScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [showImageName, setShowImageName] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStorageImages = async () => {
    try {
      const storageImages = await getStorageImages();
      setImages(storageImages);
      setShowImageName(Object.fromEntries(storageImages.map(image => [image, false])));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching storage images:', error);
    }
  };

  // Use o useFocusEffect para carregar as imagens ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      fetchStorageImages();
    }, [])
  );

  const getFileName = (url) => {
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1];
  };

  const toggleImageName = (imageUri) => {
    setShowImageName({ ...showImageName, [imageUri]: !showImageName[imageUri] });
  };

  const chunkArray = (array, chunkSize) => {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
      array.slice(index * chunkSize, (index + 1) * chunkSize)
    );
  };

  const imagesInRows = chunkArray(images, IMAGES_PER_ROW);

  return (
    <ScrollView horizontal={false} style={styles.scrollView}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
      {!loading && (
        images.length === 0 ? (
          <View style={styles.noImagesContainer}>
            <Text style={styles.noImagesText}>Sem imagens na galeria :(</Text>
          </View>
        ) : (
          imagesInRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.rowContainer}>
              {row.map((item, index) => (
                <TouchableWithoutFeedback
                  key={index}
                  onPress={() => toggleImageName(item)}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item }}
                      style={{ width: IMAGE_WIDTH, height: IMAGE_WIDTH, margin: 5 }}
                    />
                    {showImageName[item] && (
                      <Text style={styles.imageName}>{getFileName(item)}</Text>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </View>
          ))
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    flexDirection: 'column',
    width: width,
    marginHorizontal: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageName: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height - statusBarHeight,
  },
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height - statusBarHeight,
  },
  noImagesText: {
    fontSize: 18,
    color: '#808080',
  },
});

export default GalleryScreen;