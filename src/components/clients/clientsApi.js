import Api from "../../config/Api";

export const getClients = async (page = 1, searchQuery = "", status = "") => {
  const queryParams = new URLSearchParams();

  if (searchQuery.trim()) {
    if (/^\d+$/.test(searchQuery.trim())) {
      queryParams.append("nationalId", searchQuery.trim());
    } else {
      queryParams.append("name", searchQuery.trim());
    }
  }

  if (status.trim() && status !== "الكل") {
    queryParams.append("status", status.trim());
  }

  queryParams.append("limit", "10");

  const queryString = queryParams.toString();
  const url = `/api/clients/all/${page}${queryString ? `?${queryString}` : ""}`;

  const response = await Api.get(url);
  return response.data;
};

export const getClientDetails = async (clientId) => {
  const response = await Api.get(`/api/clients/${clientId}`);
  return response.data;
};

export const getClientStatement = async (
  clientId,
  page = 1,
  fromDate = "",
  toDate = ""
) => {
  const queryParams = new URLSearchParams();

  if (fromDate.trim()) {
    queryParams.append("from", fromDate.trim());
  }

  if (toDate.trim()) {
    queryParams.append("to", toDate.trim());
  }

  queryParams.append("limit", "20");

  const queryString = queryParams.toString();
  const url = `/api/clients/${clientId}/statement/${page}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await Api.get(url);
  return response.data;
};

export const getClientLoans = async (clientId, page = 1) => {
  const response = await Api.get(
    `/api/loans/all/${page}?clientId=${clientId}`
  );
  return response.data;
};
