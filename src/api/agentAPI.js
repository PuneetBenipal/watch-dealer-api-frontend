import API from "./index";
import { CustomToast } from "../components/Alerts/CustomToast";

const agentAPI = {
    get: async (employer) => {
        console.log("UI console employer",employer)
        if (!employer) return [];
        let res = await API.get(`/api/agent?employer=${employer}`);

        return res.data.data;
    },
    add: async (data) => {
        let res = await API.post(`/api/agent`, data);

        return res.data.data
    },
    update: async (id, newData) => {
        let res = await API.put(`/api/agent/${id}`, newData);

        CustomToast(res.data.state, res.data.msg);
    },
    delete: async (id) => {
        let res = await API.delete(`/api/agent/${id}`);

        CustomToast(res.data.state, res.data.msg);
    },
}

export default agentAPI;