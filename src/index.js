import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image, StyleSheet, ScrollView, Dimensions, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../firebaseConfig';
import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { getStorageImages } from '../firebaseConfig';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = 75; // Largura de cada imagem
const IMAGES_PER_ROW = Math.floor(width / IMAGE_WIDTH); // Número de imagens por linha

const statusBarHeight = StatusBar.currentHeight || 0;

export const UploadMediaFile = () => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Carrega as imagens do Firebase Storage ao montar o componente
        fetchStorageImages();
    }, []);

    const fetchStorageImages = async () => {
        try {
            const storageImages = await getStorageImages();
            setImages(storageImages);
        } catch (error) {
            // Trata o erro
            console.error('Error fetching storage images:', error);
        }
    };

    const pickImage = async () => {
        // Seleciona uma imagem da galeria
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            // Adiciona a URI da imagem ao estado
            setImages([...images, result.assets[0].uri]);
        }
    };

    // Função para dividir as imagens em linhas
    const chunkArray = (array, chunkSize) => {
        return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
            array.slice(index * chunkSize, (index + 1) * chunkSize)
        );
    };

    // Divide as imagens em linhas
    const imagesInRows = chunkArray(images, IMAGES_PER_ROW);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView horizontal={false} style={styles.scrollView}>
                {/* Renderiza as imagens do Firebase Storage em linhas */}
                {imagesInRows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.rowContainer}>
                        {row.map((item, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: IMAGE_WIDTH, height: IMAGE_WIDTH, margin: 5 }}
                                />
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
            {/* Adicione um botão para iniciar o processo de upload (se necessário) */}
            <TouchableOpacity style={styles.Btn} onPress={pickImage}>
                <Text style={styles.BtnTxt}>Select</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// Estilos
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
        flexDirection: 'column', // Alterado para 'column'
        width: width, // Ajuste para a largura da tela menos margens
        marginHorizontal: 0, // Adicionado margens
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});