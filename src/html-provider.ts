import * as vscode from 'vscode';

import { Logger } from './logging';
// ################################################################################################################################
/**
 * html for displaying webView.
 */

export class HtmlProvider{

        /**
         * Initializes a new instance of the HtmlProvider class.
         */

        /**
         * The Mermaid code to be displayed in the webview.
         */
        private _mermaidCode: string;

        /**
         * The script URI for the webview.
         */
        private _script: vscode.Uri; // Placeholder for the script URI

        /**
         * Initializes a new instance of the HtmlProvider class.
         * @param mermaidCode - The Mermaid code to be displayed in the webview.
         */


        /**
         * Initializes a new instance of the HtmlProvider class.
         * @param mermaidCode - The Mermaid code to be displayed in the webview.
         */
        constructor( mermaidCode: string) {
            this._mermaidCode = mermaidCode;
            this._script = vscode.Uri.parse('');
        }

        

    /**
     * Generates the complete HTML content for the webview.
     * @returns The complete HTML content as a string.
     */
    public getHtml(): string {
        return `
          ${this.head()}
          ${this.body()}
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
        let thresholds_Orange = vscode.workspace.getConfiguration().get<number>('py-sequence-reverse.Thresholds: Thresholds for Orange') ?? 3; 
        let thresholds_Red = vscode.workspace.getConfiguration().get<number>('py-sequence-reverse.Thresholds: Thresholds for Red') ?? 10;
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
        if (counts[fn] >= ${thresholds_Orange}) {
            element.style.fill = "orange";  // or backgroundColor, stroke, etc.
        }
        if (counts[fn] >= ${thresholds_Red}) {
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
        </html>
        `;
    }
}