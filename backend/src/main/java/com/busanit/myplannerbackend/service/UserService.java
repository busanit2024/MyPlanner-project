package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;

  public boolean isUidExist(String uid) throws FirebaseAuthException {
    try {
      FirebaseAuth.getInstance().getUser(uid);
      return true;
    } catch (FirebaseAuthException e) {
      if (e.getErrorCode().equals("auth/user-not-found")) {
        return false;
      } else {
        throw e;
      }
    }
  }

  public boolean checkEmailExist(String email) {
    return userRepository.findByEmail(email).isPresent();
  }

  public void saveUser(User user) {
    userRepository.save(user);
  }
}
