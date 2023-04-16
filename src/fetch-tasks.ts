import { DescribeTasksCommand, ECSClient, ListTasksCommand, Task } from '@aws-sdk/client-ecs'

export async function fetchTasks (client: ECSClient, cluster?: string, service?: string): Promise<Array<Required<Task>>> {
  const tasks = await listTasks(client, cluster, service)
  if (tasks.length === 0) return []

  return await describeTasks(client, tasks, cluster)
}

async function listTasks (client: ECSClient, cluster?: string, service?: string, nextToken?: string): Promise<string[]> {
  const request = { cluster, nextToken, serviceName: service }
  const response = await client.send(new ListTasksCommand(request))
  if (response.nextToken === undefined) return response.taskArns ?? []

  const nextArns = await listTasks(client, cluster, service, response.nextToken)

  return nextArns.concat(response.taskArns ?? [])
}

async function describeTasks (client: ECSClient, tasks: string[], cluster?: string): Promise<Array<Required<Task>>> {
  const response = await client.send(new DescribeTasksCommand({ cluster, tasks }))

  return response.tasks?.filter(isRequiredTask) ?? []
}

// I'm reading these properties, thus I want to check they are not undefined.
function isRequiredTask (task: Task): task is Required<Task> {
  return task.containers !== undefined &&
    task.enableExecuteCommand !== undefined &&
    task.lastStatus !== undefined &&
    task.platformFamily !== undefined &&
    task.taskArn !== undefined
}
