// Test case data
const testEndpoint = { Port: 5432, Address: "test.address" };
export const testRds = {
  name: "testRDS",
  region: "eu-west-1",
  emptyRdsResult: { DBInstances: [] },
  validRdsResult: { DBInstances: [{ DBInstanceIdentifier: "testRDS" }] },
  validRdsResultWithEngine: {
    DBInstances: [{ DBInstanceIdentifier: "testRDS", Engine: "postgres" }],
  },
  validRdsResultWithEndpointAddress: {
    DBInstances: [{ DBInstanceIdentifier: "testRDS", Endpoint: testEndpoint }],
  },
};
