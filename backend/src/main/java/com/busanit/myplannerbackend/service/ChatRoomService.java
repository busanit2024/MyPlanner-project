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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public ChatRoom findById(String roomId) {
        return chatRoomRepository.findById(roomId)
                .orElseThrow(()-> new RuntimeException("채팅방을 찾을 수 없습니다."));
    }

    public List<ChatRoom> findByParticipantEmail(String email) {
        return chatRoomRepository.findByParticipantsEmailContaining(email);
    }

    public ChatRoom getChatRoom(String chatRoomId) {
        return chatRoomRepository.findById(chatRoomId).orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
    }

    public ChatRoom createChatRoom(ChatRoomRequest request) {
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

    @Transactional
    public void save(ChatRoom chatRoom) {
        chatRoomRepository.save(chatRoom);
    }

    // 채팅방 삭제 메소드
    @Transactional
    public void deleteChatRoom(String roomId) {
        // 채팅방의 모든 메시지 삭제
        messageRepository.deleteByChatRoomId(roomId);

        // 채팅방 삭제
        chatRoomRepository.deleteById(roomId);
    }

    // 채팅방 마지막 메세지 띄우기
    @Transactional
    public void updateLastMessage(String roomId, String message, LocalDateTime time) {
        ChatRoom chatRoom = findById(roomId);
        chatRoom.setLastMessage(message);
        chatRoom.setLastMessageAt(time);
        chatRoomRepository.save(chatRoom);
    }
}
