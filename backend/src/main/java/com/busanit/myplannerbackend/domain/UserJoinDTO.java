package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Category;
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
  //회원가입용 DTO (Id 제외한 모든 정보 있음)

  private String firebaseUid;

  @NotEmpty(message = "이메일을 입력하세요.")
  private String email;

  private String username;
  private String bio;
  private String phone;

  private User.Role role;
  private String profileImageUrl;
  private List<Category> categories;

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
