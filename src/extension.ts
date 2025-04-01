import * as vscode from 'vscode';
import { FavouritesViewProvider, FavouriteItem } from './favouritesView';

export function activate(context: vscode.ExtensionContext) {
  const favouritesViewProvider = new FavouritesViewProvider();
  vscode.window.registerTreeDataProvider('favouritesView', favouritesViewProvider);

  context.subscriptions.push(vscode.commands.registerCommand('favourites.refresh', () => favouritesViewProvider.refresh()));
  context.subscriptions.push(vscode.commands.registerCommand('favourites.openFavourite', (favoutiteItem: FavouriteItem) => {
    vscode.window.showTextDocument(favoutiteItem.resourceUri);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('favourites.addFavourite', (resourceUri: vscode.Uri) => {
    vscode.window.showInputBox({ prompt: 'Enter a name for the favourite' }).then(label => {
      if (label) {
        favouritesViewProvider.addFavourite(label, resourceUri);
        vscode.window.showInformationMessage(`Favourite ${label} added`);
      }else{
        vscode.window.showErrorMessage('Label is required');
      };
    });
  }));
}

export function deactivate() {}