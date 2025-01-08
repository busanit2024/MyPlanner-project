package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.CheckListDTO;
import com.busanit.myplannerbackend.entity.CheckList;
import com.busanit.myplannerbackend.entity.Schedule;
import com.busanit.myplannerbackend.repository.CheckListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckListService {

    private final CheckListRepository checkListRepository;

    public void saveCheckList(List<CheckListDTO> checkList, Schedule schedule) {
        for (CheckListDTO checkListDTO : checkList) {
            CheckList checkList_entity = new CheckList();
            checkList_entity.setContent(checkListDTO.getContent());
            checkList_entity.setIsDone(checkListDTO.getIsDone());
            checkList_entity.setSchedule(schedule);
            checkListRepository.save(checkList_entity);
        }
    }
}
