import * as vscode from 'vscode';

// More details about TreeView APIs at https://code.visualstudio.com/api/extension-guides/tree-view
export class FavouritesViewProvider implements vscode.TreeDataProvider<FavouriteItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FavouriteItem | undefined | void> = new vscode.EventEmitter<FavouriteItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FavouriteItem | undefined | void> = this._onDidChangeTreeData.event;

  private favourites: FavouriteItem[] = [];

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FavouriteItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FavouriteItem): FavouriteItem[] {
    if (element) {
      return [];
    } else {
      return this.favourites;
    }
  }

  addFavourite(label: string, resourceUri: vscode.Uri) {
    this.favourites.push(new FavouriteItem(label, resourceUri));
    this.refresh();
  }
}

export class FavouriteItem extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      public readonly resourceUri: vscode.Uri
    ) {
      super(label, vscode.TreeItemCollapsibleState.None);
      this.resourceUri = resourceUri;
      this.description = resourceUri.fsPath;
      this.command = { command: 'favourites.openFavourite', title: 'Open Favourite File', arguments: [this] };
    }

    iconPath = vscode.ThemeIcon.File;
}
