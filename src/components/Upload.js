// UploadScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../firebase/firebaseConfig';
import { getStorageImages } from '../firebase/firebaseConfig';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = 250;
const statusBarHeight = StatusBar.currentHeight || 0;

const UploadScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showImageName, setShowImageName] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchStorageImages();
  }, []);

  const fetchStorageImages = async () => {
    try {
      const storageImages = await getStorageImages();
      setImages(storageImages);
      setShowImageName(Object.fromEntries(storageImages.map(image => [image, false])));
    } catch (error) {
      console.error('Error fetching storage images:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowImageName({ ...showImageName, [result.assets[0].uri]: false });
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      if (!selectedImage) {
        console.error('No image selected for upload');
        return;
      }

      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref();
      const imageName = getFileName(selectedImage);
      const imageRef = storageRef.child(`images/${imageName}`);

      await imageRef.put(blob);

      // Atualize o estado ou realize outras ações após o upload ser concluído
      console.log('Image uploaded successfully');

      // Limpa o estado da imagem selecionada após o upload
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileName = (url) => {
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView horizontal={false} style={styles.scrollView}>
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={{ width: IMAGE_WIDTH, height: IMAGE_WIDTH, margin: 5 }}
            />
            {showImageName[selectedImage] && (
              <Text style={styles.imageName}>{getFileName(selectedImage)}</Text>
            )}
          </View>
        )}
      </ScrollView>
      <View style={styles.centerContainer}>
        {uploading ? (
          <ActivityIndicator size="large" color="#000" style={styles.uploadingIndicator} />
        ) : (
          <>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={uploading}>
              <Text style={styles.uploadBtnTxt}>Select</Text>
            </TouchableOpacity>
            {selectedImage && (
              <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={uploading}>
                <Text style={styles.uploadBtnTxt}>Upload</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: statusBarHeight,
  },
  uploadBtn: {
    marginBottom: 10,
    backgroundColor: '#000',
    width: 125,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnTxt: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    flexDirection: 'column',
    width: width,
    marginHorizontal: 0,
  },
  centerContainer: {
    alignItems: 'center',
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
  uploadingIndicator: {
    marginTop: 20,
  },
});

export default UploadScreen;