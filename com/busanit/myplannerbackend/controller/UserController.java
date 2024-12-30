package com.busanit.myplannerbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @GetMapping("/find")
    public ResponseEntity<UserDTO> findUser(@RequestHeader("Authorization") String token) {
        // ...
    }
} 