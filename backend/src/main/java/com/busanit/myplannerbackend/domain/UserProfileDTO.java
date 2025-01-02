package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {
  private Long id;

  private String email;

  private String username;
  private String bio;

  private User.Role role;
  private String profileImageUrl;


  public static UserProfileDTO toDTO(User user) {
    UserProfileDTOBuilder builder = UserProfileDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .bio(user.getBio())
            .role(user.getRole())
            .profileImageUrl(user.getProfileImageUrl());

    return builder.build();
  }
}