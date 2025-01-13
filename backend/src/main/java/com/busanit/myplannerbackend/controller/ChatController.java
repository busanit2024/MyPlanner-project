package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.ChatRoomRequest;
import com.busanit.myplannerbackend.domain.Participant;
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

        return chatRoomService.findById(chatRoomId)
                .flatMap(chatRoom -> {
                    // 메시지 전송자가 채팅방 참여자인지 확인
                    boolean isParticipant = chatRoom.getParticipants().stream()
                            .anyMatch(p -> p.getEmail().equals(message.getSenderEmail()));

                    if (!isParticipant) {
                        return Mono.error(new RuntimeException("퇴장한 채팅방입니다."));
                    }

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
                });
    }

    //채팅방 이름 변경
    @PatchMapping("/rooms/{roomId}/title")
    public Mono<ChatRoom> updateChatRoomTitle(@PathVariable String roomId, @RequestBody ChatRoomRequest request) {
        return chatRoomService.updateChatRoomTitle(roomId, request.getChatroomTitle())
                .doOnSuccess(updatedRoom -> {
                    messagingTemplate.convertAndSend(
                            "/sub/chat/rooms/" + roomId + "/title",
                            updatedRoom
                    );
                });
    }

    //채팅방 나가기
    @PostMapping("/rooms/{roomId}/leave")
    public Mono<ChatRoom> leaveChatRoom(@PathVariable String roomId, @RequestBody Map<String, String> request) {
        String userEmail = request.get("userEmail");

        return chatRoomService.findById(roomId)
                .flatMap(chatRoom -> {
                    // 나가는 유저 정보 찾기
                    Participant leavingUser = chatRoom.getParticipants().stream()
                            .filter(p -> p.getEmail().equals(userEmail))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("User not found in chat room"));

                    // 시스템 메시지 생성
                    Message leaveMessage = Message.builder()
                            .chatRoomId(roomId)
                            .senderEmail("SYSTEM")
                            .contents(leavingUser.getUsername() + "님이 나갔습니다.")
                            .sendTime(LocalDateTime.now())
                            .messageType("LEAVE")
                            .build();

                    // 메시지 저장 후 WebSocket 전송
                    return messageService.saveMessage(leaveMessage)
                            .doOnSuccess(savedMessage ->
                                    messagingTemplate.convertAndSend("/sub/chat/rooms/" + roomId, savedMessage))
                            // 채팅방 나가기 처리
                            .then(chatRoomService.leaveChatRoom(roomId, userEmail))
                            .doOnSuccess(result -> {
                                if (result == null) {  // 채팅방이 삭제된 경우
                                    messagingTemplate.convertAndSend(
                                            "/sub/chat/rooms/" + roomId + "/delete",
                                            roomId
                                    );
                                }
                            });
                });
    }
}
