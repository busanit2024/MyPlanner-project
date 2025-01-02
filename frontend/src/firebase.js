// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage(app);

const makeDataUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1, // 최대 파일 크기 (MB)
    maxWidthOrHeight: 1920, // 최대 너비 또는 높이
    useWebWorker: true, // 웹 워커 사용
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing file:', error);
    throw error;
  }
};

const getFilename = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return null;
  }
  const urlParts = fileUrl.split('/');
  const removeQuery = urlParts[urlParts.length - 1].split('?')[0];
  const filename = removeQuery.split('%2F')[1];
  console.log('filename:', filename);
  return filename;
}


const imageFileUpload = async (file) => {
  // 이미지 파일을 firebase storage에 업로드, {url, filename} 객체 형식으로 반환

  if (!file) {
    return null;
  }
  if (typeof file === 'string') {
    // 이미지 url이라면 url과 파일명을 반환
    const filename = await getFilename(file);
    return { url: file, filename: filename };
  }

  if (!(file instanceof File)) {
    console.error("The provided input is not a valid File object:", file);
    throw new Error("The provided input is not a valid File object");
  }

  const compressedFile = await compressImage(file);
  const fileExt = compressedFile.name.split('.').pop();
  const imageFile = await makeDataUrl(compressedFile);
  const uuid = uuidv4();
  const filename = `${uuid}.${fileExt}`;
  const storageRef = ref(storage, `images/${filename}`);
  try {
    const snapshot = await uploadString(storageRef, imageFile, 'data_url');
    const url = await getDownloadURL(snapshot.ref);
    return { url, filename };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

const deleteFile = async (fileUrl) => {
  //firebase storage url 받아서 버킷 파일 삭제
  if (!fileUrl || typeof fileUrl !== 'string') {
    return;
  }
  const filename = await getFilename(fileUrl);
  const storageRef = ref(storage, `images/${filename}`);
  try {
    await getDownloadURL(storageRef);
    await deleteObject(storageRef);
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.error('File not found');
      return;
    } else {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};



export { app as default, auth, storage, imageFileUpload, deleteFile };