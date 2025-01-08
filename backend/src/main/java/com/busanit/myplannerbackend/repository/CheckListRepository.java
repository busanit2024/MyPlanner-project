package com.busanit.myplannerbackend.repository;

import com.busanit.myplannerbackend.entity.CheckList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckListRepository extends JpaRepository<CheckList, Long> {

}
