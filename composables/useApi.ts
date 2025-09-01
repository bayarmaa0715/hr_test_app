export const useApi = () => {
  const { getIdToken } = useAuth();

  const authenticatedFetch = async <T>(url: string, options: any = {}) => {
    const token = await getIdToken();

    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    return await $fetch<T>(url, fetchOptions);
  };

  // GET request
  const get = async <T>(url: string, options?: any) => {
    return await authenticatedFetch<T>(url, { ...options, method: "GET" });
  };

  // POST request
  const post = async <T>(url: string, body?: any, options?: any) => {
    return await authenticatedFetch<T>(url, {
      ...options,
      method: "POST",
      body,
    });
  };

  // PUT request
  const put = async <T>(url: string, body?: any, options?: any) => {
    return await authenticatedFetch<T>(url, {
      ...options,
      method: "PUT",
      body,
    });
  };

  // DELETE request
  const del = async <T>(url: string, body?: any, options?: any) => {
    return await authenticatedFetch<T>(url, {
      ...options,
      method: "DELETE",
      body,
    });
  };

  return {
    get,
    post,
    put,
    delete: del,
  };
};
