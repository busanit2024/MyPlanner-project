package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.service.UserService;
import lombok.Generated;
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

  @PostMapping("/join")
  public ResponseEntity<String> joinUser(@RequestBody UserDTO userDTO) {
    userService.saveUser(User.toEntity(userDTO));
    return ResponseEntity.ok("가입 성공");
  }
}
