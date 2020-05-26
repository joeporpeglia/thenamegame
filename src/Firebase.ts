import * as firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeYoPqGGSk5eJz6nph9LWg2q7J1ss5BJ8",
  authDomain: "banter-32029.firebaseapp.com",
  databaseURL: "https://banter-32029.firebaseio.com",
  projectId: "banter-32029",
  storageBucket: "banter-32029.appspot.com",
  messagingSenderId: "35956378478",
  appId: "1:35956378478:web:7644b016eabb7d13638f7f",
};

firebase.initializeApp(firebaseConfig);

export { firebase };
