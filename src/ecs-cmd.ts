#!/usr/bin/env node

import inquirer from 'inquirer'
import updateNotifier from 'update-notifier'
import { executeCommandPrompt } from './execute-command-prompt.js'
import packageJson from '../package.json' assert { type: 'json' }
import { executeCommand } from './execute-command.js'

updateNotifier({ pkg: packageJson }).notify()

const answer = await inquirer.prompt(executeCommandPrompt())
await executeCommand(answer)
