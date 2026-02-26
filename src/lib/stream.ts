import { StreamChat } from 'stream-chat';

const apiKey = import.meta.env.VITE_NEXT_PUBLIC_STREAM_API_KEY;

if (!apiKey) {
  throw new Error('Missing Stream API Key environment variable.');
}

export const streamClient = new StreamChat(apiKey);
