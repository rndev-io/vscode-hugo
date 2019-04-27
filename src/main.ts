import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import { TaskProvider } from './taskProvider';

const request = require('request');

export function activate(context: vscode.ExtensionContext) {
    const workspaceRoot = vscode.workspace.rootPath;
    if (!workspaceRoot) {
		return;
    }
    const hugo = new Hugo(workspaceRoot);
    if(!hugo.isHugoFolder()) {
        return;
    }
    console.log('"Hugo Helper" is active');
    const taskProvider = new TaskProvider();
    vscode.tasks.registerTaskProvider('hugo', taskProvider);

    let version = vscode.commands.registerCommand('hugo.version', () => {
        hugo.version().then((v) => {
            vscode.window.showInformationMessage("Local version: " + v);
        });
    });

    let createContent = vscode.commands.registerCommand('hugo.createContent', () => {        
        vscode.window.showQuickPick(hugo.sections()).then((sectionName)=>{
            if (!sectionName) {
                return ;
            }
            vscode.window.showInputBox({placeHolder: `Create content in "${sectionName}"`}).then((fileName) => {
                if (!fileName){
                    return;
                }
                let fullFileName = path.join(sectionName, fileName.replace(/ /g, '-') + '.md');

                hugo.new(fullFileName).then((path) => {
                    // commands.executeCommand<void>('vscode.open', right, opts);
                    vscode.window.showTextDocument(vscode.Uri.parse('file://' + path));
                });
            });
        });

    });

    let remoteVersion = vscode.commands.registerCommand('hugo.remoteVersion', () => {
        hugo.remoteVersion().then((v) => {
            vscode.window.showInformationMessage("Remote version: " + v);
        });
    });
    
    context.subscriptions.push(version);
    context.subscriptions.push(createContent);
    context.subscriptions.push(remoteVersion);
}

export function deactivate(): void {}

class Hugo {
    constructor(private projectRoot: string, private serverProcess?: cp.ChildProcess){

    }

    public async runServer(): Promise<Hugo> {
        // TODO run server, config option;
        if (this.serverProcess) {
            return this;
        }
        let {process} = await this.run('server', ['--buildDrafts']);
        return new Hugo(this.projectRoot, process);
    }

    public async isHugoFolder(): Promise<boolean> {
        return await exists('config.toml') || exists('config.yaml') || exists('config.json');
    }

    public async remoteVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            request('https://github.com/gohugoio/hugo/releases/latest', (err: any, res: any, body: string) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(path.basename(res.req.path));
                }    
            });
        });
    }

    public stopServer(): Hugo {
        if (!this.serverProcess) {
            return this;
        }
        this.serverProcess.kill('SIGTERM');
        return new Hugo(this.projectRoot);
    }

    public async version(): Promise<string> {
        let {stdout} = await this.spawn('version');
        let matched = stdout.match(/v[0-9.]*/);
        if (matched) {
            return matched[0];
        }
        throw `Version not found in ${stdout}`;
    }

    public async new(path: string, flag:string[] = []): Promise<string>{
        this.spawn('new', flag.concat([path]));
        return this.projectRoot + '/content/' + path;
    }

    public sections(): string[]{
        let contentFolder = path.join(this.projectRoot, 'content/');
        return walk(contentFolder).map((item) => item.replace(contentFolder, ''));
    }

    private async spawn(command: string = '', args: string[] = []): Promise<{ stdout: string; stderr: string; }> {
        let options: cp.ExecOptions = {};
        if (this.projectRoot != '') {
            options.cwd = this.projectRoot;
        }

        return await exec(['hugo', command].concat(args).join(' '), options);
    }

    private async run(command: string = '', args: string[] = []): Promise<{process: cp.ChildProcess}> {
        let options: cp.ExecOptions = {};
        if (this.projectRoot != '') {
            options.cwd = this.projectRoot;
        }

        return await run(['hugo', command].concat(args).join(' '), options);
    }
}

function exec(command: string, options: cp.ExecOptions): Promise<{ stdout: string; stderr: string; }> {
	return new Promise<{ stdout: string; stderr: string; }>((resolve, reject) => {
		cp.exec(command, options, (error, stdout, stderr) => {
			if (error) {
                // todo enable debug
                vscode.window.showErrorMessage(stderr);
                reject({ error, stdout, stderr });
            }
			resolve({ stdout, stderr });
		});
	});
}

function run(command: string, options: cp.ExecOptions): Promise<{ process: cp.ChildProcess }> {
	return new Promise<{ process: cp.ChildProcess }>((resolve, reject) => {
        let process = cp.exec(command, options);
        process.on('error', reject);
        process.on('close', (code, signal) => {
            if (code !== 0) {
                reject(`Programm close with code ${code}, ${signal}`);
            }
        });
        process.on('exit', (code, signal) => {
            if (code !== 0) {
                reject(`Programm exit with code ${code}, ${signal}`);
            }    
        });
        console.log(`Programm started, pid ${process.pid}`);
        resolve({process});
	});
}

function exists(file: string): Promise<boolean> {
	return new Promise<boolean>((resolve, _reject) => {
		fs.exists(file, (value) => {
			resolve(value);
		});
	});
}

function walk(dirPath: string): string[]{
    let result: string[] = [];

    for (var p of fs.readdirSync(dirPath)) {
        let newPath = path.join(dirPath, p);
        if (fs.lstatSync(newPath).isDirectory()) {
            result.push(newPath);
            for(var d of walk(newPath)) {
                result.push(d);
            }
        }
    }
    return result;
}