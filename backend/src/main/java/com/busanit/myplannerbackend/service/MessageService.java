package com.busanit.myplannerbackend.service;

import com.busanit.myplannerbackend.entity.ChatRoom;
import com.busanit.myplannerbackend.entity.Message;
import com.busanit.myplannerbackend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRoomService chatRoomService;

    @Transactional
    public Mono<Message> saveMessage(Message message) {
        return messageRepository.save(message)
                .flatMap(savedMessage -> chatRoomService.findById(message.getChatRoomId())
                    .flatMap(chatRoom ->
                            chatRoomService.updateLastMessage(
                                    message.getChatRoomId(),
                                    message.getContents(),
                                    message.getSendTime()
                            ).thenReturn(savedMessage)
                    )
                );
    }

    public Flux<Message> getChatHistory(String chatRoomId) {
        return messageRepository.findByChatRoomIdOrderBySendTimeAsc(chatRoomId);
    }
}