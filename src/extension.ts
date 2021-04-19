import * as vscode from 'vscode';
import { DatabaseEditorProvider } from './databaseEditor';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(DatabaseEditorProvider.register(context));
}
