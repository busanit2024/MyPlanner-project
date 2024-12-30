package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;

  public UserDTO findByEmail(String email) {
    User user = userRepository.findByEmail(email).orElse(null);
    if (user == null) {
      return null;
    }
    return UserDTO.toDTO(user);
  }

  public UserDTO findById(Long id) {
    return userRepository.findById(id).map(UserDTO::toDTO).orElse(null);
  }

  public UserDTO findByToken(String token) throws FirebaseAuthException {
    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
    String uid = decodedToken.getUid();
    User user = userRepository.findByFirebaseUid(uid).orElse(null);
    if (user == null) {
      return null;
    }
    return UserDTO.toDTO(user);
  }

  public boolean checkEmailExist(String email) {
    return userRepository.findByEmail(email).isPresent();
  }

  public void saveUser(User user) {
    userRepository.save(user);
  }
}
