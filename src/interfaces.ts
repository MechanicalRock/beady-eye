
interface endpointAddress {
    address: string;
    port: number;
}

interface connectionTester {

    // can connect to a given destination
    tryConnectionTo(endpoint: endpointAddress, timeout_ms: number): Promise<boolean>;
}

interface connectable {

    // provides an interface to endpoint address information
    getAddress(): Promise<endpointAddress | null>;

}

export { endpointAddress, connectionTester, connectable }