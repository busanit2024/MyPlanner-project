package com.busanit.myplannerbackend.handler;

import com.busanit.myplannerbackend.service.MessageService;
import lombok.RequiredArgsConstructor;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final MessageService messageService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null && destination.split("/").length > 4) {
                String chatRoomId = destination.split("/")[4];
                String userEmail = accessor.getUser() != null ? accessor.getUser().getName() : null;

                if (chatRoomId != null && userEmail != null) {
                    messageService.markAsRead(chatRoomId, userEmail)
                            .subscribe(); // Reactive 스트림 구독
                }
            }
        }

        return message;
    }

    @Override
    public boolean preReceive(MessageChannel channel) {
        return true;
    }

    @Override
    public Message<?> postReceive(Message<?> message, MessageChannel channel) {
        return message;
    }
}