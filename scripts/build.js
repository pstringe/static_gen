// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   generator.js                                       :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: pstringe <marvin@42.fr>                    +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2019/01/27 22:09:07 by pstringe          #+#    #+#             //
//   Updated: 2019/01/27 23:38:24 by pstringe         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

const	fse = require('fs-extra');
const	path = require('path');

/*
 **	not sure why promsify is in brackets here, could be to explicitly make this
 ** an object? Requires further research.
*/

const	{ promisify } = require('util');
const 	ejsRenderFile = promisify(require('ejs').renderFile);
const	globP = promisify(require('glob'));

/*
** not sure where this config file is from 
*/
const	config = require('../site.config');

const	srcPath = './src'
const	distPath = './public'

// clear destination folder
fse.emptyDirSync(distPath);

//copy assets folder
fse.copy(`${srcPath}/assets`, `${distPath}/assets`);

//read page templates
/*
 ** unfamiliar with doubl asterisk notation, I think it's some kind of wildcard
 ** not sure why we need two
*/
globP('**/*.ejs', { cwd: `${srcPath}/pages` }).then((files) => {
	files.forEach((file) => {
		const fileData = path.parse(file);
		/*
		 ** perhaps we could use a better naming convention here, it seems we've
		 ** merley changed a letter too diffentiate an intermediate destination 
		 ** from a final destination. This could become confusing later on.
		*/
		const destPath = path.join(distPath, fileData.dir);

		// create destination directory
		fse.mkdirs(destPath).then(() => {
			//render page
			return ejsRenderFile(`${srcPath}/pages/${file}`, Object.assign({}, config));
		}).then((pageContents) => {
			// render layout along with page contents
			return ejsRenderFile(`${srcPath}/layout.ejs`, Object.assign({}, config, { body: pageContents }));
		}).then((layoutContent) => {
			//save html file
			fse.writeFile(`${destPath}/${fileData.name}.html`, layoutContent);
		}).catch((err) => { 
			console.error(err); 
		});
	})
}).catch((err) => {
	console.error(err);
});
