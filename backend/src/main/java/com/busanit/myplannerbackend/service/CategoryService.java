package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category findById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }
}
