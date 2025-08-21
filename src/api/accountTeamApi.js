import API from "./index";

export async function listTeam() {
    const { data } = await API.get("/api/account/team");
    return data; // { data: User[], seats, entitlements }
}

export async function createMember(payload) {
    const { data } = await API.post("/api/account/team", payload);
    return data; // { data: User, seats }
}

export async function updateMember(id, payload) {
    const { data } = await API.patch(`/api/account/team/${id}`, payload);
    return data;
}

export async function deleteMember(id) {
    const { data } = await API.delete(`/api/account/team/${id}`);
    return data;
}
