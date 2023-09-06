import axios from "axios";
import moment from "moment";

export const getFaqs = async (BASE_URL: string, orgId: string) => {
  if (!orgId) return [];
  const res = await axios.get(
    `${BASE_URL}webchat/faqs/all/?organizationId=${orgId}`
  );
  return res.data.data;
};

export const searchFaqs = async (
  BASE_URL: string,
  orgId: string,
  value: string
) => {
  const res = await axios.get(
    `${BASE_URL}webchat/faqs/all/?organizationId=${orgId}&search=${value}`
  );
  return res.data.data;
};

export const getOrg = async (ID_URL: string, apikey: string) => {
  if (!apikey) return {};
  const res = await axios.get(`${ID_URL}${apikey}/`);
  return res.data;
};

export const getPrompt = async (BASE_URL: string, orgId: string) => {
  const res = await axios.get(
    `${BASE_URL}webchat/prompt/?organizationId=${orgId}`
  );
  return res.data;
};

export const initializeChat = async (
  BASE_URL: string,
  orgId: string,
  data: { [key: string]: string }
) => {
  const res = await axios.post(
    `${BASE_URL}webchat/initialize-livechat/${
      localStorage.getItem("clientId") ? "with-client" : "without-client"
    }/?organizationId=${orgId}`,
    data
  );
  return res.data.data;
};

export const sendMessage = async (
  BASE_URL: string,
  orgId: string,
  threadMessage: string,
  ticketId: string
) => {
  const res = await axios.post(
    `${BASE_URL}webchat/ticket-thread/?organizationId=${orgId}`,
    {
      clientId: localStorage.getItem("clientId") ?? "",
      ticketId: ticketId ?? "",
      socketId: localStorage.getItem("socketId") ?? "",
      threadMessage: threadMessage,
    }
  );
  return res.data.data;
};

export const getTickets = async (BASE_URL: string, orgId?: string) => {
  let clientID = localStorage.getItem("clientId");
  if (!orgId && !clientID) return [];
  const res = await axios.get(
    `${BASE_URL}webchat/client-tickets/?organizationId=${orgId}&clientId=${localStorage.getItem(
      "clientId"
    )}`
  );
  return res.data.data;
};
export const getTicket = async (
  BASE_URL: string,
  orgId: string,
  ticketId: string
) => {
  const res = await axios.get(
    `${BASE_URL}webchat/single-ticket/?organizationId=${orgId}&ticketId=${ticketId}`
  );
  return res.data.data;
};

export const formatDateTime = (datetime: string) => {
  return moment(datetime).format("DD/MM/YYYY hh:mm A");
};

export const getMoment = (datetime: string) => {
  let then = moment(datetime);
  let now = moment();
  return moment(then).from(now);
};

export const splitInfoAndLink = (text: string): [string, string] => {
  const pattern = /(.*?)\s(https:\/\/\S+)/;
  const match = pattern.exec(text);
  if (match) {
    const info = match[1];
    const link = match[2];
    return [info, link];
  } else {
    return [text, ""];
  }
};
