import * as vscode from 'vscode'
import { Controller } from './controller'
import { SequenceDiagramViewProvider } from './sequence-diagram-view-provider'

export const output = vscode.window.createOutputChannel('PySequenceReverse')
// todo create superclass of SequenceDiagramViewProvider and SequenceDiagramPanel
// ################################################################################################################################
/**
 * Returns the default progress options for a notification progress bar.
 * @param title - The title of the progress bar.
 * @returns The default progress options object.
 */
const getDefaultProgressOptions = (title: string): vscode.ProgressOptions => {
    return {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true
    }
}

// ################################################################################################################################
/**
 * Activates the extension and registers a command to create a sequence diagram.
 * @param context - The VS Code extension context.
 */
// export function activate(context: vscode.ExtensionContext) {

//     const provider = new SequenceDiagramViewProvider(context.extensionUri);
//     context.subscriptions.push(
//         vscode.window.registerWebviewViewProvider(
//             // 👇 package.jsonに記述したviewsのidを設定する 👇
//             "myExtension.view",å
//             provider,
//         ),
//     );
//     const commandDisposable = vscode.commands.registerCommand(
//         'PySequenceReverse.createSequenceDiagram',
//         async () => {
//             vscode.window.withProgress(
//                 getDefaultProgressOptions('Generate sequence diagram'),

//                 new Controller().generateSequenceDiagram(context)
//             )
//         }
//     )
//     context.subscriptions.push(commandDisposable)

// }

export function activate(context: vscode.ExtensionContext) {
    const displayMode = vscode.workspace.getConfiguration().get<string>('sequenceDiagram.displayMode: choice of display mode') ?? 'view';
    //todo
    const test = (x: any) => (x);
    test(displayMode);
    //todo end
    
    let display = new SequenceDiagramViewProvider(context.extensionUri);
        
        context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            // 👇 package.jsonに記述したviewsのidを設定する 👇
            "myExtension.view",
            display,
        ),
    );

    
    
    const commandDisposable = vscode.commands.registerCommand(
        'PySequenceReverse.createSequenceDiagram',
        async () => {
            vscode.window.withProgress(
                getDefaultProgressOptions('Generate sequence diagram'),

                new Controller(display).generateSequenceDiagram(context)
            )
        }
    )
    context.subscriptions.push(commandDisposable)

}

