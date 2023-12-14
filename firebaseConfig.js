// Configuração do Firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDHze7QFr0sG6GByNWYEWdGZrpF9WKr2nw",
  authDomain: "imageupload-91c1f.firebaseapp.com",
  projectId: "imageupload-91c1f",
  storageBucket: "imageupload-91c1f.appspot.com",
  messagingSenderId: "1049901624854",
  appId: "1:1049901624854:web:d0915bfe3738b803b84f37"
}

// Inicializa o Firebase se ainda não estiver inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Função para obter URLs de imagens do Firebase Storage
const getStorageImages = async () => {
    try {
        const storageRef = firebase.storage().ref();
        const listResult = await storageRef.listAll();

        const imageUrls = await Promise.all(
            listResult.items.map(async (item) => {
                const url = await item.getDownloadURL();
                return url;
            })
        );

        return imageUrls;
    } catch (error) {
        console.error('Error fetching storage images:', error);
        throw error;
    }
};

export { firebase, getStorageImages };