// ImagePickerBottomSheet.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheet } from 'react-native-btr';
import * as ImagePicker from 'expo-image-picker';

const ImagePickerBottomSheet = ({ isVisible, onClose, onSelectImage }) => {
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      onSelectImage(result.uri);
    }

    onClose();
  };

  return (
    <BottomSheet
      visible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.bottomNavigationView}>
        <TouchableOpacity onPress={handleImagePick}>
          <Text style={styles.itemText}>Escolher imagem</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomNavigationView: {
    backgroundColor: '#fff',
    padding: 16,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
  },
});

export default ImagePickerBottomSheet;