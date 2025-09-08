import * as vscode from 'vscode'
import { Controller } from './controller'
import { SequenceDiagramViewProvider } from './sequence-diagram-view-provider'
import { Logger } from './logging'

export const output = vscode.window.createOutputChannel('PySequenceReverse')

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
//             "myExtension.view",
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

    let webviewProvider = new SequenceDiagramViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            // 👇 package.jsonに記述したviewsのidを設定する 👇
            "myExtension.view",
            webviewProvider,
        ),
    );
    const commandDisposable = vscode.commands.registerCommand(
        'PySequenceReverse.createSequenceDiagram',
        async () => {
            vscode.window.withProgress(
                getDefaultProgressOptions('Generate sequence diagram'),

                new Controller( webviewProvider).generateSequenceDiagram(context)
            )
        }
    )
    context.subscriptions.push(commandDisposable)

}

