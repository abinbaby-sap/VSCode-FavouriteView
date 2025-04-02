# VSCode-FavouriteView
Favourite View extension in VS Code

- Learn more about [Views](https://code.visualstudio.com/api/ux-guidelines/views) and [TreeViews](https://code.visualstudio.com/api/extension-guides/tree-view#view-actions)

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
   You can download the icon from this repository and add the icon to a new folder, "resources", under the favourite"src" folder

2. Create a new file `src/favouritesView.ts` to define the view:
   ```typescript
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
   
     addFavourite(resourceUri: vscode.Uri) {
       this.favourites.push(new FavouriteItem(resourceUri));
       this.refresh();
     }
   }
   
   export class FavouriteItem extends vscode.TreeItem {
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
     // register the tree view provider
     const favouritesViewProvider = new FavouritesViewProvider();
     vscode.window.registerTreeDataProvider('favouritesView', favouritesViewProvider);
   
     // register a new command to add a favourite file to the Favourites view
     context.subscriptions.push(vscode.commands.registerCommand('favourites.addFavourite', (resourceUri: vscode.Uri) => {
   	favouritesViewProvider.addFavourite(resourceUri);
   	vscode.window.showInformationMessage(`Favourite ${resourceUri.fsPath} added`);
     }));
   }
   
   export function deactivate() {}
   ```
   
4. Test the extension. You should see a new Favourite View added to the Activity bar on the left pane of VS Code
   

### Step 3: Add an Open Favourite Command and an Explorer View Menu Contribution to Add a File to the Favourites View from Explorer View

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

2. Test the extension. You should see a context menu option when you right-click on a file in the Explorer view: "Add to Favourites"
3. Selecting the context menu option will add the file to the Favourites View

### Step 4: Provide the Menu Contribution also from the Source Editor

1. Include the following menu contribution to `package.json` under menus:
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
2. Test the extension. The context menu now appears on the Source Code Editor as well

### Step 5: Support a custom user input as the label for the Favourite file added

1. Update `src/favouritesView.ts` to handle the label for a Favourite Item:
   ```typescript
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
       }
   
       iconPath = vscode.ThemeIcon.File;
   }
   ```

2. Modify the `addFavourite` command in `src/extension.ts` to prompt the user for a label:
   ```typescript
   import * as vscode from 'vscode';
   import { FavouritesViewProvider } from './favouritesView';
   
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
   	}else{
   		vscode.window.showErrorMessage('Label is required');
   	};
   	});
   }));
   }
   
   export function deactivate() {}
   ```

3. Test the extension. Adding a favourite item will show a user input box to get the Label. The Favourite view will also display this label.

### Step 6: Add a new command to Open the File from the Favourite View on click. Also add the command as a context menu option in a Favourite Item in the view.

1. Add the following command contribution to `package.json` under commands. Also, add the command as a context menu for Favourite View under menus:
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
   ```

3. Update `src/favouritesView.ts` to add a command to each TreeItem to open the file in the editor on Click
   ```typescript
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
   ```

### Test the final extension

1. Run the extension by pressing `F5` to open a new VS Code window with your extension loaded.
2. Test adding files to the Favourites view from both the Explorer and the Editor. 
3. When adding a file, you should also be prompted to enter a label for the favourite.
4. Right click or click on each Favourite item in the Favourites view to open the editor

