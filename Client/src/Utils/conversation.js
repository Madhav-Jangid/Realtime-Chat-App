export function buildConversationId(currentUserId, selectedUserId) {
  if (!currentUserId || !selectedUserId) {
    return "";
  }

  const [a, b] = [currentUserId, selectedUserId].sort();
  return `convo:${a}::${b}`;
}
