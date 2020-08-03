import { AWSService, IamRole } from "./AWSService";
import { connectionTester, connectable, endpointAddress } from "./interfaces";

export { IamRole };

export abstract class ConnectableAWSService extends AWSService
  implements connectable {
  // To be implemented in sub-classes
  abstract async getAddress(): Promise<endpointAddress | null>;

  async isReachableFrom(source: connectionTester, timeout_ms = 1000) {
    let result = false;
    const address = await this.getAddress();

    if (address) {
      try {
        result = await source.tryConnectionTo(address, timeout_ms);
      } catch (error) {
        return false;
      }
    }

    return result;
  }
}
