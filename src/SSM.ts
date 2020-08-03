class SSMParameter {
  constructor(private name: string) {}
}

export default {
  parameter: (name: string) => {
    return new SSMParameter(name);
  },
};
