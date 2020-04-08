class SSMParameter {
  constructor(private name: String) {

  }

}

export default {
  parameter: (name: String) => {
    return new SSMParameter(name)
  }
}


