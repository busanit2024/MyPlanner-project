package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.Follow;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.FollowRepository;
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
  private final FollowRepository followRepository;

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

  public Slice<UserDTO> getFollowers(Long userId, Pageable pageable) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    Slice<Follow> followSlice = followRepository.findFollowFromByFollowTo(user, pageable);
    Slice<User> followers = followSlice.map(Follow::getFollowFrom);
    return UserDTO.toDTO(followers);
  }

  public Slice<UserDTO> getFollowing(Long userId, Pageable pageable) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    Slice<Follow> followSlice = followRepository.findFollowToByFollowFrom(user, pageable);
    Slice<User> followers = followSlice.map(Follow::getFollowTo);
    return UserDTO.toDTO(followers);
  }

  public void follow(Long userId, Long targetUserId) {
    User user = userRepository.findById(userId).orElse(null);
    User targetUser = userRepository.findById(targetUserId).orElse(null);
    if (user == null || targetUser == null) {
      return;
    }
    Follow follow = new Follow();
    follow.setFollowTo(targetUser);
    follow.setFollowFrom(user);
    if (followRepository.findByFollowFromAndFollowTo(user, targetUser).isPresent()) {
      return;
    }
    followRepository.save(follow);
  }

  public void unfollow(Long userId, Long targetUserId) {
    User user = userRepository.findById(userId).orElse(null);
    User targetUser = userRepository.findById(targetUserId).orElse(null);
    if (user == null || targetUser == null) {
      return;
    }
    Follow follow = followRepository.findByFollowFromAndFollowTo(user, targetUser).orElse(null);
    if (follow == null) {
      return;
    }
    followRepository.delete(follow);
  }
}
