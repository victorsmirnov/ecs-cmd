import { DescribeServicesCommand, ECSClient, ListServicesCommand, Service } from '@aws-sdk/client-ecs'

export async function fetchServices (client: ECSClient, cluster?: string): Promise<Array<Required<Service>>> {
  const services = await listServices(client, cluster)
  if (services.length === 0) return []

  return await describeServices(client, services, cluster)
}

async function listServices (client: ECSClient, cluster?: string, nextToken?: string): Promise<string[]> {
  const request = { cluster, nextToken }
  const response = await client.send(new ListServicesCommand(request))
  if (response.nextToken === undefined) return response.serviceArns ?? []

  const nextArns = await listServices(client, cluster, response.nextToken)

  return nextArns.concat(response.serviceArns ?? [])
}

async function describeServices (client: ECSClient, services: string[], cluster?: string): Promise<Array<Required<Service>>> {
  const response = await client.send(new DescribeServicesCommand({ cluster, services }))

  return response.services?.filter(isRequiredService) ?? []
}

// I'm reading these properties, thus I want to check they are not undefined.
function isRequiredService (service: Service): service is Required<Service> {
  return service.serviceName !== undefined
}
