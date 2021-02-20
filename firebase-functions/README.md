# Firebase Functions

Add this to ./.vscode/settings.json in order for eslint to work in VSC.

```
{
  "eslint.workingDirectories": [
    {
      "directory": "./functions",
      "changeProcessCWD": true
    }
  ]
}
```

<hr>

Serve functions in local env

```
npm run serve
```

<hr>

/functions is your real working directory
