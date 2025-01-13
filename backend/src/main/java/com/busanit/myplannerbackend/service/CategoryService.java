package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.Category;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.CategoryRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Category findById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public List<Category> findByUser(User user) {
        return categoryRepository.findByUser(user);
    }

    //카테고리 리스트 받아와서 없는 건 삭제, 추가, 변경사항업데이트
    @Transactional
    public void updateCategoryList(List<Category> categoryList, Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }
        List<Category> previousCategoryList = categoryRepository.findByUser(user);

        Map<Long, Category> previousCategoryMap = previousCategoryList.stream()
                .collect(Collectors.toMap(Category::getId, Function.identity()));

        for (Category category : categoryList) {
            if (previousCategoryMap.containsKey(category.getId())) {
                Category oldCategory = previousCategoryMap.get(category.getId());
                oldCategory.setCategoryName(category.getCategoryName());
                oldCategory.setColor(category.getColor());
                categoryRepository.save(oldCategory);
            } else {
                category.setUser(user);
                categoryRepository.save(category);
            }
            previousCategoryMap.remove(category.getId());
        }

      categoryRepository.deleteAll(previousCategoryMap.values());
    }
}
