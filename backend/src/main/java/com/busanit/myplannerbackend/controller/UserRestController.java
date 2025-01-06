package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.NotificationDTO;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.domain.UserEditDTO;
import com.busanit.myplannerbackend.domain.UserJoinDTO;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.service.UserService;
import com.google.firebase.auth.FirebaseAuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserRestController {
  private final UserService userService;

  @GetMapping("/checkEmail")
  public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
    boolean response = userService.checkEmailExist(email);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/checkPhone")
  public ResponseEntity<Boolean> checkPhone(@RequestParam String phone) {
    boolean response = userService.checkPhoneExist(phone);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/findEmail")
  public ResponseEntity<String> findEmail(@RequestParam String phone) {
    String foundEmail = userService.findEmailByPhone(phone);
    if (foundEmail == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(foundEmail);
  }

  @GetMapping("/getEditInfo")
  public ResponseEntity<UserEditDTO> getUserEditInfo(@RequestParam Long userId) {
    User user = userService.findById(userId);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }
    UserEditDTO userEditDTO = UserEditDTO.toDTO(user);
    return ResponseEntity.ok(userEditDTO);
  }

  @PostMapping("/saveProfile")
  public ResponseEntity<String> saveProfile(@RequestBody UserEditDTO userEditDTO) {
    userService.saveUserProfile(userEditDTO);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/find")
  public ResponseEntity<UserDTO> getUser(@RequestHeader("Authorization") String authHeader) {
    String token = authHeader.replace("Bearer ", "");
    try {
      UserDTO user = userService.findByToken(token);
      if (user == null) {
        return ResponseEntity.notFound().build();
      }
      return ResponseEntity.ok(user);
    } catch (FirebaseAuthException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @PostMapping("/join")
  public ResponseEntity<String> joinUser(@RequestBody UserJoinDTO userJoinDTO) {
    userService.save(User.toEntity(userJoinDTO));
    return ResponseEntity.ok("가입 성공");
  }

  @GetMapping("/search")
  public Slice<UserDTO> searchUser(@RequestParam String searchText, @RequestParam Long userId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    return userService.searchUser(userId, searchText, pageable);
  }

  @GetMapping("/follower")
  public Slice<UserDTO> getFollower(@RequestParam Long userId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    return userService.getFollowers(userId, pageable);
  }

  @GetMapping("/following")
  public Slice<UserDTO> getFollowing(@RequestParam Long userId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    return userService.getFollowing(userId, pageable);
  }

  @GetMapping("/follow")
  public void follow(@RequestParam Long userId, @RequestParam Long targetUserId) {
    userService.follow(userId, targetUserId);
  }

  @GetMapping("/unfollow")
  public void unfollow(@RequestParam Long userId, @RequestParam Long targetUserId) {
    userService.unfollow(userId, targetUserId);
  }

  @GetMapping("/find/{email}")
  public ResponseEntity<?> findUserByEmail(@PathVariable String email) {
    // 사용자 정보 조회 로직
    return ResponseEntity.ok(userService.findByEmail(email));
  }

  @GetMapping("/notification")
  public ResponseEntity<Slice<NotificationDTO>> notification(@RequestParam Long userId, @RequestParam String type, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    Slice<NotificationDTO> notifications = switch (type) {
      case "invite" -> userService.inviteNotis(userId, pageable);
      case "noti" -> userService.notifications(userId, pageable);
      default -> null;
    };
    if (notifications == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(notifications);
  }
}
