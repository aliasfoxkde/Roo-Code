# FlexLayout
[![GitHub](https://img.shields.io/github/license/Caplin/FlexLayout)](https://github.com/caplin/FlexLayout/blob/master/LICENSE)
![npm](https://img.shields.io/npm/dw/flexlayout-react)
[![npm](https://img.shields.io/npm/v/flexlayout-react)](https://www.npmjs.com/package/flexlayout-react)

FlexLayout is a layout manager that arranges React components in multiple tabsets, tabs can be resized and moved.

![FlexLayout Demo Screenshot](screenshots/Screenshot_light.png?raw=true "FlexLayout Demo Screenshot")

[Run the Demo](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/demo/index.html)

Try it now using [CodeSandbox](https://codesandbox.io/p/sandbox/yvjzqf)

[API Doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/index.html)

[Screenshot of Caplin Liberator Explorer using FlexLayout](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.20/images/LiberatorExplorerV3_3.PNG)

FlexLayout's only dependency is React.

Features:
*	splitters
*	tabs (scrolling or wrapped)
*	tab dragging and ordering
*	tabset dragging (move all the tabs in a tabset in one operation)
*	dock to tabset or edge of frame
*	maximize tabset (double click tabset header or use icon)
*	tab overflow (show menu when tabs overflow, scroll tabs using mouse wheel)
*   border tabsets
*   popout tabs into new browser windows
*	submodels, allow layouts inside layouts
*	tab renaming (double click tab text to rename)
*	theming - light, dark, underline, gray, rounded and combined
*	works on mobile devices (iPad, Android)
*   add tabs using drag, add to active tabset, add to tabset by id
*	tab and tabset attributes: enableTabStrip, enableDock, enableDrop...
*	customizable tabs and tabset rendering
*   component state is preserved when tabs are moved
*   Playwright tests
*	typescript type declarations

## Installation
FlexLayout is in the npm repository. install using:

```
npm install flexlayout-react
```

Import FlexLayout in your modules:

```
import {Layout, Model} from 'flexlayout-react';
```

Include the light, dark, underline, gray, rounded or combined theme by either:

Adding an import in your js code:

```
import 'flexlayout-react/style/light.css';
```

or by copying the relevant css from the node_modules/flexlayout-react/style directory to your
 public assets folder (e.g. public/style) and linking the css in your html:

```
<link rel="stylesheet" href="/style/light.css" />
```

[How to change the theme dynamically in code](#dynamically-changing-the-theme)

## Usage
The `<Layout>` component renders the tabsets and splitters, it takes the following props:

#### Required props:
| Prop            | Description       |
| --------------- | ----------------- |
| model           | the layout model  |
| factory         | a factory function for creating React components |

Additional [optional props](#optional-layout-props)

The model is tree of Node objects that define the structure of the layout.

The factory is a function that takes a Node object and returns a React component that should be hosted by a tab in the layout.

The model can be created using the Model.fromJson(jsonObject) static method, and can be saved using the model.toJson() method.

## Example Configuration:
```javascript
const json = {
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "One",
                        component: "placeholder",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Two",
                        component: "placeholder",
                    }
                ]
            }
        ]
    }
};
```

## Example Code

```javascript
const model = Model.fromJson(json);

function App() {

  const factory = (node) => {
    const component = node.getComponent();

    if (component === "placeholder") {
      return <div>{node.getName()}</div>;
    }
  }

  return (
    <Layout
      model={model}
      factory={factory} />
  );
}
```

The above code would render two tabsets horizontally each containing a single tab that hosts a div component (returned from the factory). The tabs could be moved and resized by dragging and dropping. Additional tabs could be added to the layout by sending actions to the model.

<img src="screenshots/Screenshot_two_tabs.png?raw=true" alt="Simple layout" title="Generated Layout"/>

Try it now using [CodeSandbox](https://codesandbox.io/p/sandbox/yvjzqf)

A simple Typescript example can be found here:

https://github.com/nealus/flexlayout-vite-example

The model json contains 4 top level elements:

* global - (optional) where global options are defined
* layout - where the main row/tabset/tabs layout hierarchy is defined
* borders - (optional) where up to 4 borders are defined ("top", "bottom", "left", "right").
* popouts - (optional) where the popout windows are defined

The layout element is built up using 3 types of 'node':

* row - rows contains a list of tabsets and child rows, the top level 'row' will render horizontally (unless the global attribute rootOrientationVertical is set)
, child 'rows' will render in the opposite orientation to their parent row.

* tabset - tabsets contain a list of tabs and the index of the selected tab

* tab - tabs specify the name of the component that they should host (that will be loaded via the factory) and the text of the actual tab.

The layout structure is defined with rows within rows that contain tabsets that themselves contain tabs.

Within the demo app you can show the layout structure by ticking the 'Show layout' checkbox, rows are shown in blue, tabsets in orange.

![FlexLayout Demo Showing Layout](screenshots/Screenshot_layout.png?raw=true "Demo showing layout")

The optional borders element is made up of border nodes

* border - borders contain a list of tabs and the index of the selected tab, they can only be used in the borders
top level element.

The tree structure for the JSON model is well defined as Typescript interfaces, see  [JSON Model](#json-model-definition)

Each type of node has a defined set of requires/optional attributes.

Weights on rows and tabsets specify the relative weight of these nodes within the parent row, the actual values do not matter just their relative values (ie two tabsets of weights 30,70 would render the same if they had weights of 3,7).

NOTE: the easiest way to create your initial layout JSON is to use the [demo](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/demo/index.html) app, modify one of the
existing layouts by dragging/dropping and adding nodes then press the 'Show Layout JSON in console' button to print the JSON to the browser developer console.

By changing global or node attributes you can change the layout appearance and functionality, for example:

Setting tabSetEnableTabStrip:false in the global options would change the layout into a multi-splitter (without
tabs or drag and drop).

```
 global: {tabSetEnableTabStrip:false},
```

## Dynamically Changing the Theme
The 'combined.css' theme contains all the other themes and can be used for theme switching.

When using combined.css, add a className (of the form "flexlayout__theme_[theme name]") to the div containing the `<Layout>` to select the applied theme.

For example:
```
    <div ref={containerRef} className="flexlayout__theme_light">
        <Layout model={model} factory={factory} />
    </div>
```

Change the theme in code by changing the className on the containing div.

For example:
```
    containerRef.current!.className = "flexlayout__theme_dark"
```

## Customizing Tabs
You can use the `<Layout>` prop onRenderTab to customize the tab rendering:

<img src="screenshots/Screenshot_customize_tab.png?raw=true"
     alt="FlexLayout Tab structure"
     title="Tab structure"/>

Update the renderValues parameter as needed:

renderValues.leading : the red block

renderValues.content : the green block

renderValues.buttons : the yellow block

For example:

```
onRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
    // renderValues.leading = <img style={{width:"1em", height:"1em"}}src="images/folder.svg"/>;
    // renderValues.content += " *";
    renderValues.buttons.push(<img key="menu" style={{width:"1em", height:"1em"}} src="images/menu.svg"/>);
}
```

## Customizing Tabsets
You can use the `<Layout>` prop onRenderTabSet to customize the tabset rendering:

<img src="screenshots/Screenshot_customize_tabset.png?raw=true"
     alt="FlexLayout Tab structure"
     title="Tabset structure" />

Update the renderValues parameter as needed:

renderValues.leading : the blue block

renderValues.stickyButtons : the red block

renderValues.buttons : the green block

For example:

```
onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
    renderValues.stickyButtons.push(
        <button
            key="Add"
            title="Add"
            className="flexlayout__tab_toolbar_button"
            onClick={() => {
                model.doAction(Actions.addNode({
                    component: "placeholder",
                    name: "Added " + nextAddIndex.current++
                }, node.getId(), DockLocation.CENTER, -1, true));
            }}
        ><AddIcon/></button>);

    renderValues.buttons.push(<img key="menu" style={{width:"1em", height:"1em"}} src="images/menu.svg"/>);
}
```

## Model Actions
Once the model json has been loaded all changes to the model are applied through actions.

You apply actions using the `Model.doAction()` method.

This method takes a single argument, created by one of the action
generators (accessed as `FlexLayout.Actions.<actionName>`):

[Actions doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/classes/Actions.html)

### Examples
```js
model.doAction(FlexLayout.Actions.addNode(
    {type:"tab", component:"grid", name:"a grid", id:"5"},
    "1", FlexLayout.DockLocation.CENTER, 0));
```

This example adds a new grid component to the center of tabset with id "1" and at the 0'th tab position (use value -1 to add to the end of the tabs).


```js
model.doAction(FlexLayout.Actions.updateModelAttributes({
    splitterSize:40
}));
```

The above example would increase the size of the splitters, this could be used to make
adjusting the layout easier on a small device.

Note: you can get the id of a node (e.g., the node returned by the `addNode`
action) using the method `node.getId()`.
If an id wasn't assigned when the node was created, then one will be created for you of the form `#<uuid>` (e.g. `#0c459064-8dee-444e-8636-eb9ab910fb27`).

Note: You can intercept actions resulting from GUI changes before they are applied by
implementing the `onAction` callback property of the `Layout`.

## Optional Layout Props
There are many optional properties that can be applied to the layout:

[Layout Properties doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/ILayoutProps.html)

## JSON Model Definition
The JSON model is well defined as a set of TypeScript interfaces, see the doc for details of all the attributes allowed:

## Model Config Attributes
[Model Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonModel.html)

## Global Config Attributes
[Global Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IGlobalAttributes.html)

## Row Config Attributes
[Row Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonRowNode.html)

## TabSet Config Attributes
[Tabset Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonTabSetNode.html)

Note: tabsets will be dynamically created as tabs are moved, and deleted when all their tabs are removed (unless enableDeleteWhenEmpty is false).

## Tab Config attributes
[Tab Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonTabNode.html)

## Border Config attributes
[Border Attributes doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/interfaces/IJsonBorderNode.html)


## Layout Component Methods to Create New Tabs
There are methods on the Layout Component for adding tabs:

[Layout Methods doc](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.8/typedoc/classes/Layout.html)

Example:
```
layoutRef.current.addTabToTabSet("NAVIGATION", {type:"tab", component:"grid", name:"a grid"});
```
This would add a new grid component to the tabset with id "NAVIGATION" (where layoutRef is a ref to the Layout element, see https://reactjs.org/docs/refs-and-the-dom.html ).


## Tab Node Events
You can handle events on nodes by adding a listener, this would typically be done
when the component is mounted in a useEffect method:

Example:
```
    function MyComponent({node}) {

      useEffect(() => {
        // save subject in flexlayout node tree
        node.setEventListener("save", () => {
             node.getConfig().subject = subject;
           };
        }, []);
    }
```

| Event        | parameters          | Description  |
| ------------- |:-------------:| -----|
| resize |  {rect}    |  called when tab is resized during layout, called before it is rendered with the new size|
| close |   none   |  called when a tab is closed |
| visibility |  {visible}    | called when the visibility of a tab changes |
| save |   none   | called before a tabnode is serialized to json, use to save node config by adding data to the object returned by node.getConfig()|

## Popout Windows
Tabs can be rendered into external browser windows (for use in multi-monitor setups)
by configuring them with the enablePopout attribute. When this attribute is present
an additional icon is shown in the tab header bar allowing the tab to be popped out
into an external window.

For popouts to work there needs to be an additional html page 'popout.html' hosted
at the same location as the main page (copy the one from the demo app). The popout.html is the host page for the
popped out tab, the styles from the main page will be copied into it at runtime.

Because popouts are rendering into a different document to the main layout any code in the popped out
tab that uses the global document or window objects for event listeners will not work correctly (for example custom popup menus where the code uses document.addEventListener(...)),
they need to instead use the document/window of the popout. To get the document/window of the popout use the
following method on one of the elements rendered in the popout (for example a ref or target in an event handler):

```
    const currentDocument = selfRef.current.ownerDocument;
    const currentWindow = currentDocument.defaultView!;
```

In the above code selfRef is a React ref to the toplevel element in the tab being rendered.

Note: libraries may support popout windows by allowing you to specify the document to use,
for example see the getDocument() callback in agGrid at https://www.ag-grid.com/javascript-grid-callbacks/

### Limitations of Popouts
* FlexLayout uses React Portals to draw the popout window content,
    this means all the code runs in the main Window's JS context, so effectively the popout windows are just extensions of the area on which the main window can render panels.

* Your code must use the popout window/document in popout windows when adding event listeners (e.g popoutDocument.addEventListener(...)).

* Timers throttle when main window is in the background
    you could implement a webworker timer replacement if needed (which will not throttle)
* Many third party controls will use the global document for some event listeners,
    these will not work correctly without modification
* Some third party controls will suspend when the global document is hidden
    you can use the tab overlay attribute to 'gray out' these tabs when the main window is hidden
* Resize observers may be throttled (or stay attached to the main window), so you may need to use some other way to resize the component when in a popout.
* Popouts will not size and position correctly when the browser is zoomed (ie set to 50% zoom)
* Popouts cannot reload in maximized or minimized states
* by default flexlayout will maintain react state when moving tabs between windows, but you can use the
enableWindowReMount tab attribute to force the component to re-mount.

See this article about using React portals in this way: https://dev.to/noriste/the-challenges-of-rendering-an-openlayers-map-in-a-popup-through-react-2elh

## Running the Demo and Building the Project
First install dependencies:

```
pnpm install
```

Run the Demo app:

```
pnpm dev
```

The 'pnpm dev' command will watch for changes to FlexLayout and the Demo, so you can make changes to the FlexLayout code and see the changes in your browser.

Once the demo is running you can run the Playwright tests by running (in another terminal window)

```
pnpm playwright
```

<img src="screenshots/PlaywrightUI.png?raw=true" alt="PlaywrightUI" title="PlaywrightUI screenshot"/>

To build the npm distribution run 'pnpm build'.

## Alternative Layout Managers
| Name | Repository |
| ------------- |:-------------|
| rc-dock | https://github.com/ticlo/rc-dock |
| Dockview | https://dockview.dev/ |
| lumino | https://github.com/jupyterlab/lumino |
| golden-layout | https://github.com/golden-layout/golden-layout |
| react-mosaic | https://github.com/nomcopter/react-mosaic |

## Structure
├── .editorconfig
├── .github
    └── ISSUE_TEMPLATE
    │   ├── bug_report.yml
    │   └── config.yml
├── .gitignore
├── .idea
    └── typescript-compiler.xml
├── .prettierrc.json
├── .vscode
    └── settings.json
├── CHANGELOG.md
├── LICENSE
├── README.md
├── demo
    ├── App.tsx
    ├── JsonView.tsx
    ├── MUIComponent.tsx
    ├── MUIDataGrid.tsx
    ├── NewFeatures.tsx
    ├── PopupMenu.tsx
    ├── SimpleForm.tsx
    ├── Utils.tsx
    ├── aggrid.tsx
    ├── chart.tsx
    ├── index.html
    ├── openlayter.tsx
    ├── popupmenu.css
    ├── public
    │   ├── images
    │   │   ├── add.svg
    │   │   ├── article.svg
    │   │   ├── bar_chart.svg
    │   │   ├── folder.svg
    │   │   ├── menu.svg
    │   │   ├── settings.svg
    │   │   └── terminal.svg
    │   ├── layouts
    │   │   ├── complex.layout
    │   │   ├── default.layout
    │   │   ├── mosaic.layout
    │   │   ├── newfeatures.layout
    │   │   ├── simple.layout
    │   │   ├── sub.layout
    │   │   ├── test_three_tabs.layout
    │   │   ├── test_two_tabs.layout
    │   │   ├── test_with_borders.layout
    │   │   ├── test_with_min_size.layout
    │   │   └── test_with_onRenderTab.layout
    │   └── popout.html
    └── styles.css
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── screenshots
    ├── PlaywrightUI.png
    ├── Screenshot_customize_tab.png
    ├── Screenshot_customize_tabset.png
    ├── Screenshot_layout.png
    ├── Screenshot_light.png
    ├── Screenshot_rounded.png
    └── Screenshot_two_tabs.png
├── src
    ├── Attribute.ts
    ├── AttributeDefinitions.ts
    ├── DockLocation.ts
    ├── DropInfo.ts
    ├── I18nLabel.ts
    ├── Orientation.ts
    ├── Rect.ts
    ├── Types.ts
    ├── index.ts
    ├── model
    │   ├── Action.ts
    │   ├── Actions.ts
    │   ├── BorderNode.ts
    │   ├── BorderSet.ts
    │   ├── ICloseType.ts
    │   ├── IDraggable.ts
    │   ├── IDropTarget.ts
    │   ├── IJsonModel.ts
    │   ├── LayoutWindow.ts
    │   ├── Model.ts
    │   ├── Node.ts
    │   ├── RowNode.ts
    │   ├── TabNode.ts
    │   ├── TabSetNode.ts
    │   └── Utils.ts
    └── view
    │   ├── BorderButton.tsx
    │   ├── BorderTab.tsx
    │   ├── BorderTabSet.tsx
    │   ├── DragContainer.tsx
    │   ├── ErrorBoundary.tsx
    │   ├── Icons.tsx
    │   ├── Layout.tsx
    │   ├── Overlay.tsx
    │   ├── PopoutWindow.tsx
    │   ├── PopupMenu.tsx
    │   ├── Row.tsx
    │   ├── SizeTracker.tsx
    │   ├── Splitter.tsx
    │   ├── Tab.tsx
    │   ├── TabButton.tsx
    │   ├── TabButtonStamp.tsx
    │   ├── TabOverflowHook.tsx
    │   ├── TabSet.tsx
    │   └── Utils.tsx
├── style
    ├── _base.scss
    ├── _themes.scss
    ├── combined.css
    ├── combined.scss
    ├── dark.css
    ├── dark.scss
    ├── gray.css
    ├── gray.scss
    ├── light.css
    ├── light.scss
    ├── rounded.css
    ├── rounded.scss
    ├── underline.css
    └── underline.scss
├── tests-playwright
    ├── helpers.ts
    └── view.spec.ts
├── tests
    └── Model.test.ts
├── tsconfig-types.json
├── tsconfig.json
├── vite.config.lib.ts
├── vite.config.ts
└── vitest.config.ts

/.editorconfig:
--------------------------------------------------------------------------------
1 | root = true
2 |
3 | [*]
4 | indent_style = space
5 | indent_size = 4
6 | charset = utf-8
7 | trim_trailing_whitespace = false
8 | insert_final_newline = true
9 |

--------------------------------------------------------------------------------
/.github/ISSUE_TEMPLATE/bug_report.yml:
--------------------------------------------------------------------------------
  1 | name: '🐛 Bug report'
  2 | description: Create a report to help us improve
  3 | body:
  4 |   - type: markdown
  5 |     attributes:
  6 |       value: |
  7 |         Thank you for reporting an issue :pray:.
  8 |
  9 |         This issue tracker is for reporting bugs found in `FlexLayout` (https://github.com/caplin/FlexLayout).
 10 |         If you have a question about how to achieve something and are struggling, please post a question
 11 |         inside of `FlexLayout` Discussions tab: https://github.com/caplin/FlexLayout/discussions
 12 |
 13 |         Before submitting a new bug/issue, please check the links below to see if there is a solution or question posted there already:
 14 |          - `FlexLayout` Issues tab: https://github.com/caplin/FlexLayout/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc
 15 |          - `FlexLayout` closed issues tab: https://github.com/caplin/FlexLayout/issues?q=is%3Aissue+sort%3Aupdated-desc+is%3Aclosed
 16 |          - `FlexLayout` Discussions tab: https://github.com/caplin/FlexLayout/discussions
 17 |
 18 |         The more information you fill in, the better the community can help you.
 19 |   - type: textarea
 20 |     id: description
 21 |     attributes:
 22 |       label: Describe the bug
 23 |       description: Provide a clear and concise description of the challenge you are running into.
 24 |     validations:
 25 |       required: true
 26 |   - type: input
 27 |     id: link
 28 |     attributes:
 29 |       label: Your Example Website or App
 30 |       description: |
 31 |         Which website or app were you using when the bug happened?
 32 |         Note:
 33 |         - Your bug will may get fixed much faster if we can run your code and it doesn't have dependencies other than the `FlexLayout` npm package.
 34 |         - To create a shareable code example you can use Stackblitz (https://stackblitz.com/). Please no localhost URLs.
 35 |         - Please read these tips for providing a minimal example: https://stackoverflow.com/help/mcve.
 36 |       placeholder: |
 37 |         e.g. https://stackblitz.com/edit/...... OR Github Repo
 38 |     validations:
 39 |       required: false
 40 |   - type: textarea
 41 |     id: steps
 42 |     attributes:
 43 |       label: Steps to Reproduce the Bug or Issue
 44 |       description: Describe the steps we have to take to reproduce the behavior.
 45 |       placeholder: |
 46 |         1. Go to '...'
 47 |         2. Click on '....'
 48 |         3. Scroll down to '....'
 49 |         4. See error
 50 |     validations:
 51 |       required: true
 52 |   - type: textarea
 53 |     id: expected
 54 |     attributes:
 55 |       label: Expected behavior
 56 |       description: Provide a clear and concise description of what you expected to happen.
 57 |       placeholder: |
 58 |         As a user, I expected ___ behavior, but I am seeing ___
 59 |     validations:
 60 |       required: true
 61 |   - type: input
 62 |     id: os
 63 |     attributes:
 64 |       label: Operating System
 65 |       description: What opearting system are you using?
 66 |       placeholder: |
 67 |         - OS: [e.g. macOS, Windows, Linux]
 68 |     validations:
 69 |       required: true
 70 |   - type: input
 71 |     id: browsers
 72 |     attributes:
 73 |       label: Browser Type?
 74 |       description: What browsers are you seeing the problem on?
 75 |       placeholder: |
 76 |         - OS: [e.g. Google Chrome, Safari, Firefox, Opera etc]
 77 |     validations:
 78 |       required: true
 79 |   - type: input
 80 |     id: browser_version
 81 |     attributes:
 82 |       label: Browser Version
 83 |       description: What browser version are you using?
 84 |       placeholder: |
 85 |         - Version: [e.g. 91.1]
 86 |     validations:
 87 |       required: true
 88 |   - type: textarea
 89 |     id: screenshots_or_videos
 90 |     attributes:
 91 |       label: Screenshots or Videos
 92 |       description: |
 93 |         If applicable, add screenshots or a video to help explain your problem.
 94 |         For more information on the supported file image/file types and the file size limits, please refer
 95 |         to the following link: https://docs.github.com/en/github/writing-on-github/working-with-advanced-formatting/attaching-files
 96 |       placeholder: |
 97 |         You can drag your video or image files inside of this editor ↓
 98 |     validations:
 99 |       required: true
100 |   - type: textarea
101 |     id: additional
102 |     attributes:
103 |       label: Additional context
104 |       description: Add any other context about the problem here.

--------------------------------------------------------------------------------
/.github/ISSUE_TEMPLATE/config.yml:
--------------------------------------------------------------------------------
1 | blank_issues_enabled: true
2 | contact_links:
3 |   - name: 🤔 Feature Requests & Questions
4 |     url: https://github.com/caplin/FlexLayout/discussions
5 |     about: Please ask and answer questions here.

--------------------------------------------------------------------------------
/.gitignore:
--------------------------------------------------------------------------------
 1 | node_modules/
 2 | types/
 3 | dist/
 4 | .idea/
 5 | demo/dist/
 6 | @private/
 7 | .DS_Store
 8 | typedoc/
 9 | style/*.css.map
10 |
11 | # Playwright
12 | /test-results/
13 | /playwright-report/
14 | /blob-report/
15 | /playwright/.cache/

--------------------------------------------------------------------------------
/.idea/typescript-compiler.xml:
--------------------------------------------------------------------------------
1 | <?xml version="1.0" encoding="UTF-8"?>
2 | <project version="4">
3 |   <component name="TypeScriptCompiler">
4 |     <option name="isCompilerEnabled" value="true" />
5 |   </component>
6 | </project>

--------------------------------------------------------------------------------
/.prettierrc.json:
--------------------------------------------------------------------------------
1 | {
2 |     "printWidth": 200
3 | }

--------------------------------------------------------------------------------
/.vscode/settings.json:
--------------------------------------------------------------------------------
1 | {
2 | }

--------------------------------------------------------------------------------
/LICENSE:
--------------------------------------------------------------------------------
 1 | MIT License
 2 |
 3 | Copyright (c) 2017 Caplin Systems Ltd
 4 |
 5 | Permission is hereby granted, free of charge, to any person obtaining a copy
 6 | of this software and associated documentation files (the "Software"), to deal
 7 | in the Software without restriction, including without limitation the rights
 8 | to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 9 | copies of the Software, and to permit persons to whom the Software is
10 | furnished to do so, subject to the following conditions:
11 |
12 | The above copyright notice and this permission notice shall be included in all
13 | copies or substantial portions of the Software.
14 |
15 | THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
16 | IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
17 | FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
18 | AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
19 | LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
20 | OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
21 | SOFTWARE.

--------------------------------------------------------------------------------
/demo/JsonView.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import { Model } from "../src/index";
 3 | import * as Prism from "prismjs";
 4 |
 5 | export function JsonView({ model }: { model: Model }) {
 6 |
 7 |   const timer = React.useRef<NodeJS.Timeout | undefined>(undefined);
 8 |   const [json, setJson] = React.useState<string>("");
 9 |
10 |   React.useEffect(() => {
11 |     const onModelChange = () => {
12 |       if (timer) {
13 |         clearTimeout(timer.current);
14 |       }
15 |       timer.current = setTimeout(() => {
16 |         update();
17 |         timer.current = undefined;
18 |       }, 1000);
19 |     }
20 |     model.addChangeListener(onModelChange);
21 |     update();
22 |     return () => {
23 |       model.removeChangeListener(onModelChange);
24 |     }
25 |   }, [])
26 |
27 |   const update = () => {
28 |     const jsonText = JSON.stringify(model.toJson(), null, "\t");
29 |     const newJson = Prism.highlight(jsonText, Prism.languages.javascript, 'javascript');
30 |     setJson(newJson);
31 |   }
32 |
33 |   return (
34 |     <pre style={{ tabSize: "20px" }} dangerouslySetInnerHTML={{ __html: json! }} />
35 |   );
36 | }

--------------------------------------------------------------------------------
/demo/MUIComponent.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from 'react';
 2 | import { alpha, styled } from '@mui/material/styles';
 3 | import Slider, { SliderProps } from '@mui/material/Slider';
 4 | import FormControlLabel from '@mui/material/FormControlLabel';
 5 | import Switch from '@mui/material/Switch';
 6 |
 7 | interface MUIComponent extends SliderProps {
 8 |     success?: boolean;
 9 | }
10 |
11 | const StyledSlider = styled(Slider, {
12 |     shouldForwardProp: (prop) => prop !== 'success',
13 | })<MUIComponent>(({ theme }) => ({
14 |     width: 300,
15 |     variants: [
16 |         {
17 |             props: ({ success }) => success,
18 |             style: {
19 |                 color: theme.palette.success.main,
20 |                 '& .MuiSlider-thumb': {
21 |                     [`&:hover, &.Mui-focusVisible`]: {
22 |                         boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.success.main, 0.16)}`,
23 |                     },
24 |                     [`&.Mui-active`]: {
25 |                         boxShadow: `0px 0px 0px 14px ${alpha(theme.palette.success.main, 0.16)}`,
26 |                     },
27 |                 },
28 |             },
29 |         },
30 |     ],
31 | }));
32 |
33 | export default function DynamicCSS() {
34 |     const [success, setSuccess] = React.useState(false);
35 |     const renderCountRef = React.useRef<number>(0);
36 |
37 |     const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
38 |         setSuccess(event.target.checked);
39 |     };
40 |
41 |     renderCountRef.current ++;
42 |
43 |     return (
44 |         <div style={{ margin: 10, height: "100%", display:"flex", flexDirection:"column" }}>
45 |             <FormControlLabel
46 |                 control={
47 |                     <Switch
48 |                         checked={success}
49 |                         onChange={handleChange}
50 |                         color="primary"
51 |                         value="dynamic-class-name"
52 |                     />
53 |                 }
54 |                 label="Change Style"
55 |             />
56 |             <StyledSlider success={success} defaultValue={30} sx={{ mt: 1 }} />
57 |             {"Render Count: " + renderCountRef.current}
58 |         </div>
59 |     );
60 | }

--------------------------------------------------------------------------------
/demo/MUIDataGrid.tsx:
--------------------------------------------------------------------------------
 1 | import { DataGrid, GridColDef } from '@mui/x-data-grid';
 2 |
 3 | const columns: GridColDef<(typeof rows)[number]>[] = [
 4 |   { field: 'id', headerName: 'ID', width: 90 },
 5 |   {
 6 |     field: 'firstName',
 7 |     headerName: 'First name',
 8 |     width: 150,
 9 |     editable: true,
10 |   },
11 |   {
12 |     field: 'lastName',
13 |     headerName: 'Last name',
14 |     width: 150,
15 |     editable: true,
16 |   },
17 |   {
18 |     field: 'age',
19 |     headerName: 'Age',
20 |     type: 'number',
21 |     width: 110,
22 |     editable: true,
23 |   },
24 |   {
25 |     field: 'fullName',
26 |     headerName: 'Full name',
27 |     description: 'This column has a value getter and is not sortable.',
28 |     sortable: false,
29 |     width: 160,
30 |     valueGetter: (_value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
31 |   },
32 | ];
33 |
34 | const rows = [
35 |   { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
36 |   { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
37 |   { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
38 |   { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
39 |   { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
40 |   { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
41 |   { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
42 |   { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
43 |   { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
44 | ];
45 |
46 | export default function DataGridDemo() {
47 |   return (
48 |       <DataGrid
49 |         rows={rows}
50 |         columns={columns}
51 |         initialState={{
52 |           pagination: {
53 |             paginationModel: {
54 |               pageSize: 5,
55 |             },
56 |           },
57 |         }}
58 |         pageSizeOptions={[5]}
59 |         checkboxSelection
60 |         disableRowSelectionOnClick
61 |       />
62 |   );
63 | }

--------------------------------------------------------------------------------
/demo/NewFeatures.tsx:
--------------------------------------------------------------------------------
 1 |
 2 | export function NewFeatures() {
 3 |     return (
 4 |         <ul>
 5 |         <li>
 6 |             New tab set attribute: tabSetEnableTabWrap<br/>
 7 |             <small>All tab sets in this layout will wrap their tabs onto multiple lines when needed</small>
 8 |         </li>
 9 |         <li>
10 |             Customized tabset rendering using the layout onRenderTabSet property<br/>
11 |             <small>All tab sets in this layout have an additional menu button before the tabs and a settings button after the tabs</small>
12 |         </li>
13 |         <li>
14 |             Customized tab rendering using the layout onRenderTab property<br/>
15 |             <small>The &apos;New&apos; tab has an additional settings button</small>
16 |         </li>
17 |         <li>
18 |             Help text (tooltip) option on tabs: <br/>
19 |             <small>Hover over this tab button</small>
20 |         </li>
21 |         <li>
22 |             Action to close tab set:<br/>
23 |             <small>See added x button in this tab set</small>
24 |         </li>
25 |         <li>
26 |             Allow narrow splitters with extended hit test areas:<br/>
27 |             <small>Uses the splitterExtra global attribute</small>
28 |         </li>
29 |         <li>
30 |             Tab attributes: borderWidth, borderHeight to allow tabs to have individual sizes in borders:<br/>
31 |             <small>Try the &apos;With border sizes&apos; tab</small>
32 |         </li>
33 |         <li>
34 |             Customize the drag rectangle using the callback property: onRenderDragRect <br/>
35 |             <small>In this layout all drag rectangles are custom rendered</small>
36 |         </li>
37 |         <li>
38 |             New border attribute: enableAutoHide, to hide border if it has zero tabs:<br/>
39 |             <small>Try moving all tabs from any of the borders</small>
40 |         </li>
41 |         <li>
42 |             New onContextMenu prop:<br/>
43 |             <small>All tabs and tab sets in this layout have a custom context menu</small>
44 |         </li>
45 |     </ul>
46 |     );
47 | }

--------------------------------------------------------------------------------
/demo/PopupMenu.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import * as ReactDOM from "react-dom/client";
 3 |
 4 | /** @hidden @internal */
 5 | export function showPopup(
 6 |     title: string,
 7 |     layoutDiv: HTMLElement,
 8 |     x: number, y: number,
 9 |     items: string[],
10 |     onSelect: (item: string | undefined) => void,
11 | ) {
12 |     const currentDocument = layoutDiv.ownerDocument;
13 |     const layoutRect = layoutDiv.getBoundingClientRect();
14 |
15 |     const elm = currentDocument.createElement("div");
16 |     elm.className = "popup_menu_container";
17 |
18 |     if (x < layoutRect.left + layoutRect.width / 2) {
19 |         elm.style.left = x - layoutRect.left + "px";
20 |     } else {
21 |         elm.style.right = layoutRect.right - x + "px";
22 |     }
23 |
24 |     if (y < layoutRect.top + layoutRect.height / 2) {
25 |         elm.style.top = y - layoutRect.top + "px";
26 |     } else {
27 |         elm.style.bottom = layoutRect.bottom - y + "px";
28 |     }
29 |
30 |     layoutDiv.appendChild(elm);
31 |
32 |     const onHide = (item: string | undefined) => {
33 |         onSelect(item);
34 |         layoutDiv.removeChild(elm);
35 |         root.unmount();
36 |         elm.removeEventListener("pointerdown", onElementPointerDown);
37 |         currentDocument.removeEventListener("pointerdown", onDocPointerDown);
38 |     };
39 |
40 |     const onElementPointerDown = (event: Event) => {
41 |         event.stopPropagation();
42 |     };
43 |
44 |     const onDocPointerDown = (event: Event) => {
45 |         onHide(undefined);
46 |     };
47 |
48 |     elm.addEventListener("pointerdown", onElementPointerDown);
49 |     currentDocument.addEventListener("pointerdown", onDocPointerDown);
50 |
51 |     const root = ReactDOM.createRoot(elm);
52 |     root.render(<PopupMenu
53 |         currentDocument={currentDocument}
54 |         onHide={onHide}
55 |         title={title}
56 |         items={items} />);
57 | }
58 |
59 | /** @hidden @internal */
60 | interface IPopupMenuProps {
61 |     title: string;
62 |     items: string[];
63 |     currentDocument: Document;
64 |     onHide: (item: string | undefined) => void;
65 | }
66 |
67 | /** @hidden @internal */
68 | const PopupMenu = (props: IPopupMenuProps) => {
69 |     const { title, items, onHide } = props;
70 |
71 |     const onItemClick = (item: string, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
72 |         onHide(item);
73 |         event.stopPropagation();
74 |     };
75 |
76 |     const itemElements = items.map((item) => (
77 |         <div key={item}
78 |             className="popup_menu_item"
79 |             onClick={(event) => onItemClick(item, event)}>
80 |             {item}
81 |         </div>
82 |     ));
83 |
84 |     return (
85 |         <div className="popup_menu">
86 |             <div className="popup_menu_title">{title}</div>
87 |             {itemElements}
88 |         </div>);
89 | };

--------------------------------------------------------------------------------
/demo/SimpleForm.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 |
 3 | export function SimpleForm() {
 4 |
 5 |     const timer = React.useRef<NodeJS.Timeout | undefined>(undefined);
 6 |     const [value, setValue] = React.useState<number>(0);
 7 |
 8 |
 9 |     const [formData, setFormData] = React.useState({
10 |       username: "",
11 |       password: ""
12 |     });
13 |
14 |     React.useEffect(()=> {
15 |       timer.current = setInterval(()=> {
16 |         setValue(v=> v=v+1);
17 |       }, 1000);
18 |       return () => {
19 |         clearInterval(timer.current);
20 |       }
21 |     })
22 |
23 |     const handleChange = (event: { target: { name: any; value: any; }; }) => {
24 |       const { name, value } = event.target;
25 |       setFormData((prevState) => ({ ...prevState, [name]: value }));
26 |     };
27 |
28 |
29 |     const handleSubmit = (event: { preventDefault: () => void; }) => {
30 |       event.preventDefault();
31 |     };
32 |
33 |     return (
34 |       <div style={{padding:10, display:"flex",
35 |       flexDirection:"column", gap:10, overflow:"auto",
36 |       height:"100%", boxSizing:"border-box"}}>
37 |       <p>See that the form keeps state when popped out</p>
38 |       <form style={{display:"flex", flexDirection:"column", gap:10}} onSubmit={handleSubmit}>
39 |         <label>
40 |           Username:
41 |           <input
42 |             type="text"
43 |             name="username"
44 |             value={formData.username}
45 |             onChange={handleChange}
46 |           />
47 |         </label>
48 |         <label>
49 |           Password:
50 |           <input
51 |             type="password"
52 |             name="password"
53 |             value={formData.password}
54 |             onChange={handleChange}
55 |           />
56 |         </label>
57 |         <div>{value}</div>
58 |         <input type="submit" value="Submit" />
59 |       </form>
60 |       </div>
61 |     );
62 |   }

--------------------------------------------------------------------------------
/demo/Utils.tsx:
--------------------------------------------------------------------------------
 1 | export class Utils {
 2 |
 3 |     static downloadFile(downloadUrl: any, onSuccess: any, onError: any) {
 4 |         console.log("DownloadFile: " + downloadUrl);
 5 |         if (downloadUrl) {
 6 |             const xhr = new XMLHttpRequest();
 7 |             xhr.open('GET', downloadUrl);
 8 |             xhr.onload = function () {
 9 |                 if (xhr.status == 200) {
10 |                     onSuccess(xhr.responseText);
11 |                 }
12 |                 else {
13 |                     onError(xhr.status + " " + xhr.statusText);
14 |                 }
15 |             };
16 |             xhr.onerror = function (e) {
17 |                 console.log(e);
18 |                 onError(e);
19 |             };
20 |             xhr.send();
21 |         }
22 |     }
23 |
24 |     static getQueryParams() {
25 |         const a = window.location.search.substr(1);
26 |         if (a == "") return {};
27 |         const params = a.split('&');
28 |         const b: any = {};
29 |         for (let i = 0; i < params.length; ++i) {
30 |             const p = params[i].split('=', 2);
31 |             if (p.length == 1)
32 |                 b[p[0]] = "";
33 |             else
34 |                 b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
35 |         }
36 |         return b;
37 |     }
38 | }

--------------------------------------------------------------------------------
/demo/aggrid.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from 'react';
 2 | import { AgGridReact } from 'ag-grid-react';
 3 | import type { ColDef } from 'ag-grid-community';
 4 | import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
 5 |
 6 | ModuleRegistry.registerModules([
 7 |     ClientSideRowModelModule,
 8 | ]);
 9 |
10 | // Row Data Interface
11 | interface IRow {
12 |     make: string;
13 |     model: string;
14 |     price: number;
15 |     electric: boolean;
16 | }
17 |
18 | export const AGGridExample = () => {
19 |
20 |     // Row Data: The data to be displayed.
21 |     const [rowData] = React.useState<IRow[]>([
22 |         { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
23 |         { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
24 |         { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
25 |         { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
26 |         { make: 'Fiat', model: '500', price: 15774, electric: false },
27 |         { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
28 |     ]);
29 |
30 |     // Column Definitions: Defines & controls grid columns.
31 |     const [colDefs] = React.useState<ColDef<IRow>[]>([
32 |         { field: 'make' },
33 |         { field: 'model' },
34 |         { field: 'price' },
35 |         { field: 'electric' },
36 |     ]);
37 |
38 |     return (
39 |         <div className={"ag-theme-alpine"} style={{ height: '100%' }}>
40 |             <AgGridReact rowData={rowData} columnDefs={colDefs} />
41 |         </div>
42 |     );
43 | };

--------------------------------------------------------------------------------
/demo/chart.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from 'react';
 2 | import { Bar } from 'react-chartjs-2';
 3 | import {
 4 |     Chart as ChartJS,
 5 |     CategoryScale,
 6 |     LinearScale,
 7 |     BarElement,
 8 |     Title,
 9 |     Tooltip,
10 |     Legend,
11 | } from 'chart.js';
12 |
13 | ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
14 |
15 | const BarChart: React.FC = () => {
16 |     const chartData = {
17 |         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
18 |         datasets: [
19 |             {
20 |                 label: 'Sample Data',
21 |                 data: [65, 59, 80, 81, 56, 55, 40],
22 |                 backgroundColor: 'rgba(75, 192, 192, 0.2)',
23 |                 borderColor: 'rgba(75, 192, 192, 1)',
24 |                 borderWidth: 1,
25 |             },
26 |         ],
27 |     };
28 |
29 |     const options = {
30 |         responsive: true,
31 |         maintainAspectRatio: false,
32 |         plugins: {
33 |             legend: {
34 |                 position: 'top' as const,
35 |             },
36 |             title: {
37 |                 display: true,
38 |                 text: 'Bar Chart Example',
39 |             },
40 |         },
41 |     };
42 |
43 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
44 |     const [showBar, setShowBar] = React.useState<boolean>(false);
45 |
46 |     React.useEffect(() => {
47 |         const rect = selfRef.current!.getBoundingClientRect();
48 |         if (!showBar && rect.width > 0 && rect.height > 0 && rect.x >=0 && rect.y>=0) {
49 |             setShowBar(true);
50 |         }
51 |     });
52 |
53 |     let bar = null;
54 |     if (showBar) {
55 |         bar = <Bar data={chartData} options={options} />;
56 |     }
57 |
58 |     return (
59 |         <div ref={selfRef} style={{height:"100%", overflow:"hidden"}}>
60 |             {bar}
61 |         </div>
62 |     )
63 | };
64 |
65 | export default BarChart;

--------------------------------------------------------------------------------
/demo/index.html:
--------------------------------------------------------------------------------
 1 | <!DOCTYPE html>
 2 | <html class="flexlayout__theme_light">
 3 | <head>
 4 |     <meta http-equiv='Content-type' content='text/html; charset=utf-8'>
 5 |     <title>FlexLayout Demo</title>
 6 | </head>
 7 | <body>
 8 |     <div id="container"></div>
 9 |     <script type="module" src="/App.tsx"></script>
10 | </body>
11 | </html>

--------------------------------------------------------------------------------
/demo/openlayter.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import { Map, View } from 'ol';
 3 | import TileLayer from 'ol/layer/Tile';
 4 | import OSM from 'ol/source/OSM';
 5 | import 'ol/ol.css';
 6 | import { useEffect } from "react";
 7 |
 8 | function MapComponent() {
 9 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
10 |     const map = React.useRef<any>(null);
11 |
12 |     useEffect(() => {
13 |         const osmLayer = new TileLayer({
14 |             preload: Infinity,
15 |             source: new OSM(),
16 |         })
17 |
18 |         map.current = new Map({
19 |             target: selfRef.current!,
20 |             layers: [osmLayer],
21 |             view: new View({
22 |                 center: [0, 0],
23 |                 zoom: 0,
24 |               }),
25 |           });
26 |       return () => map.current.setTarget(undefined)
27 |     }, []);
28 |
29 |     useEffect(() => {
30 |         map.current.updateSize();
31 |     });
32 |
33 |     return (
34 |       <div ref={selfRef} style={{height:'100%',width:'100%'}} id="map" className="map-container" />
35 |     );
36 | }
37 |
38 | export default MapComponent;

--------------------------------------------------------------------------------
/demo/popupmenu.css:
--------------------------------------------------------------------------------
 1 | .popup_menu {
 2 |     font-size: var(--font-size);
 3 |     font-family: var(--font-family);
 4 | }
 5 | .popup_menu_title {
 6 |     margin: 2px;
 7 |     padding: 2px 10px 2px 10px;
 8 |     white-space: nowrap;
 9 |     color: var(--color-text);
10 |     background-color: var(--color-5);
11 |     border-bottom: 1px solid var(--color-6);
12 |     cursor: default;
13 | }
14 | .popup_menu_item {
15 |     margin: 2px;
16 |     padding: 2px 10px 2px 10px;
17 |     white-space: nowrap;
18 |     cursor:pointer;
19 |     border-radius: 2px;
20 | }
21 | @media (hover: hover) {
22 |     .popup_menu_item:hover {
23 |         background-color: var(--color-6);
24 |     }
25 | }
26 | .popup_menu_container {
27 |     box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.15);
28 |     border: 1px solid var(--color-6);
29 |     color: gray;
30 |     background: white;
31 |     border-radius: 3px;
32 |     position: absolute;
33 |     z-index: 1000;
34 |     max-height: 50%;
35 |     min-width: 100px;
36 |     overflow: auto;
37 | }

--------------------------------------------------------------------------------
/demo/public/images/add.svg:
--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="gray">
2 | <path d="M0 0h24v24H0z" fill="none"/>
3 | <path stroke="gray" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
4 | </svg>

--------------------------------------------------------------------------------
/demo/public/images/article.svg:
--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="gray"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>

--------------------------------------------------------------------------------
/demo/public/images/bar_chart.svg:
--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="gray"><path d="M0 0h24v24H0z" fill="none"/><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>

--------------------------------------------------------------------------------
/demo/public/images/folder.svg:
--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="gray"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>

--------------------------------------------------------------------------------
/demo/public/images/menu.svg:
--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="gray"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>

--------------------------------------------------------------------------------
/demo/public/images/settings.svg:
--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"  viewBox="0 0 24 24"  fill="gray"><g><path d="M0,0h24v24H0V0z" fill="none"/><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></g></svg>

--------------------------------------------------------------------------------
/demo/public/images/terminal.svg:
--------------------------------------------------------------------------------
1 | <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20"  viewBox="0 0 20 20"  fill="gray"><g><rect fill="none" height="20" width="20"/></g><g><path d="M16.5,4h-13C2.67,4,2,4.67,2,5.5v9C2,15.33,2.67,16,3.5,16h13c0.83,0,1.5-0.67,1.5-1.5v-9C18,4.67,17.33,4,16.5,4z M3.5,14.5V7h13v7.5H3.5z M15,13.5h-5V12h5V13.5z M6.25,13.5l-1.06-1.06l1.69-1.69L5.19,9.06L6.25,8L9,10.75L6.25,13.5z"/></g></svg>

--------------------------------------------------------------------------------
/demo/public/layouts/default.layout:
--------------------------------------------------------------------------------
  1 | {
  2 | 	"global": {
  3 | 		"splitterEnableHandle": true,
  4 | 		"tabEnablePopout": true,
  5 | 		"tabSetEnableActiveIcon": true,
  6 | 		"tabSetMinWidth": 130,
  7 | 		"tabSetMinHeight": 100,
  8 | 		"tabSetEnableTabScrollbar": true,
  9 | 		"borderMinSize": 100,
 10 | 		"borderEnableTabScrollbar": true
 11 | 	},
 12 | 	"borders": [
 13 | 		{
 14 | 			"type": "border",
 15 | 			"location": "bottom",
 16 | 			"children": [
 17 | 				{
 18 | 					"type": "tab",
 19 | 					"id": "#0ae8e0fb-dba2-4b14-9d75-08781231479a",
 20 | 					"name": "Output",
 21 | 					"component": "grid",
 22 | 					"enableClose": false,
 23 | 					"icon": "images/bar_chart.svg"
 24 | 				},
 25 | 				{
 26 | 					"type": "tab",
 27 | 					"id": "#803a2efe-e507-4735-9c2a-46ce6042c1a2",
 28 | 					"name": "Terminal",
 29 | 					"component": "grid",
 30 | 					"enableClose": false,
 31 | 					"icon": "images/terminal.svg"
 32 | 				},
 33 | 				{
 34 | 					"type": "tab",
 35 | 					"id": "#7bac972e-fd5f-4582-a511-4feede448394",
 36 | 					"name": "Layout JSON",
 37 | 					"component": "json"
 38 | 				}
 39 | 			]
 40 | 		},
 41 | 		{
 42 | 			"type": "border",
 43 | 			"location": "left",
 44 | 			"children": [
 45 | 				{
 46 | 					"type": "tab",
 47 | 					"id": "#21c49854-be85-4e32-96c3-61962f71bc15",
 48 | 					"name": "Navigation",
 49 | 					"altName": "The Navigation Tab",
 50 | 					"component": "grid",
 51 | 					"enableClose": false,
 52 | 					"icon": "images/folder.svg"
 53 | 				}
 54 | 			]
 55 | 		},
 56 | 		{
 57 | 			"type": "border",
 58 | 			"location": "right",
 59 | 			"children": [
 60 | 				{
 61 | 					"type": "tab",
 62 | 					"id": "#ec253996-0724-416b-a097-23f85a89afbe",
 63 | 					"name": "Options",
 64 | 					"component": "grid",
 65 | 					"enableClose": false,
 66 | 					"icon": "images/settings.svg"
 67 | 				}
 68 | 			]
 69 | 		}
 70 | 	],
 71 | 	"layout": {
 72 | 		"type": "row",
 73 | 		"id": "#11b6dde6-2808-4a87-b378-dd6ed2a92547",
 74 | 		"children": [
 75 | 			{
 76 | 				"type": "tabset",
 77 | 				"id": "#018c109c-20ab-4458-84c8-1817d2e7d81b",
 78 | 				"weight": 33,
 79 | 				"children": [
 80 | 					{
 81 | 						"type": "tab",
 82 | 						"id": "#4fcdc630-6742-474a-9b67-cb40c36e2d00",
 83 | 						"name": "OpenLayers Map",
 84 | 						"component": "map",
 85 | 						"enablePopoutOverlay": true
 86 | 					}
 87 | 				]
 88 | 			},
 89 | 			{
 90 | 				"type": "row",
 91 | 				"id": "#cec0f587-2651-4bb2-a755-006a7111bb11",
 92 | 				"weight": 33,
 93 | 				"children": [
 94 | 					{
 95 | 						"type": "tabset",
 96 | 						"id": "#770c0042-3776-4576-becc-90b627bb8c91",
 97 | 						"weight": 50,
 98 | 						"selected": 0,
 99 | 						"children": [
100 | 							{
101 | 								"type": "tab",
102 | 								"id": "#a7dff07f-a37a-4d58-9853-7b91c465101c",
103 | 								"name": "ChartJS",
104 | 								"component": "chart",
105 | 								"enableWindowReMount": true,
106 | 								"enablePopoutOverlay": true
107 | 							},
108 | 							{
109 | 								"type": "tab",
110 | 								"id": "#963c76b2-ea75-4cf9-8677-823fb1aec5ea",
111 | 								"name": "Grid 1",
112 | 								"component": "grid",
113 | 								"icon": "images/article.svg"
114 | 							},
115 | 							{
116 | 								"type": "tab",
117 | 								"id": "#8bba601c-b902-432a-bc3f-5e076dafdf1d",
118 | 								"name": "Grid 2",
119 | 								"component": "grid",
120 | 								"icon": "images/article.svg"
121 | 							},
122 | 							{
123 | 								"type": "tab",
124 | 								"id": "#b89da41a-933d-4784-b4b9-c9a7d19aea0d",
125 | 								"name": "Grid 3",
126 | 								"component": "grid",
127 | 								"icon": "images/article.svg"
128 | 							},
129 | 							{
130 | 								"type": "tab",
131 | 								"id": "#b9ffea20-84d7-430d-ad16-947b26127fbc",
132 | 								"name": "Grid 4",
133 | 								"component": "grid",
134 | 								"icon": "images/article.svg"
135 | 							},
136 | 							{
137 | 								"type": "tab",
138 | 								"id": "#bebb3b66-bcba-449e-a9b8-774e92fa8c37",
139 | 								"name": "Grid 5",
140 | 								"component": "grid",
141 | 								"icon": "images/article.svg"
142 | 							}
143 | 						],
144 | 						"active": true
145 | 					},
146 | 					{
147 | 						"type": "tabset",
148 | 						"id": "#c0b4aba3-dba9-4883-a384-1b299518fd0b",
149 | 						"weight": 50,
150 | 						"children": [
151 | 							{
152 | 								"type": "tab",
153 | 								"id": "#285406e5-6795-4e17-b10d-6ff8e512ba62",
154 | 								"name": "AGGrid",
155 | 								"component": "aggrid"
156 | 							}
157 | 						]
158 | 					}
159 | 				]
160 | 			},
161 | 			{
162 | 				"type": "row",
163 | 				"id": "#6b135a77-d283-404e-8a92-4bb5bf2579cb",
164 | 				"weight": 33,
165 | 				"children": [
166 | 					{
167 | 						"type": "tabset",
168 | 						"id": "#b97c51f2-7f2c-490d-9cbb-6fcb189c2343",
169 | 						"weight": 50,
170 | 						"children": [
171 | 							{
172 | 								"type": "tab",
173 | 								"id": "#0e23b4b3-498a-4625-a916-b1e6e19eaf3f",
174 | 								"name": "Wikipedia",
175 | 								"component": "multitype",
176 | 								"config": {
177 | 									"type": "url",
178 | 									"data": "https://en.wikipedia.org/wiki/Main_Page"
179 | 								}
180 | 							},
181 | 							{
182 | 								"type": "tab",
183 | 								"id": "#31b3af95-2fc9-4511-8d5d-1e6255b92eae",
184 | 								"name": "MUI",
185 | 								"enablePopout": false,
186 | 								"component": "mui"
187 | 							}
188 | 						]
189 | 					},
190 | 					{
191 | 						"type": "tabset",
192 | 						"id": "#a1d1e2b2-246c-4116-a616-cb3d186b5743",
193 | 						"weight": 50,
194 | 						"children": [
195 | 							{
196 | 								"type": "tab",
197 | 								"id": "#4784d2d4-24a4-4ef2-ac6e-7a3ea7b03ba3",
198 | 								"name": "MUI Grid",
199 | 								"enablePopout": false,
200 | 								"component": "muigrid"
201 | 							}
202 | 						]
203 | 					}
204 | 				]
205 | 			}
206 | 		]
207 | 	},
208 | 	"popouts": {}
209 | }

--------------------------------------------------------------------------------
/demo/public/layouts/mosaic.layout:
--------------------------------------------------------------------------------
 1 | {
 2 | 	"global": {
 3 | 		"tabSetEnableDrop": false,
 4 | 		"tabSetEnableSingleTabStretch": true,
 5 | 		"tabSetMinWidth": 100,
 6 | 		"tabSetMinHeight": 100
 7 | 	},
 8 | 	"borders": [],
 9 | 	"layout": {
10 | 		"type": "row",
11 | 		"children": [
12 | 			{
13 | 				"type": "tabset",
14 | 				"id": "2",
15 | 				"weight": 25,
16 | 				"children": [
17 | 					{
18 | 						"type": "tab",
19 | 						"id": "3",
20 | 						"tabsetClassName": "greenClass",
21 | 						"name": "Layout JSON",
22 | 						"component": "json"
23 | 					}
24 | 				],
25 | 				"active": true
26 | 			},
27 | 			{
28 | 				"type": "tabset",
29 | 				"weight": 50,
30 | 				"children": [
31 | 					{
32 | 						"type": "tab",
33 | 						"name": "Wikipedia",
34 | 						"component": "multitype",
35 | 						"config": {
36 | 							"type": "url",
37 | 							"data": "https://en.wikipedia.org/wiki/Main_Page"
38 | 						}
39 | 					}
40 | 				]
41 | 			},
42 | 			{
43 | 				"type": "tabset",
44 | 				"weight": 25,
45 | 				"children": [
46 | 					{
47 | 						"type": "tab",
48 | 						"name": "One",
49 | 						"tabsetClassName": "blueClass",
50 | 						"component": "grid"
51 | 					}
52 | 				]
53 | 			}
54 | 		]
55 | 	}
56 | }

--------------------------------------------------------------------------------
/demo/public/layouts/newfeatures.layout:
--------------------------------------------------------------------------------
  1 | {
  2 | 	"global": {
  3 | 		"splitterSize": 3,
  4 | 		"splitterExtra": 7,
  5 | 		"tabEnablePopout": true,
  6 | 		"tabSetEnableClose": true,
  7 | 		"tabSetEnableTabWrap": true,
  8 | 		"tabSetMinWidth": 100,
  9 | 		"tabSetMinHeight": 100,
 10 | 		"borderMinSize": 100,
 11 | 		"borderEnableAutoHide": true
 12 | 	},
 13 | 	"borders": [
 14 | 		{
 15 | 			"type": "border",
 16 | 			"location": "bottom",
 17 | 			"children": [
 18 | 				{
 19 | 					"type": "tab",
 20 | 					"id": "#6eebf157-b04f-42a8-acd6-18ab2eb286ff",
 21 | 					"name": "Output",
 22 | 					"component": "grid",
 23 | 					"enableClose": false
 24 | 				},
 25 | 				{
 26 | 					"type": "tab",
 27 | 					"id": "#984349f2-0807-4689-b702-656bf1cb9515",
 28 | 					"name": "Terminal",
 29 | 					"component": "grid",
 30 | 					"enableClose": false
 31 | 				},
 32 | 				{
 33 | 					"type": "tab",
 34 | 					"id": "#c2117846-46a3-4c93-a32c-992a351b1301",
 35 | 					"name": "Layout JSON",
 36 | 					"component": "json"
 37 | 				}
 38 | 			]
 39 | 		},
 40 | 		{
 41 | 			"type": "border",
 42 | 			"location": "left",
 43 | 			"children": [
 44 | 				{
 45 | 					"type": "tab",
 46 | 					"id": "#0a7988f1-0cfb-4420-a2a3-8aa8af12684f",
 47 | 					"name": "Navigation",
 48 | 					"component": "grid",
 49 | 					"enableClose": false
 50 | 				},
 51 | 				{
 52 | 					"type": "tab",
 53 | 					"id": "#ab2da468-e13f-4925-b15a-388c00186737",
 54 | 					"name": "With border sizes",
 55 | 					"component": "grid",
 56 | 					"enableClose": false,
 57 | 					"borderWidth": 500,
 58 | 					"borderHeight": 500
 59 | 				}
 60 | 			]
 61 | 		},
 62 | 		{
 63 | 			"type": "border",
 64 | 			"location": "right",
 65 | 			"children": [
 66 | 				{
 67 | 					"type": "tab",
 68 | 					"id": "#c2a459f2-314a-4da6-a18d-8a00d8957a3d",
 69 | 					"name": "Options",
 70 | 					"component": "grid",
 71 | 					"enableClose": false
 72 | 				}
 73 | 			]
 74 | 		}
 75 | 	],
 76 | 	"layout": {
 77 | 		"type": "row",
 78 | 		"id": "#baeaf63a-7e31-4f5b-836c-6aec43cb228a",
 79 | 		"children": [
 80 | 			{
 81 | 				"type": "tabset",
 82 | 				"id": "#8b1bc920-89fb-4fe7-bad3-9cf70d693118",
 83 | 				"weight": 42.14932625516559,
 84 | 				"children": [
 85 | 					{
 86 | 						"type": "tab",
 87 | 						"id": "#8fcab2f4-23f8-49d7-ae82-f87a9c261200",
 88 | 						"name": "New",
 89 | 						"helpText": "this tab has helpText defined",
 90 | 						"component": "newfeatures",
 91 | 						"icon": "images/article.svg"
 92 | 					},
 93 | 					{
 94 | 						"type": "tab",
 95 | 						"id": "#a97509a3-8139-4980-9a45-7ca2418edfd8",
 96 | 						"name": "Two",
 97 | 						"component": "grid"
 98 | 					},
 99 | 					{
100 | 						"type": "tab",
101 | 						"id": "#d6a9c27a-701f-4b87-9661-be186dcb567c",
102 | 						"name": "Grid 1",
103 | 						"component": "grid",
104 | 						"icon": "images/article.svg"
105 | 					},
106 | 					{
107 | 						"type": "tab",
108 | 						"id": "#4658c30a-e98e-4a2f-9f30-07ebf2944f26",
109 | 						"name": "Grid 2",
110 | 						"component": "grid",
111 | 						"icon": "images/article.svg"
112 | 					},
113 | 					{
114 | 						"type": "tab",
115 | 						"id": "#c7c0faea-8593-4cf0-87fe-f4ff14f50bdc",
116 | 						"name": "Grid 3",
117 | 						"component": "grid",
118 | 						"icon": "images/article.svg"
119 | 					},
120 | 					{
121 | 						"type": "tab",
122 | 						"id": "#b0ee783e-bb9f-41be-8320-a2bf44490f9f",
123 | 						"name": "Grid 4",
124 | 						"component": "grid",
125 | 						"icon": "images/article.svg"
126 | 					}
127 | 				]
128 | 			},
129 | 			{
130 | 				"type": "tabset",
131 | 				"id": "#79caf830-d0fb-4f02-a579-e3bbe21b6525",
132 | 				"weight": 57.85067374483441,
133 | 				"children": [
134 | 					{
135 | 						"type": "tab",
136 | 						"id": "#65210db1-663f-4f98-95cc-1c39953ed2d1",
137 | 						"name": "Form",
138 | 						"component": "simpleform"
139 | 					},
140 | 					{
141 | 						"type": "tab",
142 | 						"id": "#9d820148-547a-431d-9793-be67ad973b86",
143 | 						"name": "Five",
144 | 						"component": "grid",
145 | 						"borderWidth": 500
146 | 					},
147 | 					{
148 | 						"type": "tab",
149 | 						"id": "#12acdbcd-0454-4d47-8d96-fccb645954c8",
150 | 						"name": "Grid 1",
151 | 						"component": "grid",
152 | 						"icon": "images/article.svg"
153 | 					},
154 | 					{
155 | 						"type": "tab",
156 | 						"id": "#5c35c619-df7f-4da7-93d7-608c49c5490b",
157 | 						"name": "Grid 2",
158 | 						"component": "grid",
159 | 						"icon": "images/article.svg"
160 | 					},
161 | 					{
162 | 						"type": "tab",
163 | 						"id": "#1357abd8-719f-47e0-bcd8-892e91e2248c",
164 | 						"name": "Grid 3",
165 | 						"component": "grid",
166 | 						"icon": "images/article.svg"
167 | 					},
168 | 					{
169 | 						"type": "tab",
170 | 						"id": "#9fa5abf6-abe8-40d5-a6d2-c8a3ff4326e5",
171 | 						"name": "Grid 4",
172 | 						"component": "grid",
173 | 						"icon": "images/article.svg"
174 | 					},
175 | 					{
176 | 						"type": "tab",
177 | 						"id": "#b73f1f91-2420-4446-9d9d-c7485853caa4",
178 | 						"name": "Grid 5",
179 | 						"component": "grid",
180 | 						"icon": "images/article.svg"
181 | 					},
182 | 					{
183 | 						"type": "tab",
184 | 						"id": "#3955e3b7-2c68-4dcf-b028-332984e94909",
185 | 						"name": "Grid 6",
186 | 						"component": "grid",
187 | 						"icon": "images/article.svg"
188 | 					},
189 | 					{
190 | 						"type": "tab",
191 | 						"id": "#4f5a137d-e63b-42dd-a7e9-635e611a5fd4",
192 | 						"name": "Grid 7",
193 | 						"component": "grid",
194 | 						"icon": "images/article.svg"
195 | 					}
196 | 				],
197 | 				"active": true
198 | 			}
199 | 		]
200 | 	},
201 | 	"popouts": {}
202 | }

--------------------------------------------------------------------------------
/demo/public/layouts/simple.layout:
--------------------------------------------------------------------------------
 1 | {
 2 | 	"global": {
 3 | 		"tabSetEnableSingleTabStretch": true
 4 | 	},
 5 | 	"borders": [],
 6 | 	"layout": {
 7 | 		"type": "row",
 8 | 		"id": "1",
 9 | 		"children": [
10 | 			{
11 | 				"type": "tabset",
12 | 				"id": "2",
13 | 				"weight": 0.2,
14 | 				"children": [
15 | 					{
16 | 						"type": "tab",
17 | 						"id": "3",
18 | 						"name": "Layout JSON",
19 | 						"component": "json"
20 | 					}
21 | 				],
22 | 				"active": true
23 | 			},
24 | 			{
25 | 				"type": "tabset",
26 | 				"id": "4",
27 | 				"weight": 0.2,
28 | 				"children": [
29 | 					{
30 | 						"type": "tab",
31 | 						"id": "5",
32 | 						"name": "Grid 1",
33 | 						"component": "grid",
34 | 						"icon": "images/article.svg"
35 | 					}
36 | 				]
37 | 			}
38 | 		]
39 | 	}
40 | }

--------------------------------------------------------------------------------
/demo/public/layouts/sub.layout:
--------------------------------------------------------------------------------
  1 | {
  2 | 	"global": {
  3 | 		"tabEnableFloat": true
  4 | 	},
  5 | 	"borders": [],
  6 | 	"layout": {
  7 | 		"type": "row",
  8 | 		"children": [
  9 | 			{
 10 | 				"type": "tabset",
 11 | 				"weight": 23.6,
 12 | 				"children": [
 13 | 					{
 14 | 						"type": "tab",
 15 | 						"name": "Tabbed Pane",
 16 | 						"component": "sub",
 17 | 						"config": {
 18 | 							"model": {
 19 | 								"global": {
 20 | 									"tabSetTabLocation": "bottom"
 21 | 								},
 22 | 								"borders": [],
 23 | 								"layout": {
 24 | 									"type": "row",
 25 | 									"children": [
 26 | 										{
 27 | 											"type": "tabset",
 28 | 											"weight": 50,
 29 | 											"selected": 1,
 30 | 											"children": [
 31 | 												{
 32 | 													"type": "tab",
 33 | 													"name": "AAAA",
 34 | 													"component": "grid",
 35 | 													"config": {
 36 | 														"id": "1"
 37 | 													}
 38 | 												},
 39 | 												{
 40 | 													"type": "tab",
 41 | 													"name": "BBBB",
 42 | 													"component": "grid",
 43 | 													"config": {
 44 | 														"id": "2"
 45 | 													}
 46 | 												}
 47 | 											],
 48 | 											"active": true
 49 | 										}
 50 | 									]
 51 | 								}
 52 | 							}
 53 | 						}
 54 | 					}
 55 | 				]
 56 | 			},
 57 | 			{
 58 | 				"type": "tabset",
 59 | 				"weight": 26.4,
 60 | 				"children": [
 61 | 					{
 62 | 						"type": "tab",
 63 | 						"name": "Split Pane",
 64 | 						"component": "sub",
 65 | 						"config": {
 66 | 							"model": {
 67 | 								"global": {
 68 | 									"tabSetEnableTabStrip": false
 69 | 								},
 70 | 								"borders": [],
 71 | 								"layout": {
 72 | 									"type": "row",
 73 | 									"children": [
 74 | 										{
 75 | 											"type": "tabset",
 76 | 											"weight": 50,
 77 | 											"children": [
 78 | 												{
 79 | 													"type": "tab",
 80 | 													"name": "1111",
 81 | 													"component": "grid",
 82 | 													"config": {
 83 | 														"id": "1"
 84 | 													}
 85 | 												}
 86 | 											]
 87 | 										},
 88 | 										{
 89 | 											"type": "tabset",
 90 | 											"weight": 50,
 91 | 											"children": [
 92 | 												{
 93 | 													"type": "tab",
 94 | 													"name": "2222",
 95 | 													"component": "grid",
 96 | 													"config": {
 97 | 														"id": "2"
 98 | 													}
 99 | 												}
100 | 											]
101 | 										}
102 | 									]
103 | 								}
104 | 							}
105 | 						}
106 | 					}
107 | 				],
108 | 				"active": true
109 | 			}
110 | 		]
111 | 	}
112 | }

--------------------------------------------------------------------------------
/demo/public/layouts/test_three_tabs.layout:
--------------------------------------------------------------------------------
 1 | {
 2 |   "global": {},
 3 |   "borders": [],
 4 |   "layout": {
 5 |     "type": "row",
 6 |     "weight": 100,
 7 |     "children": [
 8 |       {
 9 |         "type": "tabset",
10 |         "weight": 50,
11 |         "children": [
12 |           {
13 |             "type": "tab",
14 |             "name": "One",
15 |             "component": "testing"
16 |           }
17 |         ]
18 |       },
19 |       {
20 |         "type": "tabset",
21 |         "weight": 50,
22 |         "name": "TheHeader",
23 |         "children": [
24 |           {
25 |             "type": "tab",
26 |             "name": "Two",
27 |             "icon": "/test/images/settings.svg",
28 |             "component": "testing"
29 |           }
30 |         ]
31 |       },
32 |       {
33 |         "type": "tabset",
34 |         "weight": 50,
35 |         "children": [
36 |           {
37 |             "type": "tab",
38 |             "name": "Three",
39 |             "component": "testing"
40 |           }
41 |         ]
42 |       }
43 |     ]
44 |   }
45 | }

--------------------------------------------------------------------------------
/demo/public/layouts/test_two_tabs.layout:
--------------------------------------------------------------------------------
 1 | {
 2 |   "global": {},
 3 |   "borders": [],
 4 |   "layout": {
 5 |     "type": "row",
 6 |     "weight": 100,
 7 |     "children": [
 8 |       {
 9 |         "type": "tabset",
10 |         "weight": 50,
11 |         "children": [
12 |           {
13 |             "type": "tab",
14 |             "name": "One",
15 |             "component": "testing"
16 |           }
17 |         ]
18 |       },
19 |       {
20 |         "type": "tabset",
21 |         "id": "#1",
22 |         "weight": 50,
23 |         "children": [
24 |           {
25 |             "type": "tab",
26 |             "name": "Two",
27 |             "component": "testing"
28 |           }
29 |         ]
30 |       }
31 |     ]
32 |   }
33 | }

--------------------------------------------------------------------------------
/demo/public/layouts/test_with_borders.layout:
--------------------------------------------------------------------------------
 1 | {
 2 |   "global": {},
 3 |   "borders": [
 4 |     {
 5 |       "type": "border",
 6 |       "location": "top",
 7 |       "children": [
 8 |         {
 9 |           "type": "tab",
10 |           "name": "top1",
11 |           "component": "testing"
12 |         }
13 |       ]
14 |     },
15 |     {
16 |       "type": "border",
17 |       "location": "bottom",
18 |       "children": [
19 |         {
20 |           "type": "tab",
21 |           "name": "bottom1",
22 |           "component": "testing"
23 |         }
24 |
25 |       ]
26 |     },
27 |     {
28 |       "type": "border",
29 |       "location": "left",
30 |       "children": [
31 |         {
32 |           "type": "tab",
33 |           "name": "left1",
34 |           "component": "testing"
35 |         }
36 |       ]
37 |     },
38 |     {
39 |       "type": "border",
40 |       "location": "right",
41 |       "children": [
42 |         {
43 |           "type": "tab",
44 |           "name": "right1",
45 |           "component": "testing"
46 |         }
47 |       ]
48 |     }
49 |   ],
50 |   "layout": {
51 |     "type": "row",
52 |     "weight": 100,
53 |     "children": [
54 |       {
55 |         "type": "tabset",
56 |         "weight": 50,
57 |         "children": [
58 |           {
59 |             "type": "tab",
60 |             "name": "One",
61 |             "component": "testing"
62 |           }
63 |         ]
64 |       },
65 |       {
66 |         "type": "tabset",
67 |         "weight": 50,
68 |         "id": "#1",
69 |         "children": [
70 |           {
71 |             "type": "tab",
72 |             "name": "Two",
73 |             "component": "testing"
74 |           }
75 |         ]
76 |       },
77 |       {
78 |         "type": "tabset",
79 |         "weight": 50,
80 |         "children": [
81 |           {
82 |             "type": "tab",
83 |             "name": "Three",
84 |             "component": "testing"
85 |           }
86 |         ]
87 |       }
88 |     ]
89 |   }
90 | }

--------------------------------------------------------------------------------
/demo/public/layouts/test_with_min_size.layout:
--------------------------------------------------------------------------------
  1 | {
  2 |   "global": {
  3 |     "tabSetMinHeight": 100,
  4 |     "tabSetMinWidth": 100,
  5 |     "borderMinSize": 100,
  6 |     "borderEnableAutoHide": true,
  7 |     "tabSetEnableClose": true
  8 |   },
  9 |   "borders": [
 10 |     {
 11 |       "type": "border",
 12 |       "location": "top",
 13 |       "children": [
 14 |         {
 15 |           "type": "tab",
 16 |           "name": "top1",
 17 |           "component": "testing"
 18 |         }
 19 |       ]
 20 |     },
 21 |     {
 22 |       "type": "border",
 23 |       "location": "bottom",
 24 |       "children": [
 25 |         {
 26 |           "type": "tab",
 27 |           "name": "bottom1",
 28 |           "component": "testing"
 29 |         },
 30 |         {
 31 |           "type": "tab",
 32 |           "name": "bottom2",
 33 |           "component": "testing"
 34 |         }
 35 |       ]
 36 |     },
 37 |     {
 38 |       "type": "border",
 39 |       "location": "left",
 40 |       "children": [
 41 |         {
 42 |           "type": "tab",
 43 |           "name": "left1",
 44 |           "component": "testing"
 45 |         }
 46 |       ]
 47 |     },
 48 |     {
 49 |       "type": "border",
 50 |       "location": "right",
 51 |       "children": [
 52 |         {
 53 |           "type": "tab",
 54 |           "name": "right1",
 55 |           "component": "testing"
 56 |         }
 57 |       ]
 58 |     }
 59 |   ],
 60 |   "layout": {
 61 |     "type": "row",
 62 |     "weight": 100,
 63 |     "children": [
 64 |       {
 65 |         "type": "tabset",
 66 |         "weight": 50,
 67 |         "children": [
 68 |           {
 69 |             "type": "tab",
 70 |             "name": "One",
 71 |             "component": "testing"
 72 |           }
 73 |         ]
 74 |       },
 75 |       {
 76 |         "type": "tabset",
 77 |         "weight": 50,
 78 |         "id": "#1",
 79 |         "children": [
 80 |           {
 81 |             "type": "tab",
 82 |             "name": "Two",
 83 |             "component": "testing"
 84 |           }
 85 |         ]
 86 |       },
 87 |       {
 88 |         "type": "row",
 89 |         "weight": 100,
 90 |         "children": [
 91 |           {
 92 |             "type": "tabset",
 93 |             "weight": 50,
 94 |             "children": [
 95 |               {
 96 |                 "type": "tab",
 97 |                 "name": "Three",
 98 |                 "component": "testing"
 99 |               },
100 |               {
101 |                 "type": "tab",
102 |                 "name": "Four",
103 |                 "component": "testing"
104 |               },
105 |               {
106 |                 "type": "tab",
107 |                 "name": "Five",
108 |                 "component": "testing"
109 |               }
110 |             ]
111 |           },
112 |           {
113 |             "type": "tabset",
114 |             "weight": 50,
115 |             "children": [
116 |               {
117 |                 "type": "tab",
118 |                 "name": "Six",
119 |                 "component": "testing"
120 |               },
121 |               {
122 |                 "type": "tab",
123 |                 "name": "Seven",
124 |                 "component": "testing"
125 |               }
126 |             ]
127 |           }
128 |         ]
129 |       }
130 |     ]
131 |   }
132 | }

--------------------------------------------------------------------------------
/demo/public/layouts/test_with_onRenderTab.layout:
--------------------------------------------------------------------------------
  1 | {
  2 |   "global": {},
  3 |   "borders": [
  4 |     {
  5 |       "type": "border",
  6 |       "location": "top",
  7 |       "children": [
  8 |         {
  9 |           "type": "tab",
 10 |           "id": "onRenderTab2",
 11 |           "name": "top1",
 12 |           "component": "testing"
 13 |         }
 14 |       ]
 15 |     },
 16 |     {
 17 |       "type": "border",
 18 |       "location": "bottom",
 19 |       "children": [
 20 |         {
 21 |           "type": "tab",
 22 |           "name": "bottom1",
 23 |           "component": "testing"
 24 |         },
 25 |         {
 26 |           "type": "tab",
 27 |           "name": "bottom2",
 28 |           "component": "testing"
 29 |         }
 30 |       ]
 31 |     },
 32 |     {
 33 |       "type": "border",
 34 |       "location": "left",
 35 |       "children": [
 36 |         {
 37 |           "type": "tab",
 38 |           "name": "left1",
 39 |           "component": "testing"
 40 |         }
 41 |       ]
 42 |     },
 43 |     {
 44 |       "type": "border",
 45 |       "location": "right",
 46 |       "children": [
 47 |         {
 48 |           "type": "tab",
 49 |           "name": "right1",
 50 |           "component": "testing"
 51 |         }
 52 |       ]
 53 |     }
 54 |   ],
 55 |   "layout": {
 56 |     "type": "row",
 57 |     "weight": 100,
 58 |     "children": [
 59 |       {
 60 |         "type": "tabset",
 61 |         "id": "onRenderTabSet1",
 62 |         "weight": 50,
 63 |         "children": [
 64 |           {
 65 |             "type": "tab",
 66 |             "id": "345",
 67 |             "name": "One",
 68 |             "component": "testing"
 69 |           }
 70 |         ]
 71 |       },
 72 |       {
 73 |         "type": "tabset",
 74 |         "id": "onRenderTabSet2",
 75 |         "name": "will be replaced",
 76 |         "weight": 50,
 77 |         "children": [
 78 |           {
 79 |             "type": "tab",
 80 |             "id": "onRenderTab1",
 81 |             "name": "Two",
 82 |             "component": "testing"
 83 |           }
 84 |         ]
 85 |       },
 86 |       {
 87 |         "type": "tabset",
 88 |         "id": "onRenderTabSet3",
 89 |         "weight": 50,
 90 |         "children": [
 91 |           {
 92 |             "type": "tab",
 93 |             "id": "123",
 94 |             "name": "Three",
 95 |             "component": "testing"
 96 |           }
 97 |         ]
 98 |       }
 99 |     ]
100 |   }
101 | }

--------------------------------------------------------------------------------
/demo/public/popout.html:
--------------------------------------------------------------------------------
 1 | <!DOCTYPE html>
 2 | <html>
 3 |
 4 | <head>
 5 |     <meta http-equiv='Content-type' content='text/html; charset=utf-8'>
 6 |     <title>FlexLayout Popout</title>
 7 |     <style>
 8 |         body {
 9 |             height: 100%;
10 |         }
11 |     </style>
12 | </head>
13 | <body>
14 | </body>
15 | </html>

--------------------------------------------------------------------------------
/demo/styles.css:
--------------------------------------------------------------------------------
  1 | html,
  2 | body {
  3 |     height: 100%;
  4 |     margin: 0;
  5 |     padding: 0;
  6 |     overflow: hidden;
  7 |     font-size: medium;
  8 |     font-family: Arial, sans-serif;
  9 | }
 10 |
 11 | .app {
 12 |     display: flex;
 13 |     flex-direction: column;
 14 |     flex-grow: 1;
 15 | }
 16 |
 17 | .toolbar {
 18 |     margin: 2px;
 19 |     display: flex;
 20 |     align-items: center;
 21 |     flex-wrap: wrap;
 22 | }
 23 |
 24 | .toolbar_control {
 25 |     border-radius: 5px;
 26 |     border: 1px solid lightgray;
 27 | }
 28 |
 29 | .tab_content {
 30 |     height: 100%;
 31 |     display: flex;
 32 |     justify-content: center;
 33 |     align-items: center;
 34 | }
 35 |
 36 | #container {
 37 |     left: 10px;
 38 |     top: 10px;
 39 |     right: 10px;
 40 |     bottom: 10px;
 41 |     position: absolute;
 42 |     display: flex;
 43 |     overflow: hidden;
 44 |     background-color: white;
 45 | }
 46 |
 47 | .contents {
 48 |     display: flex;
 49 |     flex-grow: 1;
 50 |     position: relative;
 51 |     border: 1px solid #ddd;
 52 | }
 53 |
 54 | .drag-from {
 55 |     background-color: lightgray;
 56 |     color: black;
 57 |     border-radius: 5px;
 58 | }
 59 |
 60 | .greenClass {
 61 |     background-color: #eeffee;
 62 | }
 63 |
 64 | .blueClass {
 65 |     background-color: #eeeeff;
 66 | }
 67 |
 68 | .simple_table {
 69 |     background-color: white;
 70 |     color: #333;
 71 |     border-collapse: collapse;
 72 | }
 73 |
 74 | .simple_table th {
 75 |     background-color: #e0e0e0;
 76 |     border-right: 1px solid #ddd;
 77 |     padding: 4px;
 78 |     border-bottom-color: transparent;
 79 |     text-align: left;
 80 |     width: 100px;
 81 |     min-width: 100px;
 82 | }
 83 |
 84 | .simple_table td {
 85 |     border-right: 1px solid #ddd;
 86 |     border-bottom-color: transparent;
 87 |     padding: 4px;
 88 | }
 89 |
 90 | .simple_table tr:nth-child(even) {
 91 |     background: #f0f0f0
 92 | }
 93 |
 94 | .simple_table tr:nth-child(odd) {
 95 |     background: white
 96 | }
 97 |
 98 | ::-webkit-scrollbar {
 99 |     width: 8px;
100 |     height: 8px;
101 | }
102 |
103 | ::-webkit-scrollbar-button {
104 |     background-color: #ddd;
105 | }
106 |
107 | ::-webkit-scrollbar-track {
108 |     background-color: #efefef;
109 | }
110 |
111 | ::-webkit-scrollbar-track-piece {
112 |     background-color: #eee;
113 | }
114 |
115 | ::-webkit-scrollbar-thumb {
116 |     height: 50px;
117 |     background-color: #ccc;
118 |     border-radius: 3px;
119 | }
120 |
121 | ::-webkit-scrollbar-corner {
122 |     background-color: #fff;
123 | }
124 |
125 | ::-webkit-resizer {
126 |     background-color: #999;
127 | }
128 |
129 | .flexlayout__theme_light {}
130 |
131 | .flexlayout__theme_dark {
132 |
133 |     html,
134 |     body {
135 |         color: lightgray;
136 |         background-color: black;
137 |     }
138 |
139 |     .toolbar_control {
140 |         color: lightgray;
141 |         background-color: black;
142 |         border: 1px solid #444;
143 |     }
144 |
145 |     .drag-from {
146 |         background-color: #666;
147 |         color: white;
148 |     }
149 |
150 |     #container {
151 |         background-color: black;
152 |     }
153 |
154 |     ::-webkit-scrollbar-button {
155 |         background-color: #222;
156 |     }
157 |
158 |     ::-webkit-scrollbar-track {
159 |         background-color: #444;
160 |     }
161 |
162 |     ::-webkit-scrollbar-track-piece {
163 |         background-color: #333;
164 |     }
165 |
166 |     ::-webkit-scrollbar-thumb {
167 |         background-color: #666;
168 |     }
169 |
170 |     ::-webkit-scrollbar-corner {
171 |         background-color: #333;
172 |     }
173 |
174 |     ::-webkit-resizer {
175 |         background-color: #666;
176 |     }
177 |
178 |     .contents {
179 |         border: 1px solid gray;
180 |     }
181 |
182 |     /* simple_bundled table styling*/
183 |     .simple_table {
184 |         background-color: #222;
185 |         color: gray;
186 |     }
187 |
188 |     .simple_table th {
189 |         color: #ddd;
190 |         background-color: #282828;
191 |         border-right: 1px solid #333;
192 |         border-bottom-color: transparent;
193 |     }
194 |
195 |     .simple_table td {
196 |         border-right: 1px solid #333;
197 |         border-bottom: 1px solid #333;
198 |     }
199 |
200 |     .simple_table tr:nth-child(even) {
201 |         background: #242424
202 |     }
203 |
204 |     .simple_table tr:nth-child(odd) {
205 |         background: #222
206 |     }
207 | }
208 |
209 | .flexlayout__theme_gray {}
210 |
211 | .flexlayout__theme_underline {}
212 |
213 | .flexlayout__theme_rounded {
214 |     .drag-from {
215 |         background-color: #dce7f4;
216 |         color: black;
217 |     }
218 |
219 |     #container {
220 |         background-color: #f2f6fb;
221 |         border-radius: 10px;
222 |     }
223 |
224 |     .toolbar {
225 |         padding-left: 5px;
226 |         padding-right: 5px;
227 |     }
228 |
229 |     ::-webkit-scrollbar-button {
230 |         background-color: #e7ebf1;
231 |     }
232 |
233 |     ::-webkit-scrollbar-track {
234 |         background-color: #e7ebf1;
235 |     }
236 |
237 |     ::-webkit-scrollbar-track-piece {
238 |         background-color: #e7ebf1;
239 |     }
240 |
241 |     ::-webkit-scrollbar-thumb {
242 |         background-color: #d5deeb;
243 |         border-radius: 3px;
244 |     }
245 |
246 |     ::-webkit-scrollbar-corner {
247 |         background-color: #e7ebf1;
248 |     }
249 |
250 |     ::-webkit-resizer {
251 |         background-color: #e7ebf1;
252 |     }
253 |
254 |     .contents {
255 |         border: 5px solid transparent;
256 |     }
257 |
258 |     .simple_table {
259 |         background-color: white;
260 |         color: #333;
261 |     }
262 |
263 |     .simple_table th {
264 |         background-color: #dce5f2;
265 |         border-right: 1px solid #ddd;
266 |         border-bottom-color: transparent;
267 |     }
268 |
269 |     .simple_table td {
270 |         border-right: 1px solid #ddd;
271 |         border-bottom-color: transparent;
272 |     }
273 |
274 |     .simple_table tr:nth-child(even) {
275 |         background: #ebeff3
276 |     }
277 |
278 |     .simple_table tr:nth-child(odd) {
279 |         background: white
280 |     }
281 |
282 | }
283 |
284 | .showLayout .flexlayout__row {
285 |     margin:5px;
286 |     border: 3px solid blue;
287 | }
288 |
289 | .showLayout .flexlayout__tabset {
290 |     margin:5px;
291 |     border: 3px solid orange;
292 | }

--------------------------------------------------------------------------------
/eslint.config.mjs:
--------------------------------------------------------------------------------
 1 | import { defineConfig } from "eslint/config";
 2 | import js from "@eslint/js";
 3 | import globals from "globals";
 4 | import tseslint from "typescript-eslint";
 5 | import pluginReact from "eslint-plugin-react";
 6 |
 7 | export default defineConfig([
 8 |   { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
 9 |   { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
10 |   tseslint.configs.recommended, // This applies the recommended TypeScript rules
11 |   pluginReact.configs.flat.recommended,
12 |   {
13 |     files: ["**/*.{ts,tsx}"], // Apply only to TypeScript and TSX files
14 |     rules: {
15 |       '@typescript-eslint/no-explicit-any': 'off',
16 |       "no-unused-vars": "off",
17 |       "@typescript-eslint/no-unused-vars": "off",
18 |       "react/react-in-jsx-scope": "off",
19 |       "react/display-name":"off"
20 |     },
21 |   },
22 |   {
23 |     settings: {
24 |       react: {
25 |         version: 'detect', // Automatically detects the React version
26 |       },
27 |     },
28 |   },
29 | ]);

--------------------------------------------------------------------------------
/package.json:
--------------------------------------------------------------------------------
  1 | {
  2 |   "name": "flexlayout-react",
  3 |   "version": "0.8.17",
  4 |   "description": "A multi-tab docking layout manager",
  5 |   "author": "Caplin Systems Ltd",
  6 |   "repository": {
  7 |     "type": "git",
  8 |     "url": "git+https://github.com/caplin/FlexLayout.git"
  9 |   },
 10 |   "license": "ISC",
 11 |   "type": "module",
 12 |   "main": "./dist/index.js",
 13 |   "module": "./dist/index.js",
 14 |   "types": "./types/index.d.ts",
 15 |   "exports": {
 16 |     ".": {
 17 |       "import": "./dist/index.js",
 18 |       "types": "./types/index.d.ts"
 19 |     },
 20 |     "./style/*": "./style/*"
 21 |   },
 22 |   "files": [
 23 |     "dist/",
 24 |     "types/",
 25 |     "style/"
 26 |   ],
 27 |   "keywords": [
 28 |     "react",
 29 |     "layout",
 30 |     "dock",
 31 |     "popout",
 32 |     "tabs",
 33 |     "tabset",
 34 |     "splitter",
 35 |     "drag",
 36 |     "drop",
 37 |     "reactjs",
 38 |     "flexlayout",
 39 |     "flex layout",
 40 |     "layout manager",
 41 |     "drag and drop",
 42 |     "split view",
 43 |     "docking library",
 44 |     "docking layout"
 45 |   ],
 46 |   "scripts": {
 47 |     "dev": "vite",
 48 |     "preview": "vite preview",
 49 |     "build": "npm run build:clean && npm run build:demo && npm run css && npm run build:lib && npm run build:types && npm run doc",
 50 |     "build:clean": "rimraf demo/dist dist/ types/ typedoc/",
 51 |     "build:demo": "vite build",
 52 |     "build:types": "tsc -p tsconfig-types.json",
 53 |     "build:lib": "vite build --config vite.config.lib.ts",
 54 |     "test": "vitest",
 55 |     "playwright": "playwright test --ui",
 56 |     "lint": "eslint src/*",
 57 |     "doc": "typedoc --out typedoc --exclude \"**/demo/**/*.tsx\" --excludeInternal --disableSources --excludePrivate --excludeProtected --readme none ./src",
 58 |     "css": "sass style:style"
 59 |   },
 60 |   "eslintConfig": {
 61 |     "extends": "react-app"
 62 |   },
 63 |   "peerDependencies": {
 64 |     "react": "^18.0.0 || ^19.0.0",
 65 |     "react-dom": "^18.0.0 || ^19.0.0"
 66 |   },
 67 |   "devDependencies": {
 68 |     "@emotion/react": "^11.14.0",
 69 |     "@emotion/styled": "^11.14.0",
 70 |     "@eslint/js": "^9.24.0",
 71 |     "@mui/material": "^7.0.2",
 72 |     "@mui/x-data-grid": "^7.28.3",
 73 |     "@playwright/test": "^1.51.1",
 74 |     "@types/node": "^22.14.1",
 75 |     "@types/prismjs": "^1.26.5",
 76 |     "@types/react": "^19.1.2",
 77 |     "@types/react-dom": "^19.1.2",
 78 |     "@vitejs/plugin-react": "^4.4.0",
 79 |     "ag-grid-community": "^33.2.3",
 80 |     "ag-grid-react": "^33.2.3",
 81 |     "chart.js": "^4.4.9",
 82 |     "eslint": "^9.24.0",
 83 |     "eslint-plugin-react": "^7.37.5",
 84 |     "globals": "^16.0.0",
 85 |     "ol": "^10.5.0",
 86 |     "prettier": "^3.5.3",
 87 |     "prismjs": "^1.30.0",
 88 |     "react": "^19.1.0",
 89 |     "react-chartjs-2": "^5.3.0",
 90 |     "react-dom": "^19.1.0",
 91 |     "react-scripts": "5.0.1",
 92 |     "rimraf": "^6.0.1",
 93 |     "sass": "^1.86.3",
 94 |     "styled-components": "^6.1.17",
 95 |     "typedoc": "^0.28.2",
 96 |     "typescript": "^5.8.3",
 97 |     "typescript-eslint": "^8.30.1",
 98 |     "vite": "^6.3.0",
 99 |     "vitest": "^3.1.1"
100 |   }
101 | }

--------------------------------------------------------------------------------
/playwright.config.ts:
--------------------------------------------------------------------------------
 1 | import { defineConfig, devices } from '@playwright/test';
 2 |
 3 | /**
 4 |  * Read environment variables from file.
 5 |  * https://github.com/motdotla/dotenv
 6 |  */
 7 | // import dotenv from 'dotenv';
 8 | // import path from 'path';
 9 | // dotenv.config({ path: path.resolve(__dirname, '.env') });
10 |
11 | /**
12 |  * See https://playwright.dev/docs/test-configuration.
13 |  */
14 | export default defineConfig({
15 |   testDir: './tests-playwright',
16 |   /* Run tests in files in parallel */
17 |   fullyParallel: true,
18 |   /* Fail the build on CI if you accidentally left test.only in the source code. */
19 |   forbidOnly: !!process.env.CI,
20 |   /* Retry on CI only */
21 |   retries: process.env.CI ? 2 : 0,
22 |   /* Opt out of parallel tests on CI. */
23 |   workers: process.env.CI ? 1 : undefined,
24 |   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
25 |   reporter: 'html',
26 |   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
27 |   use: {
28 |     /* Base URL to use in actions like `await page.goto('/')`. */
29 |     // baseURL: 'http://127.0.0.1:3000',
30 |
31 |     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
32 |     trace: 'on-first-retry',
33 |   },
34 |
35 |   /* Configure projects for major browsers */
36 |   projects: [
37 |     {
38 |       name: 'chromium',
39 |       use: { ...devices['Desktop Chrome'] },
40 |     },
41 |
42 |     // {
43 |     //   name: 'firefox',
44 |     //   use: { ...devices['Desktop Firefox'] },
45 |     // },
46 |
47 |     {
48 |       name: 'webkit',
49 |       use: { ...devices['Desktop Safari'] },
50 |     },
51 |
52 |     /* Test against mobile viewports. */
53 |     // {
54 |     //   name: 'Mobile Chrome',
55 |     //   use: { ...devices['Pixel 5'] },
56 |     // },
57 |     // {
58 |     //   name: 'Mobile Safari',
59 |     //   use: { ...devices['iPhone 12'] },
60 |     // },
61 |
62 |     /* Test against branded browsers. */
63 |     // {
64 |     //   name: 'Microsoft Edge',
65 |     //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
66 |     // },
67 |     // {
68 |     //   name: 'Google Chrome',
69 |     //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
70 |     // },
71 |   ],
72 |
73 |   /* Run your local dev server before starting the tests */
74 |   // webServer: {
75 |   //   command: 'npm run start',
76 |   //   url: 'http://127.0.0.1:3000',
77 |   //   reuseExistingServer: !process.env.CI,
78 |   // },
79 | });

--------------------------------------------------------------------------------
/screenshots/PlaywrightUI.png:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/caplin/FlexLayout/40753f37f0ffe51073c592e6fed231c005f1bd8d/screenshots/PlaywrightUI.png

--------------------------------------------------------------------------------
/screenshots/Screenshot_customize_tab.png:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/caplin/FlexLayout/40753f37f0ffe51073c592e6fed231c005f1bd8d/screenshots/Screenshot_customize_tab.png

--------------------------------------------------------------------------------
/screenshots/Screenshot_customize_tabset.png:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/caplin/FlexLayout/40753f37f0ffe51073c592e6fed231c005f1bd8d/screenshots/Screenshot_customize_tabset.png

--------------------------------------------------------------------------------
/screenshots/Screenshot_layout.png:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/caplin/FlexLayout/40753f37f0ffe51073c592e6fed231c005f1bd8d/screenshots/Screenshot_layout.png

--------------------------------------------------------------------------------
/screenshots/Screenshot_light.png:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/caplin/FlexLayout/40753f37f0ffe51073c592e6fed231c005f1bd8d/screenshots/Screenshot_light.png

--------------------------------------------------------------------------------
/screenshots/Screenshot_rounded.png:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/caplin/FlexLayout/40753f37f0ffe51073c592e6fed231c005f1bd8d/screenshots/Screenshot_rounded.png

--------------------------------------------------------------------------------
/screenshots/Screenshot_two_tabs.png:
--------------------------------------------------------------------------------
https://raw.githubusercontent.com/caplin/FlexLayout/40753f37f0ffe51073c592e6fed231c005f1bd8d/screenshots/Screenshot_two_tabs.png

--------------------------------------------------------------------------------
/src/Attribute.ts:
--------------------------------------------------------------------------------
 1 | /** @internal */
 2 | export class Attribute {
 3 |     static NUMBER = "number";
 4 |     static STRING = "string";
 5 |     static BOOLEAN = "boolean";
 6 |
 7 |     name: string;
 8 |     alias: string | undefined;
 9 |     modelName?: string;
10 |     pairedAttr?: Attribute;
11 |     pairedType?: string;
12 |     defaultValue: any;
13 |     alwaysWriteJson?: boolean;
14 |     type?: string;
15 |     required: boolean;
16 |     fixed: boolean;
17 |     description?: string;
18 |
19 |     constructor(name: string, modelName: string | undefined, defaultValue: any, alwaysWriteJson?: boolean) {
20 |         this.name = name;
21 |         this.alias = undefined;
22 |         this.modelName = modelName;
23 |         this.defaultValue = defaultValue;
24 |         this.alwaysWriteJson = alwaysWriteJson;
25 |         this.required = false;
26 |         this.fixed = false;
27 |
28 |         this.type = "any";
29 |     }
30 |
31 |     setType(value: string) {
32 |         this.type = value;
33 |         return this;
34 |     }
35 |
36 |     setAlias(value: string) {
37 |         this.alias = value;
38 |         return this;
39 |     }
40 |
41 |     setDescription(value: string) {
42 |         this.description = value;
43 |     }
44 |
45 |     setRequired() {
46 |         this.required = true;
47 |         return this;
48 |     }
49 |
50 |     setFixed() {
51 |         this.fixed = true;
52 |         return this;
53 |     }
54 |
55 |     // sets modelAttr for nodes, and nodeAttr for model
56 |     setpairedAttr(value: Attribute) {
57 |         this.pairedAttr = value;
58 |     }
59 |
60 |     setPairedType(value: string) {
61 |         this.pairedType = value;
62 |     }
63 |
64 | }

--------------------------------------------------------------------------------
/src/AttributeDefinitions.ts:
--------------------------------------------------------------------------------
  1 | import { Attribute } from "./Attribute";
  2 |
  3 | /** @internal */
  4 | export class AttributeDefinitions {
  5 |     attributes: Attribute[];
  6 |     nameToAttribute: Map<string, Attribute>;
  7 |
  8 |     constructor() {
  9 |         this.attributes = [];
 10 |         this.nameToAttribute = new Map();
 11 |     }
 12 |
 13 |     addWithAll(name: string, modelName: string | undefined, defaultValue: any, alwaysWriteJson?: boolean) {
 14 |         const attr = new Attribute(name, modelName, defaultValue, alwaysWriteJson);
 15 |         this.attributes.push(attr);
 16 |         this.nameToAttribute.set(name, attr);
 17 |         return attr;
 18 |     }
 19 |
 20 |     addInherited(name: string, modelName: string) {
 21 |         return this.addWithAll(name, modelName, undefined, false);
 22 |     }
 23 |
 24 |     add(name: string, defaultValue: any, alwaysWriteJson?: boolean) {
 25 |         return this.addWithAll(name, undefined, defaultValue, alwaysWriteJson);
 26 |     }
 27 |
 28 |     getAttributes() {
 29 |         return this.attributes;
 30 |     }
 31 |
 32 |     getModelName(name: string) {
 33 |         const conversion = this.nameToAttribute.get(name);
 34 |         if (conversion !== undefined) {
 35 |             return conversion.modelName;
 36 |         }
 37 |         return undefined;
 38 |     }
 39 |
 40 |     toJson(jsonObj: any, obj: any) {
 41 |         for (const attr of this.attributes) {
 42 |             const fromValue = obj[attr.name];
 43 |             if (attr.alwaysWriteJson || fromValue !== attr.defaultValue) {
 44 |                 jsonObj[attr.name] = fromValue;
 45 |             }
 46 |         }
 47 |     }
 48 |
 49 |     fromJson(jsonObj: any, obj: any) {
 50 |         for (const attr of this.attributes) {
 51 |             let fromValue = jsonObj[attr.name];
 52 |             if (fromValue === undefined && attr.alias) {
 53 |                 fromValue = jsonObj[attr.alias];
 54 |             }
 55 |             if (fromValue === undefined) {
 56 |                 obj[attr.name] = attr.defaultValue;
 57 |             } else {
 58 |                 obj[attr.name] = fromValue;
 59 |             }
 60 |         }
 61 |     }
 62 |
 63 |     update(jsonObj: any, obj: any) {
 64 |         for (const attr of this.attributes) {
 65 |             if (Object.prototype.hasOwnProperty.call(jsonObj, attr.name)) {
 66 |                 const fromValue = jsonObj[attr.name];
 67 |                 if (fromValue === undefined) {
 68 |                     delete obj[attr.name];
 69 |                 } else {
 70 |                     obj[attr.name] = fromValue;
 71 |                 }
 72 |             }
 73 |         }
 74 |     }
 75 |
 76 |     setDefaults(obj: any) {
 77 |         for (const attr of this.attributes) {
 78 |             obj[attr.name] = attr.defaultValue;
 79 |         }
 80 |     }
 81 |
 82 |     pairAttributes(type: string, childAttributes: AttributeDefinitions) {
 83 |         for (const attr of childAttributes.attributes) {
 84 |             if (attr.modelName && this.nameToAttribute.has(attr.modelName)) {
 85 |                 const pairedAttr = this.nameToAttribute.get(attr.modelName)!;
 86 |                 pairedAttr.setpairedAttr(attr);
 87 |                 attr.setpairedAttr(pairedAttr);
 88 |                 pairedAttr.setPairedType(type);
 89 |             }
 90 |         }
 91 |     }
 92 |
 93 |     toTypescriptInterface(name: string, parentAttributes: AttributeDefinitions | undefined) {
 94 |         const lines = [];
 95 |         const sorted = this.attributes.sort((a, b) => a.name.localeCompare(b.name));
 96 |         // const sorted = this.attributes;
 97 |         lines.push("export interface I" + name + "Attributes {");
 98 |         for (let i = 0; i < sorted.length; i++) {
 99 |             const c = sorted[i];
100 |             let type = c.type;
101 |             let defaultValue = undefined;
102 |
103 |             let attr = c;
104 |             let inherited = undefined;
105 |             if (attr.defaultValue !== undefined) {
106 |                 defaultValue = attr.defaultValue;
107 |             } else if (attr.modelName !== undefined
108 |                 && parentAttributes !== undefined
109 |                 && parentAttributes.nameToAttribute.get(attr.modelName) !== undefined) {
110 |                 inherited = attr.modelName;
111 |                 attr = parentAttributes.nameToAttribute.get(inherited)!;
112 |                 defaultValue = attr.defaultValue;
113 |                 type = attr.type;
114 |             }
115 |
116 |             const defValue = JSON.stringify(defaultValue);
117 |
118 |             const required = attr.required ? "" : "?";
119 |
120 |             let sb = "\t/**\n\t  ";
121 |             if (c.description) {
122 |                 sb += c.description;
123 |             } else if (c.pairedType && c.pairedAttr?.description) {
124 |                 sb += `Value for ${c.pairedType} attribute ${c.pairedAttr.name} if not overridden`
125 |                 sb += "\n\n\t  ";
126 |                 sb += c.pairedAttr?.description;
127 |             }
128 |             sb += "\n\n\t  ";
129 |             if (c.fixed) {
130 |                 sb += `Fixed value: ${defValue}`;
131 |             } else if (inherited) {
132 |                 sb += `Default: inherited from Global attribute ${c.modelName} (default ${defValue})`;
133 |             } else {
134 |                 sb += `Default: ${defValue}`;
135 |             }
136 |             sb += "\n\t */";
137 |             lines.push(sb);
138 |             lines.push("\t" + c.name + required + ": " + type + ";\n");
139 |         }
140 |         lines.push("}");
141 |
142 |         return lines.join("\n");
143 |     }
144 | }

--------------------------------------------------------------------------------
/src/DockLocation.ts:
--------------------------------------------------------------------------------
  1 | import { Orientation } from "./Orientation";
  2 | import { Rect } from "./Rect";
  3 |
  4 | export class DockLocation {
  5 |     static values = new Map<string, DockLocation>();
  6 |     static TOP = new DockLocation("top", Orientation.VERT, 0);
  7 |     static BOTTOM = new DockLocation("bottom", Orientation.VERT, 1);
  8 |     static LEFT = new DockLocation("left", Orientation.HORZ, 0);
  9 |     static RIGHT = new DockLocation("right", Orientation.HORZ, 1);
 10 |     static CENTER = new DockLocation("center", Orientation.VERT, 0);
 11 |
 12 |     /** @internal */
 13 |     static getByName(name: string): DockLocation {
 14 |         return DockLocation.values.get(name)!;
 15 |     }
 16 |
 17 |     /** @internal */
 18 |     static getLocation(rect: Rect, x: number, y: number) {
 19 |         x = (x - rect.x) / rect.width;
 20 |         y = (y - rect.y) / rect.height;
 21 |
 22 |         if (x >= 0.25 && x < 0.75 && y >= 0.25 && y < 0.75) {
 23 |             return DockLocation.CENTER;
 24 |         }
 25 |
 26 |         // Whether or not the point is in the bottom-left half of the rect
 27 |         // +-----+
 28 |         // |\    |
 29 |         // |x\   |
 30 |         // |xx\  |
 31 |         // |xxx\ |
 32 |         // |xxxx\|
 33 |         // +-----+
 34 |         const bl = y >= x;
 35 |
 36 |         // Whether or not the point is in the bottom-right half of the rect
 37 |         // +-----+
 38 |         // |    /|
 39 |         // |   /x|
 40 |         // |  /xx|
 41 |         // | /xxx|
 42 |         // |/xxxx|
 43 |         // +-----+
 44 |         const br = y >= 1 - x;
 45 |
 46 |         if (bl) {
 47 |             return br ? DockLocation.BOTTOM : DockLocation.LEFT;
 48 |         } else {
 49 |             return br ? DockLocation.RIGHT : DockLocation.TOP;
 50 |         }
 51 |     }
 52 |
 53 |     /** @internal */
 54 |     name: string;
 55 |     /** @internal */
 56 |     orientation: Orientation;
 57 |     /** @internal */
 58 |     indexPlus: number;
 59 |
 60 |     /** @internal */
 61 |     constructor(_name: string, _orientation: Orientation, _indexPlus: number) {
 62 |         this.name = _name;
 63 |         this.orientation = _orientation;
 64 |         this.indexPlus = _indexPlus;
 65 |         DockLocation.values.set(this.name, this);
 66 |     }
 67 |
 68 |     getName() {
 69 |         return this.name;
 70 |     }
 71 |
 72 |     getOrientation() {
 73 |         return this.orientation;
 74 |     }
 75 |
 76 |     /** @internal */
 77 |     getDockRect(r: Rect) {
 78 |         if (this === DockLocation.TOP) {
 79 |             return new Rect(r.x, r.y, r.width, r.height / 2);
 80 |         } else if (this === DockLocation.BOTTOM) {
 81 |             return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
 82 |         }
 83 |         if (this === DockLocation.LEFT) {
 84 |             return new Rect(r.x, r.y, r.width / 2, r.height);
 85 |         } else if (this === DockLocation.RIGHT) {
 86 |             return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
 87 |         } else {
 88 |             return r.clone();
 89 |         }
 90 |     }
 91 |
 92 |     /** @internal */
 93 |     split(rect: Rect, size: number) {
 94 |         if (this === DockLocation.TOP) {
 95 |             const r1 = new Rect(rect.x, rect.y, rect.width, size);
 96 |             const r2 = new Rect(rect.x, rect.y + size, rect.width, rect.height - size);
 97 |             return { start: r1, end: r2 };
 98 |         } else if (this === DockLocation.LEFT) {
 99 |             const r1 = new Rect(rect.x, rect.y, size, rect.height);
100 |             const r2 = new Rect(rect.x + size, rect.y, rect.width - size, rect.height);
101 |             return { start: r1, end: r2 };
102 |         }
103 |         if (this === DockLocation.RIGHT) {
104 |             const r1 = new Rect(rect.getRight() - size, rect.y, size, rect.height);
105 |             const r2 = new Rect(rect.x, rect.y, rect.width - size, rect.height);
106 |             return { start: r1, end: r2 };
107 |         } else {
108 |             // if (this === DockLocation.BOTTOM) {
109 |             const r1 = new Rect(rect.x, rect.getBottom() - size, rect.width, size);
110 |             const r2 = new Rect(rect.x, rect.y, rect.width, rect.height - size);
111 |             return { start: r1, end: r2 };
112 |         }
113 |     }
114 |
115 |     /** @internal */
116 |     reflect() {
117 |         if (this === DockLocation.TOP) {
118 |             return DockLocation.BOTTOM;
119 |         } else if (this === DockLocation.LEFT) {
120 |             return DockLocation.RIGHT;
121 |         }
122 |         if (this === DockLocation.RIGHT) {
123 |             return DockLocation.LEFT;
124 |         } else {
125 |             // if (this === DockLocation.BOTTOM) {
126 |             return DockLocation.TOP;
127 |         }
128 |     }
129 |
130 |     toString() {
131 |         return "(DockLocation: name=" + this.name + ", orientation=" + this.orientation + ")";
132 |     }
133 | }

--------------------------------------------------------------------------------
/src/DropInfo.ts:
--------------------------------------------------------------------------------
 1 | import { DockLocation } from "./DockLocation";
 2 | import { IDropTarget } from "./model/IDropTarget";
 3 | import { Node } from "./model/Node";
 4 | import { Rect } from "./Rect";
 5 |
 6 | export class DropInfo {
 7 |     node: Node & IDropTarget;
 8 |     rect: Rect;
 9 |     location: DockLocation;
10 |     index: number;
11 |     className: string;
12 |
13 |     constructor(node: Node & IDropTarget, rect: Rect, location: DockLocation, index: number, className: string) {
14 |         this.node = node;
15 |         this.rect = rect;
16 |         this.location = location;
17 |         this.index = index;
18 |         this.className = className;
19 |     }
20 | }

--------------------------------------------------------------------------------
/src/I18nLabel.ts:
--------------------------------------------------------------------------------
 1 | export enum I18nLabel {
 2 |     Close_Tab = "Close",
 3 |     Close_Tabset = "Close tab set",
 4 |     Active_Tabset = "Active tab set",
 5 |     Move_Tabset = "Move tab set",
 6 |     Move_Tabs = "Move tabs(?)",
 7 |     Maximize = "Maximize tab set",
 8 |     Restore = "Restore tab set",
 9 |     Popout_Tab = "Popout selected tab",
10 |     Overflow_Menu_Tooltip = "Hidden tabs",
11 |     Error_rendering_component = "Error rendering component",
12 |     Error_rendering_component_retry = "Retry",
13 | }

--------------------------------------------------------------------------------
/src/Orientation.ts:
--------------------------------------------------------------------------------
 1 | export class Orientation {
 2 |     static HORZ = new Orientation("horz");
 3 |     static VERT = new Orientation("vert");
 4 |
 5 |     static flip(from: Orientation) {
 6 |         if (from === Orientation.HORZ) {
 7 |             return Orientation.VERT;
 8 |         } else {
 9 |             return Orientation.HORZ;
10 |         }
11 |     }
12 |
13 |     /** @internal */
14 |     private _name: string;
15 |
16 |     /** @internal */
17 |     private constructor(name: string) {
18 |         this._name = name;
19 |     }
20 |
21 |     getName() {
22 |         return this._name;
23 |     }
24 |
25 |     toString() {
26 |         return this._name;
27 |     }
28 | }

--------------------------------------------------------------------------------
/src/Rect.ts:
--------------------------------------------------------------------------------
  1 | import { IJsonRect } from "./model/IJsonModel";
  2 | import { Orientation } from "./Orientation";
  3 |
  4 | export class Rect {
  5 |     static empty() {
  6 |         return new Rect(0, 0, 0, 0);
  7 |     }
  8 |
  9 |     static fromJson(json: IJsonRect): Rect {
 10 |         return new Rect(json.x, json.y, json.width, json.height);
 11 |     }
 12 |
 13 |     x: number;
 14 |     y: number;
 15 |     width: number;
 16 |     height: number;
 17 |
 18 |     constructor(x: number, y: number, width: number, height: number) {
 19 |         this.x = x;
 20 |         this.y = y;
 21 |         this.width = width;
 22 |         this.height = height;
 23 |     }
 24 |
 25 |     toJson() {
 26 |         return {x: this.x, y: this.y, width: this.width, height: this.height};
 27 |     }
 28 |
 29 |     snap(round: number) {
 30 |         this.x = Math.round(this.x / round) * round;
 31 |         this.y = Math.round(this.y / round) * round;
 32 |         this.width = Math.round(this.width / round) * round;
 33 |         this.height= Math.round(this.height / round) * round;
 34 |     }
 35 |
 36 |     static getBoundingClientRect(element: Element) {
 37 |         const { x, y, width, height } = element.getBoundingClientRect();
 38 |         return new Rect(x, y, width, height);
 39 |     }
 40 |
 41 |     static getContentRect(element: HTMLElement) {
 42 |         const rect = element.getBoundingClientRect();
 43 |         const style = window.getComputedStyle(element);
 44 |
 45 |         const paddingLeft = parseFloat(style.paddingLeft);
 46 |         const paddingRight = parseFloat(style.paddingRight);
 47 |         const paddingTop = parseFloat(style.paddingTop);
 48 |         const paddingBottom = parseFloat(style.paddingBottom);
 49 |         const borderLeftWidth = parseFloat(style.borderLeftWidth);
 50 |         const borderRightWidth = parseFloat(style.borderRightWidth);
 51 |         const borderTopWidth = parseFloat(style.borderTopWidth);
 52 |         const borderBottomWidth = parseFloat(style.borderBottomWidth);
 53 |
 54 |         const contentWidth = rect.width - borderLeftWidth - paddingLeft - paddingRight - borderRightWidth;
 55 |         const contentHeight = rect.height - borderTopWidth - paddingTop - paddingBottom - borderBottomWidth;
 56 |
 57 |         return new Rect(
 58 |             rect.left + borderLeftWidth + paddingLeft,
 59 |             rect.top + borderTopWidth + paddingTop,
 60 |             contentWidth,
 61 |             contentHeight,
 62 |         );
 63 |     }
 64 |
 65 |     static fromDomRect(domRect: DOMRect) {
 66 |         return new Rect(domRect.x, domRect.y, domRect.width, domRect.height);
 67 |     }
 68 |
 69 |     relativeTo(r: Rect | DOMRect) {
 70 |         return new Rect(this.x - r.x, this.y - r.y, this.width, this.height);
 71 |     }
 72 |
 73 |     clone() {
 74 |         return new Rect(this.x, this.y, this.width, this.height);
 75 |     }
 76 |
 77 |     equals(rect: Rect | null | undefined) {
 78 |         return this.x === rect?.x && this.y === rect?.y && this.width === rect?.width && this.height === rect?.height
 79 |     }
 80 |
 81 |     equalSize(rect: Rect | null | undefined) {
 82 |         return this.width === rect?.width && this.height === rect?.height
 83 |     }
 84 |
 85 |     getBottom() {
 86 |         return this.y + this.height;
 87 |     }
 88 |
 89 |     getRight() {
 90 |         return this.x + this.width;
 91 |     }
 92 |
 93 |     get bottom() {
 94 |         return this.y + this.height;
 95 |     }
 96 |
 97 |     get right() {
 98 |         return this.x + this.width;
 99 |     }
100 |
101 |     getCenter() {
102 |         return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
103 |     }
104 |
105 |     positionElement(element: HTMLElement, position?: string) {
106 |         this.styleWithPosition(element.style, position);
107 |     }
108 |
109 |     styleWithPosition(style: Record<string, any>, position: string = "absolute") {
110 |         style.left = this.x + "px";
111 |         style.top = this.y + "px";
112 |         style.width = Math.max(0, this.width) + "px"; // need Math.max to prevent -ve, cause error in IE
113 |         style.height = Math.max(0, this.height) + "px";
114 |         style.position = position;
115 |         return style;
116 |     }
117 |
118 |     contains(x: number, y: number) {
119 |         if (this.x <= x && x <= this.getRight() && this.y <= y && y <= this.getBottom()) {
120 |             return true;
121 |         } else {
122 |             return false;
123 |         }
124 |     }
125 |
126 |     removeInsets(insets: { top: number; left: number; bottom: number; right: number }) {
127 |         return new Rect(this.x + insets.left, this.y + insets.top, Math.max(0, this.width - insets.left - insets.right), Math.max(0, this.height - insets.top - insets.bottom));
128 |     }
129 |
130 |     centerInRect(outerRect: Rect) {
131 |         this.x = (outerRect.width - this.width) / 2;
132 |         this.y = (outerRect.height - this.height) / 2;
133 |     }
134 |
135 |     /** @internal */
136 |     _getSize(orientation: Orientation) {
137 |         let prefSize = this.width;
138 |         if (orientation === Orientation.VERT) {
139 |             prefSize = this.height;
140 |         }
141 |         return prefSize;
142 |     }
143 |
144 |     toString() {
145 |         return "(Rect: x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";
146 |     }
147 | }

--------------------------------------------------------------------------------
/src/Types.ts:
--------------------------------------------------------------------------------
  1 | export enum CLASSES {
  2 |     FLEXLAYOUT__BORDER = "flexlayout__border",
  3 |     FLEXLAYOUT__BORDER_ = "flexlayout__border_",
  4 |
  5 |     FLEXLAYOUT__BORDER_TAB_CONTENTS = "flexlayout__border_tab_contents",
  6 |     FLEXLAYOUT__BORDER_BUTTON = "flexlayout__border_button",
  7 |     FLEXLAYOUT__BORDER_BUTTON_ = "flexlayout__border_button_",
  8 |     FLEXLAYOUT__BORDER_BUTTON_CONTENT = "flexlayout__border_button_content",
  9 |     FLEXLAYOUT__BORDER_BUTTON_LEADING = "flexlayout__border_button_leading",
 10 |     FLEXLAYOUT__BORDER_BUTTON_TRAILING = "flexlayout__border_button_trailing",
 11 |     FLEXLAYOUT__BORDER_BUTTON__SELECTED = "flexlayout__border_button--selected",
 12 |     FLEXLAYOUT__BORDER_BUTTON__UNSELECTED = "flexlayout__border_button--unselected",
 13 |     FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW = "flexlayout__border_toolbar_button_overflow",
 14 |     FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW_ = "flexlayout__border_toolbar_button_overflow_",
 15 |
 16 |     FLEXLAYOUT__BORDER_INNER = "flexlayout__border_inner",
 17 |     FLEXLAYOUT__BORDER_INNER_ = "flexlayout__border_inner_",
 18 |     FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER = "flexlayout__border_inner_tab_container",
 19 |     FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER_ = "flexlayout__border_inner_tab_container_",
 20 |     FLEXLAYOUT__BORDER_TAB_DIVIDER = "flexlayout__border_tab_divider",
 21 |     FLEXLAYOUT__BORDER_LEADING = "flexlayout__border_leading",
 22 |
 23 |     FLEXLAYOUT__BORDER_SIZER = "flexlayout__border_sizer",
 24 |
 25 |     FLEXLAYOUT__BORDER_TOOLBAR = "flexlayout__border_toolbar",
 26 |     FLEXLAYOUT__BORDER_TOOLBAR_ = "flexlayout__border_toolbar_",
 27 |     FLEXLAYOUT__BORDER_TOOLBAR_BUTTON = "flexlayout__border_toolbar_button",
 28 |     FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT = "flexlayout__border_toolbar_button-float",
 29 |
 30 |     FLEXLAYOUT__DRAG_RECT = "flexlayout__drag_rect",
 31 |
 32 |     FLEXLAYOUT__EDGE_RECT = "flexlayout__edge_rect",
 33 |     FLEXLAYOUT__EDGE_RECT_TOP = "flexlayout__edge_rect_top",
 34 |     FLEXLAYOUT__EDGE_RECT_LEFT = "flexlayout__edge_rect_left",
 35 |     FLEXLAYOUT__EDGE_RECT_BOTTOM = "flexlayout__edge_rect_bottom",
 36 |     FLEXLAYOUT__EDGE_RECT_RIGHT = "flexlayout__edge_rect_right",
 37 |
 38 |     FLEXLAYOUT__ERROR_BOUNDARY_CONTAINER = "flexlayout__error_boundary_container",
 39 |     FLEXLAYOUT__ERROR_BOUNDARY_CONTENT = "flexlayout__error_boundary_content",
 40 |
 41 |     FLEXLAYOUT__FLOATING_WINDOW_CONTENT = "flexlayout__floating_window_content",
 42 |
 43 |     FLEXLAYOUT__LAYOUT = "flexlayout__layout",
 44 |     FLEXLAYOUT__LAYOUT_MOVEABLES = "flexlayout__layout_moveables",
 45 |     FLEXLAYOUT__LAYOUT_OVERLAY = "flexlayout__layout_overlay",
 46 |     FLEXLAYOUT__LAYOUT_TAB_STAMPS = "flexlayout__layout_tab_stamps",
 47 |     FLEXLAYOUT__LAYOUT_MAIN = "flexlayout__layout_main",
 48 |     FLEXLAYOUT__LAYOUT_BORDER_CONTAINER = "flexlayout__layout_border_container",
 49 |     FLEXLAYOUT__LAYOUT_BORDER_CONTAINER_INNER = "flexlayout__layout_border_container_inner",
 50 |
 51 |     FLEXLAYOUT__OUTLINE_RECT = "flexlayout__outline_rect",
 52 |     FLEXLAYOUT__OUTLINE_RECT_EDGE = "flexlayout__outline_rect_edge",
 53 |
 54 |     FLEXLAYOUT__SPLITTER = "flexlayout__splitter",
 55 |     FLEXLAYOUT__SPLITTER_EXTRA = "flexlayout__splitter_extra",
 56 |     FLEXLAYOUT__SPLITTER_ = "flexlayout__splitter_",
 57 |     FLEXLAYOUT__SPLITTER_BORDER = "flexlayout__splitter_border",
 58 |     FLEXLAYOUT__SPLITTER_DRAG = "flexlayout__splitter_drag",
 59 |     FLEXLAYOUT__SPLITTER_HANDLE = "flexlayout__splitter_handle",
 60 |     FLEXLAYOUT__SPLITTER_HANDLE_HORZ = "flexlayout__splitter_handle_horz",
 61 |     FLEXLAYOUT__SPLITTER_HANDLE_VERT = "flexlayout__splitter_handle_vert",
 62 |
 63 |     FLEXLAYOUT__ROW = "flexlayout__row",
 64 |     FLEXLAYOUT__TAB = "flexlayout__tab",
 65 |     FLEXLAYOUT__TAB_POSITION = "flexlayout__tab_position",
 66 |     FLEXLAYOUT__TAB_MOVEABLE = "flexlayout__tab_moveable",
 67 |     FLEXLAYOUT__TAB_OVERLAY = "flexlayout__tab_overlay",
 68 |
 69 |     FLEXLAYOUT__TABSET = "flexlayout__tabset",
 70 |     FLEXLAYOUT__TABSET_CONTAINER = "flexlayout__tabset_container",
 71 |     FLEXLAYOUT__TABSET_HEADER = "flexlayout__tabset_header",
 72 |     FLEXLAYOUT__TABSET_HEADER_CONTENT = "flexlayout__tabset_header_content",
 73 |     FLEXLAYOUT__TABSET_MAXIMIZED = "flexlayout__tabset-maximized",
 74 |     FLEXLAYOUT__TABSET_SELECTED = "flexlayout__tabset-selected",
 75 |     FLEXLAYOUT__TABSET_TAB_DIVIDER = "flexlayout__tabset_tab_divider",
 76 |     FLEXLAYOUT__TABSET_CONTENT = "flexlayout__tabset_content",
 77 |     FLEXLAYOUT__TABSET_TABBAR_INNER = "flexlayout__tabset_tabbar_inner",
 78 |     FLEXLAYOUT__TABSET_TABBAR_INNER_ = "flexlayout__tabset_tabbar_inner_",
 79 |     FLEXLAYOUT__TABSET_LEADING = "flexlayout__tabset_leading",
 80 |
 81 |     FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER = "flexlayout__tabset_tabbar_inner_tab_container",
 82 |     FLEXLAYOUT__TABSET_TABBAR_INNER_TAB_CONTAINER_ = "flexlayout__tabset_tabbar_inner_tab_container_",
 83 |
 84 |     FLEXLAYOUT__TABSET_TABBAR_OUTER = "flexlayout__tabset_tabbar_outer",
 85 |     FLEXLAYOUT__TABSET_TABBAR_OUTER_ = "flexlayout__tabset_tabbar_outer_",
 86 |
 87 |     FLEXLAYOUT__TAB_BORDER = "flexlayout__tab_border",
 88 |     FLEXLAYOUT__TAB_BORDER_ = "flexlayout__tab_border_",
 89 |     FLEXLAYOUT__TAB_BUTTON = "flexlayout__tab_button",
 90 |     FLEXLAYOUT__TAB_BUTTON_STRETCH = "flexlayout__tab_button_stretch",
 91 |     FLEXLAYOUT__TAB_BUTTON_CONTENT = "flexlayout__tab_button_content",
 92 |     FLEXLAYOUT__TAB_BUTTON_LEADING = "flexlayout__tab_button_leading",
 93 |     FLEXLAYOUT__TAB_BUTTON_OVERFLOW = "flexlayout__tab_button_overflow",
 94 |     FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT = "flexlayout__tab_button_overflow_count",
 95 |     FLEXLAYOUT__TAB_BUTTON_TEXTBOX = "flexlayout__tab_button_textbox",
 96 |     FLEXLAYOUT__TAB_BUTTON_TRAILING = "flexlayout__tab_button_trailing",
 97 |     FLEXLAYOUT__TAB_BUTTON_STAMP = "flexlayout__tab_button_stamp",
 98 |
 99 |     FLEXLAYOUT__TAB_TOOLBAR = "flexlayout__tab_toolbar",
100 |     FLEXLAYOUT__TAB_TOOLBAR_BUTTON = "flexlayout__tab_toolbar_button",
101 |     FLEXLAYOUT__TAB_TOOLBAR_ICON = "flexlayout__tab_toolbar_icon",
102 |     FLEXLAYOUT__TAB_TOOLBAR_BUTTON_ = "flexlayout__tab_toolbar_button-",
103 |     FLEXLAYOUT__TAB_TOOLBAR_BUTTON_FLOAT = "flexlayout__tab_toolbar_button-float",
104 |     FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER = "flexlayout__tab_toolbar_sticky_buttons_container",
105 |     FLEXLAYOUT__TAB_TOOLBAR_BUTTON_CLOSE = "flexlayout__tab_toolbar_button-close",
106 |
107 |     FLEXLAYOUT__POPUP_MENU_CONTAINER = "flexlayout__popup_menu_container",
108 |     FLEXLAYOUT__POPUP_MENU_ITEM = "flexlayout__popup_menu_item",
109 |     FLEXLAYOUT__POPUP_MENU_ITEM__SELECTED = "flexlayout__popup_menu_item--selected",
110 |     FLEXLAYOUT__POPUP_MENU = "flexlayout__popup_menu",
111 |
112 |     FLEXLAYOUT__MINI_SCROLLBAR = "flexlayout__mini_scrollbar",
113 |     FLEXLAYOUT__MINI_SCROLLBAR_CONTAINER = "flexlayout__mini_scrollbar_container",
114 | }

--------------------------------------------------------------------------------
/src/index.ts:
--------------------------------------------------------------------------------
 1 | export * from './view/Layout';
 2 | export * from './view/Icons';
 3 |
 4 | export * from './model/Action';
 5 | export * from './model/Actions';
 6 | export * from './model/BorderNode';
 7 | export * from './model/BorderSet';
 8 | export * from './model/ICloseType';
 9 | export * from './model/IDraggable';
10 | export * from './model/IDropTarget';
11 | export * from './model/IJsonModel';
12 | export * from './model/Model';
13 | export * from './model/Node';
14 | export * from './model/RowNode';
15 | export * from './model/TabNode';
16 | export * from './model/TabSetNode';
17 | export * from './model/LayoutWindow';
18 |
19 | export * from './DockLocation';
20 | export * from './DropInfo';
21 | export * from './I18nLabel';
22 | export * from './Orientation';
23 | export * from './Rect';
24 | export * from './Types';

--------------------------------------------------------------------------------
/src/model/Action.ts:
--------------------------------------------------------------------------------
 1 | export class Action {
 2 |     type: string;
 3 |     data: Record<string, any>;
 4 |
 5 |     constructor(type: string, data: Record<string, any>) {
 6 |         this.type = type;
 7 |         this.data = data;
 8 |     }
 9 | }

--------------------------------------------------------------------------------
/src/model/Actions.ts:
--------------------------------------------------------------------------------
  1 | import { DockLocation } from "../DockLocation";
  2 | import { Action } from "./Action";
  3 | import { IJsonRect, IJsonRowNode } from "./IJsonModel";
  4 |
  5 | /**
  6 |  * The Action creator class for FlexLayout model actions
  7 |  */
  8 | export class Actions {
  9 |     static ADD_NODE = "FlexLayout_AddNode";
 10 |     static MOVE_NODE = "FlexLayout_MoveNode";
 11 |     static DELETE_TAB = "FlexLayout_DeleteTab";
 12 |     static DELETE_TABSET = "FlexLayout_DeleteTabset";
 13 |     static RENAME_TAB = "FlexLayout_RenameTab";
 14 |     static SELECT_TAB = "FlexLayout_SelectTab";
 15 |     static SET_ACTIVE_TABSET = "FlexLayout_SetActiveTabset";
 16 |     static ADJUST_WEIGHTS = "FlexLayout_AdjustWeights";
 17 |     static ADJUST_BORDER_SPLIT = "FlexLayout_AdjustBorderSplit";
 18 |     static MAXIMIZE_TOGGLE = "FlexLayout_MaximizeToggle";
 19 |     static UPDATE_MODEL_ATTRIBUTES = "FlexLayout_UpdateModelAttributes";
 20 |     static UPDATE_NODE_ATTRIBUTES = "FlexLayout_UpdateNodeAttributes";
 21 |     static POPOUT_TAB = "FlexLayout_PopoutTab";
 22 |     static POPOUT_TABSET = "FlexLayout_PopoutTabset";
 23 |     static CLOSE_WINDOW = "FlexLayout_CloseWindow";
 24 |     static CREATE_WINDOW = "FlexLayout_CreateWindow";
 25 |
 26 |     /**
 27 |      * Adds a tab node to the given tabset node
 28 |      * @param json the json for the new tab node e.g {type:"tab", component:"table"}
 29 |      * @param toNodeId the new tab node will be added to the tabset with this node id
 30 |      * @param location the location where the new tab will be added, one of the DockLocation enum values.
 31 |      * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
 32 |      * @param select (optional) whether to select the new tab, overriding autoSelectTab
 33 |      * @returns {Action} the action
 34 |      */
 35 |     static addNode(json: any, toNodeId: string, location: DockLocation, index: number, select?: boolean): Action {
 36 |         return new Action(Actions.ADD_NODE, {
 37 |             json,
 38 |             toNode: toNodeId,
 39 |             location: location.getName(),
 40 |             index,
 41 |             select,
 42 |         });
 43 |     }
 44 |
 45 |     /**
 46 |      * Moves a node (tab or tabset) from one location to another
 47 |      * @param fromNodeId the id of the node to move
 48 |      * @param toNodeId the id of the node to receive the moved node
 49 |      * @param location the location where the moved node will be added, one of the DockLocation enum values.
 50 |      * @param index for docking to the center this value is the index of the tab, use -1 to add to the end.
 51 |      * @param select (optional) whether to select the moved tab(s) in new tabset, overriding autoSelectTab
 52 |      * @returns {Action} the action
 53 |      */
 54 |     static moveNode(fromNodeId: string, toNodeId: string, location: DockLocation, index: number, select?: boolean): Action {
 55 |         return new Action(Actions.MOVE_NODE, {
 56 |             fromNode: fromNodeId,
 57 |             toNode: toNodeId,
 58 |             location: location.getName(),
 59 |             index,
 60 |             select,
 61 |         });
 62 |     }
 63 |
 64 |     /**
 65 |      * Deletes a tab node from the layout
 66 |      * @param tabNodeId the id of the tab node to delete
 67 |      * @returns {Action} the action
 68 |      */
 69 |     static deleteTab(tabNodeId: string): Action {
 70 |         return new Action(Actions.DELETE_TAB, { node: tabNodeId });
 71 |     }
 72 |
 73 |     /**
 74 |      * Deletes a tabset node and all it's child tab nodes from the layout
 75 |      * @param tabsetNodeId the id of the tabset node to delete
 76 |      * @returns {Action} the action
 77 |      */
 78 |     static deleteTabset(tabsetNodeId: string): Action {
 79 |         return new Action(Actions.DELETE_TABSET, { node: tabsetNodeId });
 80 |     }
 81 |
 82 |     /**
 83 |      * Change the given nodes tab text
 84 |      * @param tabNodeId the id of the node to rename
 85 |      * @param text the test of the tab
 86 |      * @returns {Action} the action
 87 |      */
 88 |     static renameTab(tabNodeId: string, text: string): Action {
 89 |         return new Action(Actions.RENAME_TAB, { node: tabNodeId, text });
 90 |     }
 91 |
 92 |     /**
 93 |      * Selects the given tab in its parent tabset
 94 |      * @param tabNodeId the id of the node to set selected
 95 |      * @returns {Action} the action
 96 |      */
 97 |     static selectTab(tabNodeId: string): Action {
 98 |         return new Action(Actions.SELECT_TAB, { tabNode: tabNodeId });
 99 |     }
100 |
101 |     /**
102 |      * Set the given tabset node as the active tabset
103 |      * @param tabsetNodeId the id of the tabset node to set as active
104 |      * @returns {Action} the action
105 |      */
106 |     static setActiveTabset(tabsetNodeId: string | undefined, windowId?: string | undefined): Action {
107 |         return new Action(Actions.SET_ACTIVE_TABSET, { tabsetNode: tabsetNodeId, windowId: windowId });
108 |     }
109 |
110 |     /**
111 |      * Adjust the weights of a row, used when the splitter is moved
112 |      * @param nodeId the row node whose childrens weights are being adjusted
113 |      * @param weights an array of weights to be applied to the children
114 |      * @returns {Action} the action
115 |      */
116 |     static adjustWeights(nodeId: string, weights: number[]): Action {
117 |         return new Action(Actions.ADJUST_WEIGHTS, {nodeId, weights});
118 |     }
119 |
120 |     static adjustBorderSplit(nodeId: string, pos: number): Action {
121 |         return new Action(Actions.ADJUST_BORDER_SPLIT, { node: nodeId, pos });
122 |     }
123 |
124 |     /**
125 |      * Maximizes the given tabset
126 |      * @param tabsetNodeId the id of the tabset to maximize
127 |      * @returns {Action} the action
128 |      */
129 |     static maximizeToggle(tabsetNodeId: string, windowId?: string | undefined): Action {
130 |         return new Action(Actions.MAXIMIZE_TOGGLE, { node: tabsetNodeId, windowId: windowId });
131 |     }
132 |
133 |     /**
134 |      * Updates the global model jsone attributes
135 |      * @param attributes the json for the model attributes to update (merge into the existing attributes)
136 |      * @returns {Action} the action
137 |      */
138 |     static updateModelAttributes(attributes: any): Action {
139 |         return new Action(Actions.UPDATE_MODEL_ATTRIBUTES, { json: attributes });
140 |     }
141 |
142 |     /**
143 |      * Updates the given nodes json attributes
144 |      * @param nodeId the id of the node to update
145 |      * @param attributes the json attributes to update (merge with the existing attributes)
146 |      * @returns {Action} the action
147 |      */
148 |     static updateNodeAttributes(nodeId: string, attributes: any): Action {
149 |         return new Action(Actions.UPDATE_NODE_ATTRIBUTES, { node: nodeId, json: attributes });
150 |     }
151 |
152 |     /**
153 |      * Pops out the given tab node into a new browser window
154 |      * @param nodeId the tab node to popout
155 |      * @returns
156 |      */
157 |     static popoutTab(nodeId: string): Action {
158 |         return new Action(Actions.POPOUT_TAB, { node: nodeId });
159 |     }
160 |
161 |     /**
162 |      * Pops out the given tab set node into a new browser window
163 |      * @param nodeId the tab set node to popout
164 |      * @returns
165 |      */
166 |     static popoutTabset(nodeId: string): Action {
167 |         return new Action(Actions.POPOUT_TABSET, { node: nodeId });
168 |     }
169 |
170 |     /**
171 |      * Closes the popout window
172 |      * @param windowId the id of the popout window to close
173 |      * @returns
174 |      */
175 |     static closeWindow(windowId: string): Action {
176 |         return new Action(Actions.CLOSE_WINDOW, { windowId });
177 |     }
178 |
179 |     /**
180 |      * Creates a new empty popout window with the given layout
181 |      * @param layout the json layout for the new window
182 |      * @param rect the window rectangle in screen coordinates
183 |      * @returns
184 |      */
185 |     static createWindow(layout: IJsonRowNode, rect: IJsonRect): Action {
186 |         return new Action(Actions.CREATE_WINDOW, { layout, rect});
187 |     }
188 | }

--------------------------------------------------------------------------------
/src/model/BorderSet.ts:
--------------------------------------------------------------------------------
 1 | import { DockLocation } from "../DockLocation";
 2 | import { DropInfo } from "../DropInfo";
 3 | import { BorderNode } from "./BorderNode";
 4 | import { IDraggable } from "./IDraggable";
 5 | import { Model } from "./Model";
 6 | import { Node } from "./Node";
 7 |
 8 | export class BorderSet {
 9 |     /** @internal */
10 |     static fromJson(json: any, model: Model) {
11 |         const borderSet = new BorderSet(model);
12 |         borderSet.borders = json.map((borderJson: any) => BorderNode.fromJson(borderJson, model));
13 |         for (const border of borderSet.borders) {
14 |             borderSet.borderMap.set(border.getLocation(), border);
15 |         }
16 |         return borderSet;
17 |     }
18 |     /** @internal */
19 |     private borders: BorderNode[];
20 |     /** @internal */
21 |     private borderMap: Map<DockLocation, BorderNode>;
22 |     /** @internal */
23 |     private layoutHorizontal: boolean;
24 |
25 |     /** @internal */
26 |     constructor(_model: Model) {
27 |         this.borders = [];
28 |         this.borderMap = new Map<DockLocation, BorderNode>();
29 |         this.layoutHorizontal = true;
30 |     }
31 |
32 |     toJson() {
33 |         return this.borders.map((borderNode) => borderNode.toJson());
34 |     }
35 |
36 |     /** @internal */
37 |     getLayoutHorizontal () {
38 |         return this.layoutHorizontal;
39 |     }
40 |
41 |     /** @internal */
42 |     getBorders() {
43 |         return this.borders;
44 |     }
45 |
46 |     /** @internal */
47 |     getBorderMap() {
48 |         return this.borderMap;
49 |     }
50 |
51 |     /** @internal */
52 |     forEachNode(fn: (node: Node, level: number) => void) {
53 |         for (const borderNode of this.borders) {
54 |             fn(borderNode, 0);
55 |             for (const node of borderNode.getChildren()) {
56 |                 node.forEachNode(fn, 1);
57 |             }
58 |         }
59 |     }
60 |
61 |         /** @internal */
62 |         setPaths() {
63 |             for (const borderNode of this.borders) {
64 |                 const path = "/border/" + borderNode.getLocation().getName();
65 |                 borderNode.setPath(path);
66 |                 let i = 0;
67 |                 for (const node of borderNode.getChildren()) {
68 |                     node.setPath( path + "/t" + i);
69 |                     i++;
70 |                 }
71 |             }
72 |         }
73 |
74 |
75 |     /** @internal */
76 |     findDropTargetNode(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
77 |         for (const border of this.borders) {
78 |             if (border.isShowing()) {
79 |                 const dropInfo = border.canDrop(dragNode, x, y);
80 |                 if (dropInfo !== undefined) {
81 |                     return dropInfo;
82 |                 }
83 |             }
84 |         }
85 |         return undefined;
86 |     }
87 | }

--------------------------------------------------------------------------------
/src/model/ICloseType.ts:
--------------------------------------------------------------------------------
1 | export enum ICloseType {
2 |     Visible = 1, // close if selected or hovered, i.e. when x is visible (will only close selected on mobile, where css hover is not available)
3 |     Always = 2, // close always (both selected and unselected when x rect tapped e.g where a custom image has been added for close)
4 |     Selected = 3, // close only if selected
5 | }

--------------------------------------------------------------------------------
/src/model/IDraggable.ts:
--------------------------------------------------------------------------------
1 | export interface IDraggable {
2 |     /** @internal */
3 |     isEnableDrag(): boolean;
4 |     /** @internal */
5 |     getName(): string | undefined;
6 | }

--------------------------------------------------------------------------------
/src/model/IDropTarget.ts:
--------------------------------------------------------------------------------
 1 | import { DockLocation } from "../DockLocation";
 2 | import { DropInfo } from "../DropInfo";
 3 | import { IDraggable } from "./IDraggable";
 4 | import { Node } from "./Node";
 5 |
 6 | export interface IDropTarget {
 7 |     /** @internal */
 8 |     canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined;
 9 |     /** @internal */
10 |     drop(dragNode: Node & IDraggable, location: DockLocation, index: number, select?: boolean): void;
11 |     /** @internal */
12 |     isEnableDrop(): boolean;
13 | }

--------------------------------------------------------------------------------
/src/model/LayoutWindow.ts:
--------------------------------------------------------------------------------
  1 | import { Rect } from "../Rect";
  2 | import { IJsonPopout } from "./IJsonModel";
  3 | import { Model } from "./Model";
  4 | import { RowNode } from "./RowNode";
  5 | import { Node } from "./Node";
  6 | import { TabSetNode } from "./TabSetNode";
  7 | import { LayoutInternal } from "../view/Layout";
  8 |
  9 | export class LayoutWindow {
 10 |     private _windowId: string;
 11 |     private _layout: LayoutInternal | undefined;
 12 |     private _rect: Rect;
 13 |     private _window?: Window | undefined;
 14 |     private _root?: RowNode | undefined;
 15 |     private _maximizedTabSet?: TabSetNode | undefined;
 16 |     private _activeTabSet?: TabSetNode | undefined;
 17 |     private _toScreenRectFunction: (rect: Rect) => Rect;
 18 |
 19 |     constructor(windowId: string, rect: Rect) {
 20 |         this._windowId = windowId;
 21 |         this._rect = rect;
 22 |         this._toScreenRectFunction = (r) => r;
 23 |     }
 24 |
 25 |     public visitNodes(fn: (node: Node, level: number) => void) {
 26 |         this.root!.forEachNode(fn, 0);
 27 |     }
 28 |
 29 |     public get windowId(): string {
 30 |         return this._windowId;
 31 |     }
 32 |
 33 |     public get rect(): Rect {
 34 |         return this._rect;
 35 |     }
 36 |
 37 |     public get layout(): LayoutInternal | undefined {
 38 |         return this._layout;
 39 |     }
 40 |
 41 |     public get window(): Window | undefined {
 42 |         return this._window;
 43 |     }
 44 |
 45 |     public get root(): RowNode | undefined {
 46 |         return this._root;
 47 |     }
 48 |
 49 |     public get maximizedTabSet(): TabSetNode | undefined {
 50 |         return this._maximizedTabSet;
 51 |     }
 52 |
 53 |     public get activeTabSet(): TabSetNode | undefined {
 54 |         return this._activeTabSet;
 55 |     }
 56 |
 57 |     /** @internal */
 58 |     public set rect(value: Rect) {
 59 |         this._rect = value;
 60 |     }
 61 |
 62 |     /** @internal */
 63 |     public set layout(value: LayoutInternal) {
 64 |         this._layout = value;
 65 |     }
 66 |
 67 |     /** @internal */
 68 |     public set window(value: Window | undefined) {
 69 |         this._window = value;
 70 |     }
 71 |
 72 |     /** @internal */
 73 |     public set root(value: RowNode | undefined) {
 74 |         this._root = value;
 75 |     }
 76 |
 77 |     /** @internal */
 78 |     public set maximizedTabSet(value: TabSetNode | undefined) {
 79 |         this._maximizedTabSet = value;
 80 |     }
 81 |
 82 |     /** @internal */
 83 |     public set activeTabSet(value: TabSetNode | undefined) {
 84 |         this._activeTabSet = value;
 85 |     }
 86 |
 87 |     /** @internal */
 88 |     public get toScreenRectFunction(): (rect: Rect) => Rect {
 89 |         return this._toScreenRectFunction!;
 90 |     }
 91 |
 92 |     /** @internal */
 93 |     public set toScreenRectFunction(value: (rect: Rect) => Rect) {
 94 |         this._toScreenRectFunction = value;
 95 |     }
 96 |
 97 |     public toJson(): IJsonPopout {
 98 |         // chrome sets top,left to large -ve values when minimized, dont save in this case
 99 |         if (this._window && this._window.screenTop > -10000) {
100 |             this.rect = new Rect(
101 |                 this._window.screenLeft,
102 |                 this._window.screenTop,
103 |                 this._window.outerWidth,
104 |                 this._window.outerHeight
105 |             );
106 |         }
107 |
108 |         return { layout: this.root!.toJson(), rect: this.rect.toJson() }
109 |     }
110 |
111 |     static fromJson(windowJson: IJsonPopout, model: Model, windowId: string): LayoutWindow {
112 |         const count = model.getwindowsMap().size;
113 |         const rect = windowJson.rect ? Rect.fromJson(windowJson.rect) : new Rect(50 + 50 * count, 50 + 50 * count, 600, 400);
114 |         rect.snap(10); // snapping prevents issue where window moves 1 pixel per save/restore on Chrome
115 |         const layoutWindow = new LayoutWindow(windowId, rect);
116 |         layoutWindow.root = RowNode.fromJson(windowJson.layout, model, layoutWindow);
117 |         return layoutWindow;
118 |     }
119 | }

--------------------------------------------------------------------------------
/src/model/Node.ts:
--------------------------------------------------------------------------------
  1 | import { AttributeDefinitions } from "../AttributeDefinitions";
  2 | import { DockLocation } from "../DockLocation";
  3 | import { DropInfo } from "../DropInfo";
  4 | import { Orientation } from "../Orientation";
  5 | import { Rect } from "../Rect";
  6 | import { IDraggable } from "./IDraggable";
  7 | import { IJsonBorderNode, IJsonRowNode, IJsonTabNode, IJsonTabSetNode } from "./IJsonModel";
  8 | import { Model } from "./Model";
  9 |
 10 | export abstract class Node {
 11 |     /** @internal */
 12 |     protected model: Model;
 13 |     /** @internal */
 14 |     protected attributes: Record<string, any>;
 15 |     /** @internal */
 16 |     protected parent?: Node;
 17 |     /** @internal */
 18 |     protected children: Node[];
 19 |     /** @internal */
 20 |     protected rect: Rect;
 21 |     /** @internal */
 22 |     protected path: string;
 23 |     /** @internal */
 24 |     protected listeners: Map<string, (params: any) => void>;
 25 |
 26 |     /** @internal */
 27 |     protected constructor(_model: Model) {
 28 |         this.model = _model;
 29 |         this.attributes = {};
 30 |         this.children = [];
 31 |         this.rect = Rect.empty();
 32 |         this.listeners = new Map();
 33 |         this.path = "";
 34 |     }
 35 |
 36 |     getId() {
 37 |         let id = this.attributes.id;
 38 |         if (id !== undefined) {
 39 |             return id as string;
 40 |         }
 41 |
 42 |         id = this.model.nextUniqueId();
 43 |         this.setId(id);
 44 |
 45 |         return id as string;
 46 |     }
 47 |
 48 |     getModel() {
 49 |         return this.model;
 50 |     }
 51 |
 52 |     getType() {
 53 |         return this.attributes.type as string;
 54 |     }
 55 |
 56 |     getParent() {
 57 |         return this.parent;
 58 |     }
 59 |
 60 |     getChildren() {
 61 |         return this.children;
 62 |     }
 63 |
 64 |     getRect() {
 65 |         return this.rect;
 66 |     }
 67 |
 68 |     getPath() {
 69 |         return this.path;
 70 |     }
 71 |
 72 |     getOrientation(): Orientation {
 73 |         if (this.parent === undefined) {
 74 |             return this.model.isRootOrientationVertical() ? Orientation.VERT : Orientation.HORZ;
 75 |         } else {
 76 |             return Orientation.flip(this.parent.getOrientation());
 77 |         }
 78 |     }
 79 |
 80 |     // event can be: resize, visibility, maximize (on tabset), close
 81 |     setEventListener(event: string, callback: (params: any) => void) {
 82 |         this.listeners.set(event, callback);
 83 |     }
 84 |
 85 |     removeEventListener(event: string) {
 86 |         this.listeners.delete(event);
 87 |     }
 88 |
 89 |     abstract toJson(): IJsonRowNode | IJsonBorderNode | IJsonTabSetNode | IJsonTabNode | undefined;
 90 |
 91 |     /** @internal */
 92 |     setId(id: string) {
 93 |         this.attributes.id = id;
 94 |     }
 95 |
 96 |     /** @internal */
 97 |     fireEvent(event: string, params: any) {
 98 |         // console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
 99 |         if (this.listeners.has(event)) {
100 |             this.listeners.get(event)!(params);
101 |         }
102 |     }
103 |
104 |     /** @internal */
105 |     getAttr(name: string) {
106 |         let val = this.attributes[name];
107 |
108 |         if (val === undefined) {
109 |             const modelName = this.getAttributeDefinitions().getModelName(name);
110 |             if (modelName !== undefined) {
111 |                 val = this.model.getAttribute(modelName);
112 |             }
113 |         }
114 |
115 |         // console.log(name + "=" + val);
116 |         return val;
117 |     }
118 |
119 |     /** @internal */
120 |     forEachNode(fn: (node: Node, level: number) => void, level: number) {
121 |         fn(this, level);
122 |         level++;
123 |         for (const node of this.children) {
124 |             node.forEachNode(fn, level);
125 |         }
126 |     }
127 |
128 |     /** @internal */
129 |     setPaths(path: string) {
130 |         let i = 0;
131 |
132 |         for (const node of this.children) {
133 |             let newPath = path;
134 |             if (node.getType() === "row") {
135 |                 newPath += "/r" + i;
136 |             } else if (node.getType() === "tabset") {
137 |                 newPath += "/ts" + i;
138 |             } else if (node.getType() === "tab") {
139 |                 newPath += "/t" + i;
140 |             }
141 |
142 |             node.path = newPath;
143 |
144 |             node.setPaths(newPath);
145 |             i++;
146 |         }
147 |     }
148 |
149 |     /** @internal */
150 |     setParent(parent: Node) {
151 |         this.parent = parent;
152 |     }
153 |
154 |     /** @internal */
155 |     setRect(rect: Rect) {
156 |         this.rect = rect;
157 |     }
158 |
159 |     /** @internal */
160 |     setPath(path: string) {
161 |         this.path = path;
162 |     }
163 |
164 |     /** @internal */
165 |     setWeight(weight: number) {
166 |         this.attributes.weight = weight;
167 |     }
168 |
169 |     /** @internal */
170 |     setSelected(index: number) {
171 |         this.attributes.selected = index;
172 |     }
173 |
174 |     /** @internal */
175 |     findDropTargetNode(windowId: string, dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
176 |         let rtn: DropInfo | undefined;
177 |         if (this.rect.contains(x, y)) {
178 |             if (this.model.getMaximizedTabset(windowId) !== undefined) {
179 |                 rtn = this.model.getMaximizedTabset(windowId)!.canDrop(dragNode, x, y);
180 |             } else {
181 |                 rtn = this.canDrop(dragNode, x, y);
182 |                 if (rtn === undefined) {
183 |                     if (this.children.length !== 0) {
184 |                         for (const child of this.children) {
185 |                             rtn = child.findDropTargetNode(windowId, dragNode, x, y);
186 |                             if (rtn !== undefined) {
187 |                                 break;
188 |                             }
189 |                         }
190 |                     }
191 |                 }
192 |             }
193 |         }
194 |
195 |         return rtn;
196 |     }
197 |
198 |     /** @internal */
199 |     canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
200 |         return undefined;
201 |     }
202 |
203 |     /** @internal */
204 |     canDockInto(dragNode: Node & IDraggable, dropInfo: DropInfo | undefined): boolean {
205 |         if (dropInfo != null) {
206 |             if (dropInfo.location === DockLocation.CENTER && dropInfo.node.isEnableDrop() === false) {
207 |                 return false;
208 |             }
209 |
210 |             // prevent named tabset docking into another tabset, since this would lose the header
211 |             if (dropInfo.location === DockLocation.CENTER && dragNode.getType() === "tabset" && dragNode.getName() !== undefined) {
212 |                 return false;
213 |             }
214 |
215 |             if (dropInfo.location !== DockLocation.CENTER && dropInfo.node.isEnableDivide() === false) {
216 |                 return false;
217 |             }
218 |
219 |             // finally check model callback to check if drop allowed
220 |             if (this.model.getOnAllowDrop()) {
221 |                 return (this.model.getOnAllowDrop() as (dragNode: Node, dropInfo: DropInfo) => boolean)(dragNode, dropInfo);
222 |             }
223 |         }
224 |         return true;
225 |     }
226 |
227 |     /** @internal */
228 |     removeChild(childNode: Node) {
229 |         const pos = this.children.indexOf(childNode);
230 |         if (pos !== -1) {
231 |             this.children.splice(pos, 1);
232 |         }
233 |         return pos;
234 |     }
235 |
236 |     /** @internal */
237 |     addChild(childNode: Node, pos?: number) {
238 |         if (pos != null) {
239 |             this.children.splice(pos, 0, childNode);
240 |         } else {
241 |             this.children.push(childNode);
242 |             pos = this.children.length - 1;
243 |         }
244 |         childNode.parent = this;
245 |         return pos;
246 |     }
247 |
248 |     /** @internal */
249 |     removeAll() {
250 |         this.children = [];
251 |     }
252 |
253 |     /** @internal */
254 |     styleWithPosition(style?: Record<string, any>) {
255 |         if (style == null) {
256 |             style = {};
257 |         }
258 |         return this.rect.styleWithPosition(style);
259 |     }
260 |
261 |     /** @internal */
262 |     isEnableDivide() {
263 |         return true;
264 |     }
265 |
266 |     /** @internal */
267 |     toAttributeString() {
268 |         return JSON.stringify(this.attributes, undefined, "\t");
269 |     }
270 |
271 |     // implemented by subclasses
272 |     /** @internal */
273 |     abstract updateAttrs(json: any): void;
274 |     /** @internal */
275 |     abstract getAttributeDefinitions(): AttributeDefinitions;
276 | }

--------------------------------------------------------------------------------
/src/model/Utils.ts:
--------------------------------------------------------------------------------
 1 | import { TabSetNode } from "./TabSetNode";
 2 | import { BorderNode } from "./BorderNode";
 3 | import { RowNode } from "./RowNode";
 4 | import { TabNode } from "./TabNode";
 5 |
 6 | /** @internal */
 7 | export function adjustSelectedIndexAfterDock(node: TabNode) {
 8 |     const parent = node.getParent();
 9 |     if (parent !== null && (parent instanceof TabSetNode || parent instanceof BorderNode)) {
10 |         const children = parent.getChildren();
11 |         for (let i = 0; i < children.length; i++) {
12 |             const child = children[i] as TabNode;
13 |             if (child === node) {
14 |                 parent.setSelected(i);
15 |                 return;
16 |             }
17 |         }
18 |     }
19 | }
20 |
21 | /** @internal */
22 | export function adjustSelectedIndex(parent: TabSetNode | BorderNode | RowNode, removedIndex: number) {
23 |     // for the tabset/border being removed from set the selected index
24 |     if (parent !== undefined && (parent instanceof TabSetNode || parent instanceof BorderNode)) {
25 |         const selectedIndex = (parent as TabSetNode | BorderNode).getSelected();
26 |         if (selectedIndex !== -1) {
27 |             if (removedIndex === selectedIndex && parent.getChildren().length > 0) {
28 |                 if (removedIndex >= parent.getChildren().length) {
29 |                     // removed last tab; select new last tab
30 |                     parent.setSelected(parent.getChildren().length - 1);
31 |                 } else {
32 |                     // leave selected index as is, selecting next tab after this one
33 |                 }
34 |             } else if (removedIndex < selectedIndex) {
35 |                 parent.setSelected(selectedIndex - 1);
36 |             } else if (removedIndex > selectedIndex) {
37 |                 // leave selected index as is
38 |             } else {
39 |                 parent.setSelected(-1);
40 |             }
41 |         }
42 |     }
43 | }
44 |
45 | export function randomUUID(): string {
46 |     // @ts-ignore
47 |     return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
48 |       (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
49 |     );
50 |   }

--------------------------------------------------------------------------------
/src/view/BorderButton.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { I18nLabel } from "../I18nLabel";
  3 | import { Actions } from "../model/Actions";
  4 | import { TabNode } from "../model/TabNode";
  5 | import { IIcons, LayoutInternal } from "./Layout";
  6 | import { ICloseType } from "../model/ICloseType";
  7 | import { CLASSES } from "../Types";
  8 | import { getRenderStateEx, isAuxMouseEvent } from "./Utils";
  9 |
 10 | /** @internal */
 11 | export interface IBorderButtonProps {
 12 |     layout: LayoutInternal;
 13 |     node: TabNode;
 14 |     selected: boolean;
 15 |     border: string;
 16 |     icons: IIcons;
 17 |     path: string;
 18 | }
 19 |
 20 | /** @internal */
 21 | export const BorderButton = (props: IBorderButtonProps) => {
 22 |     const { layout, node, selected, border, icons, path } = props;
 23 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
 24 |     const contentRef = React.useRef<HTMLInputElement | null>(null);
 25 |
 26 |     const onDragStart = (event: React.DragEvent<HTMLElement>) => {
 27 |         if (node.isEnableDrag()) {
 28 |             event.stopPropagation();
 29 |             layout.setDragNode(event.nativeEvent, node as TabNode);
 30 |         } else {
 31 |             event.preventDefault();
 32 |         }
 33 |     };
 34 |
 35 |     const onDragEnd = (event: React.DragEvent<HTMLElement>) => {
 36 |         event.stopPropagation();
 37 |         layout.clearDragMain();
 38 |     };
 39 |
 40 |     const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 41 |         if (isAuxMouseEvent(event)) {
 42 |             layout.auxMouseClick(node, event);
 43 |         }
 44 |     };
 45 |
 46 |     const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 47 |         layout.showContextMenu(node, event);
 48 |     };
 49 |
 50 |     const onClick = () => {
 51 |         layout.doAction(Actions.selectTab(node.getId()));
 52 |     };
 53 |
 54 |     // const onDoubleClick = (event: Event) => {
 55 |     //     // if (node.isEnableRename()) {
 56 |     //     //     onRename();
 57 |     //     // }
 58 |     // };
 59 |
 60 |     // const onRename = () => {
 61 |     //     layout.setEditingTab(node);
 62 |     //     layout.getCurrentDocument()!.body.addEventListener("pointerdown", onEndEdit);
 63 |     // };
 64 |
 65 |     const onEndEdit = (event: Event) => {
 66 |         if (event.target !== contentRef.current!) {
 67 |             layout.getCurrentDocument()!.body.removeEventListener("pointerdown", onEndEdit);
 68 |             layout.setEditingTab(undefined);
 69 |         }
 70 |     };
 71 |
 72 |     const isClosable = () => {
 73 |         const closeType = node.getCloseType();
 74 |         if (selected || closeType === ICloseType.Always) {
 75 |             return true;
 76 |         }
 77 |         if (closeType === ICloseType.Visible) {
 78 |             // not selected but x should be visible due to hover
 79 |             if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
 80 |                 return true;
 81 |             }
 82 |         }
 83 |         return false;
 84 |     };
 85 |
 86 |     const onClose = (event: React.MouseEvent<HTMLElement>) => {
 87 |         if (isClosable()) {
 88 |             layout.doAction(Actions.deleteTab(node.getId()));
 89 |             event.stopPropagation();
 90 |         }
 91 |     };
 92 |
 93 |     const onClosePointerDown = (event: React.PointerEvent<HTMLElement>) => {
 94 |         event.stopPropagation();
 95 |     };
 96 |
 97 |     React.useLayoutEffect(() => {
 98 |         node.setTabRect(layout.getBoundingClientRect(selfRef.current!));
 99 |         if (layout.getEditingTab() === node) {
100 |             (contentRef.current! as HTMLInputElement).select();
101 |         }
102 |     });
103 |
104 |     const onTextBoxPointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
105 |         event.stopPropagation();
106 |     };
107 |
108 |     const onTextBoxKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
109 |         if (event.code === 'Escape') {
110 |             // esc
111 |             layout.setEditingTab(undefined);
112 |         } else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
113 |             // enter
114 |             layout.setEditingTab(undefined);
115 |             layout.doAction(Actions.renameTab(node.getId(), (event.target as HTMLInputElement).value));
116 |         }
117 |     };
118 |
119 |     const cm = layout.getClassName;
120 |     let classNames = cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_ + border);
121 |
122 |     if (selected) {
123 |         classNames += " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON__SELECTED);
124 |     } else {
125 |         classNames += " " + cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON__UNSELECTED);
126 |     }
127 |
128 |     if (node.getClassName() !== undefined) {
129 |         classNames += " " + node.getClassName();
130 |     }
131 |
132 |     let iconAngle = 0;
133 |     if (node.getModel().isEnableRotateBorderIcons() === false) {
134 |         if (border === "left") {
135 |             iconAngle = 90;
136 |         } else if (border === "right") {
137 |             iconAngle = -90;
138 |         }
139 |     }
140 |
141 |     const renderState = getRenderStateEx(layout, node, iconAngle);
142 |
143 |     let content = renderState.content ? (
144 |         <div className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_CONTENT)}>
145 |             {renderState.content}
146 |         </div>) : null;
147 |
148 |     const leading = renderState.leading ? (
149 |         <div className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_LEADING)}>
150 |             {renderState.leading}
151 |         </div>) : null;
152 |
153 |     if (layout.getEditingTab() === node) {
154 |         content = (
155 |             <input
156 |                 ref={contentRef}
157 |                 className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TEXTBOX)}
158 |                 data-layout-path={path + "/textbox"}
159 |                 type="text"
160 |                 autoFocus={true}
161 |                 defaultValue={node.getName()}
162 |                 onKeyDown={onTextBoxKeyPress}
163 |                 onPointerDown={onTextBoxPointerDown}
164 |             />
165 |         );
166 |     }
167 |
168 |     if (node.isEnableClose()) {
169 |         const closeTitle = layout.i18nName(I18nLabel.Close_Tab);
170 |         renderState.buttons.push(
171 |             <div
172 |                 key="close"
173 |                 data-layout-path={path + "/button/close"}
174 |                 title={closeTitle}
175 |                 className={cm(CLASSES.FLEXLAYOUT__BORDER_BUTTON_TRAILING)}
176 |                 onPointerDown={onClosePointerDown}
177 |                 onClick={onClose}>
178 |                 {(typeof icons.close === "function") ? icons.close(node) : icons.close}
179 |             </div>
180 |         );
181 |     }
182 |
183 |     return (
184 |         <div
185 |             ref={selfRef}
186 |             data-layout-path={path}
187 |             className={classNames}
188 |             onClick={onClick}
189 |             onAuxClick={onAuxMouseClick}
190 |             onContextMenu={onContextMenu}
191 |             title={node.getHelpText()}
192 |             draggable={true}
193 |             onDragStart={onDragStart}
194 |             onDragEnd={onDragEnd}
195 |         >
196 |             {leading}
197 |             {content}
198 |             {renderState.buttons}
199 |         </div>
200 |     );
201 | };

--------------------------------------------------------------------------------
/src/view/BorderTab.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import { Orientation } from "../Orientation";
 3 | import { LayoutInternal } from "./Layout";
 4 | import { BorderNode } from "../model/BorderNode";
 5 | import { Splitter, splitterDragging } from "./Splitter";
 6 | import { DockLocation } from "../DockLocation";
 7 | import { CLASSES } from "../Types";
 8 |
 9 | /** @internal */
10 | export interface IBorderTabProps {
11 |     layout: LayoutInternal;
12 |     border: BorderNode;
13 |     show: boolean;
14 | }
15 |
16 | export function BorderTab(props: IBorderTabProps) {
17 |     const { layout, border, show } = props;
18 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
19 |     const timer = React.useRef<NodeJS.Timeout | undefined>(undefined);
20 |
21 |     React.useLayoutEffect(() => {
22 |         const contentRect = layout.getBoundingClientRect(selfRef.current!);
23 |         if (!isNaN(contentRect.x) && contentRect.width > 0) {
24 |             if (!border.getContentRect().equals(contentRect)) {
25 |                 border.setContentRect(contentRect);
26 |                 if (splitterDragging) { // next movement will draw tabs again, only redraw after pause/end
27 |                     if (timer.current) {
28 |                         clearTimeout(timer.current);
29 |                     }
30 |                     timer.current = setTimeout(() => {
31 |                         layout.redrawInternal("border content rect " + contentRect);
32 |                         timer.current = undefined;
33 |                     }, 50);
34 |                 } else {
35 |                     layout.redrawInternal("border content rect " + contentRect);
36 |                 }
37 |             }
38 |         }
39 |
40 |     });
41 |
42 |     let horizontal = true;
43 |     const style: Record<string, any> = {};
44 |
45 |     if (border.getOrientation() === Orientation.HORZ) {
46 |         style.width = border.getSize();
47 |         style.minWidth = border.getMinSize();
48 |         style.maxWidth = border.getMaxSize();
49 |     } else {
50 |         style.height = border.getSize();
51 |         style.minHeight = border.getMinSize();
52 |         style.maxHeight = border.getMaxSize();
53 |         horizontal = false;
54 |     }
55 |
56 |     style.display = show ? "flex" : "none";
57 |
58 |     const className = layout.getClassName(CLASSES.FLEXLAYOUT__BORDER_TAB_CONTENTS);
59 |
60 |     if (border.getLocation() === DockLocation.LEFT || border.getLocation() === DockLocation.TOP) {
61 |         return (
62 |             <>
63 |                 <div ref={selfRef} style={style} className={className}>
64 |                 </div>
65 |                 {show && <Splitter layout={layout} node={border} index={0} horizontal={horizontal} />}
66 |             </>
67 |         );
68 |     } else {
69 |         return (
70 |             <>
71 |                 {show && <Splitter layout={layout} node={border} index={0} horizontal={horizontal} />}
72 |                 <div ref={selfRef} style={style} className={className}>
73 |                 </div>
74 |             </>
75 |         );
76 |
77 |     }
78 | }

--------------------------------------------------------------------------------
/src/view/BorderTabSet.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { DockLocation } from "../DockLocation";
  3 | import { BorderNode } from "../model/BorderNode";
  4 | import { TabNode } from "../model/TabNode";
  5 | import { BorderButton } from "./BorderButton";
  6 | import { LayoutInternal, ITabSetRenderValues } from "./Layout";
  7 | import { showPopup } from "./PopupMenu";
  8 | import { Actions } from "../model/Actions";
  9 | import { I18nLabel } from "../I18nLabel";
 10 | import { useTabOverflow } from "./TabOverflowHook";
 11 | import { Orientation } from "../Orientation";
 12 | import { CLASSES } from "../Types";
 13 | import { isAuxMouseEvent } from "./Utils";
 14 |
 15 | /** @internal */
 16 | export interface IBorderTabSetProps {
 17 |     border: BorderNode;
 18 |     layout: LayoutInternal;
 19 |     size: number;
 20 | }
 21 |
 22 | /** @internal */
 23 | export const BorderTabSet = (props: IBorderTabSetProps) => {
 24 |     const { border, layout, size } = props;
 25 |
 26 |     const toolbarRef = React.useRef<HTMLDivElement | null>(null);
 27 |     const miniScrollRef = React.useRef<HTMLDivElement | null>(null);
 28 |     const overflowbuttonRef = React.useRef<HTMLButtonElement | null>(null);
 29 |     const stickyButtonsRef = React.useRef<HTMLDivElement | null>(null);
 30 |     const tabStripInnerRef = React.useRef<HTMLDivElement | null>(null);
 31 |
 32 |     const icons = layout.getIcons();
 33 |
 34 |     React.useLayoutEffect(() => {
 35 |         border.setTabHeaderRect(layout.getBoundingClientRect(selfRef.current!));
 36 |     });
 37 |
 38 |     const { selfRef, userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs } =
 39 |         useTabOverflow(layout, border, Orientation.flip(border.getOrientation()), tabStripInnerRef, miniScrollRef,
 40 |             layout.getClassName(CLASSES.FLEXLAYOUT__BORDER_BUTTON)
 41 |         );
 42 |
 43 |     const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 44 |         if (isAuxMouseEvent(event)) {
 45 |             layout.auxMouseClick(border, event);
 46 |         }
 47 |     };
 48 |
 49 |     const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 50 |         layout.showContextMenu(border, event);
 51 |     };
 52 |
 53 |     const onInterceptPointerDown = (event: React.PointerEvent) => {
 54 |         event.stopPropagation();
 55 |     };
 56 |
 57 |     const onOverflowClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 58 |         const callback = layout.getShowOverflowMenu();
 59 |         const items = hiddenTabs.map(h => { return { index: h, node: (border.getChildren()[h] as TabNode) }; });
 60 |         if (callback !== undefined) {
 61 |
 62 |             callback(border, event, items, onOverflowItemSelect);
 63 |         } else {
 64 |             const element = overflowbuttonRef.current!;
 65 |             showPopup(
 66 |                 element,
 67 |                 border,
 68 |                 items,
 69 |                 onOverflowItemSelect,
 70 |                 layout);
 71 |         }
 72 |         event.stopPropagation();
 73 |     };
 74 |
 75 |     const onOverflowItemSelect = (item: { node: TabNode; index: number }) => {
 76 |         layout.doAction(Actions.selectTab(item.node.getId()));
 77 |         userControlledPositionRef.current = false;
 78 |     };
 79 |
 80 |     const onPopoutTab = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 81 |         const selectedTabNode = border.getChildren()[border.getSelected()] as TabNode;
 82 |         if (selectedTabNode !== undefined) {
 83 |             layout.doAction(Actions.popoutTab(selectedTabNode.getId()));
 84 |         }
 85 |         event.stopPropagation();
 86 |     };
 87 |
 88 |     const cm = layout.getClassName;
 89 |
 90 |     const tabButtons: any = [];
 91 |
 92 |     const layoutTab = (i: number) => {
 93 |         const isSelected = border.getSelected() === i;
 94 |         const child = border.getChildren()[i] as TabNode;
 95 |
 96 |         tabButtons.push(
 97 |             <BorderButton
 98 |                 layout={layout}
 99 |                 border={border.getLocation().getName()}
100 |                 node={child}
101 |                 path={border.getPath() + "/tb" + i}
102 |                 key={child.getId()}
103 |                 selected={isSelected}
104 |                 icons={icons}
105 |             />
106 |         );
107 |         if (i < border.getChildren().length - 1) {
108 |             tabButtons.push(
109 |                 <div key={"divider" + i} className={cm(CLASSES.FLEXLAYOUT__BORDER_TAB_DIVIDER)}></div>
110 |             );
111 |         }
112 |     };
113 |
114 |     for (let i = 0; i < border.getChildren().length; i++) {
115 |         layoutTab(i);
116 |     }
117 |
118 |     let borderClasses = cm(CLASSES.FLEXLAYOUT__BORDER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_ + border.getLocation().getName());
119 |     if (border.getClassName() !== undefined) {
120 |         borderClasses += " " + border.getClassName();
121 |     }
122 |
123 |     // allow customization of tabset
124 |     let leading : React.ReactNode = undefined;
125 |     let buttons: any[] = [];
126 |     let stickyButtons: any[] = [];
127 |     const renderState: ITabSetRenderValues = { leading, buttons, stickyButtons: stickyButtons, overflowPosition: undefined };
128 |     layout.customizeTabSet(border, renderState);
129 |     leading = renderState.leading;
130 |     stickyButtons = renderState.stickyButtons;
131 |     buttons = renderState.buttons;
132 |
133 |     if (renderState.overflowPosition === undefined) {
134 |         renderState.overflowPosition = stickyButtons.length;
135 |     }
136 |
137 |     if (stickyButtons.length > 0) {
138 |         if (isDockStickyButtons) {
139 |             buttons = [...stickyButtons, ...buttons];
140 |         } else {
141 |             tabButtons.push(<div
142 |                 ref={stickyButtonsRef}
143 |                 key="sticky_buttons_container"
144 |                 onPointerDown={onInterceptPointerDown}
145 |                 onDragStart={(e) => { e.preventDefault() }}
146 |                 className={cm(CLASSES.FLEXLAYOUT__TAB_TOOLBAR_STICKY_BUTTONS_CONTAINER)}
147 |             >
148 |                 {stickyButtons}
149 |             </div>);
150 |         }
151 |     }
152 |
153 |     if (isShowHiddenTabs) {
154 |         const overflowTitle = layout.i18nName(I18nLabel.Overflow_Menu_Tooltip);
155 |         let overflowContent;
156 |         if (typeof icons.more === "function") {
157 |             const items = hiddenTabs.map(h => { return { index: h, node: (border.getChildren()[h] as TabNode) }; });
158 |
159 |             overflowContent = icons.more(border, items);
160 |         } else {
161 |             overflowContent = (<>
162 |                 {icons.more}
163 |                 <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_OVERFLOW_COUNT)}>{hiddenTabs.length>0?hiddenTabs.length: ""}</div>
164 |             </>);
165 |         }
166 |         buttons.splice(Math.min(renderState.overflowPosition, buttons.length), 0,
167 |             <button
168 |                 key="overflowbutton"
169 |                 ref={overflowbuttonRef}
170 |                 className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_OVERFLOW_ + border.getLocation().getName())}
171 |                 title={overflowTitle}
172 |                 onClick={onOverflowClick}
173 |                 onPointerDown={onInterceptPointerDown}
174 |             >
175 |                 {overflowContent}
176 |             </button>
177 |         );
178 |     }
179 |
180 |     const selectedIndex = border.getSelected();
181 |     if (selectedIndex !== -1) {
182 |         const selectedTabNode = border.getChildren()[selectedIndex] as TabNode;
183 |         if (selectedTabNode !== undefined && layout.isSupportsPopout() && selectedTabNode.isEnablePopout()) {
184 |             const popoutTitle = layout.i18nName(I18nLabel.Popout_Tab);
185 |             buttons.push(
186 |                 <button
187 |                     key="popout"
188 |                     title={popoutTitle}
189 |                     className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_BUTTON_FLOAT)}
190 |                     onClick={onPopoutTab}
191 |                     onPointerDown={onInterceptPointerDown}
192 |                 >
193 |                     {(typeof icons.popout === "function") ? icons.popout(selectedTabNode) : icons.popout}
194 |                 </button>
195 |             );
196 |         }
197 |     }
198 |     const toolbar = (
199 |         <div key="toolbar" ref={toolbarRef} className={cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_TOOLBAR_ + border.getLocation().getName())}>
200 |             {buttons}
201 |         </div>
202 |     );
203 |
204 |     let innerStyle = {};
205 |     let outerStyle = {};
206 |     const borderHeight = size - 1;
207 |     if (border.getLocation() === DockLocation.LEFT) {
208 |         innerStyle = { right: "100%", top: 0 };
209 |         outerStyle = { width: borderHeight, overflowY: "auto" };
210 |     } else if (border.getLocation() === DockLocation.RIGHT) {
211 |         innerStyle = { left: "100%", top: 0 };
212 |         outerStyle = { width: borderHeight, overflowY: "auto" };
213 |     } else {
214 |         innerStyle = { left: 0 };
215 |         outerStyle = { height: borderHeight, overflowX: "auto" };
216 |     }
217 |
218 |     let miniScrollbar = undefined;
219 |     if (border.isEnableTabScrollbar()) {
220 |         miniScrollbar = (
221 |             <div ref={miniScrollRef}
222 |                 className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR)}
223 |                 onPointerDown={onScrollPointerDown}
224 |             />
225 |         );
226 |     }
227 |
228 |     let leadingContainer: React.ReactNode = undefined;
229 |     if (leading) {
230 |         leadingContainer = (
231 |             <div className={cm(CLASSES.FLEXLAYOUT__BORDER_LEADING)}>
232 |                 {leading}
233 |             </div>
234 |         );
235 |     }
236 |
237 |     return (
238 |         <div
239 |             ref={selfRef}
240 |             style={{
241 |                 display: "flex",
242 |                 flexDirection: (border.getOrientation() === Orientation.VERT ? "row" : "column")
243 |             }}
244 |             className={borderClasses}
245 |             data-layout-path={border.getPath()}
246 |             onClick={onAuxMouseClick}
247 |             onAuxClick={onAuxMouseClick}
248 |             onContextMenu={onContextMenu}
249 |             onWheel={onMouseWheel}
250 |         >
251 |             {leadingContainer}
252 |             <div className={cm(CLASSES.FLEXLAYOUT__MINI_SCROLLBAR_CONTAINER)}>
253 |                 <div
254 |                     ref={tabStripInnerRef}
255 |                     className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_ + border.getLocation().getName())}
256 |                     style={outerStyle}
257 |                     onScroll={onScroll}
258 |                 >
259 |                     <div
260 |                         style={innerStyle}
261 |                         className={cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER) + " " + cm(CLASSES.FLEXLAYOUT__BORDER_INNER_TAB_CONTAINER_ + border.getLocation().getName())}
262 |                     >
263 |                         {tabButtons}
264 |                     </div>
265 |                 </div>
266 |                 {miniScrollbar}
267 |             </div>
268 |             {toolbar}
269 |         </div >
270 |     );
271 |
272 | };

--------------------------------------------------------------------------------
/src/view/DragContainer.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import { TabNode } from "../model/TabNode";
 3 | import { LayoutInternal } from "./Layout";
 4 | import { CLASSES } from "../Types";
 5 | import { TabButtonStamp } from "./TabButtonStamp";
 6 |
 7 | /** @internal */
 8 | export interface IDragContainerProps {
 9 |     node: TabNode;
10 |     layout: LayoutInternal;
11 | }
12 |
13 | /** @internal */
14 | export const DragContainer = (props: IDragContainerProps) => {
15 |     const { layout, node} = props;
16 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
17 |
18 |     React.useEffect(()=> {
19 |         node.setTabStamp(selfRef.current);
20 |     }, [node, selfRef.current]);
21 |
22 |     const cm = layout.getClassName;
23 |
24 |     const classNames = cm(CLASSES.FLEXLAYOUT__DRAG_RECT);
25 |
26 |     return (<div
27 |             ref={selfRef}
28 |             className={classNames}>
29 |             <TabButtonStamp key={node.getId()} layout={layout} node={node} />
30 |         </div>
31 |     );
32 | };

--------------------------------------------------------------------------------
/src/view/ErrorBoundary.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import { ErrorInfo } from "react";
 3 | import { CLASSES } from "../Types";
 4 |
 5 | /** @internal */
 6 | export interface IErrorBoundaryProps {
 7 |     message: string;
 8 |     retryText: string;
 9 |     children: React.ReactNode;
10 | }
11 | /** @internal */
12 | export interface IErrorBoundaryState {
13 |     hasError: boolean;
14 | }
15 |
16 | /** @internal */
17 | export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
18 |     constructor(props: IErrorBoundaryProps) {
19 |         super(props);
20 |         this.state = { hasError: false };
21 |     }
22 |
23 |     static getDerivedStateFromError(error: Error) {
24 |         return { hasError: true };
25 |     }
26 |
27 |     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
28 |         console.debug(error);
29 |         console.debug(errorInfo);
30 |     }
31 |
32 |     retry = () => {
33 |         this.setState({ hasError: false });
34 |       };
35 |
36 |     render() {
37 |         if (this.state.hasError) {
38 |             return (
39 |                 <div className={CLASSES.FLEXLAYOUT__ERROR_BOUNDARY_CONTAINER}>
40 |                     <div className={CLASSES.FLEXLAYOUT__ERROR_BOUNDARY_CONTENT}>
41 |                         <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
42 |                             {this.props.message}
43 |                             <p><button onClick={this.retry}>{this.props.retryText}</button></p>
44 |                         </div>
45 |                     </div>
46 |
47 |                 </div>
48 |             );
49 |         }
50 |
51 |         return this.props.children;
52 |     }
53 | }

--------------------------------------------------------------------------------
/src/view/Icons.tsx:
--------------------------------------------------------------------------------
 1 | const style = { width: "1em", height: "1em", display: "flex", alignItems: "center" };
 2 |
 3 | export const CloseIcon = () => {
 4 |     return (
 5 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" >
 6 |             <path fill="none" d="M0 0h24v24H0z" />
 7 |             <path stroke="var(--color-icon)" fill="var(--color-icon)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
 8 |         </svg>
 9 |     );
10 | }
11 |
12 | export const MaximizeIcon = () => {
13 |     return (
14 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none" /><path stroke="var(--color-icon)" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
15 |     );
16 | }
17 |
18 | export const OverflowIcon = () => {
19 |     return (
20 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none" /><path stroke="var(--color-icon)" d="M7 10l5 5 5-5z" /></svg>
21 |     );
22 | }
23 |
24 | export const EdgeIcon = () => {
25 |     return (
26 |         <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: 10, height: 10 }} preserveAspectRatio="none" viewBox="0 0 100 100"><path fill="var(--color-edge-icon)" stroke="var(--color-edge-icon)"
27 |             d="M10 30 L90 30 l-40 40 Z" /></svg>
28 |     );
29 | }
30 |
31 | export const PopoutIcon = () => {
32 |     return (
33 |         // <svg xmlns="http://www.w3.org/2000/svg"  style={style}  viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none"/><path stroke="var(--color-icon)" d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/></svg>
34 |
35 |         // <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="none" viewBox="0 0 24 24" stroke="var(--color-icon)" stroke-width="2">
36 |         //     <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
37 |         // </svg>
38 |
39 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 20 20" fill="var(--color-icon)">
40 |             <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
41 |             <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
42 |         </svg>
43 |
44 |     );
45 | }
46 |
47 | export const RestoreIcon = () => {
48 |     return (
49 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} viewBox="0 0 24 24" fill="var(--color-icon)"><path d="M0 0h24v24H0z" fill="none" /><path stroke="var(--color-icon)" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
50 |     );
51 | }
52 |
53 | export const AsterickIcon = () => {
54 |     return (
55 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} height="24px" viewBox="0 -960 960 960" width="24px" ><path fill="var(--color-icon)" stroke="var(--color-icon)" d="M440-120v-264L254-197l-57-57 187-186H120v-80h264L197-706l57-57 186 187v-264h80v264l186-187 57 57-187 186h264v80H576l187 186-57 57-186-187v264h-80Z" /></svg>
56 |     );
57 | }
58 |
59 | export const AddIcon = () => {
60 |     return (
61 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} height="24px" viewBox="0 0 24 24" fill="var(--color-icon)">
62 |             <path d="M0 0h24v24H0z" fill="none" />
63 |             <path stroke="var(--color-icon)" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
64 |         </svg>
65 |
66 |     );
67 | }
68 |
69 | export const MenuIcon = () => {
70 |     return (
71 |         <svg xmlns="http://www.w3.org/2000/svg" style={style} height="24px" width="24px" viewBox="0 -960 960 960" fill="var(--color-icon)">
72 |             <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
73 |         </svg>
74 |     );
75 | }
76 |
77 |
78 | export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => {
79 |     return (
80 |         <svg xmlns="http://www.w3.org/2000/svg" {...props} style={style} viewBox="0 0 24 24" fill="var(--color-icon)">
81 |             <g>
82 |                 <path d="M0,0h24v24H0V0z" fill="none" />
83 |                 <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
84 |             </g>
85 |         </svg>
86 |     );
87 | }

--------------------------------------------------------------------------------
/src/view/Overlay.tsx:
--------------------------------------------------------------------------------
 1 | import { LayoutInternal } from "./Layout";
 2 | import { CLASSES } from "../Types";
 3 |
 4 | /** @internal */
 5 | export interface IOverlayProps {
 6 |     layout: LayoutInternal;
 7 |     show: boolean;
 8 | }
 9 |
10 | /** @internal */
11 | export const Overlay = (props: IOverlayProps) => {
12 |     const {layout, show} = props;
13 |
14 |     return (
15 |         <div
16 |             className={layout.getClassName(CLASSES.FLEXLAYOUT__LAYOUT_OVERLAY)}
17 |             style={{display: (show ? "flex" : "none")
18 |         }}
19 |         />
20 |     );
21 | }

--------------------------------------------------------------------------------
/src/view/PopoutWindow.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { createPortal } from "react-dom";
  3 | import { CLASSES } from "../Types";
  4 | import { LayoutInternal } from "./Layout";
  5 | import { LayoutWindow } from "../model/LayoutWindow";
  6 |
  7 | /** @internal */
  8 | export interface IPopoutWindowProps {
  9 |     title: string;
 10 |     layout: LayoutInternal;
 11 |     layoutWindow: LayoutWindow;
 12 |     url: string;
 13 |     onCloseWindow: (layoutWindow: LayoutWindow) => void;
 14 |     onSetWindow: (layoutWindow: LayoutWindow, window: Window) => void;
 15 | }
 16 |
 17 | /** @internal */
 18 | export const PopoutWindow = (props: React.PropsWithChildren<IPopoutWindowProps>) => {
 19 |     const { title, layout, layoutWindow, url, onCloseWindow, onSetWindow, children } = props; const popoutWindow = React.useRef<Window | null>(null);
 20 |     const [content, setContent] = React.useState<HTMLElement | undefined>(undefined);
 21 |     // map from main docs style -> this docs equivalent style
 22 |     const styleMap = new Map<HTMLElement, HTMLElement>();
 23 |
 24 |     React.useLayoutEffect(() => {
 25 |         if (!popoutWindow.current) { // only create window once, even in strict mode
 26 |             const windowId = layoutWindow.windowId;
 27 |             const rect = layoutWindow.rect;
 28 |
 29 |             popoutWindow.current = window.open(url, windowId, `left=${rect.x},top=${rect.y},width=${rect.width},height=${rect.height}`);
 30 |
 31 |             if (popoutWindow.current) {
 32 |                 layoutWindow.window = popoutWindow.current;
 33 |                 onSetWindow(layoutWindow, popoutWindow.current);
 34 |
 35 |                 // listen for parent unloading to remove all popouts
 36 |                 window.addEventListener("beforeunload", () => {
 37 |                     if (popoutWindow.current) {
 38 |                         const closedWindow = popoutWindow.current;
 39 |                         popoutWindow.current = null; // need to set to null before close, since this will trigger popup window before unload...
 40 |                         closedWindow.close();
 41 |                     }
 42 |                 });
 43 |
 44 |                 popoutWindow.current.addEventListener("load", () => {
 45 |                     if (popoutWindow.current) {
 46 |                         popoutWindow.current.focus();
 47 |
 48 |                         // note: resizeto must be before moveto in chrome otherwise the window will end up at 0,0
 49 |                         popoutWindow.current.resizeTo(rect.width, rect.height);
 50 |                         popoutWindow.current.moveTo(rect.x, rect.y);
 51 |
 52 |                         const popoutDocument = popoutWindow.current.document;
 53 |                         popoutDocument.title = title;
 54 |                         const popoutContent = popoutDocument.createElement("div");
 55 |                         popoutContent.className = CLASSES.FLEXLAYOUT__FLOATING_WINDOW_CONTENT;
 56 |                         popoutDocument.body.appendChild(popoutContent);
 57 |                         copyStyles(popoutDocument, styleMap).then(() => {
 58 |                             setContent(popoutContent); // re-render once link styles loaded
 59 |                         });
 60 |
 61 |                         // listen for style mutations
 62 |                         const observer = new MutationObserver((mutationsList: any) => handleStyleMutations(mutationsList, popoutDocument, styleMap));
 63 |                         observer.observe(document.head, { childList: true });
 64 |
 65 |                         // listen for popout unloading (needs to be after load for safari)
 66 |                         popoutWindow.current.addEventListener("beforeunload", () => {
 67 |                             if (popoutWindow.current) {
 68 |                                 onCloseWindow(layoutWindow); // remove the layoutWindow in the model
 69 |                                 popoutWindow.current = null;
 70 |                                 observer.disconnect();
 71 |                             }
 72 |                         });
 73 |                     }
 74 |                 });
 75 |             } else {
 76 |                 console.warn(`Unable to open window ${url}`);
 77 |                 onCloseWindow(layoutWindow); // remove the layoutWindow in the model
 78 |             }
 79 |         }
 80 |         return () => {
 81 |             // only close popoutWindow if windowId has been removed from the model (ie this was due to model change)
 82 |             if (!layout.getModel().getwindowsMap().has(layoutWindow.windowId)) {
 83 |                 popoutWindow.current?.close();
 84 |                 popoutWindow.current = null;
 85 |             }
 86 |         }
 87 |     }, []);
 88 |
 89 |     if (content !== undefined) {
 90 |         return createPortal(children, content!);
 91 |     } else {
 92 |         return null;
 93 |     }
 94 | };
 95 |
 96 | function handleStyleMutations(mutationsList: any, popoutDocument: Document, styleMap: Map<HTMLElement, HTMLElement>) {
 97 |     for (const mutation of mutationsList) {
 98 |         if (mutation.type === 'childList') {
 99 |             for (const addition of mutation.addedNodes) {
100 |                 if (addition instanceof HTMLLinkElement || addition instanceof HTMLStyleElement) {
101 |                     copyStyle(popoutDocument, addition, styleMap);
102 |                 }
103 |             }
104 |             for (const removal of mutation.removedNodes) {
105 |                 if (removal instanceof HTMLLinkElement || removal instanceof HTMLStyleElement) {
106 |                     const popoutStyle = styleMap.get(removal);
107 |                     if (popoutStyle) {
108 |                         popoutDocument.head.removeChild(popoutStyle);
109 |                     }
110 |                 }
111 |             }
112 |         }
113 |     }
114 | };
115 |
116 |
117 |
118 | /** @internal */
119 | function copyStyles(popoutDoc: Document, styleMap: Map<HTMLElement, HTMLElement>): Promise<boolean[]> {
120 |     const promises: Promise<boolean>[] = [];
121 |     const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]') as NodeListOf<HTMLElement>
122 |     for (const element of styleElements) {
123 |         copyStyle(popoutDoc, element, styleMap, promises);
124 |     }
125 |     return Promise.all(promises);
126 | }
127 |
128 | /** @internal */
129 | function copyStyle(popoutDoc: Document, element: HTMLElement, styleMap: Map<HTMLElement, HTMLElement>, promises?: Promise<boolean>[]) {
130 |     if (element instanceof HTMLLinkElement) {
131 |         // prefer links since they will keep paths to images etc
132 |         const linkElement = element.cloneNode(true) as HTMLLinkElement;
133 |         popoutDoc.head.appendChild(linkElement);
134 |         styleMap.set(element, linkElement);
135 |
136 |         if (promises) {
137 |             promises.push(new Promise((resolve) => {
138 |                 linkElement.onload = () => resolve(true);
139 |             }));
140 |         }
141 |     } else if (element instanceof HTMLStyleElement) {
142 |         try {
143 |             const styleElement = element.cloneNode(true) as HTMLStyleElement;
144 |             popoutDoc.head.appendChild(styleElement);
145 |             styleMap.set(element, styleElement);
146 |         } catch (e) {
147 |             // can throw an exception
148 |         }
149 |     }
150 | }

--------------------------------------------------------------------------------
/src/view/PopupMenu.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { TabNode } from "../model/TabNode";
  3 | import { CLASSES } from "../Types";
  4 | import { LayoutInternal } from "./Layout";
  5 | import { TabButtonStamp } from "./TabButtonStamp";
  6 | import { TabSetNode } from "../model/TabSetNode";
  7 | import { BorderNode } from "../model/BorderNode";
  8 | import { useEffect, useRef } from "react";
  9 |
 10 | /** @internal */
 11 | export function showPopup(
 12 |     triggerElement: Element,
 13 |     parentNode: TabSetNode | BorderNode,
 14 |     items: { index: number; node: TabNode }[],
 15 |     onSelect: (item: { index: number; node: TabNode }) => void,
 16 |     layout: LayoutInternal,
 17 | ) {
 18 |     const layoutDiv = layout.getRootDiv();
 19 |     const classNameMapper = layout.getClassName;
 20 |     const currentDocument = triggerElement.ownerDocument;
 21 |     const triggerRect = triggerElement.getBoundingClientRect();
 22 |     const layoutRect = layoutDiv?.getBoundingClientRect() ?? new DOMRect(0, 0, 100, 100);
 23 |
 24 |     const elm = currentDocument.createElement("div");
 25 |     elm.className = classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_CONTAINER);
 26 |     if (triggerRect.left < layoutRect.left + layoutRect.width / 2) {
 27 |         elm.style.left = triggerRect.left - layoutRect.left + "px";
 28 |     } else {
 29 |         elm.style.right = layoutRect.right - triggerRect.right + "px";
 30 |     }
 31 |
 32 |     if (triggerRect.top < layoutRect.top + layoutRect.height / 2) {
 33 |         elm.style.top = triggerRect.top - layoutRect.top + "px";
 34 |     } else {
 35 |         elm.style.bottom = layoutRect.bottom - triggerRect.bottom + "px";
 36 |     }
 37 |
 38 |     layout.showOverlay(true);
 39 |
 40 |     if (layoutDiv) {
 41 |         layoutDiv.appendChild(elm);
 42 |     }
 43 |
 44 |     const onHide = () => {
 45 |         layout.hideControlInPortal();
 46 |         layout.showOverlay(false);
 47 |         if (layoutDiv) {
 48 |             layoutDiv.removeChild(elm);
 49 |         }
 50 |         elm.removeEventListener("pointerdown", onElementPointerDown);
 51 |         currentDocument.removeEventListener("pointerdown", onDocPointerDown);
 52 |     };
 53 |
 54 |     const onElementPointerDown = (event: Event) => {
 55 |         event.stopPropagation();
 56 |     };
 57 |
 58 |     const onDocPointerDown = (_event: Event) => {
 59 |         onHide();
 60 |     };
 61 |
 62 |     elm.addEventListener("pointerdown", onElementPointerDown);
 63 |     currentDocument.addEventListener("pointerdown", onDocPointerDown);
 64 |
 65 |     layout.showControlInPortal(<PopupMenu
 66 |         currentDocument={currentDocument}
 67 |         parentNode={parentNode}
 68 |         onSelect={onSelect}
 69 |         onHide={onHide}
 70 |         items={items}
 71 |         classNameMapper={classNameMapper}
 72 |         layout={layout}
 73 |     />, elm);
 74 | }
 75 |
 76 | /** @internal */
 77 | interface IPopupMenuProps {
 78 |     parentNode: TabSetNode | BorderNode;
 79 |     items: { index: number; node: TabNode }[];
 80 |     currentDocument: Document;
 81 |     onHide: () => void;
 82 |     onSelect: (item: { index: number; node: TabNode }) => void;
 83 |     classNameMapper: (defaultClassName: string) => string;
 84 |     layout: LayoutInternal;
 85 | }
 86 |
 87 | /** @internal */
 88 | const PopupMenu = (props: IPopupMenuProps) => {
 89 |     const { parentNode, items, onHide, onSelect, classNameMapper, layout } = props;
 90 |     const divRef = useRef<HTMLDivElement>(null);
 91 |
 92 |     useEffect(() => {
 93 |         // Set focus when the component mounts
 94 |         if (divRef.current) {
 95 |             divRef.current.focus();
 96 |         }
 97 |     }, []);
 98 |
 99 |     const onItemClick = (item: { index: number; node: TabNode }, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
100 |         onSelect(item);
101 |         onHide();
102 |         event.stopPropagation();
103 |     };
104 |
105 |     const onDragStart = (event: React.DragEvent<HTMLElement>, node: TabNode) => {
106 |         event.stopPropagation(); // prevent starting a tabset drag as well
107 |         layout.setDragNode(event.nativeEvent, node as TabNode);
108 |         setTimeout(() => {
109 |             onHide();
110 |         }, 0);
111 |
112 |     };
113 |
114 |     const onDragEnd = (event: React.DragEvent<HTMLElement>) => {
115 |         layout.clearDragMain();
116 |     };
117 |
118 |     const handleKeyDown = (event: React.KeyboardEvent) => {
119 |         if (event.key === "Escape") {
120 |             onHide();
121 |         }
122 |     };
123 |
124 |     const itemElements = items.map((item, i) => {
125 |         let classes = classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM);
126 |         if (parentNode.getSelected() === item.index) {
127 |             classes += " " + classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM__SELECTED);
128 |         }
129 |         return (
130 |             <div key={item.index}
131 |                 className={classes}
132 |                 data-layout-path={"/popup-menu/tb" + i}
133 |                 onClick={(event) => onItemClick(item, event)}
134 |                 draggable={true}
135 |                 onDragStart={(e) => onDragStart(e, item.node)}
136 |                 onDragEnd={onDragEnd}
137 |                 title={item.node.getHelpText()} >
138 |                 <TabButtonStamp
139 |                     node={item.node}
140 |                     layout={layout}
141 |                 />
142 |             </div>
143 |         )
144 |     }
145 |     );
146 |
147 |     return (
148 |         <div className={classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU)}
149 |             ref={divRef}
150 |             tabIndex={0}  // Make div focusable
151 |             onKeyDown={handleKeyDown}
152 |             data-layout-path="/popup-menu"
153 |         >
154 |             {itemElements}
155 |         </div>);
156 | };

--------------------------------------------------------------------------------
/src/view/Row.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import { RowNode } from "../model/RowNode";
 3 | import { TabSetNode } from "../model/TabSetNode";
 4 | import { CLASSES } from "../Types";
 5 | import { LayoutInternal } from "./Layout";
 6 | import { TabSet } from "./TabSet";
 7 | import { Splitter } from "./Splitter";
 8 | import { Orientation } from "../Orientation";
 9 |
10 | /** @internal */
11 | export interface IRowProps {
12 |     layout: LayoutInternal;
13 |     node: RowNode;
14 | }
15 |
16 | /** @internal */
17 | export const Row = (props: IRowProps) => {
18 |     const { layout, node } = props;
19 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
20 |
21 |     const horizontal = node.getOrientation() === Orientation.HORZ;
22 |
23 |     React.useLayoutEffect(() => {
24 |         node.setRect(layout.getBoundingClientRect(selfRef.current!));
25 |     });
26 |
27 |     const items: React.ReactNode[] = [];
28 |
29 |     let i = 0;
30 |
31 |     for (const child of node.getChildren()) {
32 |         if (i > 0) {
33 |             items.push(<Splitter key={"splitter" + i} layout={layout} node={node} index={i} horizontal={horizontal} />)
34 |         }
35 |         if (child instanceof RowNode) {
36 |             items.push(<Row key={child.getId()} layout={layout} node={child} />);
37 |         } else if (child instanceof TabSetNode) {
38 |             items.push(<TabSet key={child.getId()} layout={layout} node={child} />);
39 |         }
40 |         i++;
41 |     }
42 |
43 |     const style: Record<string, any> = {
44 |         flexGrow: Math.max(1, node.getWeight()*1000), // NOTE:  flex-grow cannot have values < 1 otherwise will not fill parent, need to normalize
45 |         minWidth: node.getMinWidth(),
46 |         minHeight: node.getMinHeight(),
47 |         maxWidth: node.getMaxWidth(),
48 |         maxHeight: node.getMaxHeight(),
49 |     };
50 |
51 |     if (horizontal) {
52 |         style.flexDirection = "row";
53 |     } else {
54 |         style.flexDirection = "column";
55 |     }
56 |
57 |      return (
58 |         <div
59 |             ref={selfRef}
60 |             className={layout.getClassName(CLASSES.FLEXLAYOUT__ROW)}
61 |             style={style}
62 |             >
63 |             {items}
64 |         </div>
65 |     );
66 | };

--------------------------------------------------------------------------------
/src/view/SizeTracker.tsx:
--------------------------------------------------------------------------------
 1 | import * as React from "react";
 2 | import { Rect } from "../Rect";
 3 | import { ErrorBoundary } from "./ErrorBoundary";
 4 | import { I18nLabel } from "../I18nLabel";
 5 | import { LayoutInternal } from "./Layout";
 6 | import { TabNode } from "../model/TabNode";
 7 |
 8 | export interface ISizeTrackerProps {
 9 |     layout: LayoutInternal,
10 |     node: TabNode,
11 |     rect: Rect;
12 |     visible: boolean;
13 |     forceRevision: number;
14 |     tabsRevision: number;
15 | }
16 |
17 | export const SizeTracker = React.memo(({ layout, node }: ISizeTrackerProps) => {
18 |     return (
19 |         <ErrorBoundary
20 |             message={layout.i18nName(I18nLabel.Error_rendering_component)}
21 |             retryText={layout.i18nName(I18nLabel.Error_rendering_component_retry)}>
22 |             {layout.props.factory(node)}
23 |         </ErrorBoundary>);
24 | }, arePropsEqual);
25 |
26 | // only re-render if visible && (size changed or forceRevision changed or tabsRevision changed)
27 | function arePropsEqual(prevProps: ISizeTrackerProps, nextProps: ISizeTrackerProps) {
28 |     const reRender = nextProps.visible &&
29 |         (!prevProps.rect.equalSize(nextProps.rect) ||
30 |             prevProps.forceRevision !== nextProps.forceRevision ||
31 |             prevProps.tabsRevision !== nextProps.tabsRevision
32 |         );
33 |     return !reRender;
34 | }

--------------------------------------------------------------------------------
/src/view/Splitter.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { Actions } from "../model/Actions";
  3 | import { BorderNode } from "../model/BorderNode";
  4 | import { RowNode } from "../model/RowNode";
  5 | import { Orientation } from "../Orientation";
  6 | import { CLASSES } from "../Types";
  7 | import { LayoutInternal } from "./Layout";
  8 | import { enablePointerOnIFrames, isDesktop, startDrag } from "./Utils";
  9 | import { Rect } from "../Rect";
 10 |
 11 | /** @internal */
 12 | export interface ISplitterProps {
 13 |     layout: LayoutInternal;
 14 |     node: RowNode | BorderNode;
 15 |     index: number;
 16 |     horizontal: boolean;
 17 | }
 18 |
 19 | /** @internal */
 20 | export let splitterDragging:boolean = false; // used in tabset & borderTab
 21 |
 22 | /** @internal */
 23 | export const Splitter = (props: ISplitterProps) => {
 24 |     const { layout, node, index, horizontal } = props;
 25 |
 26 |     const [dragging, setDragging] = React.useState<boolean>(false);
 27 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
 28 |     const extendedRef = React.useRef<HTMLDivElement | null>(null);
 29 |     const pBounds = React.useRef<number[]>([]);
 30 |     const outlineDiv = React.useRef<HTMLDivElement | undefined>(undefined);
 31 |     const handleDiv = React.useRef<HTMLDivElement | undefined>(undefined);
 32 |     const dragStartX = React.useRef<number>(0);
 33 |     const dragStartY = React.useRef<number>(0);
 34 |     const initalSizes = React.useRef<{ initialSizes: number[], sum: number, startPosition: number }>({ initialSizes: [], sum: 0, startPosition: 0 })
 35 |     // const throttleTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);
 36 |
 37 |     const size = node.getModel().getSplitterSize();
 38 |     let extra = node.getModel().getSplitterExtra();
 39 |
 40 |     if (!isDesktop()) {
 41 |         // make hit test area on mobile at least 20px
 42 |         extra = Math.max(20, extra + size) - size;
 43 |     }
 44 |
 45 |     React.useEffect(() => {
 46 |         // Android fix: must have passive touchstart handler to prevent default handling
 47 |         selfRef.current?.addEventListener("touchstart", onTouchStart, { passive: false });
 48 |         extendedRef.current?.addEventListener("touchstart", onTouchStart, { passive: false });
 49 |         return () => {
 50 |             selfRef.current?.removeEventListener("touchstart", onTouchStart);
 51 |             extendedRef.current?.removeEventListener("touchstart", onTouchStart);
 52 |         }
 53 |     }, []);
 54 |
 55 |     const onTouchStart = (event: TouchEvent) => {
 56 |         event.preventDefault();
 57 |         event.stopImmediatePropagation();
 58 |     }
 59 |
 60 |     const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
 61 |         event.stopPropagation();
 62 |         if (node instanceof RowNode) {
 63 |             initalSizes.current = node.getSplitterInitials(index);
 64 |         }
 65 |
 66 |         enablePointerOnIFrames(false, layout.getCurrentDocument()!);
 67 |         startDrag(event.currentTarget.ownerDocument, event, onDragMove, onDragEnd, onDragCancel);
 68 |
 69 |         pBounds.current = node.getSplitterBounds(index, true);
 70 |         const rootdiv = layout.getRootDiv();
 71 |         outlineDiv.current = layout.getCurrentDocument()!.createElement("div");
 72 |         outlineDiv.current.style.flexDirection = horizontal ? "row" : "column";
 73 |         outlineDiv.current.className = layout.getClassName(CLASSES.FLEXLAYOUT__SPLITTER_DRAG);
 74 |         outlineDiv.current.style.cursor = node.getOrientation() === Orientation.VERT ? "ns-resize" : "ew-resize";
 75 |
 76 |         if (node.getModel().isSplitterEnableHandle()) {
 77 |             handleDiv.current = layout.getCurrentDocument()!.createElement("div");
 78 |             handleDiv.current.className = cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE) + " " +
 79 |                 (horizontal ? cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_HORZ) : cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_VERT));
 80 |             outlineDiv.current.appendChild(handleDiv.current);
 81 |         }
 82 |
 83 |         const r = selfRef.current?.getBoundingClientRect()!;
 84 |         const rect = new Rect(
 85 |             r.x - layout.getDomRect()!.x,
 86 |             r.y - layout.getDomRect()!.y,
 87 |             r.width,
 88 |             r.height
 89 |         );
 90 |
 91 |         dragStartX.current = event.clientX - r.x;
 92 |         dragStartY.current = event.clientY - r.y;
 93 |
 94 |         rect.positionElement(outlineDiv.current);
 95 |         if (rootdiv) {
 96 |             rootdiv.appendChild(outlineDiv.current);
 97 |         }
 98 |
 99 |         setDragging(true);
100 |         splitterDragging = true;
101 |     };
102 |
103 |     const onDragCancel = () => {
104 |         const rootdiv = layout.getRootDiv();
105 |         if (rootdiv && outlineDiv.current) {
106 |             rootdiv.removeChild(outlineDiv.current as Element);
107 |         }
108 |         outlineDiv.current = undefined;
109 |         setDragging(false);
110 |         splitterDragging = false;
111 |     };
112 |
113 |     const onDragMove = (x: number, y: number) => {
114 |
115 |         if (outlineDiv.current) {
116 |             const clientRect = layout.getDomRect();
117 |             if (!clientRect) {
118 |                 return;
119 |             }
120 |             if (node.getOrientation() === Orientation.VERT) {
121 |                 outlineDiv.current!.style.top = getBoundPosition(y - clientRect.y - dragStartY.current) + "px";
122 |             } else {
123 |                 outlineDiv.current!.style.left = getBoundPosition(x - clientRect.x - dragStartX.current) + "px";
124 |             }
125 |
126 |             if (layout.isRealtimeResize()) {
127 |                 updateLayout(true);
128 |             }
129 |         }
130 |     };
131 |
132 |     const onDragEnd = () => {
133 |         if (outlineDiv.current) {
134 |             updateLayout(false);
135 |
136 |             const rootdiv = layout.getRootDiv();
137 |             if (rootdiv && outlineDiv.current) {
138 |                 rootdiv.removeChild(outlineDiv.current as HTMLElement);
139 |             }
140 |             outlineDiv.current = undefined;
141 |         }
142 |         enablePointerOnIFrames(true, layout.getCurrentDocument()!);
143 |         setDragging(false);
144 |         splitterDragging = false;
145 |     };
146 |
147 |     const updateLayout = (realtime: boolean) => {
148 |
149 |         const redraw = () => {
150 |             if (outlineDiv.current) {
151 |                 let value = 0;
152 |                 if (node.getOrientation() === Orientation.VERT) {
153 |                     value = outlineDiv.current!.offsetTop;
154 |                 } else {
155 |                     value = outlineDiv.current!.offsetLeft;
156 |                 }
157 |
158 |
159 |                 if (node instanceof BorderNode) {
160 |                     const pos = (node as BorderNode).calculateSplit(node, value);
161 |                     layout.doAction(Actions.adjustBorderSplit(node.getId(), pos));
162 |                 } else {
163 |                     const init = initalSizes.current;
164 |                     const weights = node.calculateSplit(index, value, init.initialSizes, init.sum, init.startPosition);
165 |                     layout.doAction(Actions.adjustWeights(node.getId(), weights));
166 |                 }
167 |             }
168 |         };
169 |
170 |         redraw();
171 |     };
172 |
173 |     const getBoundPosition = (p: number) => {
174 |         const bounds = pBounds.current as number[];
175 |         let rtn = p;
176 |         if (p < bounds[0]) {
177 |             rtn = bounds[0];
178 |         }
179 |         if (p > bounds[1]) {
180 |             rtn = bounds[1];
181 |         }
182 |
183 |         return rtn;
184 |     };
185 |
186 |     const cm = layout.getClassName;
187 |     const style: Record<string, any> = {
188 |         cursor: horizontal ? "ew-resize" : "ns-resize",
189 |         flexDirection: horizontal ? "column" : "row"
190 |     };
191 |     let className = cm(CLASSES.FLEXLAYOUT__SPLITTER) + " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_ + node.getOrientation().getName());
192 |
193 |     if (node instanceof BorderNode) {
194 |         className += " " + cm(CLASSES.FLEXLAYOUT__SPLITTER_BORDER);
195 |     } else {
196 |         if (node.getModel().getMaximizedTabset(layout.getWindowId()) !== undefined) {
197 |             style.display = "none";
198 |         }
199 |     }
200 |
201 |     if (horizontal) {
202 |         style.width = size + "px";
203 |         style.minWidth = size + "px";
204 |     } else {
205 |         style.height = size + "px";
206 |         style.minHeight = size + "px";
207 |     }
208 |
209 |     let handle;
210 |     if (!dragging && node.getModel().isSplitterEnableHandle()) {
211 |         handle = (
212 |             <div
213 |                 className={cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE) + " " +
214 |                     (horizontal ? cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_HORZ) : cm(CLASSES.FLEXLAYOUT__SPLITTER_HANDLE_VERT))
215 |                 }>
216 |             </div>
217 |         );
218 |     }
219 |
220 |     if (extra === 0) {
221 |         return (<div
222 |             className={className}
223 |             style={style}
224 |             ref={selfRef}
225 |             data-layout-path={node.getPath() + "/s" + (index - 1)}
226 |             onPointerDown={onPointerDown}>
227 |             {handle}
228 |         </div>);
229 |     } else {
230 |         // add extended transparent div for hit testing
231 |
232 |         const style2: Record<string, any> = {};
233 |         if (node.getOrientation() === Orientation.HORZ) {
234 |             style2.height = "100%";
235 |             style2.width = size + extra + "px";
236 |             style2.cursor = "ew-resize";
237 |         } else {
238 |             style2.height = size + extra + "px";
239 |             style2.width = "100%";
240 |             style2.cursor = "ns-resize";
241 |         }
242 |
243 |         const className2 = cm(CLASSES.FLEXLAYOUT__SPLITTER_EXTRA);
244 |
245 |         return (
246 |             <div
247 |                 className={className}
248 |                 style={style}
249 |                 ref={selfRef}
250 |                 data-layout-path={node.getPath() + "/s" + (index - 1)}
251 |                 onPointerDown={onPointerDown}
252 |             >
253 |                 <div
254 |                     style={style2}
255 |                     ref={extendedRef}
256 |                     className={className2}
257 |                     onPointerDown={onPointerDown}>
258 |                 </div>
259 |             </div>);
260 |     }
261 | };

--------------------------------------------------------------------------------
/src/view/Tab.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { TabNode } from "../model/TabNode";
  3 | import { TabSetNode } from "../model/TabSetNode";
  4 | import { CLASSES } from "../Types";
  5 | import { LayoutInternal } from "./Layout";
  6 | import { BorderNode } from "../model/BorderNode";
  7 | import { Actions } from "../model/Actions";
  8 |
  9 | /** @internal */
 10 | export interface ITabProps {
 11 |     layout: LayoutInternal;
 12 |     node: TabNode;
 13 |     selected: boolean;
 14 |     path: string;
 15 | }
 16 |
 17 | /** @internal */
 18 | export const Tab = (props: ITabProps) => {
 19 |     const { layout, selected, node, path } = props;
 20 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
 21 |     const firstSelect = React.useRef<boolean>(true);
 22 |
 23 |     const parentNode = node.getParent() as TabSetNode | BorderNode;
 24 |     const rect = parentNode.getContentRect()!;
 25 |
 26 |     React.useLayoutEffect(() => {
 27 |         const element = node.getMoveableElement()!;
 28 |         selfRef.current!.appendChild(element);
 29 |         node.setMoveableElement(element);
 30 |
 31 |         const handleScroll = () => {
 32 |             node.saveScrollPosition();
 33 |         };
 34 |
 35 |         // keep scroll position
 36 |         element.addEventListener('scroll', handleScroll);
 37 |
 38 |         // listen for clicks to change active tabset
 39 |         selfRef.current!.addEventListener("pointerdown", onPointerDown);
 40 |
 41 |         return () => {
 42 |             element.removeEventListener('scroll', handleScroll);
 43 |             if (selfRef.current) {
 44 |                 selfRef.current.removeEventListener("pointerdown", onPointerDown);
 45 |             }
 46 |             node.setVisible(false);
 47 |         }
 48 |     }, []);
 49 |
 50 |     React.useEffect(() => {
 51 |         if (node.isSelected()) {
 52 |             if (firstSelect.current) {
 53 |                 node.restoreScrollPosition(); // if window docked back in
 54 |                 firstSelect.current = false;
 55 |             }
 56 |         }
 57 |     });
 58 |
 59 |     const onPointerDown = () => {
 60 |         const parent = node.getParent()!; // cannot use parentNode here since will be out of date
 61 |         if (parent instanceof TabSetNode) {
 62 |             if (!parent.isActive()) {
 63 |                 layout.doAction(Actions.setActiveTabset(parent.getId(), layout.getWindowId()));
 64 |             }
 65 |         }
 66 |     };
 67 |
 68 |     node.setRect(rect); // needed for resize event
 69 |     const cm = layout.getClassName;
 70 |     const style: Record<string, any> = {};
 71 |
 72 |     rect.styleWithPosition(style);
 73 |
 74 |     let overlay = null;
 75 |
 76 |     if (selected) {
 77 |         node.setVisible(true);
 78 |         if (document.hidden && node.isEnablePopoutOverlay()) {
 79 |             const overlayStyle: Record<string, any> = {};
 80 |             rect.styleWithPosition(overlayStyle);
 81 |             overlay = (<div style={overlayStyle} className={cm(CLASSES.FLEXLAYOUT__TAB_OVERLAY)}></div>)
 82 |         }
 83 |     } else {
 84 |         style.display = "none";
 85 |         node.setVisible(false);
 86 |     }
 87 |
 88 |     if (parentNode instanceof TabSetNode) {
 89 |         if (node.getModel().getMaximizedTabset(layout.getWindowId()) !== undefined) {
 90 |             if (parentNode.isMaximized()) {
 91 |                 style.zIndex = 10;
 92 |             } else {
 93 |                 style.display = "none";
 94 |             }
 95 |         }
 96 |     }
 97 |
 98 |     if (parentNode instanceof BorderNode) {
 99 |         if (!parentNode.isShowing()) {
100 |             style.display = "none";
101 |         }
102 |     }
103 |
104 |     let className = cm(CLASSES.FLEXLAYOUT__TAB);
105 |     if (parentNode instanceof BorderNode) {
106 |         className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER);
107 |         className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER_ + parentNode.getLocation().getName());
108 |     }
109 |
110 |     if (node.getContentClassName() !== undefined) {
111 |         className += " " + node.getContentClassName();
112 |     }
113 |
114 |     return (
115 |         <>
116 |             {overlay}
117 |
118 |             <div
119 |                 ref={selfRef}
120 |                 style={style}
121 |                 className={className}
122 |                 data-layout-path={path}
123 |             />
124 |         </>
125 |     );
126 | };

--------------------------------------------------------------------------------
/src/view/TabButton.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { I18nLabel } from "../I18nLabel";
  3 | import { Actions } from "../model/Actions";
  4 | import { TabNode } from "../model/TabNode";
  5 | import { TabSetNode } from "../model/TabSetNode";
  6 | import { LayoutInternal } from "./Layout";
  7 | import { ICloseType } from "../model/ICloseType";
  8 | import { CLASSES } from "../Types";
  9 | import { getRenderStateEx, isAuxMouseEvent } from "./Utils";
 10 |
 11 | /** @internal */
 12 | export interface ITabButtonProps {
 13 |     layout: LayoutInternal;
 14 |     node: TabNode;
 15 |     selected: boolean;
 16 |     path: string;
 17 | }
 18 |
 19 | /** @internal */
 20 | export const TabButton = (props: ITabButtonProps) => {
 21 |     const { layout, node, selected, path } = props;
 22 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
 23 |     const contentRef = React.useRef<HTMLInputElement | null>(null);
 24 |     const icons = layout.getIcons();
 25 |
 26 |     React.useLayoutEffect(() => {
 27 |         node.setTabRect(layout.getBoundingClientRect(selfRef.current!));
 28 |         if (layout.getEditingTab() === node) {
 29 |             (contentRef.current! as HTMLInputElement).select();
 30 |         }
 31 |     });
 32 |
 33 |     const onDragStart = (event: React.DragEvent<HTMLElement>) => {
 34 |         if (node.isEnableDrag()) {
 35 |             event.stopPropagation(); // prevent starting a tabset drag as well
 36 |             layout.setDragNode(event.nativeEvent, node as TabNode);
 37 |         } else {
 38 |             event.preventDefault();
 39 |         }
 40 |     };
 41 |
 42 |     const onDragEnd = (event: React.DragEvent<HTMLElement>) => {
 43 |         layout.clearDragMain();
 44 |     };
 45 |
 46 |     const onAuxMouseClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 47 |         if (isAuxMouseEvent(event)) {
 48 |             layout.auxMouseClick(node, event);
 49 |         }
 50 |     };
 51 |
 52 |     const onContextMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
 53 |         layout.showContextMenu(node, event);
 54 |     };
 55 |
 56 |     const onClick = () => {
 57 |         layout.doAction(Actions.selectTab(node.getId()));
 58 |     };
 59 |
 60 |     const onDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
 61 |         if (node.isEnableRename()) {
 62 |             onRename();
 63 |             event.stopPropagation();
 64 |         }
 65 |     };
 66 |
 67 |     const onRename = () => {
 68 |         layout.setEditingTab(node);
 69 |         layout.getCurrentDocument()!.body.addEventListener("pointerdown", onEndEdit);
 70 |     };
 71 |
 72 |     const onEndEdit = (event: Event) => {
 73 |         if (event.target !== contentRef.current!) {
 74 |             layout.getCurrentDocument()!.body.removeEventListener("pointerdown", onEndEdit);
 75 |             layout.setEditingTab(undefined);
 76 |         }
 77 |     };
 78 |
 79 |     const isClosable = () => {
 80 |         const closeType = node.getCloseType();
 81 |         if (selected || closeType === ICloseType.Always) {
 82 |             return true;
 83 |         }
 84 |         if (closeType === ICloseType.Visible) {
 85 |             // not selected but x should be visible due to hover
 86 |             if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
 87 |                 return true;
 88 |             }
 89 |         }
 90 |         return false;
 91 |     };
 92 |
 93 |     const onClose = (event: React.MouseEvent<HTMLElement>) => {
 94 |         if (isClosable()) {
 95 |             layout.doAction(Actions.deleteTab(node.getId()));
 96 |             event.stopPropagation();
 97 |         }
 98 |     };
 99 |
100 |     const onClosePointerDown = (event: React.PointerEvent<HTMLElement>) => {
101 |         event.stopPropagation();
102 |     };
103 |
104 |     const onTextBoxPointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
105 |         event.stopPropagation();
106 |     };
107 |
108 |     const onTextBoxKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
109 |         if (event.code === 'Escape') {
110 |             // esc
111 |             layout.setEditingTab(undefined);
112 |         } else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
113 |             // enter
114 |             layout.setEditingTab(undefined);
115 |             layout.doAction(Actions.renameTab(node.getId(), (event.target as HTMLInputElement).value));
116 |         }
117 |     };
118 |
119 |     const cm = layout.getClassName;
120 |     const parentNode = node.getParent() as TabSetNode;
121 |
122 |     const isStretch = parentNode.isEnableSingleTabStretch() && parentNode.getChildren().length === 1;
123 |     const baseClassName = isStretch ? CLASSES.FLEXLAYOUT__TAB_BUTTON_STRETCH : CLASSES.FLEXLAYOUT__TAB_BUTTON;
124 |     let classNames = cm(baseClassName);
125 |     classNames += " " + cm(baseClassName + "_" + parentNode.getTabLocation());
126 |
127 |     if (!isStretch) {
128 |         if (selected) {
129 |             classNames += " " + cm(baseClassName + "--selected");
130 |         } else {
131 |             classNames += " " + cm(baseClassName + "--unselected");
132 |         }
133 |     }
134 |
135 |     if (node.getClassName() !== undefined) {
136 |         classNames += " " + node.getClassName();
137 |     }
138 |
139 |     const renderState = getRenderStateEx(layout, node);
140 |
141 |     let content = renderState.content ? (
142 |         <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_CONTENT)}>
143 |             {renderState.content}
144 |         </div>) : null;
145 |
146 |     const leading = renderState.leading ? (
147 |         <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING)}>
148 |             {renderState.leading}
149 |         </div>) : null;
150 |
151 |     if (layout.getEditingTab() === node) {
152 |         content = (
153 |             <input
154 |                 ref={contentRef}
155 |                 className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TEXTBOX)}
156 |                 data-layout-path={path + "/textbox"}
157 |                 type="text"
158 |                 autoFocus={true}
159 |                 defaultValue={node.getName()}
160 |                 onKeyDown={onTextBoxKeyPress}
161 |                 onPointerDown={onTextBoxPointerDown}
162 |             />
163 |         );
164 |     }
165 |
166 |     if (node.isEnableClose() && !isStretch) {
167 |         const closeTitle = layout.i18nName(I18nLabel.Close_Tab);
168 |         renderState.buttons.push(
169 |             <div
170 |                 key="close"
171 |                 data-layout-path={path + "/button/close"}
172 |                 title={closeTitle}
173 |                 className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_TRAILING)}
174 |                 onPointerDown={onClosePointerDown}
175 |                 onClick={onClose}>
176 |                 {(typeof icons.close === "function") ? icons.close(node) : icons.close}
177 |             </div>
178 |         );
179 |     }
180 |
181 |     return (
182 |         <div
183 |             ref={selfRef}
184 |             data-layout-path={path}
185 |             className={classNames}
186 |             onClick={onClick}
187 |             onAuxClick={onAuxMouseClick}
188 |             onContextMenu={onContextMenu}
189 |             title={node.getHelpText()}
190 |             draggable={true}
191 |             onDragStart={onDragStart}
192 |             onDragEnd={onDragEnd}
193 |             onDoubleClick={onDoubleClick}
194 |         >
195 |             {leading}
196 |             {content}
197 |             {renderState.buttons}
198 |         </div>
199 |     );
200 | };

--------------------------------------------------------------------------------
/src/view/TabButtonStamp.tsx:
--------------------------------------------------------------------------------
 1 | import { TabNode } from "../model/TabNode";
 2 | import { LayoutInternal } from "./Layout";
 3 | import { CLASSES } from "../Types";
 4 | import { getRenderStateEx } from "./Utils";
 5 |
 6 | /** @internal */
 7 | export interface ITabButtonStampProps {
 8 |     node: TabNode;
 9 |     layout: LayoutInternal;
10 | }
11 |
12 | /** @internal */
13 | export const TabButtonStamp = (props: ITabButtonStampProps) => {
14 |     const { layout, node } = props;
15 |
16 |     const cm = layout.getClassName;
17 |
18 |     const classNames = cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_STAMP);
19 |
20 |     const renderState = getRenderStateEx(layout, node);
21 |
22 |     const content = renderState.content ? (
23 |         <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_CONTENT)}>
24 |             {renderState.content}
25 |         </div>)
26 |         : node.getNameForOverflowMenu();
27 |
28 |     const leading = renderState.leading ? (
29 |         <div className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_LEADING)}>
30 |             {renderState.leading}
31 |         </div>) : null;
32 |
33 |     return (
34 |         <div
35 |             className={classNames}
36 |             title={node.getHelpText()}
37 |         >
38 |             {leading}
39 |             {content}
40 |         </div>
41 |     );
42 | };

--------------------------------------------------------------------------------
/src/view/TabOverflowHook.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { TabSetNode } from "../model/TabSetNode";
  3 | import { BorderNode } from "../model/BorderNode";
  4 | import { Orientation } from "../Orientation";
  5 | import { LayoutInternal } from "./Layout";
  6 | import { TabNode } from "../model/TabNode";
  7 | import { startDrag } from "./Utils";
  8 | import { Rect } from "../Rect";
  9 |
 10 | /** @internal */
 11 | export const useTabOverflow = (
 12 |     layout: LayoutInternal,
 13 |     node: TabSetNode | BorderNode,
 14 |     orientation: Orientation,
 15 |     tabStripRef: React.RefObject<HTMLElement | null>,
 16 |     miniScrollRef: React.RefObject<HTMLElement | null>,
 17 |     tabClassName: string
 18 | ) => {
 19 |     const [hiddenTabs, setHiddenTabs] = React.useState<number[]>([]);
 20 |     const [isShowHiddenTabs, setShowHiddenTabs] = React.useState<boolean>(false);
 21 |     const [isDockStickyButtons, setDockStickyButtons] = React.useState<boolean>(false);
 22 |
 23 |     const selfRef = React.useRef<HTMLDivElement | null>(null);
 24 |     const userControlledPositionRef = React.useRef<boolean>(false);
 25 |     const updateHiddenTabsTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
 26 |     const hiddenTabsRef = React.useRef<number[]>([]);
 27 |     const thumbInternalPos = React.useRef<number>(0);
 28 |     const repositioningRef = React.useRef<boolean>(false);
 29 |     hiddenTabsRef.current = hiddenTabs;
 30 |
 31 |     // if node id changes (new model) then reset scroll to 0
 32 |     React.useLayoutEffect(() => {
 33 |         if (tabStripRef.current) {
 34 |             setScrollPosition(0);
 35 |         }
 36 |     }, [node.getId()]);
 37 |
 38 |     // if selected node or tabset/border rectangle change then unset usercontrolled (so selected tab will be kept in view)
 39 |     React.useLayoutEffect(() => {
 40 |         userControlledPositionRef.current = false;
 41 |     }, [node.getSelectedNode(), node.getRect().width, node.getRect().height]);
 42 |
 43 |     React.useLayoutEffect(() => {
 44 |         checkForOverflow(); // if tabs + sticky buttons length > scroll area => move sticky buttons to right buttons
 45 |
 46 |         if (userControlledPositionRef.current === false) {
 47 |             scrollIntoView();
 48 |         }
 49 |
 50 |         updateScrollMetrics();
 51 |         updateHiddenTabs();
 52 |     });
 53 |
 54 |     React.useEffect(() => {
 55 |         selfRef.current?.addEventListener("wheel", onWheel, { passive: false });
 56 |         return () => {
 57 |             selfRef.current?.removeEventListener("wheel", onWheel);
 58 |         };
 59 |     }, [selfRef.current]);
 60 |
 61 |     // needed to prevent default mouse wheel over tabset/border when page scrolled (cannot do with react event?)
 62 |     const onWheel = (event: Event) => {
 63 |         event.preventDefault();
 64 |     };
 65 |
 66 |     function scrollIntoView() {
 67 |         const selectedTabNode = node.getSelectedNode() as TabNode;
 68 |         if (selectedTabNode && tabStripRef.current) {
 69 |             const stripRect = layout.getBoundingClientRect(tabStripRef.current);
 70 |             const selectedRect = selectedTabNode.getTabRect()!;
 71 |
 72 |             let shift = getNear(stripRect) - getNear(selectedRect);
 73 |             if (shift > 0 || getSize(selectedRect) > getSize(stripRect)) {
 74 |                 setScrollPosition(getScrollPosition(tabStripRef.current) - shift);
 75 |                 repositioningRef.current = true; // prevent onScroll setting userControlledPosition
 76 |             } else {
 77 |                 shift = getFar(selectedRect) - getFar(stripRect);
 78 |                 if (shift > 0) {
 79 |                     setScrollPosition(getScrollPosition(tabStripRef.current) + shift);
 80 |                     repositioningRef.current = true;
 81 |                 }
 82 |             }
 83 |         }
 84 |     }
 85 |
 86 |     const updateScrollMetrics = () => {
 87 |         if (tabStripRef.current && miniScrollRef.current) {
 88 |             const t = tabStripRef.current;
 89 |             const s = miniScrollRef.current;
 90 |
 91 |             const size = getElementSize(t);
 92 |             const scrollSize = getScrollSize(t);
 93 |             const position = getScrollPosition(t);
 94 |
 95 |             if (scrollSize > size && scrollSize > 0) {
 96 |                 let thumbSize = size * size / scrollSize;
 97 |                 let adjust = 0;
 98 |                 if (thumbSize < 20) {
 99 |                     adjust = 20 - thumbSize;
100 |                     thumbSize = 20;
101 |                 }
102 |                 const thumbPos = position * (size - adjust) / scrollSize;
103 |                 if (orientation === Orientation.HORZ) {
104 |                     s.style.width = thumbSize + "px";
105 |                     s.style.left = thumbPos + "px";
106 |                 } else {
107 |                     s.style.height = thumbSize + "px";
108 |                     s.style.top = thumbPos + "px";
109 |                 }
110 |                 s.style.display = "block";
111 |             } else {
112 |                 s.style.display = "none";
113 |             }
114 |
115 |             if (orientation === Orientation.HORZ) {
116 |                 s.style.bottom = "0px";
117 |             } else {
118 |                 s.style.right = "0px";
119 |             }
120 |         }
121 |     }
122 |
123 |     const updateHiddenTabs = () => {
124 |         const newHiddenTabs = findHiddenTabs();
125 |         const showHidden = newHiddenTabs.length > 0;
126 |
127 |         if (showHidden !== isShowHiddenTabs) {
128 |             setShowHiddenTabs(showHidden);
129 |         }
130 |
131 |         if (updateHiddenTabsTimerRef.current === undefined) {
132 |             // throttle updates to prevent Maximum update depth exceeded error
133 |             updateHiddenTabsTimerRef.current = setTimeout(() => {
134 |                 const newHiddenTabs = findHiddenTabs();
135 |                 if (!arraysEqual(newHiddenTabs, hiddenTabsRef.current)) {
136 |                     setHiddenTabs(newHiddenTabs);
137 |                 }
138 |
139 |                 updateHiddenTabsTimerRef.current = undefined;
140 |             }, 100);
141 |         }
142 |     }
143 |
144 |     const onScroll = () => {
145 |         if (!repositioningRef.current){
146 |             userControlledPositionRef.current=true;
147 |         }
148 |         repositioningRef.current = false;
149 |         updateScrollMetrics()
150 |         updateHiddenTabs();
151 |     };
152 |
153 |     const onScrollPointerDown = (event: React.PointerEvent<HTMLElement>) => {
154 |         event.stopPropagation();
155 |         miniScrollRef.current!.setPointerCapture(event.pointerId)
156 |         const r = miniScrollRef.current?.getBoundingClientRect()!;
157 |         if (orientation === Orientation.HORZ) {
158 |             thumbInternalPos.current = event.clientX - r.x;
159 |         } else {
160 |             thumbInternalPos.current = event.clientY - r.y;
161 |         }
162 |         startDrag(event.currentTarget.ownerDocument, event, onDragMove, onDragEnd, onDragCancel);
163 |     }
164 |
165 |     const onDragMove = (x: number, y: number) => {
166 |         if (tabStripRef.current && miniScrollRef.current) {
167 |             const t = tabStripRef.current;
168 |             const s = miniScrollRef.current;
169 |             const size = getElementSize(t);
170 |             const scrollSize = getScrollSize(t);
171 |             const thumbSize = getElementSize(s);
172 |
173 |             const r = t.getBoundingClientRect()!;
174 |             let thumb = 0;
175 |             if (orientation === Orientation.HORZ) {
176 |                 thumb = x - r.x - thumbInternalPos.current;
177 |             } else {
178 |                 thumb = y - r.y - thumbInternalPos.current
179 |             }
180 |
181 |             thumb = Math.max(0, Math.min(scrollSize - thumbSize, thumb));
182 |             if (size > 0) {
183 |                 const scrollPos = thumb * scrollSize / size;
184 |                 setScrollPosition(scrollPos);
185 |             }
186 |         }
187 |     }
188 |
189 |     const onDragEnd = () => {
190 |     }
191 |
192 |     const onDragCancel = () => {
193 |     }
194 |
195 |     const checkForOverflow = () => {
196 |         if (tabStripRef.current) {
197 |             const strip = tabStripRef.current;
198 |             const tabContainer = strip.firstElementChild!;
199 |
200 |             const offset = isDockStickyButtons ? 10 : 0; // prevents flashing, after sticky buttons docked set, must be 10 pixels smaller before unsetting
201 |             const dock = (getElementSize(tabContainer) + offset) > getElementSize(tabStripRef.current);
202 |             if (dock !== isDockStickyButtons) {
203 |                 setDockStickyButtons(dock);
204 |             }
205 |         }
206 |     }
207 |
208 |     const findHiddenTabs: () => number[] = () => {
209 |         const hidden: number[] = [];
210 |         if (tabStripRef.current) {
211 |             const strip = tabStripRef.current;
212 |             const stripRect = strip.getBoundingClientRect();
213 |             const visibleNear = getNear(stripRect) - 1;
214 |             const visibleFar = getFar(stripRect) + 1;
215 |
216 |             const tabContainer = strip.firstElementChild!;
217 |
218 |             let i = 0;
219 |             Array.from(tabContainer.children).forEach((child) => {
220 |                 const tabRect = child.getBoundingClientRect();
221 |
222 |                 if (child.classList.contains(tabClassName)) {
223 |                     if (getNear(tabRect) < visibleNear || getFar(tabRect) > visibleFar) {
224 |                         hidden.push(i);
225 |                     }
226 |                     i++;
227 |                 }
228 |             });
229 |         }
230 |
231 |         return hidden;
232 |     };
233 |
234 |     const onMouseWheel = (event: React.WheelEvent<HTMLElement>) => {
235 |         if (tabStripRef.current) {
236 |             if (node.getChildren().length === 0) return;
237 |
238 |             let delta = 0;
239 |             if (Math.abs(event.deltaY) > 0) {
240 |                 delta = -event.deltaY;
241 |                 if (event.deltaMode === 1) {
242 |                     // DOM_DELTA_LINE	0x01	The delta values are specified in lines.
243 |                     delta *= 40;
244 |                 }
245 |                 const newPos = getScrollPosition(tabStripRef.current) - delta;
246 |                 const maxScroll = getScrollSize(tabStripRef.current) - getElementSize(tabStripRef.current);
247 |                 const p = Math.max(0, Math.min(maxScroll, newPos));
248 |                 setScrollPosition(p);
249 |                 event.stopPropagation();
250 |             }
251 |         }
252 |     };
253 |
254 |     // orientation helpers:
255 |
256 |     const getNear = (rect: DOMRect | Rect) => {
257 |         if (orientation === Orientation.HORZ) {
258 |             return rect.x;
259 |         } else {
260 |             return rect.y;
261 |         }
262 |     };
263 |
264 |     const getFar = (rect: DOMRect | Rect) => {
265 |         if (orientation === Orientation.HORZ) {
266 |             return rect.right;
267 |         } else {
268 |             return rect.bottom;
269 |         }
270 |     };
271 |
272 |     const getElementSize = (elm: Element) => {
273 |         if (orientation === Orientation.HORZ) {
274 |             return elm.clientWidth;
275 |         } else {
276 |             return elm.clientHeight;
277 |         }
278 |     }
279 |
280 |     const getSize = (rect: DOMRect | Rect) => {
281 |         if (orientation === Orientation.HORZ) {
282 |             return rect.width;
283 |         } else {
284 |             return rect.height;
285 |         }
286 |     }
287 |
288 |     const getScrollSize = (elm: Element) => {
289 |         if (orientation === Orientation.HORZ) {
290 |             return elm.scrollWidth;
291 |         } else {
292 |             return elm.scrollHeight;
293 |         }
294 |     }
295 |
296 |     const setScrollPosition = (p: number) => {
297 |         if (orientation === Orientation.HORZ) {
298 |             tabStripRef.current!.scrollLeft = p;
299 |         } else {
300 |             tabStripRef.current!.scrollTop = p;
301 |         }
302 |     }
303 |
304 |     const getScrollPosition = (elm: Element) => {
305 |         if (orientation === Orientation.HORZ) {
306 |             return elm.scrollLeft;
307 |         } else {
308 |             return elm.scrollTop;
309 |         }
310 |     }
311 |
312 |     return { selfRef, userControlledPositionRef, onScroll, onScrollPointerDown, hiddenTabs, onMouseWheel, isDockStickyButtons, isShowHiddenTabs };
313 | };
314 |
315 | function arraysEqual(arr1: number[], arr2: number[]) {
316 |     return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
317 | }

--------------------------------------------------------------------------------
/src/view/Utils.tsx:
--------------------------------------------------------------------------------
  1 | import * as React from "react";
  2 | import { Node } from "../model/Node";
  3 | import { TabNode } from "../model/TabNode";
  4 | import { LayoutInternal } from "./Layout";
  5 | import { TabSetNode } from "../model/TabSetNode";
  6 |
  7 | /** @internal */
  8 | export function isDesktop() {
  9 |     const desktop = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
 10 |     return desktop;
 11 | }
 12 | /** @internal */
 13 | export function getRenderStateEx(
 14 |     layout: LayoutInternal,
 15 |     node: TabNode,
 16 |     iconAngle?: number
 17 | ) {
 18 |     let leadingContent = undefined;
 19 |     const titleContent: React.ReactNode = node.getName();
 20 |     const name = node.getName();
 21 |     if (iconAngle === undefined) {
 22 |         iconAngle = 0;
 23 |     }
 24 |
 25 |     if (leadingContent === undefined && node.getIcon() !== undefined) {
 26 |         if (iconAngle !== 0) {
 27 |             leadingContent = <img style={{ width: "1em", height: "1em", transform: "rotate(" + iconAngle + "deg)" }} src={node.getIcon()} alt="leadingContent" />;
 28 |         } else {
 29 |             leadingContent = <img style={{ width: "1em", height: "1em" }} src={node.getIcon()} alt="leadingContent" />;
 30 |         }
 31 |     }
 32 |
 33 |     const buttons: any[] = [];
 34 |
 35 |     // allow customization of leading contents (icon) and contents
 36 |     const renderState = { leading: leadingContent, content: titleContent, name, buttons };
 37 |     layout.customizeTab(node, renderState);
 38 |
 39 |     node.setRenderedName(renderState.name);
 40 |
 41 |     return renderState;
 42 | }
 43 |
 44 | /** @internal */
 45 | export function isAuxMouseEvent(event: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) {
 46 |     let auxEvent = false;
 47 |     if (event.nativeEvent instanceof MouseEvent) {
 48 |         if (event.nativeEvent.button !== 0 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
 49 |             auxEvent = true;
 50 |         }
 51 |     }
 52 |     return auxEvent;
 53 | }
 54 |
 55 | export function enablePointerOnIFrames(enable: boolean, currentDocument: Document) {
 56 |     const iframes = [
 57 |         ...getElementsByTagName('iframe', currentDocument),
 58 |         ...getElementsByTagName('webview', currentDocument),
 59 |     ];
 60 |
 61 |     for (const iframe of iframes) {
 62 |         (iframe as HTMLElement).style.pointerEvents = enable ? 'auto' : 'none';
 63 |     }
 64 | };
 65 |
 66 | export function getElementsByTagName(tag: string, currentDocument: Document): Element[] {
 67 |     return [...currentDocument.getElementsByTagName(tag)];
 68 | }
 69 |
 70 | export function startDrag(
 71 |     doc: Document,
 72 |     event: React.PointerEvent<HTMLElement>,
 73 |     drag: (x: number, y: number) => void,
 74 |     dragEnd: () => void,
 75 |     dragCancel: () => void) {
 76 |
 77 |     event.preventDefault();
 78 |
 79 |     const pointerMove = (ev: PointerEvent) => {
 80 |         ev.preventDefault();
 81 |         drag(ev.clientX, ev.clientY);
 82 |     };
 83 |
 84 |     const pointerCancel = (ev: PointerEvent) => {
 85 |         ev.preventDefault();
 86 |         dragCancel();
 87 |     };
 88 |     const pointerUp = () => {
 89 |         doc.removeEventListener("pointermove", pointerMove);
 90 |         doc.removeEventListener("pointerup", pointerUp);
 91 |         doc.removeEventListener("pointercancel", pointerCancel);
 92 |         dragEnd();
 93 |     };
 94 |
 95 |     doc.addEventListener("pointermove", pointerMove);
 96 |     doc.addEventListener("pointerup", pointerUp);
 97 |     doc.addEventListener('pointercancel', pointerCancel);
 98 | }
 99 |
100 | export function canDockToWindow(node: Node) {
101 |     if (node instanceof TabNode) {
102 |         return node.isEnablePopout();
103 |     } else if (node instanceof TabSetNode) {
104 |         for (const child of node.getChildren()) {
105 |             if ((child as TabNode).isEnablePopout() === false) {
106 |                 return false;
107 |             }
108 |         }
109 |         return true;
110 |     }
111 |     return false;
112 | }
113 |
114 | export function copyInlineStyles(source: HTMLElement, target: HTMLElement): boolean {
115 |     // Get the inline style attribute from the source element
116 |     const sourceStyle = source.getAttribute('style');
117 |     const targetStyle = target.getAttribute('style');
118 |     if (sourceStyle === targetStyle) return false;
119 |
120 |     // console.log("copyInlineStyles", sourceStyle);
121 |
122 |     if (sourceStyle) {
123 |         // Set the style attribute on the target element
124 |         target.setAttribute('style', sourceStyle);
125 |     } else {
126 |         // If the source has no inline style, clear the target's style attribute
127 |         target.removeAttribute('style');
128 |     }
129 |     return true;
130 | }
131 |
132 | export function isSafari() {
133 |     const userAgent = navigator.userAgent;
134 |     return userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium");
135 |   }

--------------------------------------------------------------------------------
/style/combined.scss:
--------------------------------------------------------------------------------
 1 | @use "base";
 2 | @use "themes";
 3 |
 4 | .flexlayout__theme_light {
 5 |     @include themes.light_theme;
 6 | }
 7 |
 8 | .flexlayout__theme_dark {
 9 |     @include themes.dark_theme;
10 | }
11 |
12 | .flexlayout__theme_gray {
13 |     @include themes.gray_theme;
14 | }
15 |
16 | .flexlayout__theme_underline {
17 |     @include themes.underline_theme;
18 | }
19 |
20 | .flexlayout__theme_rounded {
21 |     @include themes.rounded_theme;
22 | }
23 |
24 |
25 | @include base.baseMixin;
26 |
27 |
28 | .flexlayout__theme_light {
29 |     @include themes.light_theme_overrides;
30 | }
31 |
32 | .flexlayout__theme_dark {
33 |     @include themes.dark_theme_overrides;
34 | }
35 |
36 | .flexlayout__theme_gray {
37 |     @include themes.gray_theme_overrides;
38 | }
39 |
40 | .flexlayout__theme_underline {
41 |     @include themes.underline_theme_overrides;
42 | }
43 |
44 | .flexlayout__theme_rounded {
45 |     @include themes.rounded_theme_overrides;
46 | }

--------------------------------------------------------------------------------
/style/dark.scss:
--------------------------------------------------------------------------------
1 | @use "base";
2 | @use "themes";
3 |
4 | @include themes.dark_theme;
5 | @include base.baseMixin;
6 | @include themes.dark_theme_overrides;

--------------------------------------------------------------------------------
/style/gray.scss:
--------------------------------------------------------------------------------
1 | @use "base";
2 | @use "themes";
3 |
4 | @include themes.gray_theme;
5 | @include base.baseMixin;
6 | @include themes.gray_theme_overrides;

--------------------------------------------------------------------------------
/style/light.scss:
--------------------------------------------------------------------------------
1 | @use "base";
2 | @use "themes";
3 |
4 | @include themes.light_theme;
5 | @include base.baseMixin;
6 | @include themes.light_theme_overrides;

--------------------------------------------------------------------------------
/style/rounded.scss:
--------------------------------------------------------------------------------
1 | @use "base";
2 | @use "themes";
3 |
4 | @include themes.rounded_theme;
5 | @include base.baseMixin;
6 | @include themes.rounded_theme_overrides;

--------------------------------------------------------------------------------
/style/underline.scss:
--------------------------------------------------------------------------------
1 | @use "base";
2 | @use "themes";
3 |
4 | @include themes.underline_theme;
5 | @include base.baseMixin;
6 | @include themes.underline_theme_overrides;

--------------------------------------------------------------------------------
/tests-playwright/helpers.ts:
--------------------------------------------------------------------------------
  1 |     import { expect, Page, Locator } from '@playwright/test';
  2 |
  3 |     export const findAllTabSets = (page: Page) => {
  4 |         return page.locator('.flexlayout__tabset');
  5 |     };
  6 |
  7 |     export const findPath = (page: Page, path: string) => {
  8 |         return page.locator(`[data-layout-path="${path}"]`);
  9 |     };
 10 |
 11 |     export const findTabButton = (page: Page, path: string, index: number) => {
 12 |         return findPath(page, `${path}/tb${index}`);
 13 |     };
 14 |
 15 |     export const checkTab = async (page: Page, path: string, index: number, selected: boolean, text: string) => {
 16 |         const tabButton = findTabButton(page, path, index);
 17 |         const tabContent = findPath(page, `${path}/t${index}`);
 18 |
 19 |         await expect(tabButton).toBeVisible();
 20 |         await expect(tabButton).toHaveClass(new RegExp(selected ? 'flexlayout__tab_button--selected' : 'flexlayout__tab_button--unselected'));
 21 |         await expect(tabButton.locator('.flexlayout__tab_button_content')).toContainText(text);
 22 |
 23 |         await expect(tabContent).toBeVisible({ visible: selected });
 24 |         await expect(tabContent).toContainText(text);
 25 |     };
 26 |
 27 |     export const checkBorderTab = async (page: Page, path: string, index: number, selected: boolean, text: string) => {
 28 |         const tabButton = findTabButton(page, path, index);
 29 |         const tabContent = findPath(page, `${path}/t${index}`);
 30 |
 31 |         await expect(tabButton).toBeVisible();
 32 |         await expect(tabButton).toHaveClass(new RegExp(selected ? 'flexlayout__border_button--selected' : 'flexlayout__border_button--unselected'));
 33 |         await expect(tabButton.locator('.flexlayout__border_button_content')).toContainText(text);
 34 |
 35 |         if (selected) {
 36 |         await expect(tabContent).toBeVisible();
 37 |         await expect(tabContent).toContainText(text);
 38 |         }
 39 |     };
 40 |
 41 |     export enum Location {
 42 |         CENTER,
 43 |         TOP,
 44 |         BOTTOM,
 45 |         LEFT,
 46 |         RIGHT,
 47 |         LEFTEDGE
 48 |     }
 49 |
 50 |     function getLocation(rect: { x: number; y: number; width: number; height: number }, loc: Location) {
 51 |         switch (loc) {
 52 |         case Location.CENTER:
 53 |             return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
 54 |         case Location.TOP:
 55 |             return { x: rect.x + rect.width / 2, y: rect.y + 5 };
 56 |         case Location.BOTTOM:
 57 |             return { x: rect.x + rect.width / 2, y: rect.y + rect.height - 5 };
 58 |         case Location.LEFT:
 59 |             return { x: rect.x + 5, y: rect.y + rect.height / 2 };
 60 |         case Location.RIGHT:
 61 |             return { x: rect.x + rect.width - 5, y: rect.y + rect.height / 2 };
 62 |         case Location.LEFTEDGE:
 63 |             return { x: rect.x , y: rect.y + rect.height / 2 };
 64 |         default:
 65 |             throw new Error(`Unknown location: ${loc}`);
 66 |         }
 67 |     }
 68 |
 69 |     export async function drag(page: Page, from: Locator, to: Locator, loc: Location) {
 70 |         const fr = await from.boundingBox();
 71 |         const tr = await to.boundingBox();
 72 |
 73 |         if (!fr || !tr) throw new Error('Could not get bounding boxes');
 74 |
 75 |         const cf = getLocation(fr, Location.CENTER);
 76 |         const ct = getLocation(tr, loc);
 77 |
 78 |         await page.mouse.move(cf.x, cf.y);
 79 |         await page.mouse.down();
 80 |         await page.mouse.move(ct.x, ct.y, { steps: 10 });
 81 |         await page.mouse.up();
 82 |     }
 83 |
 84 |     export async function dragToEdge(page: Page, from: Locator, edgeIndex: number) {
 85 |
 86 |
 87 |         const fr = await from.boundingBox();
 88 |         if (!fr) throw new Error('Could not get bounding box for source');
 89 |
 90 |         const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };
 91 |
 92 |         await page.mouse.move(cf.x, cf.y);
 93 |         await page.mouse.down();
 94 |         await page.mouse.move(cf.x + 10, cf.y + 10); // start move to make edges show
 95 |         const edgeRects = page.locator('.flexlayout__edge_rect');
 96 |         const edge = edgeRects.nth(edgeIndex);
 97 |         const tr = await edge.boundingBox();
 98 |         if (!tr) throw new Error('Could not get bounding box for edge');
 99 |
100 |         const ct = { x: tr.x + tr.width / 2, y: tr.y + tr.height / 2 };
101 |
102 |         // await page.mouse.move((cf.x + ct.x) / 2, (cf.y + ct.y) / 2);
103 |         await page.mouse.move(ct.x, ct.y, { steps: 10 });
104 |         await page.mouse.up();
105 |     }
106 |
107 |     export async function dragSplitter(page: Page, from: Locator, upDown: boolean, distance: number) {
108 |         const fr = await from.boundingBox();
109 |         if (!fr) throw new Error('Could not get bounding box for splitter');
110 |
111 |         const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };
112 |         const ct = { x: cf.x + (upDown ? 0 : distance), y: cf.y + (upDown ? distance : 0) };
113 |
114 |         await page.mouse.move(cf.x, cf.y);
115 |         await page.mouse.down();
116 |         // await page.mouse.move(cf.x + 10, cf.y + 10);
117 |         // await page.mouse.move((cf.x + ct.x) / 2, (cf.y + ct.y) / 2);
118 |         await page.mouse.move(ct.x, ct.y, { steps: 10 });
119 |         await page.mouse.up();
120 |     }

--------------------------------------------------------------------------------
/tsconfig-types.json:
--------------------------------------------------------------------------------
 1 | {
 2 |     "compilerOptions": {
 3 |       "emitDeclarationOnly": true,
 4 |       "declaration": true,
 5 |       "declarationDir": "types",
 6 |       "module": "ESNext",
 7 |       "target": "ESNext",
 8 |       "moduleResolution": "Bundler",
 9 |       "jsx": "react-jsx",
10 |       "strict": true,
11 |       "skipLibCheck": true,
12 |       "esModuleInterop": true,
13 |       "allowSyntheticDefaultImports": true
14 |     },
15 |     "include": ["src"]
16 |   }

--------------------------------------------------------------------------------
/tsconfig.json:
--------------------------------------------------------------------------------
 1 | {
 2 |     "compilerOptions": {
 3 |         "outDir": "./dist/",
 4 |         "sourceMap": true,
 5 |         "noImplicitAny": true,
 6 |         "target": "ESNext",
 7 |         "module": "ESNext",
 8 |         "moduleResolution": "bundler",
 9 |         "stripInternal": true,
10 |         "alwaysStrict": true,
11 |         "forceConsistentCasingInFileNames": true,
12 |         "noImplicitReturns": true,
13 |         "strict": true,
14 |         "noUnusedLocals": true,
15 |         "jsx": "react-jsx",
16 |         "skipLibCheck": true,
17 |         "types": ["vitest/globals"],
18 |         "allowSyntheticDefaultImports": true,
19 |         "esModuleInterop": true
20 |     },
21 |     "include": ["./src/**/*", "./demo/**/*", "./tests/**/*", "./tests-playwright/**/*"]
22 | }

--------------------------------------------------------------------------------
/vite.config.lib.ts:
--------------------------------------------------------------------------------
 1 | import { defineConfig, PluginOption, UserConfig } from 'vite';
 2 | import react from '@vitejs/plugin-react';
 3 | import path from 'path';
 4 | import pkg from './package.json';
 5 |
 6 | // Banner content
 7 | const banner = `/**
 8 |  * ${pkg.name}
 9 |  * @version ${pkg.version}
10 |  */\n`;
11 |
12 | // Banner injection plugin
13 | function bannerPlugin(): PluginOption {
14 |   return {
15 |     name: 'inject-banner',
16 |     apply: 'build',
17 |     generateBundle(_, bundle) {
18 |       for (const [, file] of Object.entries(bundle)) {
19 |         if (file.type === 'chunk' && file.fileName.endsWith('.js')) {
20 |           file.code = banner + file.code;
21 |         }
22 |       }
23 |     }
24 |   };
25 | }
26 |
27 | export default defineConfig({
28 |   plugins: [react(), bannerPlugin()],
29 |   build: {
30 |     lib: {
31 |       entry: path.resolve(__dirname, 'src/index.ts'),
32 |       name: 'index',
33 |       fileName: 'index',
34 |       formats: ['es'],
35 |     },
36 |     outDir: 'dist',
37 |     minify: false,
38 |     rollupOptions: {
39 |       external: [
40 |         'react',
41 |         'react-dom',
42 |         'react-dom/client',
43 |         'react/jsx-runtime'
44 |       ]
45 |     }
46 |   },
47 |   define: {
48 |     __VERSION__: JSON.stringify(pkg.version),
49 |   },
50 | } as UserConfig);

--------------------------------------------------------------------------------
/vite.config.ts:
--------------------------------------------------------------------------------
 1 | import { defineConfig, UserConfig } from 'vite';
 2 | import react from '@vitejs/plugin-react';
 3 | import pkg from './package.json';
 4 |
 5 | export default defineConfig({
 6 |   root: './demo/',
 7 |   base: './', // use relative paths
 8 |   plugins: [react()],
 9 |   build: {
10 |     outDir: 'dist',
11 |     rollupOptions: {
12 |       output: {
13 |         entryFileNames: 'demo.js',
14 |         assetFileNames: (chunkInfo) => {
15 |           return 'demo[extname]';
16 |         },
17 |       },
18 |     },
19 |   },
20 |   server: {
21 |     open: true,
22 |   },
23 |   define: {
24 |     __VERSION__: JSON.stringify(pkg.version),
25 |   },
26 | } as UserConfig);

--------------------------------------------------------------------------------
/vitest.config.ts:
--------------------------------------------------------------------------------
 1 | import { defineConfig } from 'vitest/config'
 2 |
 3 | export default defineConfig({
 4 |
 5 |   test: {
 6 |     globals: true,     // so can use `describe`/`it` without importing them
 7 |     environment: 'node',
 8 |     include: ['tests/**/*.test.{js,ts}'],
 9 |   },
10 |
11 |   define: {
12 |     __VERSION__: JSON.stringify('test-version'),
13 |   }
14 | })

--------------------------------------------------------------------------------
