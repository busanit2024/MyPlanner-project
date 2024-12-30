package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.MessageResponseDTO;
import com.busanit.myplannerbackend.domain.UserDTO;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.service.MessageService;
import com.busanit.myplannerbackend.service.UserService;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final UserService userService;
    private final MessageService messageService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatRoomService chatRoomService;

    @GetMapping("/api/chat/rooms/{chatRoomId}/messages")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable String chatRoomId){
        List<Message> messages = messageService.getChatHistory(chatRoomId);
        return ResponseEntity.ok(messages);
    }

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
                .senderName(sender.getName())
                .sendTime(savedMessage.getSendTime())
                .build();

        messagingTemplate.convertAndSend("/sub/chat/rooms/" + chatRoomId, response);
    }

    @PostMapping("/api/chat/rooms")
    public ResponseEntity<ChatRoom> createChatRoom(
            @RequestParam String senderId,
            @RequestParam String receiverId) {
        ChatRoom chatRoom = chatRoomService.createChatRoom(senderId, receiverId);
        return ResponseEntity.ok(chatRoom);
    }

    @GetMapping("/api/chat/rooms")
    public ResponseEntity<List<ChatRoom>> getUserChatRooms(
            @RequestParam String userId) {
        List<ChatRoom> chatRooms = chatRoomService.getUserChatRooms(userId);
        return ResponseEntity.ok(chatRooms);
    }
} 