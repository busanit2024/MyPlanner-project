package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRoomService chatRoomService;

    @Transactional
    public Message saveMessage(Message message) {
        log.info("메시지 저장 시작:{}", message);

        try {
            // 메시지 저장
            Message savedMessage = messageRepository.save(message);
            log.info("메시지 저장 완료:{}", savedMessage);

            // 채팅방 찾기
            ChatRoom chatRoom = chatRoomService.findById(message.getChatRoomId());
            log.info("채팅방 조회: {}", chatRoom);

            // 채팅방의 마지막 메시지 정보 업데이트
//            chatRoom.setLastMessage(message.getContents());
//            chatRoom.setLastMessageAt(message.getSendTime());
//            chatRoomService.save(chatRoom);
            chatRoomService.updateLastMessage(
                    message.getChatRoomId(),
                    message.getContents(),
                    message.getSendTime()
            );

            log.info("채팅방 업데이트 완료: roomId={}, lastMessage={}",
                    chatRoom.getId(), chatRoom.getLastMessage());

            return savedMessage;

        } catch (Exception e) {
            log.error("메시지 저장 중 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Message> getChatHistory(String chatRoomId) {
        log.info("채팅 이력 조회 시작: roomId={}", chatRoomId);

        List<Message> messages = messageRepository.findByChatRoomIdOrderBySendTimeAsc(chatRoomId);

        log.info("채팅 이력 조회 완료: {} 개의 메시지", messages.size());
        return messages;
    }
}