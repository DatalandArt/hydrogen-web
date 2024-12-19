import type { HomeServerApi } from "../net/HomeServerApi";
import type { IHomeServerRequest } from "../net/HomeServerRequest";
import type { PresenceContent, PresenceResponse } from "./types";

export class PresenceApi {
    constructor(private readonly hsApi: HomeServerApi) {}

    public async get(userId: string): Promise<PresenceResponse> {
        const request = this.hsApi.getPresence(userId);
        const response = await request.response();
        return response as PresenceResponse;
    }

    public async set(content: Partial<PresenceContent>): Promise<void> {
        const request = this.hsApi.setPresence(content);
        await request.response();
    }
}