// Importações dos componentes e módulos necessários
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
import { firebase, getStorageImages, firebaseConfig } from './firebase/firebaseConfig';

// Obtenção da largura da tela e cálculo do número de imagens por linha
const { width } = Dimensions.get('window');
const IMAGE_WIDTH = 250;
const IMAGES_PER_ROW = Math.floor(width / IMAGE_WIDTH);

// Obtenção da altura da barra de status (se existir)
const statusBarHeight = StatusBar.currentHeight || 0;

// Componente principal responsável pelo upload e exibição de imagens
export const UploadMediaFile = () => {
  // Estados locais para armazenar imagens, status de upload e visibilidade do nome da imagem
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(true); // Inicia como true para mostrar a animação
  const [showImageName, setShowImageName] = useState({});

  // Efeito de componente que carrega imagens do Firebase Storage ao montar o componente
  useEffect(() => {
    fetchStorageImages();
  }, []);

  // Função assíncrona para buscar imagens no Firebase Storage
  const fetchStorageImages = async () => {
    try {
      // Obtém URLs de imagens
      const storageImages = await getStorageImages();
      // Define as imagens e inicializa o estado showImageName como não visíveis
      setImages(storageImages);
      setShowImageName(Object.fromEntries(storageImages.map(image => [image, false])));
    } catch (error) {
      // Trata o erro
      console.error('Error fetching storage images:', error);
    } finally {
      // Quando as imagens são carregadas ou ocorre um erro, definimos uploading como false
      setUploading(false);
    }
  };

  // Função para selecionar uma imagem da galeria e fazer o upload para o Firebase Storage
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Adiciona a URI da imagem ao estado e inicializa o estado showImageName como não visível
        setImages([...images, result.assets[0].uri]);
        setShowImageName({ ...showImageName, [result.assets[0].uri]: false });

        // Faz o upload da imagem para o Firebase Storage
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking and uploading image:', error);
    }
  };

  // Função para fazer o upload da imagem para o Firebase Storage
  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref();
      const imageName = getFileName(uri);
      const imageRef = storageRef.child(`images/${imageName}`);

      await imageRef.put(blob);

      // Atualiza o estado ou realiza outras ações após o upload ser concluído
      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  // Função para obter o nome do arquivo de uma URL
  const getFileName = (url) => {
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1];
  };

  // Função para alternar a visibilidade do nome da imagem
  const toggleImageName = (imageUri) => {
    setShowImageName({ ...showImageName, [imageUri]: !showImageName[imageUri] });
  };

  // Função para dividir as imagens em linhas
  const chunkArray = (array, chunkSize) => {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
      array.slice(index * chunkSize, (index + 1) * chunkSize)
    );
  };

  // Divide as imagens em linhas
  const imagesInRows = chunkArray(images, IMAGES_PER_ROW);

  // Renderização do componente
  return (
    <SafeAreaView style={styles.container}>
      {uploading && (
        // Mostra a animação enquanto o aplicativo está carregando as imagens
        <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />
      )}
      {!uploading && (
        <ScrollView horizontal={false} style={styles.scrollView}>
          {imagesInRows.map((row, rowIndex) => (
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
          ))}
        </ScrollView>
      )}
      <TouchableOpacity style={styles.Btn} onPress={pickImage}>
        <Text style={styles.BtnTxt}>Select</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Estilos do componente
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
  loadingIndicator: {
    marginTop: 20,
  },
});