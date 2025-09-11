import * as vscode from 'vscode';

// ################################################################################################################################
/**
 * Webview for displaying sequence diagrams .
 */
export class SequenceDiagramViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _mermaidCode: string = '';

    /**
     * Initializes a new instance of the SequenceDiagramViewProvider class.
     * @param extensionUri - The URI of the extension.
     */
    constructor(private readonly extensionUri: vscode.Uri) {
    }

    /**
     * Resolves the webview view.
     * @param webviewView - The webview view to be resolved.
     */
    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        // Allow scripts in the webview
        webviewView.webview.options = { enableScripts: true };

        // Set the  HTML content
        webviewView.webview.html = this.getHtml();

        // Handle messages from the webview.
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'jumpToFunction') {
                await this.jumpToFunction(message.functionName);
            }
        });
    }


    /**
     * Generates the complete HTML content for the webview.
     * @returns The complete HTML content as a string.
     */
    public getHtml() {
        return `
          ${this.head()}
          ${this.body()}
          ${this.foot()}
        `;
    }

    /**
     * Sets the Mermaid code to be displayed in the webview.
     * @param mermaidCode - The Mermaid code to be set.
     */
    public setMermaidCode(mermaidCode: string) {
        this._mermaidCode = mermaidCode;
    }

    /**
     * Generates the head section of the HTML content.
     * @returns The head section of the HTML content.
     */
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
    mermaid.initialize({
  startOnLoad: true,
  theme: 'forest',
});

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

    /**
     * Generates the body section of the HTML content.
     * @returns The body section of the HTML content.
     */
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

    /**
     * Generates the footer section of the HTML content.
     * @returns The footer section of the HTML content.
     */
    public foot() {
        return `
          <footer>
          </footer>
        </html>
        `;
    }

    /**
     * Updates the Mermaid diagram in the webview.
     * @param mermaidCode - The Mermaid code to update the diagram with.
     */
    public updateDiagram(mermaidCode: string) {
        this.setMermaidCode(mermaidCode);
        if (this._view) {
            this._view.webview.html = this.getHtml();
        }
    }

    /**
     * Jumps to the specified function in the codebase.
     * @param functionName - The name of the function to jump to.
     */
    private async jumpToFunction(functionName: string) {
        functionName = functionName
            .replace(/^(\d+(\.\d+)?:\s*)?/, '')  //remove optional line number prefix
            .replace(/^def\s+/, '')              //remove 'def' keyword if present
            .replace(/\([\s\S]*\)?$/, '')        //remove arguments and closing parenthesis
            .trim();                             // Clean up whitespace


        vscode.window.showInformationMessage(`Jumping to function: ${functionName}`);

        // Search for the function definition in all Python files in the workspace
        const files = await vscode.workspace.findFiles('**/*.py', '**/site-packages/**',);

        if (files.length === 0) {
            vscode.window.showErrorMessage('Python files not found');
            return;
        }

        // Open each file and search for the function definition
        files.forEach(file => {
            vscode.workspace.openTextDocument(file).then(document => {

                const text = document.getText();

                const regex = new RegExp(`\\bdef\\s+${functionName}\\s*\\(`);
                const match = regex.exec(text);
                if (match) {
                    const pos = document.positionAt(match.index);
                    vscode.window.showTextDocument(document, { selection: new vscode.Range(pos, pos) });
                    return;
                } else {
                    vscode.window.showWarningMessage(`Function "${functionName}" not found in file.`);
                }
            });
        });
        // const document = editor.document;
        // const text = document.getText();

        // const regex = new RegExp(`\\bdef\\s+${functionName}\\s*\\(`);
        // const match = regex.exec(text);

        // if (match) {
        //     const position = document.positionAt(match.index);
        //     editor.selection = new vscode.Selection(position, position);
        //     editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        // } else {
        //     vscode.window.showWarningMessage(`Function "${functionName}" not found in current file.`);
        // }
    }




}