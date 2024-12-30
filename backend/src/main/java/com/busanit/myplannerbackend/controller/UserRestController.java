package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.domain.UserJoinDTO;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.service.UserService;
import com.google.firebase.auth.FirebaseAuthException;
import lombok.RequiredArgsConstructor;
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
    userService.saveUser(User.toEntity(userJoinDTO));
    return ResponseEntity.ok("가입 성공");
  }
}
