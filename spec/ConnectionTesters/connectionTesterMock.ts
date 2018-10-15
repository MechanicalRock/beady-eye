import { endpointAddress, connectionTester, connectionTesterParams, uriEndpointAddress } from "../../src/interfaces";

export class connectionTesterMock implements connectionTester {
  
  sourceId: string;
  result: boolean;
  requestedAddress: string;
  requestedPort: number;
  requestedUri: string;
  
  constructor(sourceId: string) {
    this.sourceId = sourceId;
  }
  
  setResult(result: boolean) {
    this.result = result;
  }
  
  async tryConnectionTo(endpoint: endpointAddress, timeout_ms: number): Promise<boolean> {
    this.requestedAddress = endpoint.address;
    this.requestedPort = endpoint.port;
    return this.result;
  }

  async tryConnectionToV2(endpointParams: connectionTesterParams, timeout_ms: number): Promise<boolean> {
    if( (<endpointAddress>endpointParams).address ){
      return this.tryConnectionTo(<endpointAddress>endpointParams, timeout_ms)
    }else{
      this.requestedUri = (<uriEndpointAddress>endpointParams).Uri;
      return this.result;
    }
  }
}
