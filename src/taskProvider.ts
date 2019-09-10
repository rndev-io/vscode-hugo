import * as vscode from "vscode";

export class TaskProvider implements vscode.TaskProvider {
    provideTasks(): vscode.ProviderResult<vscode.Task[]> {
        return [
            this.build(),
            this.serve(),
            this.serve_draft()
        ];
    }

    private build(): vscode.Task {
        let build = new vscode.Task(
            {type: "hugo", task: ""},
             "Build site",
            "hugo",
            new vscode.ShellExecution("hugo"),
            []
        );
        build.group = vscode.TaskGroup.Build;
        return build;
    }

    private serve(): vscode.Task {
        let serve = new vscode.Task(
            {type: "hugo", task: "server"},
             "Serve site",
            "hugo",
            new vscode.ShellExecution("hugo server"),
            []
        );
        serve.group = vscode.TaskGroup.Build;
        serve.isBackground = true;
        return serve;
    }

    private serve_draft(): vscode.Task {
        let serve = new vscode.Task(
            {type: "hugo", task: "server draft"},
            "Serve draft site",
            "hugo",
            new vscode.ShellExecution("hugo server --buildDrafts"),
            []
        );
        serve.group = vscode.TaskGroup.Build;
        serve.isBackground = true;
        return serve;
    }

    resolveTask(): vscode.ProviderResult<vscode.Task> {
        return undefined;
    }
}