package com.busanit.myplannerbackend.domain;

import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.Follow;
import com.busanit.myplannerbackend.entity.User;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Slice;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
  //유저 정보 출력용 DTO
  private Long id;

  private String email;

  private String username;
  private String bio;

  private User.Role role;
  private String profileImageUrl;

  private List<Long> followers;
  private List<Long> follows;
  private List<Category> categories;

  public static UserDTO toDTO(User user) {
    UserDTOBuilder builder = UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .bio(user.getBio())
            .role(user.getRole())
            .profileImageUrl(user.getProfileImageUrl());

    List<User> followers = user.getFollowers().stream().map(Follow::getFollowFrom).toList();
    List<Long> followerIds = followers.stream().map(User::getId).toList();
    List<User> follows = user.getFollows().stream().map(Follow::getFollowTo).toList();
    List<Long> followIds = follows.stream().map(User::getId).toList();

    builder.followers(followerIds);
    builder.follows(followIds);
    builder.categories(user.getCategories());

    return builder.build();
  }

  public static List<UserDTO> toDTO(List<User> users) {
    return users.stream().map(UserDTO::toDTO).collect(Collectors.toList());
  }

  public static Slice<UserDTO> toDTO(Slice<User> slice) {
    return slice.map(UserDTO::toDTO);
    }

  }