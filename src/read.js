/**
 * Created by acer on 2017/5/28.
 */

let fs = require( 'fs' );

fs.readdir( 'e:/DATA/logs/' , function ( err , data ) {
	// console.log( data );
	let len = data.length;
	let str = '';
	let index = 0;
	data.forEach( function ( filename , i ) {
		// console.log( filename );
		fs.readFile( `e:/DATA/logs/${filename}` , 'utf8' , ( err , content ) => {
			str += content;
			if ( ++index === len ) {
				console.log( "结束" );
			}
			// let num = content.split( '\n' );
		} );
	} );
} );

setInterval( () => {

} , 1000 );