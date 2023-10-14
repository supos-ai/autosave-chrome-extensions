import * as messageType from "./messageType";
import * as actionType from "./actionType";

type MessageType = typeof messageType;
type ActionType = typeof actionType;

export interface MessageProps {
  messageType: keyof MessageType;
  actionType: keyof ActionType;
  payload: any;
}
