public UserDTO findById(String id) {
    try {
        Long longId = Long.parseLong(id);
        return findById(longId);
    } catch (NumberFormatException e) {
        return null;
    }
}

public UserDTO findById(Long id) {
    User user = userRepository.findById(id).orElse(null);
    if (user == null) {
        return null;
    }
    return UserDTO.toDTO(user);
} 