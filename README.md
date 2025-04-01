# VSCode-FavouriteView
Favourite View extension in VS Code

Let's break it down step by step. We'll start with setting up the extension and adding a basic Favourites view.

### Step 1: Set Up Your Extension

1. Open a terminal in VS Code.
2. Create a new TypeScript extension for Favourites View

### Step 2: Add a New Favourites View

1. Open `package.json` and add the following contribution to create a new view and add the view to the Activity bar in VS Code:
   ```json
   "contributes": {
     "viewsContainers": {
       "activitybar": [
         {
           "id": "favourites",
           "title": "Favourites",
           "icon": "./src/resources/favourites.svg"
         }
       ]
     },
     "views": {
       "favourites": [
         {
           "id": "favouritesView",
           "name": "Favourites"
         }
       ]
     }
   }
   ```

2. Create a new file `src/favouritesView.ts` to define the view:
   ```typescript
   import * as vscode from 'vscode';

   // More details about TreeView APis at https://code.visualstudio.com/api/extension-guides/tree-view
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

     getChildren(element?: FavouriteItem): Thenable<FavouriteItem[]> {
       if (element) {
         return Promise.resolve([]);
       } else {
         return Promise.resolve(this.favourites);
       }
     }

     addFavourite(resourceUri: vscode.Uri) {
       this.favourites.push(new FavouriteItem(resourceUri));
       this.refresh();
     }
   }

   class FavouriteItem extends vscode.TreeItem {
     constructor(
       public readonly resourceUri: vscode.Uri
     ) {
       super(resourceUri.fsPath, vscode.TreeItemCollapsibleState.None);
       this.resourceUri = resourceUri;
     }

     iconPath = vscode.ThemeIcon.File;
   }
   ```

3. Register the view provider in `src/extension.ts`:
   ```typescript
   import * as vscode from 'vscode';
   import { FavouritesViewProvider } from './favouritesView';

   export function activate(context: vscode.ExtensionContext) {
     const favouritesViewProvider = new FavouritesViewProvider();
     vscode.window.registerTreeDataProvider('favouritesView', favouritesViewProvider);

     context.subscriptions.push(vscode.commands.registerCommand('favourites.refresh', () => favouritesViewProvider.refresh()));
     context.subscriptions.push(vscode.commands.registerCommand('favourites.addFavourite', (resourceUri: vscode.Uri) => {
       favouritesViewProvider.addFavourite(resourceUri);
       vscode.window.showInformationMessage(`Favourite ${resourceUri.fsPath} added`);
     }));
   }

   export function deactivate() {}
   ```

### Step 3: Add a Command and Menu Contribution to Add a File to the Favourites View from Explorer View

1. Add the command and menu contribution to `package.json`:
    ```json
    "contributes": {
        "viewsContainers": {
            "activitybar": [
                {
                    "id": "favourites",
                    "title": "Favourites",
                    "icon": "./src/resources/favourites.svg"
                }
            ]
        },
        "views": {
            "favourites": [
                {
                    "id": "favouritesView",
                    "name": "Favourites"
                }
            ]
        },
        "commands": [
            {
                "command": "favourites.addFavourite",
                "title": "Add to Favourites"
            }
        ],
        "menus": {
            "explorer/context": [
                {
                    "command": "favourites.addFavourite",
                    "group": "navigation"
                }
            ]
        }
    }
   ```

### Step 4: Provide the Menu Contribution from the Editor

1. Add the following menu contribution to `package.json` under menus:
   ```json
   "contributes": {
     "menus": {
       "editor/context": [
         {
           "command": "favourites.addFavourite",
           "group": "navigation"
         }
       ]
     }
   }
   ```

### Step 5: Update the Command to Include an Input Box for the Label for a Favourite item

1. Modify the `addFavourite` command in `src/extension.ts` to prompt the user for a label:
   ```typescript
    import * as vscode from 'vscode';
    import { FavouritesViewProvider } from './favouritesView';

    export function activate(context: vscode.ExtensionContext) {
    const favouritesViewProvider = new FavouritesViewProvider();
    vscode.window.registerTreeDataProvider('favouritesView', favouritesViewProvider);

    context.subscriptions.push(vscode.commands.registerCommand('favourites.refresh', () => favouritesViewProvider.refresh()));
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
   ```

2. Update `src/favouritesView.ts` to handle the label:
   ```typescript
   import * as vscode from 'vscode';

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

     getChildren(element?: FavouriteItem): Thenable<FavouriteItem[]> {
       if (element) {
         return Promise.resolve([]);
       } else {
         return Promise.resolve(this.favourites);
       }
     }

     addFavourite(label: string, resourceUri: vscode.Uri) {
       this.favourites.push(new FavouriteItem(label, resourceUri));
       this.refresh();
     }
   }

   class FavouriteItem extends vscode.TreeItem {
     constructor(
       public readonly label: string,
       public readonly resourceUri: vscode.Uri
     ) {
       super(label, vscode.TreeItemCollapsibleState.None);
       this.resourceUri = resourceUri;
       this.description = resourceUri.fsPath;
     }

     iconPath = vscode.ThemeIcon.File;
   }
   ```

### Step 6: Add a command to Open the File from Favourite View

1. Add the following command contribution to `package.json` under commands. Also add the command as a context menu for Favourite View under menus:
   ```json
   "contributes": {
    
     "commands": [
       {
         "command": "favourites.openFavourite",
         "title": "Open Favourite"
       }
     ],

     "menus": {
      "view/item/context": [
        {
          "command": "favourites.openFavourite",
          "when": "view == favouritesView",
          "group": "navigation"
        }
      ]
    }

   }
   ```
2. Register the `openFavourite` command in `src/extension.ts`:

   ```typescript
    import * as vscode from 'vscode';
    import { FavouritesViewProvider } from './favouritesView';

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
   ```

3. Update `src/favouritesView.ts` to add command to each TreeItem to open the file in editor on Click
   ```typescript
   import * as vscode from 'vscode';

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

     getChildren(element?: FavouriteItem): Thenable<FavouriteItem[]> {
       if (element) {
         return Promise.resolve([]);
       } else {
         return Promise.resolve(this.favourites);
       }
     }

     addFavourite(label: string, resourceUri: vscode.Uri) {
       this.favourites.push(new FavouriteItem(label, resourceUri));
       this.refresh();
     }
   }

   class FavouriteItem extends vscode.TreeItem {
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
   ```

### Test the final extension

1. Run the extension by pressing `F5` to open a new VS Code window with your extension loaded.
2. Test adding files to the Favourites view from both the Explorer and the Editor. When adding a file, you should also be prompted to enter a label for the favourite.

