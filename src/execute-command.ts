import { spawn } from 'child_process'
import type { ExecuteCommandAnswers } from './execute-command-prompt.js'

export async function executeCommand (answers: ExecuteCommandAnswers): Promise<void> {
  const { cluster, command, container, region, task } = answers

  const shellCmd = `aws ecs execute-command \\
    --cluster ${cluster?.clusterName ?? 'default'} \\
    --command "${command ?? 'bash'}" \\
    --container ${container?.name ?? 'default'} \\
    --interactive \\
    --region ${region ?? 'default'} \\
    --task ${task?.taskArn ?? 'default'}`

  spawn(shellCmd, { shell: 'sh', stdio: 'inherit' })
}
