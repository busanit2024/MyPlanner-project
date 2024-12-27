package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.User;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserJoinDTO {

  private String firebaseUid;

  @NotEmpty(message = "이메일을 입력하세요.")
  private String email;

  private String username;
  private String bio;
  private String phone;

  private User.Role role;
  private String profileImageUrl;

  public static UserJoinDTO toDTO(User user) {
    UserJoinDTOBuilder builder = UserJoinDTO.builder()
            .firebaseUid(user.getFirebaseUid())
            .email(user.getEmail())
            .username(user.getUsername())
            .bio(user.getBio())
            .phone(user.getPhone())
            .role(user.getRole())
            .profileImageUrl(user.getProfileImageUrl());

    return builder.build();
  }

  public static List<UserJoinDTO> toDTO(List<User> users) {
    return users.stream().map(UserJoinDTO::toDTO).collect(Collectors.toList());
  }
}
