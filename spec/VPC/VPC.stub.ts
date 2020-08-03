// Test case data
export const testVpc = {
  name: "testVPC",
  region: "eu-west-1",
  emptyVpcResult: { Vpcs: [] },
  validVpcResult: { Vpcs: [{ VpcId: "12345" }] },
  emptyVpcEndpointResult: { VpcEndpoints: [] },
  validVpcEndpointResult: { VpcEndpoints: [{ Value: "Fake" }] },
  emptyEC2EndpointResult: { Reservations: [] },
  validEC2EndpointResult: {
    Reservations: [{ Instances: [{ Value: "Fake" }] }],
  },
};
