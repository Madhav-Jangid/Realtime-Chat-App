export interface ClientToServerEvents {
  sent_message: (data: { conversationId: string; from: string; message: string }) => void;
}

export interface ServerToClientEvents {
  get_message: (data: { conversationId: string; from: string; message: string; date: string }) => void;
}
