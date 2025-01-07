package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.ChatRoomRequest;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.domain.MessageResponseDTO;
import com.busanit.myplannerbackend.service.ChatRoomService;
import com.busanit.myplannerbackend.service.MessageService;
import com.busanit.myplannerbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final UserService userService;
    private final MessageService messageService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatRoomService chatRoomService;

    @GetMapping("/rooms/{roomId}")
    public Mono<ChatRoom> getChatRoom(@PathVariable String roomId) {
        return chatRoomService.findById(roomId);
    }

    @PostMapping("/rooms")
    public Mono<ChatRoom> createChatRoom(@RequestBody ChatRoomRequest request) {
        return chatRoomService.createChatRoom(request);
    }

    @GetMapping("/rooms/user/{email}")
    public Flux<ChatRoom> getUserChatRooms(@PathVariable String email) {
        return chatRoomService.findByParticipantEmail(email);
    }

    @GetMapping("/rooms/{chatRoomId}/messages")
    public Flux<Message> getChatHistory(@PathVariable String chatRoomId) {
        return messageService.getChatHistory(chatRoomId);
    }

    @MessageMapping("/chat/rooms/{chatRoomId}/send")
    public Mono<Void> sendMessage(@DestinationVariable String chatRoomId,
                                  @Payload Message message) {
        message.setSendTime(LocalDateTime.now());
        message.setChatRoomId(chatRoomId);

        return messageService.saveMessage(message)
                .map(savedMessage -> MessageResponseDTO.builder()
                        .id(savedMessage.getId())
                        .contents(savedMessage.getContents())
                        .senderEmail(message.getSenderEmail())
                        .sendTime(savedMessage.getSendTime())
                        .build())
                .doOnNext(response ->
                        messagingTemplate.convertAndSend("/sub/chat/rooms/" + chatRoomId, response))
                .then();
    }

    @PostMapping("/rooms/{roomId}/leave")
    public Mono<ChatRoom> leaveChatRoom(@PathVariable String roomId, @RequestBody Map<String, String> request) {
        String userEmail = request.get("userEmail");
        return chatRoomService.leaveChatRoom(roomId, userEmail);
    }
}
