package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.Participant;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.domain.MessageResponseDTO;
import com.busanit.myplannerbackend.service.ChatRoomService;
import com.busanit.myplannerbackend.service.MessageService;
import com.busanit.myplannerbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final UserService userService;
    private final MessageService messageService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatRoomService chatRoomService;

    // 채팅방 정보 조회
    @GetMapping("/api/chat/rooms/{roomId}")
    public ResponseEntity<ChatRoom> getChatRoom(@PathVariable String roomId) {
        ChatRoom chatRoom = chatRoomService.findById(roomId);
        return ResponseEntity.ok(chatRoom);
    }

    // 새로운 채팅방 생성
    @PostMapping("/api/chat/rooms")
    public ResponseEntity<ChatRoom> createChatRoom(
            @RequestBody Map<String, Object> request) {
        List<Participant> participants = ((List<String>) request.get("participants"))
                .stream()
                .map(email -> {
                    Participant participant = new Participant();
                    participant.setEmail(email);
                    participant.setStatus("ACTIVE");
                    return participant;
                })
                .collect(Collectors.toList());

        String title = (String) request.get("title");
        ChatRoom chatRoom = chatRoomService.createChatRoom(participants, title);
        return ResponseEntity.ok(chatRoom);
    }

    // 사용자의 모든 채팅방 조회
    @GetMapping("/api/chat/rooms")
    public ResponseEntity<List<ChatRoom>> getUserChatRooms(
            @RequestParam String userEmail) {
        List<ChatRoom> chatRooms = chatRoomService.findByParticipantEmail(userEmail);
        return ResponseEntity.ok(chatRooms);
    }

    // 채팅방 이전 메시지 조회
    @GetMapping("/api/chat/rooms/{chatRoomId}/messages")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable String chatRoomId){
        List<Message> messages = messageService.getChatHistory(chatRoomId);
        return ResponseEntity.ok(messages);
    }

    // 실시간 메시지 송수신
    @MessageMapping("/chat/rooms/{chatRoomId}/send")
    public void sendMessage(@DestinationVariable String chatRoomId,
                            @Payload Message message) {
        UserDTO sender = userService.findByEmail(message.getSenderEmail());
        if (sender == null) {
            return;
        }

        message.setSendTime(LocalDateTime.now());
        message.setChatRoomId(chatRoomId);
        message.setSenderEmail(sender.getEmail());

        Message savedMessage = messageService.saveMessage(message);

        MessageResponseDTO response = MessageResponseDTO.builder()
                .id(savedMessage.getId())
                .contents(savedMessage.getContents())
                .senderEmail(sender.getEmail())
                .senderName(sender.getUsername())
                .sendTime(savedMessage.getSendTime())
                .build();

        messagingTemplate.convertAndSend("/sub/chat/rooms/" + chatRoomId, response);
    }



}
