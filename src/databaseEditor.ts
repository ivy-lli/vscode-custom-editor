import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class DatabaseEditorProvider implements vscode.CustomTextEditorProvider {
  static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new DatabaseEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(DatabaseEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'ivy.custom-db-editor';

  constructor(
    private readonly context: vscode.ExtensionContext
  ) { }

  resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    //const caseMapHtml = fs.readFileSync(path.join(this.context.extensionPath, "casemap", "index.html"), 'utf-8');
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
      });
    }

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(e => {
      console.log(e);
    });

    updateWebview();
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const caseMapUri = vscode.Uri.joinPath(this.context.extensionUri, 'casemap');
    const fontUri = vscode.Uri.joinPath(caseMapUri, 'fonts');
    const fontRoboto = webview.asWebviewUri(vscode.Uri.joinPath(fontUri, 'roboto', 'fonts.css'));
    const fontMaterial = webview.asWebviewUri(vscode.Uri.joinPath(fontUri, 'material-icons', 'fonts.css'));
    const fontCM = webview.asWebviewUri(vscode.Uri.joinPath(fontUri, 'casemap', 'ivy-cm-icons.css'));
    const fontFA = webview.asWebviewUri(vscode.Uri.joinPath(fontUri, 'font-awesome', 'css', 'font-awesome.min.css'));

    const cssCM = webview.asWebviewUri(vscode.Uri.joinPath(caseMapUri, 'css', 'casemapui.css'));

    const jsShim = webview.asWebviewUri(vscode.Uri.joinPath(caseMapUri, 'js', 'shim.min.js'));
    const jsMaterial = webview.asWebviewUri(vscode.Uri.joinPath(caseMapUri, 'js', 'material.min.js'));
    const jsCM = webview.asWebviewUri(vscode.Uri.joinPath(caseMapUri, 'js', 'casemapui.min.js'));
    return /* html */`
		<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    <title>Simple Case Map</title>
    <link rel="stylesheet" href="${fontRoboto}">
    <link rel="stylesheet" href="${fontMaterial}">
    <link rel="stylesheet" href="${fontCM}">
    <link rel="stylesheet" href="${fontFA}">
    <link href="${cssCM}" rel="stylesheet">    
</head>

<body>
    <script src="${jsShim}"></script>
    
    <div id="casemapui-app"></div>
    
	<script src="${jsMaterial}"></script>
    <script src="${jsCM}"></script>
</body>
</html>`;
  }

}