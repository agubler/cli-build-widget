import * as webpack from 'webpack';
import * as path from 'path';
import { existsSync } from 'fs';
import CssModulePlugin from '@dojo/webpack-contrib/css-module-plugin/CssModulePlugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { WebpackConfiguration } from './interfaces';
import * as loaderUtils from 'loader-utils';

const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const slash = require('slash');

const basePath = process.cwd();
const srcPath = path.join(basePath, 'src');
const testPath = path.join(basePath, 'tests');
const allPaths = [srcPath, testPath];
const packageJsonPath = path.join(basePath, 'package.json');
const packageJson = existsSync(packageJsonPath) ? require(packageJsonPath) : {};
const packageName = packageJson.name || '';
const tsLintPath = path.join(basePath, 'tslint.json');
const tsLint = existsSync(tsLintPath) ? require(tsLintPath) : false;

function getJsonpFunctionName(name: string) {
	name = name
		.replace(/[^a-z0-9_]/g, ' ')
		.trim()
		.replace(/\s+/g, '_');
	return `dojoWebpackJsonp${name}`;
}

function getUMDCompatLoader(options: { bundles?: { [key: string]: string[] } }) {
	const { bundles = {} } = options;
	return {
		loader: 'umd-compat-loader',
		options: {
			imports(module: string, context: string) {
				const filePath = path.relative(basePath, path.join(context, module));
				let chunkName = slash(filePath);
				Object.keys(bundles).some(name => {
					if (bundles[name].indexOf(slash(filePath)) > -1) {
						chunkName = name;
						return true;
					}
					return false;
				});
				return `@dojo/webpack-contrib/promise-loader?global,${chunkName}!${module}`;
			}
		}
	};
}

function getLocalIdent(
	loaderContext: webpack.loader.LoaderContext,
	localIdentName: string,
	localName: string,
	options: any
) {
	if (!options.context) {
		if (loaderContext.options && typeof loaderContext.options.context === 'string') {
			options.context = loaderContext.options.context;
		} else {
			options.context = loaderContext.context;
		}
	}
	const request = slash(path.relative(options.context, loaderContext.resourcePath));
	options.content = `${options.hashPrefix}${request}+${localName}`;
	localIdentName = localIdentName.replace(/\[local\]/gi, localName);
	const hash = loaderUtils.interpolateName(loaderContext, localIdentName, options);
	return hash.replace(new RegExp('[^a-zA-Z0-9\\-_\u00A0-\uFFFF]', 'g'), '-').replace(/^((-?[0-9])|--)/, '_$1');
}

const removeEmpty = (items: any[]) => items.filter(item => item);

const banner = `
[Dojo](https://dojo.io/)
Copyright [JS Foundation](https://js.foundation/) & contributors
[New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
All rights reserved
`;

export default function webpackConfigFactory(args: any): WebpackConfiguration {
	const config: webpack.Configuration = {
		entry: args.elements.reduce((entry: any, element: string) => {
			entry[element] = [path.join(srcPath, element)];
			return entry;
		}, {}),
		node: { dgram: 'empty', net: 'empty', tls: 'empty', fs: 'empty' },
		output: {
			chunkFilename: '[name].js',
			filename: '[name].js',
			jsonpFunction: getJsonpFunctionName(packageName),
			libraryTarget: 'jsonp',
			path: path.resolve('./output')
		},
		resolve: {
			modules: [basePath, path.join(basePath, 'node_modules')],
			extensions: ['.ts', '.tsx', '.js']
		},
		devtool: 'source-map',
		watchOptions: { ignored: /node_modules/ },
		plugins: removeEmpty([
			new CssModulePlugin(basePath),
			new webpack.BannerPlugin(banner),
			new IgnorePlugin(/request\/providers\/node/),
			new webpack.DefinePlugin({
				__dojoCustomElements__: true
			}),
			new ExtractTextPlugin({
				filename: (getPath: any) => getPath('[name].css')
			} as any),
			new webpack.NamedChunksPlugin(),
			new webpack.NamedModulesPlugin()
		]),
		module: {
			rules: removeEmpty([
				tsLint && {
					test: /\.ts$/,
					enforce: 'pre',
					loader: 'tslint-loader',
					options: { configuration: tsLint, emitErrors: true, failOnHint: true }
				},
				{
					test: /@dojo\/.*\.js$/,
					enforce: 'pre',
					loader: 'source-map-loader-cli',
					options: { includeModulePaths: true }
				},
				{
					include: allPaths,
					test: /.*\.ts?$/,
					enforce: 'pre',
					loader: '@dojo/webpack-contrib/css-module-dts-loader?type=ts&instanceName=0_dojo'
				},
				{
					include: allPaths,
					test: /.*\.m\.css?$/,
					enforce: 'pre',
					loader: '@dojo/webpack-contrib/css-module-dts-loader?type=css'
				},
				{
					include: allPaths,
					test: /.*\.ts(x)?$/,
					use: removeEmpty([
						args.features && {
							loader: '@dojo/webpack-contrib/static-build-loader',
							options: { features: args.features }
						},
						getUMDCompatLoader({ bundles: args.bundles }),
						{
							loader: 'ts-loader',
							options: { onlyCompileBundledFiles: true, instance: 'dojo' }
						}
					])
				},
				{
					test: /\.js?$/,
					use: removeEmpty([
						args.features && {
							loader: '@dojo/webpack-contrib/static-build-loader',
							options: { features: args.features }
						},
						'umd-compat-loader'
					])
				},
				{
					test: new RegExp(`globalize(\\${path.sep}|$)`),
					loader: 'imports-loader?define=>false'
				},
				{
					test: /.*\.(gif|png|jpe?g|svg|eot|ttf|woff|woff2)$/i,
					loader: 'file-loader?hash=sha512&digest=hex&name=[hash:base64:8].[ext]'
				},
				{
					test: /\.css$/,
					exclude: allPaths,
					use: ExtractTextPlugin.extract({
						fallback: ['style-loader'],
						use: ['css-loader?sourceMap']
					})
				},
				{
					test: /\.m\.css.js$/,
					exclude: allPaths,
					use: ['json-css-module-loader']
				},
				{
					include: allPaths,
					test: /.*\.css?$/,
					use: ExtractTextPlugin.extract({
						fallback: ['style-loader'],
						use: [
							'@dojo/webpack-contrib/css-module-decorator-loader',
							{
								loader: 'css-loader',
								options: {
									modules: true,
									sourceMap: true,
									importLoaders: 1,
									localIdentName: '[hash:base64:8]',
									getLocalIdent
								}
							},
							{
								loader: 'postcss-loader?sourceMap',
								options: {
									ident: 'postcss',
									plugins: [
										require('postcss-import')(),
										require('postcss-cssnext')({
											features: {
												autoprefixer: {
													browsers: ['last 2 versions', 'ie >= 10']
												}
											}
										})
									]
								}
							}
						]
					})
				}
			])
		}
	};

	return config as WebpackConfiguration;
}
