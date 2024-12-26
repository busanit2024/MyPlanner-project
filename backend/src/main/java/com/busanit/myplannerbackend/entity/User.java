package com.busanit.myplannerbackend.entity;


import com.busanit.myplannerbackend.domain.UserDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String firebaseUid;

  @Column(unique = true, nullable = false)
  private String email;

  private String username;
  private String bio;

  @CreationTimestamp
  private LocalDateTime regDate;
  private Role role;
  private String profileImageUrl;

  public enum Role {
    ADMIN, USER
  }

  public static User toEntity(UserDTO dto) {
    UserBuilder builder = User.builder()
            .firebaseUid(dto.getFirebaseUid())
            .email(dto.getEmail())
            .username(dto.getUsername())
            .bio(dto.getBio())
            .role(dto.getRole())
            .profileImageUrl(dto.getProfileImageUrl());

    return builder.build();
  }

}
