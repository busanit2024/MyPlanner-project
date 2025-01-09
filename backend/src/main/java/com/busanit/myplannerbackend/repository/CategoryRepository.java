package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

  List<Category> findByUser(User user);

}
