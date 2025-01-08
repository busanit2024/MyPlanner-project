package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.NotificationDTO;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.domain.UserEditDTO;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Follow;
import com.busanit.myplannerbackend.entity.Notification;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.ChatRoomRepository;
import com.busanit.myplannerbackend.repository.FollowRepository;
import com.busanit.myplannerbackend.repository.NotificationRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;
  private final FollowRepository followRepository;
  private final NotificationRepository notificationRepository;
  private final ApplicationEventPublisher eventPublisher;
  private final SimpMessagingTemplate messagingTemplate;  // WebSocket 의존성 추가
  private final ChatRoomRepository chatRoomRepository;

  public void save(User user) {
    userRepository.save(user);
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

    follow.publishEvent(eventPublisher);

//    Notification noti = Notification.of(targetUser, Notification.NotiType.FOLLOW, new Notification.NotiArgs(UserDTO.toDTO(user), userId));
//    notificationRepository.save(noti);

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

  public Slice<NotificationDTO> notifications(Long userId, Pageable pageable) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    Slice<Notification> notifications =  notificationRepository.findAllByUserAndTypeNotOrderByUpdatedAtDesc(user, Notification.NotiType.INVITE, pageable);
    return NotificationDTO.toDTO(notifications);
  }

  public Slice<NotificationDTO> inviteNotis(Long userId, Pageable pageable) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    Slice<Notification> notis = notificationRepository.findAllByUserAndTypeOrderByUpdatedAtDesc(user, Notification.NotiType.INVITE, pageable);
    return NotificationDTO.toDTO(notis);
  }

  public Integer getUnreadCount(Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return null;
    }
    return notificationRepository.countByUserAndIsRead(user, false);
  }
}
