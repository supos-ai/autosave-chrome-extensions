import actionNames from "./actionNames";

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
