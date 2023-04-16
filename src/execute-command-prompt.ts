import { Cluster, Container, ECSClient, Service, Task } from '@aws-sdk/client-ecs'
import { fetchClusters } from './fetch-clusters.js'
import { fetchServices } from './fetch-services.js'
import { fetchTasks } from './fetch-tasks.js'
import { ListChoiceOptions, QuestionCollection } from 'inquirer'

export interface ExecuteCommandAnswers {
  readonly region?: string
  readonly cluster?: Required<Cluster>
  readonly service?: Required<Service>
  readonly task?: Required<Task>
  readonly container?: Container
  readonly command?: string
}

export function executeCommandPrompt (): QuestionCollection<ExecuteCommandAnswers> {
  return [
    { default: defaultRegion, message: 'Enter AWS region', name: 'region', type: 'input' },
    { choices: clusters, message: 'Choose cluster', name: 'cluster', pageSize: 10, type: 'list' },
    { when: hasService, choices: services, message: 'Choose service', name: 'service', pageSize: 10, type: 'list' },
    { choices: tasks, message: 'Choose task', name: 'task', pageSize: 10, type: 'list' },
    { choices: containers, message: 'Choose container', name: 'container', pageSize: 10, type: 'list' },
    { default: 'bash', message: 'Enter command', name: 'command', type: 'input' }
  ]
}

async function defaultRegion (): Promise<string> {
  const client = new ECSClient({})
  return await client.config.region()
}

async function clusters (answers: ExecuteCommandAnswers): Promise<ListChoiceOptions[]> {
  const { region } = answers
  const client = new ECSClient({ region })
  const clusters = await fetchClusters(client)
  clusters.sort((a, b) => a.clusterName.localeCompare(b.clusterName))

  return clusters.map((cluster) => ({
    name: `${cluster.clusterName} (${cluster.status}, ${cluster.activeServicesCount} active services, ${cluster.runningTasksCount} running tasks)`,
    short: cluster.clusterName,
    value: cluster
  }))
}

function hasService (answers: ExecuteCommandAnswers): boolean {
  return answers.cluster !== undefined && answers.cluster.activeServicesCount > 0
}

async function services (answers: ExecuteCommandAnswers): Promise<ListChoiceOptions[]> {
  const { cluster, region } = answers
  const client = new ECSClient({ region })
  const services = await fetchServices(client, cluster?.clusterName)
  return services
    .map((service) => ({
      name: service.serviceName,
      short: service.serviceName,
      value: service
    }))
}

async function tasks (answers: ExecuteCommandAnswers): Promise<ListChoiceOptions[]> {
  const { cluster, region, service } = answers
  const client = new ECSClient({ region })
  const tasks = await fetchTasks(client, cluster?.clusterName, service?.serviceName)
  return tasks.map((task) => ({
    name: `${task.taskArn} (${task.startedBy})`,
    short: task.taskArn,
    value: task
  }))
}

function containers (answers: ExecuteCommandAnswers): ListChoiceOptions[] {
  const { task } = answers
  return task?.containers?.map((container) => ({
    name: container.name,
    short: container.name,
    value: container
  })) ?? []
}
