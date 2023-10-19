import { messageType, messageAction } from "extensions-config";

type MessageType = typeof messageType;
type MessageAction = typeof messageAction;

export interface MessageData {
  type: keyof MessageType;
  action: keyof MessageAction;
  path: string;
  from: string;
  to: string;
  payload: any;
}

export type MessageFlow = Pick<MessageData, "path" | "from" | "to">;
