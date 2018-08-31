import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { JasmineComplianceRunner } from 'beady-eye'

export const currentAccountId = (context: Context):String => {
  // for local testing
  if(process.env.AWS_ACCOUNT_ID){
    return process.env.AWS_ACCOUNT_ID
  }
  return context.invokedFunctionArn.split(':')[4]
}

export const runCompliance: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {

  let complianceRunner = new JasmineComplianceRunner(cb)  

  let redshiftParams: RedshiftSuiteParams = {
    region: 'eu-west-1',
    env_stack: `${process.env.ENVIRONMENT_STAGE}${process.env.ENVIRONMENT_INSTANCE}`,
    env_stage: `${process.env.ENVIRONMENT_STAGE}`,
    env_instance: `${process.env.ENVIRONMENT_INSTANCE}`,
    security_groups: {
      bastionSg: `${process.env.SG_BASTION}`,
      redshiftExternalAccess: `${process.env.SG_REDSHIFT_EXTERNAL_ACCESS}`,
      redshiftInternalAccess: `${process.env.SG_REDSHIFT_INTERNAL_ACCESS}`,
    }

  }
  require('./S3.example').suite(redshiftParams)

  complianceRunner.execute()
}

export interface RedshiftSuiteParams {
  // The AWS region 
  region: string,
  // The vgwinfra Environment stack this is deployed into - e.g. `devb`
  env_stack: string,
  env_stage: string,
  env_instance: string,
  security_groups: {
    bastionSg: string,
    redshiftExternalAccess: string,
    redshiftInternalAccess: string,
  }
}
