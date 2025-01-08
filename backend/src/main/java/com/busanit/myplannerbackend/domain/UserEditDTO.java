package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserEditDTO {
  //유저 프로필 편집용 DTO
  private Long id;

  private String email;
  private String phone;
  private String username;
  private String bio;

  private User.Role role;
  private String profileImageUrl;

  public static UserEditDTO toDTO(User user) {
    UserEditDTOBuilder builder = UserEditDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .phone(user.getPhone())
            .username(user.getUsername())
            .bio(user.getBio())
            .role(user.getRole())
            .profileImageUrl(user.getProfileImageUrl());

    return builder.build();
  }
}
