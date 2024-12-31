package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  Optional<User> findByFirebaseUid(String firebaseUid);
  Optional<User> findByPhone(String phone);

  @Query("select u from User u where (u.email LIKE %:email% OR u.username LIKE %:username%) and u.id != :id")
  Slice<User> findByEmailOrUsernameAndIdNot(@Param("email") String email, String username, @Param("id") Long id, Pageable pageable);

}
