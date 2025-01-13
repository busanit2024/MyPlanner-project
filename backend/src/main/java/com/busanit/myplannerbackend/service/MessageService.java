package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.entity.ReadStatus;
import com.busanit.myplannerbackend.repository.MessageRepository;
import com.busanit.myplannerbackend.repository.ReadStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ReadStatusRepository readStatusRepository;

    public Flux<Message> getChatHistory(String chatRoomId) {
        return messageRepository.findByChatRoomIdOrderBySendTimeAsc(chatRoomId);
    }

    public Mono<Message> saveMessage(Message message) {
        return messageRepository.save(message);
    }

    // 안 읽은 메시지 수
    public Mono<Long> getUnreadMessageCount(String roomId, String userEmail) {
        return readStatusRepository.findByUserEmailAndChatRoomId(userEmail, roomId)
                .flatMap(readStatus -> {
                    String lastReadMessageId = readStatus.getLastChatLogId();
                    return messageRepository.countByChatRoomIdAndIdAfter(roomId, lastReadMessageId);
                })
                .defaultIfEmpty(0L);
    }

    // 읽음 처리
    public Mono<Void> markAsRead(String roomId, String userEmail, String messageId) {
        return readStatusRepository.findByUserEmailAndChatRoomId(userEmail, roomId)
                .flatMap(readStatus -> {
                    readStatus.setLastChatLogId(messageId);
                    readStatus.setUpdatedAt(LocalDateTime.now());
                    return readStatusRepository.save(readStatus);
                })
                .switchIfEmpty(
                        readStatusRepository.save(ReadStatus.builder()
                                .userEmail(userEmail)
                                .chatRoomId(roomId)
                                .lastChatLogId(messageId)
                                .updatedAt(LocalDateTime.now())
                                .isLeave(false)
                                .build())
                )
                .then();
    }

    // preSend용 2개 파라미터 오버로드 메서드 추가
    public Mono<Void> markAsRead(String roomId, String userEmail) {
        return messageRepository.findFirstByChatRoomIdOrderBySendTimeDesc(roomId)
                .flatMap(lastMessage -> markAsRead(roomId, userEmail, lastMessage.getId()))
                .switchIfEmpty(
                        readStatusRepository.save(ReadStatus.builder()
                                        .userEmail(userEmail)
                                        .chatRoomId(roomId)
                                        .updatedAt(LocalDateTime.now())
                                        .isLeave(false)
                                        .build())
                                .then()
                );
    }

    public Mono<Void> handleLeaveStatus(String roomId, String userEmail) {
        return readStatusRepository.findByUserEmailAndChatRoomId(userEmail, roomId)
                .flatMap(readStatus -> {
                    readStatus.setLeave(true);
                    readStatus.setUpdatedAt(LocalDateTime.now());
                    return readStatusRepository.save(readStatus);
                })
                .then();
    }
}