import * as vscode from 'vscode';
import { FavouriteItem, FavouritesViewProvider } from './favouritesView';

export function activate(context: vscode.ExtensionContext) {
	// register the tree view provider
	const favouritesViewProvider = new FavouritesViewProvider();
	vscode.window.registerTreeDataProvider('favouritesView', favouritesViewProvider);

	// register a new command to add a favourite file to the Favourites view
	context.subscriptions.push(vscode.commands.registerCommand('favourites.addFavourite', (resourceUri: vscode.Uri) => {
		vscode.window.showInputBox({ prompt: 'Enter a name for the favourite' }).then(label => {
			if (label) {
				favouritesViewProvider.addFavourite(label, resourceUri);
				vscode.window.showInformationMessage(`Favourite ${label} added`);
			} else {
				vscode.window.showErrorMessage('Label is required');
			};
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('favourites.openFavourite', (favoutiteItem: FavouriteItem) => {
        vscode.window.showTextDocument(favoutiteItem.resourceUri);
    }));
}

export function deactivate() { }
