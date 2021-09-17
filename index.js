#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if (!fs.existsSync(name)) {
            inquirer.prompt([
                {
                    type: 'list',
                    message: '请选择需要的模板:',
                    name: 'template',
                    choices: ['react项目开发模板', 'react组件开发模板']
                }
            ]).then((answers) => {
                let branch;
                switch (answers.template) {
                    case 'react项目开发模板':
                        branch = "https://github.com:dazhenyun/react-template-project#master";
                        break;
                    case 'react组件开发模板':
                        branch = "https://github.com:dazhenyun/react-template-components#master";
                        break;
                }
                inquirer.prompt([
                    {
                        name: 'description',
                        message: '请输入项目描述'
                    },
                    {
                        name: 'author',
                        message: '请输入作者名称'
                    }
                ]).then((answers) => {
                    const spinner = ora('正在下载模板...');
                    spinner.start();
                    download(branch, name, { clone: true }, (err) => {
                        if (err) {
                            spinner.fail();
                            console.log(symbols.error, chalk.red(err));
                        } else {
                            spinner.succeed();
                            const fileName = `${name}/package.json`;
                            const meta = {
                                name,
                                description: answers.description,
                                author: answers.author
                            }
                            if (fs.existsSync(fileName)) {
                                const content = fs.readFileSync(fileName).toString();
                                const result = handlebars.compile(content)(meta);
                                fs.writeFileSync(fileName, result);
                            }
                            console.log(symbols.success, chalk.green('项目初始化完成'));
                        }
                    })
                })
            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);
