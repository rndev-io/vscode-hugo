# vscode-hugo

![downloads](https://img.shields.io/vscode-marketplace/d/rusnasonov.vscode-hugo.svg)

Integrate [Hugo](http://gohugo.io) with [VSCode](https://code.visualstudio.com).

## Tasks

[VSCode Task](https://code.visualstudio.com/Docs/editor/tasks#_processing-task-output-with-problem-matchers) for Hugo.

![Tasks](https://github.com/rusnasonov/vscode-hugo/blob/master/tasks.gif)

### Build site

Run `hugo` shell command. In VSCode run `Command Pallete` -> `Run tasks` -> `Build site`.

Or press <kbd>command</kbd> + <kbd>shift</kbd> + <kbd>b</kbd> (<kbd>control</kbd> + <kbd>shift</kbd> + <kbd>b</kbd> for Windows and Linux) for select task in Build menu. If you setup `Default build task` command will be run without showing menu.

### Serve site

Two possibility :
* Run `hugo server` shell command to start like final site.
 In VSCode run `Command Pallete` -> `Run tasks` -> `Serve site`.
* Run `hugo server --buildDrafts` shell command to start site with draft page.
 In VSCode run `Command Pallete` -> `Run tasks` -> `Serve draft site`.


## Commands in Command Pallete

`version` - show local version of Hugo.

`remote version` - show remote version of Hugo.

`create content` - create content in `content/` directory.

`create content from archetype` - create content in `content/` directory from an archetype (https://gohugo.io/content-management/archetypes/)

