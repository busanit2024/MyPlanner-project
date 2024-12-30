@Document(collection = "chatrooms")
@Getter
@Setter
public class ChatRoom {
    @Id
    private String id;
    
    @Getter
    @Setter
    public static class Participant {
        private String userId;
        private String status;  // "ACTIVE" or "LEFT"
    }
    
    private List<Participant> participants;
    private String chatRoomTitle;
    private String chatRoomType;
    private LocalDateTime createdAt;
    private Message lastMessage;
} 