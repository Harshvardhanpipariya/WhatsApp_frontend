import axios from "axios";

export const getMessages =
  async (userId) => {

    const res =
      await axios.get(
        `/api/messages/${userId}`
      );

    return res.data;
};