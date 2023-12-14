// App.js

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { UploadMediaFile} from './src';

export default function App() {
  return (
    <View style={styles.container}>
      <UploadMediaFile></UploadMediaFile>
      <StatusBar style="auto" />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});