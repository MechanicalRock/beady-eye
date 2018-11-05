

export interface endpointAddress {
    address: string;
    port: number;
}

export interface uriEndpointAddress {
    Uri: string,
    failOnHTTP: boolean
}

export type connectionTesterParams = endpointAddress | uriEndpointAddress;

export interface connectionTester {

    // can connect to a given destination
    /**
     * @deprecated use tryConnectionToV2
     * @param endpoint 
     * @param timeout_ms 
     */
    tryConnectionTo(endpoint: endpointAddress, timeout_ms: number): Promise<boolean>;
    tryConnectionToV2(endpointParams: connectionTesterParams, timeout_ms: number): Promise<boolean>;
}

export interface connectable {

    // provides an interface to endpoint address information
    getAddress(): Promise<endpointAddress | null>;

}
