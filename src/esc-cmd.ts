#!/usr/bin/env node

import inquirer from 'inquirer'
import { spawn } from 'child_process'
import { ExecuteCommandAnswers, executeCommandPrompt } from './execute-command-prompt.js'

const answer = await inquirer.prompt(executeCommandPrompt())
await executeCommand(answer)

async function executeCommand (answers: ExecuteCommandAnswers): Promise<void> {
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
