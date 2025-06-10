const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export default asyncHandler;

//AsyncHandler use garo vane try/catch use garna pardaina
//Yesma error handle garna easy banauxa
