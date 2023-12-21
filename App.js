// App.js

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import UploadMediaFile from './src/index';

export default function App() {
  return (
    // Renderiza o componente UploadMediaFile ao iniciar o aplicativo
    <UploadMediaFile/>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
