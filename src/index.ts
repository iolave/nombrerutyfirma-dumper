#! /usr/bin/env node
import { program, Command } from "commander"

const testFn = (obj: any) => console.log(obj)

const command = new Command()
command.name('fromFile')
command.requiredOption('-f --file <input>', 'Input file to be processed')
command.action(testFn)

program.addCommand(command)
program.parse()

