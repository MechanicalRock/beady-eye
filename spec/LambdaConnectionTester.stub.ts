//Test case data
export const lambdaResponseData = {
  successResult: { StatusCode: 200, Payload: '{ "result": true }' },
  failureResult: { StatusCode: 200, Payload: '{ "result": false }' },
  handledErrorResult: {
    StatusCode: 200,
    FunctionError: "Handled",
    Payload: '{ "errorMessage":"bad things happened","errorType":"Error" }',
  },
  unhandledErrorResult: {
    StatusCode: 200,
    FunctionError: "Unhandled",
    Payload: '{ "errorMessage":"bad things happened","errorType":"NameError" }',
  },
};
