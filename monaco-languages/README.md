# Monaco Languages [![Build Status](https://dev.azure.com/ms/monaco-languages/_apis/build/status/microsoft.monaco-languages?branchName=master)](https://dev.azure.com/ms/monaco-languages/_build/latest?definitionId=140&branchName=master)

Colorization and configuration supports for multiple languages for the Monaco Editor:

![monaco-languages](https://cloud.githubusercontent.com/assets/5047891/15938606/1fd4bac6-2e74-11e6-8839-d455da8bc8a7.gif)

## Issues

Please file issues concerning `monaco-languages` in the [`monaco-editor`-repository](https://github.com/Microsoft/monaco-editor/issues).

## Installing

This npm module is bundled and distributed in the [monaco-editor](https://www.npmjs.com/package/monaco-editor) npm module.

## Dev: cheat sheet

- initial setup with `npm install .`
- compile with `npm run watch`
- test with `npm run test`
- bundle with `npm run prepublishOnly`

## Dev: Adding a new language

- create `$/src/myLang/myLang.contribution.ts`
- create `$/src/myLang/myLang.ts`
- create `$/src/myLang/myLang.test.ts`
- edit `$/src/monaco.contribution.ts` and register your new language

```js
import './myLang/myLang.contribution';
```

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](https://github.com/Microsoft/monaco-languages/blob/master/LICENSE.md)
