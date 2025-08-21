import API from "./index";
import { CustomToast } from "../components/Alerts/CustomToast";

const dealerAPI = {
    get: async (userId) => {
        console.log("UI console userId", userId)
        if (!userId) return [];
        let res = await API.get(`/api/dealer?companyId=${userId}`);

        return res.data.data;
    },
    add: async (data) => {
        let res = await API.post(`/api/dealer`, data);

        return res.data.data
    },
    update: async (id, newData) => {
        let res = await API.put(`/api/dealer/${id}`, newData);

        CustomToast(res.data.state, res.data.msg);
    },
    delete: async (id) => {
        let res = await API.delete(`/api/dealer/${id}`);

        CustomToast(res.data.state, res.data.msg);
    },
}

export default dealerAPI;
