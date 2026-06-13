import { httpClient } from './http-client';

export type HealthResponse = {
  status: string;
  service: string;
  environment: string;
  timestamp: string;
};

export async function getHealth() {
  const response = await httpClient.get<HealthResponse>('/health');
  return response.data;
}

