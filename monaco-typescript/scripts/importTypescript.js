/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const generatedNote = `//
// **NOTE**: Do not edit directly! This file is generated using \`npm run import-typescript\`
//
`;

const REPO_ROOT = path.join(__dirname, '../../');
const TYPESCRIPT_LIB_SOURCE = path.join(REPO_ROOT, 'node_modules/typescript/lib');
const TYPESCRIPT_LIB_DESTINATION = path.join(REPO_ROOT, 'monaco-typescript/src/lib');

(function () {
	try {
		fs.statSync(TYPESCRIPT_LIB_DESTINATION);
	} catch (err) {
		fs.mkdirSync(TYPESCRIPT_LIB_DESTINATION);
	}
	importLibs();

	const npmLsOutput = JSON.parse(
		child_process.execSync('npm ls typescript --depth=0 --json=true', { cwd: REPO_ROOT }).toString()
	);
	const typeScriptDependencyVersion = npmLsOutput.dependencies.typescript.version;

	fs.writeFileSync(
		path.join(TYPESCRIPT_LIB_DESTINATION, 'typescriptServicesMetadata.ts'),
		`${generatedNote}
export const typescriptVersion = "${typeScriptDependencyVersion}";\n`
	);

	let tsServices = fs
		.readFileSync(path.join(TYPESCRIPT_LIB_SOURCE, 'typescriptServices.js'))
		.toString();

	// Ensure we never run into the node system...
	// (this also removes require calls that trick webpack into shimming those modules...)
	tsServices = tsServices.replace(
		/\n    ts\.sys =([^]*)\n    \}\)\(\);/m,
		`\n    // MONACOCHANGE\n    ts.sys = undefined;\n    // END MONACOCHANGE`
	);

	// Eliminate more require() calls...
	tsServices = tsServices.replace(
		/^( +)etwModule = require\(.*$/m,
		'$1// MONACOCHANGE\n$1etwModule = undefined;\n$1// END MONACOCHANGE'
	);
	tsServices = tsServices.replace(
		/^( +)var result = ts\.sys\.require\(.*$/m,
		'$1// MONACOCHANGE\n$1var result = undefined;\n$1// END MONACOCHANGE'
	);
	tsServices = tsServices.replace(
		/^( +)fs = require\("fs"\);$/m,
		'$1// MONACOCHANGE\n$1fs = undefined;\n$1// END MONACOCHANGE'
	);
	tsServices = tsServices.replace(
		/^( +)debugger;$/m,
		'$1// MONACOCHANGE\n$1// debugger;\n$1// END MONACOCHANGE'
	);
	tsServices = tsServices.replace(
		/= require\("perf_hooks"\)/m,
		'/* MONACOCHANGE */= {}/* END MONACOCHANGE */'
	);

	// Flag any new require calls (outside comments) so they can be corrected preemptively.
	// To avoid missing cases (or using an even more complex regex), temporarily remove comments
	// about require() and then check for lines actually calling require().
	// \/[*/] matches the start of a comment (single or multi-line).
	// ^\s+\*[^/] matches (presumably) a later line of a multi-line comment.
	const tsServicesNoCommentedRequire = tsServices.replace(
		/(\/[*/]|^\s+\*[^/]).*\brequire\(.*/gm,
		''
	);
	const linesWithRequire = tsServicesNoCommentedRequire.match(/^.*?\brequire\(.*$/gm);

	// Allow error messages to include references to require() in their strings
	const runtimeRequires =
		linesWithRequire &&
		linesWithRequire.filter((l) => !l.includes(': diag(') && !l.includes('ts.DiagnosticCategory'));

	if (runtimeRequires && runtimeRequires.length && linesWithRequire) {
		console.error(
			'Found new require() calls on the following lines. These should be removed to avoid breaking webpack builds.\n'
		);
		console.error(
			runtimeRequires.map((r) => `${r} (${tsServicesNoCommentedRequire.indexOf(r)})`).join('\n')
		);
		process.exit(1);
	}

	const tsServices_amd =
		generatedNote +
		tsServices +
		`
// MONACOCHANGE
// Defining the entire module name because r.js has an issue and cannot bundle this file
// correctly with an anonymous define call
define("vs/language/typescript/lib/typescriptServices", [], function() { return ts; });
// END MONACOCHANGE
`;
	fs.writeFileSync(
		path.join(TYPESCRIPT_LIB_DESTINATION, 'typescriptServices-amd.js'),
		stripSourceMaps(tsServices_amd)
	);

	const tsServices_esm =
		generatedNote +
		tsServices +
		`
// MONACOCHANGE
export var createClassifier = ts.createClassifier;
export var createLanguageService = ts.createLanguageService;
export var displayPartsToString = ts.displayPartsToString;
export var EndOfLineState = ts.EndOfLineState;
export var flattenDiagnosticMessageText = ts.flattenDiagnosticMessageText;
export var IndentStyle = ts.IndentStyle;
export var ScriptKind = ts.ScriptKind;
export var ScriptTarget = ts.ScriptTarget;
export var TokenClass = ts.TokenClass;
// END MONACOCHANGE
`;
	fs.writeFileSync(
		path.join(TYPESCRIPT_LIB_DESTINATION, 'typescriptServices.js'),
		stripSourceMaps(tsServices_esm)
	);

	let dtsServices = fs
		.readFileSync(path.join(TYPESCRIPT_LIB_SOURCE, 'typescriptServices.d.ts'))
		.toString();
	dtsServices += `
// MONACOCHANGE
export = ts;
// END MONACOCHANGE
`;
	fs.writeFileSync(
		path.join(TYPESCRIPT_LIB_DESTINATION, 'typescriptServices.d.ts'),
		generatedNote + dtsServices
	);
})();

function importLibs() {
	function readLibFile(name) {
		const srcPath = path.join(TYPESCRIPT_LIB_SOURCE, name);
		return fs.readFileSync(srcPath).toString();
	}

	let strLibResult = `/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
${generatedNote}

/** Contains all the lib files */
export const libFileMap: Record<string, string> = {}
`;
	let strIndexResult = `/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
${generatedNote}

/** Contains all the lib files */
export const libFileSet: Record<string, boolean> = {}
`;
	const dtsFiles = fs.readdirSync(TYPESCRIPT_LIB_SOURCE).filter((f) => f.includes('lib.'));
	while (dtsFiles.length > 0) {
		const name = dtsFiles.shift();
		const output = readLibFile(name).replace(/\r\n/g, '\n');
		strLibResult += `libFileMap['${name}'] = "${escapeText(output)}";\n`;
		strIndexResult += `libFileSet['${name}'] = true;\n`;
	}

	fs.writeFileSync(path.join(TYPESCRIPT_LIB_DESTINATION, 'lib.ts'), strLibResult);
	fs.writeFileSync(path.join(TYPESCRIPT_LIB_DESTINATION, 'lib.index.ts'), strIndexResult);
}

/**
 * Escape text such that it can be used in a javascript string enclosed by double quotes (")
 */
function escapeText(text) {
	// See http://www.javascriptkit.com/jsref/escapesequence.shtml
	const _backspace = '\b'.charCodeAt(0);
	const _formFeed = '\f'.charCodeAt(0);
	const _newLine = '\n'.charCodeAt(0);
	const _nullChar = 0;
	const _carriageReturn = '\r'.charCodeAt(0);
	const _tab = '\t'.charCodeAt(0);
	const _verticalTab = '\v'.charCodeAt(0);
	const _backslash = '\\'.charCodeAt(0);
	const _doubleQuote = '"'.charCodeAt(0);

	const len = text.length;
	let startPos = 0;
	let chrCode;
	let replaceWith = null;
	let resultPieces = [];

	for (let i = 0; i < len; i++) {
		chrCode = text.charCodeAt(i);
		switch (chrCode) {
			case _backspace:
				replaceWith = '\\b';
				break;
			case _formFeed:
				replaceWith = '\\f';
				break;
			case _newLine:
				replaceWith = '\\n';
				break;
			case _nullChar:
				replaceWith = '\\0';
				break;
			case _carriageReturn:
				replaceWith = '\\r';
				break;
			case _tab:
				replaceWith = '\\t';
				break;
			case _verticalTab:
				replaceWith = '\\v';
				break;
			case _backslash:
				replaceWith = '\\\\';
				break;
			case _doubleQuote:
				replaceWith = '\\"';
				break;
		}
		if (replaceWith !== null) {
			resultPieces.push(text.substring(startPos, i));
			resultPieces.push(replaceWith);
			startPos = i + 1;
			replaceWith = null;
		}
	}
	resultPieces.push(text.substring(startPos, len));
	return resultPieces.join('');
}

function stripSourceMaps(str) {
	return str.replace(/\/\/# sourceMappingURL[^\n]+/gm, '');
}
