import * as vscode from 'vscode';

import { HtmlProvider } from './html-provider';

// ################################################################################################################################
/**
 * Webview for displaying sequence diagrams .
 */
export class SequenceDiagramViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _htmlProvider: HtmlProvider;

    /**
     * Initializes a new instance of the SequenceDiagramViewProvider class.
     * @param extensionUri - The URI of the extension.
     */
    constructor(private readonly extensionUri: vscode.Uri) {
        this._htmlProvider = new HtmlProvider('');
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
        

        // const scriptPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'events.js');
        // this._script = this._view.webview.asWebviewUri(scriptPath);

        // // this._scripts.push(script);
        
        // Logger.log(`Script Path: ${scriptPath}`);
        // Logger.log(`Script URI: ${this._script}`);
        // Set the  HTML content
        webviewView.webview.html = this._htmlProvider.getHtml();

        // Handle messages from the webview.
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'jumpToFunction') {
                await this.jumpToFunction(message.functionName);
            }
        });
    }

    // /**
    //  * Sets the HtmlProvider instance to use.
    //  * @param htmlProvider - The HtmlProvider instance to set.
    //  */
    // setHtmlProvider(htmlProvider: HtmlProvider) {
    //     this._htmlProvider = htmlProvider;
    // }

    /**
     * Updates the Mermaid diagram in the webview.
     * @param mermaidCode - The Mermaid code to update the diagram with.
     */
    public updateDiagram(mermaidCode: string) {
        this._htmlProvider.setMermaidCode(mermaidCode);
        if (this._view) {
            this._view.webview.html = this._htmlProvider.getHtml();
        }
    }

    /**
     * Jumps to the specified function in the codebase.
     * @param functionName - The name of the function to jump to.
     */
    private async jumpToFunction(functionName: string) {

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
    }

}