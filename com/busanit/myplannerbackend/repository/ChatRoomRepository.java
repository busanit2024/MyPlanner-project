@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    // email로 참여 중인 채팅방 찾기
    List<ChatRoom> findByParticipantsEmailAndParticipantsStatus(String email, String status);
    
    // 1:1 채팅방 찾기 (두 사용자의 이메일로)
    @Query("{ 'chatRoomType': 'INDIVIDUAL', 'participants': { $all: [ {'$elemMatch': {'email': ?0}}, {'$elemMatch': {'email': ?1}} ] } }")
    Optional<ChatRoom> findIndividualChatRoom(String email1, String email2);
} 