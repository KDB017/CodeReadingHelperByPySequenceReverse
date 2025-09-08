import * as vscode from 'vscode';
import { Logger } from './logging'

export class SequenceDiagramViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _mermaidCode: string = 'sequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: I am good thanks!';

    constructor(private readonly extensionUri: vscode.Uri) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        // ここで表示させたいHTMLを記述する
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml();

        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'jumpToFunction') {
                await this.jumpToFunction(message.functionName);
            }
        });
    }

    public getHtml() {
        return `
          ${this.head()}
          ${this.body()}
          ${this.foot()}
        `;
    }

    public setMermaidCode(mermaidCode: string) {
        this._mermaidCode = mermaidCode;
    }

    public head() {
        return `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sequence Diagram</title>
            <style>
              .mermaid { background: #fff; padding: 10px; border-radius: 8px; }
              .clickable {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
}
            </style>
            <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
    const vscode = acquireVsCodeApi();

    setTimeout(() => {
        document.querySelectorAll('.messageText').forEach(el => {
            el.classList.add('clickable');
            el.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'jumpToFunction',
                    functionName: el.textContent.trim()
                });
            });
        });
    }, 1000);
</script>
          </head>
        `;
    }

    public body() {
        return `
          <body>
            <h1>Sequcence Diagram</h1>
            <div class="mermaid">
              ${this._mermaidCode}
            </div>
          </body>
        `;
    }

    public foot() {
        return `
          <footer>
          </footer>
        </html>
        `;
    }

    public updateDiagram(mermaidCode: string) {
        this.setMermaidCode(mermaidCode);
        if (this._view) {
            this._view.webview.html = this.getHtml();
        }
    }

    private async jumpToFunction(functionName: string) {
    // クリックされたテキストをクリーンにする
    functionName = functionName.replace(/^\d+(\.\d+)?:\s*/, '').replace(/\(.*\)$/, '');
    vscode.window.showInformationMessage(`Jumping to function: ${functionName}`);

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const text = document.getText();

    const regex = new RegExp(`\\bdef\\s+${functionName}\\s*\\(`);
    const match = regex.exec(text);

    if (match) {
        const position = document.positionAt(match.index);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    } else {
        vscode.window.showWarningMessage(`Function "${functionName}" not found in current file.`);
    }
}




}