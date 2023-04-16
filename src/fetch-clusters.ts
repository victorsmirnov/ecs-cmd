import { Cluster, DescribeClustersCommand, ECSClient, ListClustersCommand } from '@aws-sdk/client-ecs'

export async function fetchClusters (client: ECSClient): Promise<Array<Required<Cluster>>> {
  const clusters = await listClusters(client)
  if (clusters.length === 0) return []

  return await describeClusters(client, clusters)
}

async function listClusters (client: ECSClient, nextToken?: string): Promise<string[]> {
  const response = await client.send(new ListClustersCommand({ nextToken }))
  if (response.nextToken === undefined) return response.clusterArns ?? []

  const nextArns = await listClusters(client, response.nextToken)

  return nextArns.concat(response.clusterArns ?? [])
}

// TODO: Handle case when clusters.length > 100
async function describeClusters (client: ECSClient, clusters: string[]): Promise<Array<Required<Cluster>>> {
  const response = await client.send(new DescribeClustersCommand({ clusters }))

  return response.clusters?.filter(isRequiredCluster) ?? []
}

// I'm reading these properties, thus I want to check they are not undefined.
function isRequiredCluster (cluster: Cluster): cluster is Required<Cluster> {
  return cluster.activeServicesCount !== undefined &&
    cluster.clusterArn !== undefined &&
    cluster.clusterName !== undefined &&
    cluster.runningTasksCount !== undefined &&
    cluster.status !== undefined
}
