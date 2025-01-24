package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.NotificationDTO;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.domain.UserEditDTO;
import com.busanit.myplannerbackend.entity.*;
import com.busanit.myplannerbackend.repository.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.util.Pair;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;
  private final FollowRepository followRepository;
  private final NotificationRepository notificationRepository;
  private final ApplicationEventPublisher eventPublisher;
  private final SimpMessagingTemplate messagingTemplate;  // WebSocket 의존성 추가
  private final ChatRoomRepository chatRoomRepository;

  private final List<Pair<String, String>> defaultCategoryList = List.of(
          Pair.of("약속", "#7EC1FF"),
          Pair.of("과제", "#F9AD47"),
          Pair.of("스터디", "#5ADCB3"),
          Pair.of("여행", "#FF898D")
  );
  private final CategoryRepository categoryRepository;

  public void save(User user) {
    userRepository.save(user);
  }

  @Transactional
  public void join(User user) {
    User savedUser = userRepository.save(user);
    for (Pair<String, String> data : defaultCategoryList) {
      Category category = Category.of(savedUser, data.getFirst(), data.getSecond());
      categoryRepository.save(category);
    }
  }


  public User findById(Long id) {
    return userRepository.findById(id).orElse(null);
  }

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

  public void saveUserProfile(UserEditDTO editDTO) {
    User user = userRepository.findById(editDTO.getId()).orElse(null);
    if (user == null) {
      return;
    }
    user.setEmail(editDTO.getEmail());
    user.setUsername(editDTO.getUsername());
    user.setPhone(editDTO.getPhone());
    user.setBio(editDTO.getBio());
    user.setProfileImageUrl(editDTO.getProfileImageUrl());
    
    save(user);

    // 해당 사용자가 참여한 모든 채팅방의 participants 정보 업데이트
    chatRoomRepository.findByParticipantsEmailContaining(user.getEmail())
            .map(chatRoom -> {
              chatRoom.updateParticipantInfo(user);
              return chatRoom;
            })
            .flatMap(chatRoomRepository::save)
            .subscribe();
  }

  public Slice<UserDTO> searchUser(Long userId, String searchText, Pageable pageable) {
    Slice<User> userSlice = userRepository.findByEmailOrUsernameAndIdNot( searchText, searchText, userId,  pageable);
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
    Slice<User> follows = followSlice.map(Follow::getFollowTo);
    return UserDTO.toDTO(follows);
  }

  @Transactional
  public void follow(Long userId, Long targetUserId) {
    User user = userRepository.findById(userId).orElse(null);
    User targetUser = userRepository.findById(targetUserId).orElse(null);
    if (user == null || targetUser == null) {
      return;
    }
    if (userId.equals(targetUserId)) {
      return;
    }
    Follow follow = new Follow();
    follow.setFollowTo(targetUser);
    follow.setFollowFrom(user);
    if (followRepository.findByFollowFromAndFollowTo(user, targetUser).isPresent()) {
      return;
    }
    followRepository.save(follow);

    //팔로우 시 notification 이벤트 발행 (follow객체에서 처리 -> NotificationListener에서 받음)
    follow.publishEvent(eventPublisher);
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

  //유저가 받은 알림 (일정 초대 제외) 불러오기
  public Slice<NotificationDTO> notifications(Long userId, Pageable pageable) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    Slice<Notification> notifications =  notificationRepository.findAllByUserAndTypeNotOrderByUpdatedAtDesc(user, Notification.NotiType.INVITE, pageable);
    return NotificationDTO.toDTO(notifications);
  }

  //유저가 받은 알림(일정 초대만) 불러오기
  public Slice<NotificationDTO> inviteNotis(Long userId, Pageable pageable) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    Slice<Notification> notis = notificationRepository.findAllByUserAndTypeOrderByUpdatedAtDesc(user, Notification.NotiType.INVITE, pageable);
    return NotificationDTO.toDTO(notis);
  }

  //읽지 않은 알림 수
  public Integer getUnreadCount(Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    return notificationRepository.countByUserAndIsRead(user, false);
  }

  //회원 탈퇴
  public void deleteUser(Long userId) throws FirebaseAuthException {
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    String firebaseUid = user.getFirebaseUid();
    FirebaseAuth.getInstance().deleteUser(firebaseUid);
    userRepository.deleteById(userId);
  }
}
