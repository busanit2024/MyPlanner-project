package com.busanit.myplannerbackend.entity;


import com.busanit.myplannerbackend.domain.UserEditDTO;
import com.busanit.myplannerbackend.domain.UserJoinDTO;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
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

  @Column(unique = true, nullable = false)
  private String phone;

  @CreationTimestamp
  private LocalDateTime regDate;

  @Enumerated(EnumType.STRING)
  private Role role;
  private String profileImageUrl;


  public enum Role {
    ADMIN, USER
  }

  @OneToMany(mappedBy = "followFrom", fetch = FetchType.EAGER)
  private List<Follow> follows;

  @OneToMany(mappedBy = "followTo", fetch = FetchType.EAGER)
  private List<Follow> followers;

  @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
  private List<Category> categories;

  public static User toEntity(UserJoinDTO dto) {
    UserBuilder builder = User.builder()
            .firebaseUid(dto.getFirebaseUid())
            .email(dto.getEmail())
            .username(dto.getUsername())
            .bio(dto.getBio())
            .phone(dto.getPhone())
            .role(dto.getRole())
            .profileImageUrl(dto.getProfileImageUrl());

    return builder.build();
  }

  public static User toEntity(UserEditDTO dto) {
    UserBuilder builder = User.builder()
            .id(dto.getId())
            .email(dto.getEmail())
            .username(dto.getUsername())
            .bio(dto.getBio())
            .phone(dto.getPhone())
            .role(dto.getRole())
            .profileImageUrl(dto.getProfileImageUrl());

    return builder.build();
  }
}
