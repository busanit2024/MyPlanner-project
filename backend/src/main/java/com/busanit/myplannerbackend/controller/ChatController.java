package com.busanit.myplannerbackend.controller;

import com.busanit.myplannerbackend.domain.ChatRoomRequest;
import com.busanit.myplannerbackend.domain.Participant;
import com.busanit.myplannerbackend.domain.ReadStatusDTO;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.domain.MessageResponseDTO;
import com.busanit.myplannerbackend.service.ChatRoomService;
import com.busanit.myplannerbackend.service.MessageService;
import com.busanit.myplannerbackend.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.AbstractMap;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final UserService userService;
    private final MessageService messageService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatRoomService chatRoomService;

    // 채팅방 목록 불러오기
    @GetMapping("/rooms/{roomId}")
    public Mono<ChatRoom> getChatRoom(@PathVariable String roomId) {
        return chatRoomService.findById(roomId);
    }

    //채팅방 만들기
    @PostMapping("/rooms")
    public Mono<ChatRoom> createChatRoom(@RequestBody ChatRoomRequest request) {
        return chatRoomService.createChatRoom(request);
    }

    // 참여자 정보 불러오기
    @GetMapping("/rooms/user/{email}")
    public Flux<ChatRoom> getUserChatRooms(@PathVariable String email) {
        return chatRoomService.findByParticipantEmail(email);
    }

    // 채팅 내역 불러오기
    @GetMapping("/rooms/{chatRoomId}/messages")
    public Flux<Message> getChatHistory(@PathVariable String chatRoomId) {
        return messageService.getChatHistory(chatRoomId);
    }

    // 채팅 보내기
    @MessageMapping("/chat/rooms/{chatRoomId}/send")
    public Mono<Void> sendMessage(@DestinationVariable String chatRoomId,
                                  @Payload Message message) {
        message.setSendTime(LocalDateTime.now());
        message.setChatRoomId(chatRoomId);

        return chatRoomService.findById(chatRoomId)
                .flatMap(chatRoom -> {
                    boolean isParticipant = chatRoom.getParticipants().stream()
                            .anyMatch(p -> p.getEmail().equals(message.getSenderEmail()));

                    if (!isParticipant) {
                        return Mono.error(new RuntimeException("퇴장한 채팅방입니다."));
                    }

                    // 메시지 내용이 JSON 형식인지 확인
                    String contents = message.getContents();
                    try {
                        // JSON 파싱 시도
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode jsonNode = mapper.readTree(contents);

                        // 일정 메시지인 경우
                        if (jsonNode.has("type") && "SCHEDULE".equals(jsonNode.get("type").asText())) {
                            message.setMessageType("SCHEDULE");
                        }
                    } catch (JsonProcessingException e) {
                        // JSON이 아닌 경우 일반 텍스트 메시지로 처리
                        message.setMessageType("TEXT");
                    }

                    return messageService.saveMessage(message)
                            .doOnSuccess(savedMessage -> {
                                // 채팅방 정보 업데이트
                                chatRoom.setLastMessage(message.getContents());
                                chatRoom.setLastMessageAt(message.getSendTime());
                                chatRoomService.save(chatRoom).subscribe();

                                // 메시지 전송
                                MessageResponseDTO response = MessageResponseDTO.builder()
                                        .id(savedMessage.getId())
                                        .contents(savedMessage.getContents())
                                        .senderEmail(message.getSenderEmail())
                                        .sendTime(savedMessage.getSendTime())
                                        .messageType(savedMessage.getMessageType()) // messageType 추가
                                        .build();
                                messagingTemplate.convertAndSend("/sub/chat/rooms/" + chatRoomId, response);

                                // ... existing code for unread counts ...
                            })
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

    // 읽지 않은 메시지 수
    @GetMapping("/rooms/unread/{email}")
    public Mono<Map<String, Long>> getUnreadCounts(@PathVariable String email) {
        return chatRoomService.findByParticipantEmail(email)
                .flatMap(chatRoom -> messageService.getUnreadMessageCount(chatRoom.getId(), email)
                        .map(unreadCount -> new AbstractMap.SimpleEntry<>(chatRoom.getId(), unreadCount)))
                .collectMap(Map.Entry::getKey, Map.Entry::getValue);
    }

    // 마지막으로 읽은 메시지 변경
    @PostMapping("/rooms/{roomId}/read-status")
    public Mono<Void> updateReadStatus(
            @PathVariable String roomId,
            @RequestBody ReadStatusDTO readStatusDTO) {
        return messageService.markAsRead(
                roomId,
                readStatusDTO.getUserEmail(),
                readStatusDTO.getLastChatLogId()
        ).doOnSuccess(v -> {
            // 읽음 상태 업데이트 후 해당 사용자의 읽지 않은 메시지 수 전송
            getUnreadCounts(readStatusDTO.getUserEmail())
                    .subscribe(unreadCounts -> {
                        messagingTemplate.convertAndSend(
                                "/sub/chat/unread/" + readStatusDTO.getUserEmail(),
                                unreadCounts
                        );
                    });
        });
    }


}
