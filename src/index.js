// index.js
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase, getStorageImages } from './firebase/firebaseConfig';
import ImagePickerBottomSheet from './components/bottomSheet';
import { Entypo } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = (width - 20) / 2;
const IMAGES_PER_ROW = 1;
const statusBarHeight = StatusBar.currentHeight || 0;

export const UploadMediaFile = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(true);
  const [showImageName, setShowImageName] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [showButtons, setShowButtons] = useState({});

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
    } finally {
      setUploading(false);
    }
  };

  const pickImage = () => {
    setBottomSheetVisible(true);
  };

  const handleImageSelect = (imageUri) => {
    setSelectedImage(imageUri);
    setShowImageName({ ...showImageName, [imageUri]: false });
    setShowButtons({ ...showButtons, [imageUri]: false });
    setUploadModalVisible(true);
    setBottomSheetVisible(false);
  };

  const getFileName = (url) => {
    if (!url) {
      return 'Unknown';
    }

    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1];
  };

  const toggleImageName = (imageUri) => {
    setShowImageName({ ...showImageName, [imageUri]: !showImageName[imageUri] });
  };

  const toggleButtons = (imageUri) => {
    setShowButtons({ ...showButtons, [imageUri]: !showButtons[imageUri] });
  };

  const cancelUpload = () => {
    setSelectedImage(null);
    setUploadModalVisible(false);
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

      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
      setUploadModalVisible(false);
    }
  };

  const chunkArray = (array, chunkSize) => {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
      array.slice(index * chunkSize, (index + 1) * chunkSize)
    );
  };

  const imagesInRows = chunkArray(images, IMAGES_PER_ROW);

  return (
    <SafeAreaView style={styles.container}>
      {uploading && (
        <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />
      )}
      {!uploading && (
        <ScrollView horizontal={false} style={styles.scrollView}>
          {imagesInRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.rowContainer}>
              {row.map((item, index) => (
                <TouchableWithoutFeedback
                  key={index}
                  onPress={() => {
                    toggleImageName(item);
                    toggleButtons(item);
                  }}
                >
                  <View style={styles.cardContainer}>
                    <Image
                      source={{ uri: item }}
                      style={styles.cardImage}
                    />
                    {showImageName[item] && (
                      <Text style={styles.imageName} numberOfLines={1} ellipsizeMode="tail">
                        {getFileName(item)}
                      </Text>
                    )}
                    {showButtons[item] && (
                      <View style={styles.buttonContainer}>
                        {/* Adiciona o botão de edição à esquerda */}
                        <TouchableOpacity style={styles.editButton} onPress={() => console.log('Edit pressed')}>
                          <Entypo name="pencil" size={24} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.deleteButton} onPress={() => console.log('Delete pressed')}>
                          <Entypo name="trash" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.uploadModal}>
            <Image
              source={{ uri: selectedImage }}
              style={{ width: 200, height: 200, marginBottom: 10 }}
            />
            <Text style={styles.uploadText}>Upload...</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelUpload}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.Btn} onPress={pickImage}>
        <Text style={styles.BtnTxt}>Select</Text>
      </TouchableOpacity>
      <ImagePickerBottomSheet
        isVisible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onSelectImage={handleImageSelect}
      />
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
  Btn: {
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: '#000',
    width: 125,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  BtnTxt: {
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    margin: 5,
    borderRadius: 10,
  },
  imageName: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    maxWidth: IMAGE_WIDTH - 10,
    overflow: 'hidden',
  },
  buttonContainer: {
    alignSelf:'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  uploadModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ff3333',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'black',
    borderRadius: 50,
    padding: 10,
    margin: 2,
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 50,
    padding: 10,
    margin: 2,
  },
});

export default UploadMediaFile;