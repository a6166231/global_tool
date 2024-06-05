// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands } from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const senderCMD = commands.registerTextEditorCommand('supernotice.allSender', (editor) => {
		allNoticeFormat(editor, CustomRuleType.send);
	});
	const reciveCMD = commands.registerTextEditorCommand('supernotice.allReciver', (editor) => {
		allNoticeFormat(editor, CustomRuleType.recive, CustomRuleType.send);
	});
	context.subscriptions.push(senderCMD, reciveCMD);
}

// This method is called when your extension is deactivated
export function deactivate() { }

enum CustomRuleType {
	send = 'send',
	recive = 'recive',
}

async function allNoticeFormat(editor: vscode.TextEditor, rule: CustomRuleType, subRule?: CustomRuleType) {
	const target = editor.document.uri;
	const pos = editor.selection.active;
	vscode.commands.executeCommand<vscode.Location[]>('vscode.executeReferenceProvider', target, pos).then(async locations => {
		locations = await checkLocationsListByRule(locations || [], rule, subRule);
		showReferences(locations);
	});
}

async function checkLocationsListByRule(locations: Array<vscode.Location>, rule: CustomRuleType, subRule?: CustomRuleType) {
	let cfg: Record<string, string> = vscode.workspace.getConfiguration("supernotice").get("noticeLink", {});

	let links: Array<string> = cfg[rule] && cfg[rule].length > 0 ? cfg[rule].split('|') : [];

	let subRuleStatus = false;
	if (links.length === 0 && subRule) {
		subRuleStatus = true;
		links = cfg[subRule] && cfg[subRule].length > 0 ? cfg[subRule].split('|') : [];
	}

	if (links.length > 0) {
		for (let i = 0; i < locations.length; i++) {
			let location = locations[i];
			const document = await vscode.workspace.openTextDocument(location.uri);
			const lineText = document.lineAt(location.range.start.line).text;
			let status = false;
			for (let key of links) {
				if (subRuleStatus && !lineText.includes(key) || (!subRuleStatus && lineText.includes(key))) {
					status = true;
					break;
				}
			}
			if (!status) {
				locations.splice(i, 1);
				i--;
			}
		}
	}
	return locations;
}

function showReferences(locations: Array<vscode.Location>) {
	const activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		vscode.commands.executeCommand(
			'editor.action.showReferences',
			activeEditor.document.uri,
			activeEditor.selection.active,
			locations
		);
	}
}