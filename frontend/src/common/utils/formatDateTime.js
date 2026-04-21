export const formatDateTime = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
};
