package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.ChatRoomRequest;
import com.busanit.myplannerbackend.domain.Participant;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.ChatRoomRepository;
import com.busanit.myplannerbackend.repository.MessageRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public Mono<ChatRoom> findById(String roomId) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new RuntimeException("채팅방을 찾을 수 없습니다.")));
    }

    public Flux<ChatRoom> findByParticipantEmail(String email) {
        return chatRoomRepository.findByParticipantsEmailContaining(email);
    }

    public Mono<ChatRoom> getChatRoom(String chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .switchIfEmpty(Mono.error(new RuntimeException("채팅방을 찾을 수 없습니다.")));
    }

    @Transactional
    public Mono<ChatRoom> createChatRoom(ChatRoomRequest request) {
        List<Participant> participants = request.getParticipantIds().stream()
                .map(participantRequest -> {
                    User user = userRepository.findByEmail(participantRequest.getEmail())
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    Participant participant = new Participant();
                    participant.setEmail(user.getEmail());
                    participant.setUsername(user.getUsername());
                    participant.setProfileImageUrl(user.getProfileImageUrl());
                    participant.setStatus(participantRequest.getStatus());
                    return participant;
                })
                .collect(Collectors.toList());

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setParticipants(participants);
        chatRoom.setChatroomTitle(request.getChatroomTitle());
        chatRoom.setChatRoomType(request.getChatroomType());
        chatRoom.setCreatedAt(LocalDateTime.now());

        return chatRoomRepository.save(chatRoom);
    }

    public Mono<ChatRoom> save(ChatRoom chatRoom) {
        return chatRoomRepository.save(chatRoom);
    }

    public Mono<Void> deleteChatRoom(String roomId) {
        return messageRepository.deleteByChatRoomId(roomId)
                .then(chatRoomRepository.deleteById(roomId));
    }

    public Mono<ChatRoom> updateLastMessage(String roomId, String message, LocalDateTime time) {
        return findById(roomId)
                .map(chatRoom -> {
                    chatRoom.setLastMessage(message);
                    chatRoom.setLastMessageAt(time);
                    return chatRoom;
                })
                .flatMap(chatRoomRepository::save);
    }

    //채팅방 제목 업데이트
    public Mono<ChatRoom> updateChatRoomTitle(String roomId, String newTitle) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new RuntimeException("채팅방을 찾을 수 없습니다.")))
                .flatMap(chatRoom -> {
                    chatRoom.setChatroomTitle(newTitle);
                    return chatRoomRepository.save(chatRoom);
                });
    }
}
