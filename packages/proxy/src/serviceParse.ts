
import { cid } from "./utils";

export interface ServiceDataProps {
  serviceName: string;
  serviceId: string;
  script: string;
  id: string;
  createAt: number;
}

const serviceParse = (payload: RequestInit | undefined): ServiceDataProps[] => {
  const dataQueue: ServiceDataProps[] = [];

  if (payload === undefined || payload.body === undefined) return dataQueue;

  const { body } = payload;

  const context = JSON.parse(body as string);

  // 可能是删除操作， 需要将 url 正则匹配路径改为精确的匹配
  if (!context.enName && !context.displayName) return dataQueue;
  dataQueue.push({
    serviceName: context.displayName,
    serviceId: context.enName,
    script: context.script,
    createAt: Date.now(),
    id: cid(),
  });

  return dataQueue;
};

export default serviceParse;
