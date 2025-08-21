import API from "./index";
import { CustomToast } from "../components/Alerts/CustomToast";

const customerAPI = {
    get: async (userId) => {
        console.log("UI console userId", userId)
        if (!userId) return [];
        let res = await API.get(`/api/customer?companyId=${userId}`);

        return res.data.data;
    },
    add: async (data) => {
        let res = await API.post(`/api/customer`, data);

        return res.data.data
    },
    update: async (id, newData) => {
        let res = await API.put(`/api/customer/${id}`, newData);

        CustomToast(res.data.state, res.data.msg);
    },
    delete: async (id) => {
        let res = await API.delete(`/api/customer/${id}`);

        CustomToast(res.data.state, res.data.msg);
    },
}

export default customerAPI;
