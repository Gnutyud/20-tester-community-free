import { initializeApp } from "firebase/app";
import { ref as firebaseRef, getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "tester-community.firebaseapp.com",
  projectId: "tester-community",
  storageBucket: "tester-community.appspot.com",
  messagingSenderId: "812247265532",
  appId: "1:812247265532:web:854ee6c93381e569516779",
  measurementId: "G-47EP65JZG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const uploadFileToFirebase = async (file: File) => {
  return new Promise(function (resolve, reject) {
    const storage = getStorage(app);
    const name = new Date().getTime() + "-" + file.name;
    const storageRef = firebaseRef(storage, name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      function error(err) {
        console.log("error", err);
        reject();
      },
      function complete() {
        getDownloadURL(uploadTask.snapshot.ref).then(function (downloadURL) {
          resolve(downloadURL);
        });
      }
    );
  });
};
