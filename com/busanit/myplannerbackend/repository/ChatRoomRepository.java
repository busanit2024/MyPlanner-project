@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    // userId로 참여 중인 채팅방 찾기
    List<ChatRoom> findByParticipantsUserIdAndParticipantsStatus(String userId, String status);
    
    // 1:1 채팅방 찾기 (두 사용자의 ID로)
    @Query("{ 'chatRoomType': 'INDIVIDUAL', 'participants': { $all: [ {'$elemMatch': {'userId': ?0}}, {'$elemMatch': {'userId': ?1}} ] } }")
    Optional<ChatRoom> findIndividualChatRoom(String userId1, String userId2);
} 