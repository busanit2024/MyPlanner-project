package com.busanit.myplannerbackend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

  @PostConstruct
  public void initializeFirebase() throws IOException {
    if (FirebaseApp.getApps().isEmpty()) {
      FileInputStream serviceAccount = new FileInputStream("src/main/resources/serviceAccountKey.json");
      FirebaseOptions options = new FirebaseOptions.Builder()
              .setCredentials(GoogleCredentials.fromStream(serviceAccount))
              .build();
      FirebaseApp.initializeApp(options);
    }
  }
}