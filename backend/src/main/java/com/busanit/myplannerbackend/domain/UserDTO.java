package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.User;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Slice;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
  private Long id;

  private String email;

  private String username;
  private String bio;

  private User.Role role;
  private String profileImageUrl;

  public static UserDTO toDTO(User user) {
    UserDTOBuilder builder = UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .bio(user.getBio())
            .role(user.getRole())
            .profileImageUrl(user.getProfileImageUrl());

    return builder.build();
  }

  public static Slice<UserDTO> toDTO(Slice<User> slice) {
    return slice.map(UserDTO::toDTO);
    }

  }