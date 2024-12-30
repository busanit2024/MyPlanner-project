package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
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

  public UserDTO findByToken(String token) throws FirebaseAuthException {
    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
    String uid = decodedToken.getUid();
    User user = userRepository.findByFirebaseUid(uid).orElse(null);
    if (user == null) {
      return null;
    }
    return UserDTO.toDTO(user);
  }

  public String findEmailByPhone(String phone) {
    User user = userRepository.findByPhone(phone).orElse(null);
    if (user == null) {
      return null;
    }
    return user.getEmail();
  }

  public boolean checkEmailExist(String email) {
    return userRepository.findByEmail(email).isPresent();
  }

  public boolean checkPhoneExist(String phone) {
    return userRepository.findByPhone(phone).isPresent();
  }

  public void saveUser(User user) {
    userRepository.save(user);
  }

  public Slice<UserDTO> searchUser(String searchText, Pageable pageable) {
    Slice<User> userSlice = userRepository.findByEmailContainingOrUsernameContaining(searchText, searchText, pageable);
    return UserDTO.toDTO(userSlice);
  }
}
