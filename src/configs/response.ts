interface responseInterface {
  status: number;
  message: string;
  type?: string;
  data?: any;
  token?: any;
}

export default (response: responseInterface) => {
  const { status, message, data = {}, type, token } = response;

  return {
    status,
    message,
    response: {
      ...(type && { type }),
      data,
      ...(token && { tokens: token }),
    },
  };
};
