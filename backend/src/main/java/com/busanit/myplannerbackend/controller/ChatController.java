package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.ChatRoomRequest;
import com.busanit.myplannerbackend.domain.Participant;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.domain.MessageResponseDTO;
import com.busanit.myplannerbackend.service.ChatRoomService;
import com.busanit.myplannerbackend.service.MessageService;
import com.busanit.myplannerbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    private final UserService userService;
    private final MessageService messageService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatRoomService chatRoomService;

    // 채팅방 정보 조회
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoom> getChatRoom(@PathVariable String roomId) {
        ChatRoom chatRoom = chatRoomService.findById(roomId);
        return ResponseEntity.ok(chatRoom);
    }

    // 새로운 채팅방 생성
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createChatRoom(@RequestBody ChatRoomRequest request) {
        ChatRoom chatRoom = chatRoomService.createChatRoom(request);
        return ResponseEntity.ok(chatRoom);
    }

    // 사용자의 모든 채팅방 조회
    @GetMapping("/rooms/user/{email}")
    public ResponseEntity<List<ChatRoom>> getUserChatRooms(@PathVariable String email) {
        List<ChatRoom> chatRooms = chatRoomService.findByParticipantEmail(email);
        return ResponseEntity.ok(chatRooms);
    }

    // 채팅방 이전 메시지 조회
    @GetMapping("/rooms/{chatRoomId}/messages")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable String chatRoomId){
        List<Message> messages = messageService.getChatHistory(chatRoomId);
        return ResponseEntity.ok(messages);
    }

    // 실시간 메시지 송수신
    @MessageMapping("/chat/rooms/{chatRoomId}/send")
    public void sendMessage(@DestinationVariable String chatRoomId,
                            @Payload Message message) {
        try {
            // 기본적인 메시지 정보만 설정
            message.setSendTime(LocalDateTime.now());
            message.setChatRoomId(chatRoomId);

            // 메시지 저장
            Message savedMessage = messageService.saveMessage(message);

            // 응답 생성 (최소한의 정보만 포함)
            MessageResponseDTO response = MessageResponseDTO.builder()
                    .id(savedMessage.getId())
                    .contents(savedMessage.getContents())
                    .senderEmail(message.getSenderEmail())  // 원본 이메일 사용
                    .sendTime(savedMessage.getSendTime())
                    .build();

            // 메시지 전송
            messagingTemplate.convertAndSend("/sub/chat/rooms/" + chatRoomId, response);

        } catch (Exception e) {
            log.error("메시지 처리 중 오류: {}", e.getMessage());
        }
    }



}
