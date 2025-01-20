package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.NotificationDTO;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.domain.UserEditDTO;
import com.busanit.myplannerbackend.domain.UserJoinDTO;
import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.service.CategoryService;
import com.busanit.myplannerbackend.service.UserService;
import com.google.firebase.auth.FirebaseAuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserRestController {
  private final UserService userService;
  private final CategoryService categoryService;

  @GetMapping("/{userId}")
  public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
    User user = userService.findById(userId);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(UserDTO.toDTO(user));
  }

  //이메일 중복 체크
  @GetMapping("/checkEmail")
  public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
    boolean response = userService.checkEmailExist(email);
    return ResponseEntity.ok(response);
  }

  //전화번호 중복 체크
  @GetMapping("/checkPhone")
  public ResponseEntity<Boolean> checkPhone(@RequestParam String phone) {
    boolean response = userService.checkPhoneExist(phone);
    return ResponseEntity.ok(response);
  }

  //전화번호로 이메일 찾기
  @GetMapping("/findEmail")
  public ResponseEntity<String> findEmail(@RequestParam String phone) {
    String foundEmail = userService.findEmailByPhone(phone);
    if (foundEmail == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(foundEmail);
  }

  //프로필 수정용 DTO 가져오기
  @GetMapping("/getEditInfo")
  public ResponseEntity<UserEditDTO> getUserEditInfo(@RequestParam Long userId) {
    User user = userService.findById(userId);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }
    UserEditDTO userEditDTO = UserEditDTO.toDTO(user);
    return ResponseEntity.ok(userEditDTO);
  }

  //프로필 수정
  @PostMapping("/saveProfile")
  public ResponseEntity<String> saveProfile(@RequestBody UserEditDTO userEditDTO) {
    userService.saveUserProfile(userEditDTO);
    return ResponseEntity.ok().build();
  }

  //카테고리 업데이트
  @PostMapping("/updateCategory")
  public ResponseEntity<String> updateCategory(@RequestBody List<Category> categoryList, @RequestParam Long userId) {
    categoryService.updateCategoryList(categoryList, userId);
    return ResponseEntity.ok().build();
  }

  //토큰으로 유저 찾기
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

  //회원가입
  @PostMapping("/join")
  public ResponseEntity<String> joinUser(@RequestBody UserJoinDTO userJoinDTO) {
    userService.join(User.toEntity(userJoinDTO));
    return ResponseEntity.ok("가입 성공");
  }

  //닉네임,이메일로 유저 검색
  @GetMapping("/search")
  public Slice<UserDTO> searchUser(@RequestParam String searchText, @RequestParam Long userId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    return userService.searchUser(userId, searchText, pageable);
  }

  //나를 팔로우하는 유저 목록
  @GetMapping("/follower")
  public Slice<UserDTO> getFollower(@RequestParam Long userId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    return userService.getFollowers(userId, pageable);
  }

  //내가 팔로우하는 유저 목록
  @GetMapping("/following")
  public Slice<UserDTO> getFollowing(@RequestParam Long userId, @RequestParam int page, @RequestParam int size) {
    Pageable pageable = PageRequest.of(page, size);
    return userService.getFollowing(userId, pageable);
  }

  //팔로우하기
  @GetMapping("/follow")
  public void follow(@RequestParam Long userId, @RequestParam Long targetUserId) {
    userService.follow(userId, targetUserId);
  }

  //언팔로우하기
  @GetMapping("/unfollow")
  public void unfollow(@RequestParam Long userId, @RequestParam Long targetUserId) {
    userService.unfollow(userId, targetUserId);
  }

  //이메일로 유저 조회
  @GetMapping("/find/{email}")
  public ResponseEntity<?> findUserByEmail(@PathVariable String email) {
    // 사용자 정보 조회 로직
    return ResponseEntity.ok(userService.findByEmail(email));
  }

  //유저가 받은 알림 리스트
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

  //회원 탈퇴
  @DeleteMapping("/delete/{userId}")
  public ResponseEntity<String> deleteUser(@PathVariable Long userId) throws FirebaseAuthException {
    userService.deleteUser(userId);
    return ResponseEntity.ok("success");
  }

}
