/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/// <reference path="../node_modules/monaco-editor-core/monaco.d.ts" />

declare namespace monaco.languages.json {
	export interface DiagnosticsOptions {
		/**
		 * If set, the validator will be enabled and perform syntax and schema based validation,
		 * unless `DiagnosticsOptions.schemaValidation` is set to `ignore`.
		 */
		readonly validate?: boolean;
		/**
		 * If set, comments are tolerated. If set to false, syntax errors will be emitted for comments.
		 * `DiagnosticsOptions.allowComments` will override this setting.
		 */
		readonly allowComments?: boolean;
		/**
		 * A list of known schemas and/or associations of schemas to file names.
		 */
		readonly schemas?: {
			/**
			 * The URI of the schema, which is also the identifier of the schema.
			 */
			readonly uri: string;
			/**
			 * A list of glob patterns that describe for which file URIs the JSON schema will be used.
			 * '*' and '**' wildcards are supported. Exclusion patterns start with '!'.
			 * For example '*.schema.json', 'package.json', '!foo*.schema.json', 'foo/**\/BADRESP.json'.
			 * A match succeeds when there is at least one pattern matching and last matching pattern does not start with '!'.
			 */
			readonly fileMatch?: string[];
			/**
			 * The schema for the given URI.
			 */
			readonly schema?: any;
		}[];
		/**
		 *  If set, the schema service would load schema content on-demand with 'fetch' if available
		 */
		readonly enableSchemaRequest?: boolean;
		/**
		 * The severity of problems from schema validation. If set to 'ignore', schema validation will be skipped. If not set, 'warning' is used.
		 */
		readonly schemaValidation?: SeverityLevel;
		/**
		 * The severity of problems that occurred when resolving and loading schemas. If set to 'ignore', schema resolving problems are not reported. If not set, 'warning' is used.
		 */
		readonly schemaRequest?: SeverityLevel;
		/**
		 * The severity of reported trailing commas. If not set, trailing commas will be reported as errors.
		 */
		readonly trailingCommas?: SeverityLevel;
		/**
		 * The severity of reported comments. If not set, 'DiagnosticsOptions.allowComments' defines whether comments are ignored or reported as errors.
		 */
		readonly comments?: SeverityLevel;
	}
	export type SeverityLevel = 'error' | 'warning' | 'ignore';
	export interface ModeConfiguration {
		/**
		 * Defines whether the built-in documentFormattingEdit provider is enabled.
		 */
		readonly documentFormattingEdits?: boolean;
		/**
		 * Defines whether the built-in documentRangeFormattingEdit provider is enabled.
		 */
		readonly documentRangeFormattingEdits?: boolean;
		/**
		 * Defines whether the built-in completionItemProvider is enabled.
		 */
		readonly completionItems?: boolean;
		/**
		 * Defines whether the built-in hoverProvider is enabled.
		 */
		readonly hovers?: boolean;
		/**
		 * Defines whether the built-in documentSymbolProvider is enabled.
		 */
		readonly documentSymbols?: boolean;
		/**
		 * Defines whether the built-in tokens provider is enabled.
		 */
		readonly tokens?: boolean;
		/**
		 * Defines whether the built-in color provider is enabled.
		 */
		readonly colors?: boolean;
		/**
		 * Defines whether the built-in foldingRange provider is enabled.
		 */
		readonly foldingRanges?: boolean;
		/**
		 * Defines whether the built-in diagnostic provider is enabled.
		 */
		readonly diagnostics?: boolean;
		/**
		 * Defines whether the built-in selection range provider is enabled.
		 */
		readonly selectionRanges?: boolean;
	}
	export interface LanguageServiceDefaults {
		readonly languageId: string;
		readonly onDidChange: IEvent<LanguageServiceDefaults>;
		readonly diagnosticsOptions: DiagnosticsOptions;
		readonly modeConfiguration: ModeConfiguration;
		setDiagnosticsOptions(options: DiagnosticsOptions): void;
		setModeConfiguration(modeConfiguration: ModeConfiguration): void;
	}
	export const jsonDefaults: LanguageServiceDefaults;
}
