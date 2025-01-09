package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.domain.ChatRoomRequest;
import com.busanit.myplannerbackend.domain.Participant;
import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.entity.ReadStatus;
import com.busanit.myplannerbackend.entity.User;
import com.busanit.myplannerbackend.repository.ChatRoomRepository;
import com.busanit.myplannerbackend.repository.MessageRepository;
import com.busanit.myplannerbackend.repository.ReadStatusRepository;
import com.busanit.myplannerbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ReadStatusRepository readStatusRepository;

    public Mono<ChatRoom> findById(String roomId) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new RuntimeException("채팅방을 찾을 수 없습니다.")));
    }

    public Flux<ChatRoom> findByParticipantEmail(String email) {
        return chatRoomRepository.findByParticipantsEmailContaining(email);
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

    // 채팅방 나가기
    @Transactional
    public Mono<ChatRoom> leaveChatRoom(String roomId, String userEmail) {
        return findById(roomId)
                .flatMap(chatRoom -> {
                    // 나간 유저를 제외한 참가자 목록 생성
                    List<Participant> updatedParticipants = chatRoom.getParticipants().stream()
                            .filter(p -> !p.getEmail().equals(userEmail))
                            .collect(Collectors.toList());

                    // 마지막 참가자가 나갈 경우 (참가자가 없을 경우)
                    if (updatedParticipants.isEmpty()) {
                        // 채팅방의 메시지를 먼저 삭제하고
                        return messageRepository.deleteByChatRoomId(roomId)
                                // 채팅방을 삭제
                                .then(chatRoomRepository.deleteById(roomId))
                                // 삭제 완료 후 빈 Mono 반환
                                .then(Mono.empty());
                    }

                    // 아직 참가자가 남아있는 경우
                    chatRoom.setParticipants(updatedParticipants);

                    // 나가기 메시지를 마지막 메시지로 설정
                    String leaveMessage = chatRoom.getParticipants().stream()
                            .filter(p -> p.getEmail().equals(userEmail))
                            .findFirst()
                            .map(p -> p.getUsername() + "님이 나갔습니다.")
                            .orElse("사용자가 나갔습니다.");

                    chatRoom.setLastMessage(leaveMessage);
                    chatRoom.setLastMessageAt(LocalDateTime.now());

                    return chatRoomRepository.save(chatRoom);
                })
                // 에러 처리 추가
                .onErrorResume(e -> {
                    System.err.println("채팅방 나가기 실패: " + e.getMessage());
                    return Mono.error(e);
                });
    }

    // 읽음 상태 업데이트
    public Mono<Map<String, String>> updateLastReadMessage(String roomId, String userEmail, String messageId) {
        System.out.println("Updating read status: " +
                "roomId=" + roomId +
                ", userEmail=" + userEmail +
                ", messageId=" + messageId);

        return readStatusRepository.findByUserEmailAndChatRoomId(userEmail, roomId)
                .switchIfEmpty(Mono.just(ReadStatus.builder()
                        .chatRoomId(roomId)
                        .userEmail(userEmail)
                        .build()))
                .doOnNext(readStatus -> {
                    System.out.println("Found/Created read status: " + readStatus);
                })
                .map(readStatus -> {
                    readStatus.setLastChatLogId(messageId);
                    readStatus.setUpdatedAt(LocalDateTime.now());
                    return readStatus;
                })
                .flatMap(readStatusRepository::save)
                .doOnNext(savedStatus -> {
                    System.out.println("Saved read status: " + savedStatus);
                })
                .then(makeUnreadCountMap(roomId));
    }

    // 읽지 않은 메시지 수 계산
    public Mono<Map<String, String>> makeUnreadCountMap(String roomId) {
        // 먼저 전체 참가자 수를 가져옴
        return chatRoomRepository.findById(roomId)
                .flatMap(chatRoom -> {
                    int totalParticipants = chatRoom.getParticipants().size();  // 전체 참가자 수

                    return readStatusRepository.findByChatRoomId(roomId)
                            .filter(status -> !status.isLeave() && status.getLastChatLogId() != null)
                            .collectList()
                            .map(readStatuses -> {
                                Map<String, Integer> countMap = new HashMap<>();

                                // 각 메시지 ID별로 읽은 사용자 수 계산
                                for (ReadStatus status : readStatuses) {
                                    String logId = status.getLastChatLogId();
                                    countMap.merge(logId, 1, Integer::sum);
                                }

                                // 정렬된 결과 맵 생성
                                Map<String, String> result = new TreeMap<>();

                                for (Map.Entry<String, Integer> entry : countMap.entrySet()) {
                                    int unreadCount = totalParticipants - entry.getValue();
                                    // 읽지 않은 사람이 있는 경우 추가 (0이어도 추가)
                                    result.put(String.valueOf(unreadCount), entry.getKey());
                                }

                                return result;
                            });
                });
    }
}
