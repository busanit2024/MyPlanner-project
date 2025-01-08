package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.CheckList;
import com.busanit.myplannerbackend.repository.CheckListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckListService {

    private final CheckListRepository checkListRepository;

    public void saveCheckList(List<CheckList> checkList) {
        for (CheckList check : checkList) {
            checkListRepository.save(check);
        }
    }
}
