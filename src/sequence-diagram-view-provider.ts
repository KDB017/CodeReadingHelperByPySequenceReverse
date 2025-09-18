import * as vscode from 'vscode';
import {Logger} from './logging';

// ################################################################################################################################
/**
 * Webview for displaying sequence diagrams .
 */
export class SequenceDiagramViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _mermaidCode: string = '';
    private _script: vscode.Uri = vscode.Uri.file(''); // Placeholder for the script URI

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

        webviewView.webview.options = { 
            localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
            enableScripts: true };
        

        const scriptPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'events.js');
        this._script = this._view.webview.asWebviewUri(scriptPath);

        // this._scripts.push(script);
        
        Logger.log(`Script Path: ${scriptPath}`);
        Logger.log(`Script URI: ${this._script}`);
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
    public getHtml(): string {
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
           <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">

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
    import Panzoom from "https://esm.sh/@panzoom/panzoom";
    mermaid.initialize({
  startOnLoad: true,
  theme: 'forest',
});

    const vscode = acquireVsCodeApi();

    mermaid.run().then(() => {
    
        const counts = {};
            
        const elements = document.querySelectorAll('.messageText');
        elements.forEach(element => {
        const raw=element.textContent
        const colonIndex=raw.indexOf(":");

        let fn=raw.substring(colonIndex+1);  // Remove leading numbers like "1:", "2.1:" etc.
        fn=fn.substring(0,fn.indexOf("("));
        fn = fn.trim();
        counts[fn] = (counts[fn] || 0) + 1;
        console.log("抽出:",raw, "→",fn, counts[fn]);
    });

        elements.forEach(element => {
       const raw=element.textContent
        const colonIndex=raw.indexOf(":");

        let fn=raw.substring(colonIndex+1);  // Remove leading numbers like "1:", "2.1:" etc.
        fn=fn.substring(0,fn.indexOf("("));
        fn = fn.trim();
        if (fn===""){
            return;
        }
        if (counts[fn] >= 3) {
            element.style.fill = "orange";  // or backgroundColor, stroke, etc.
        }
        if (counts[fn] >= 10) {
            element.style.fill = "red";  // or backgroundColor, stroke, etc.
        }

            element.classList.add('clickable');
            element.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'jumpToFunction',
                    functionName: fn
                });
            });
        });
    });
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
            <div id="controls">
                <button id="zoomIn">＋</button>
                <button id="zoomOut">－</button>
                <button id="reset">reset</button>
            </div>
            <h1>Sequence Diagram</h1>
            <div id="diagram">
                <div class="mermaid">
                ${this._mermaidCode}
                </div>
            </div>
            <script type='module' src='${this._script}'></script>
          </body>
        `;
    }

    /**
     * Generates the footer section of the HTML content.
     * @returns The footer section of the HTML content.
     */
    public foot() {
        return `
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
        // functionName = functionName
        //     .replace(/^(\d+(\.\d+)?:\s*)?/, '')  //remove optional line number prefix
        //     .replace(/\([\s\S]*\)?$/, '')        //remove arguments and closing parenthesis
        //     .trim();                             // Clean up whitespace


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