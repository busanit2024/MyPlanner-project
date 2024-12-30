@Getter
@Builder
public class MessageResponseDTO {
    private String id;
    private String contents;
    private String senderEmail;
    private String senderName;
    private LocalDateTime sendTime;
} 