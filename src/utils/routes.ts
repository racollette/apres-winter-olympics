export const getQueryString = (query: string | string[] | undefined) => {
  if (query === undefined) {
    return "undefined";
  } else if (typeof query === "string") {
    return query;
  } else if (Array.isArray(query)) {
    return query[0] || "undefined";
  } else {
    return "undefined";
    // throw new Error(`Unsupported type: ${typeof query}`);
  }
};
