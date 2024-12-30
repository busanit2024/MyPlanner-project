package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  Optional<User> findByFirebaseUid(String firebaseUid);
}