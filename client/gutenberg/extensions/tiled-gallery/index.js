/**
 * External dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { filter } from 'lodash';
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';
import save from './save';
import {
	LAYOUT_CIRCLE,
	LAYOUT_COLUMN,
	LAYOUT_DEFAULT,
	LAYOUT_SQUARE,
	LAYOUT_STYLES,
} from './constants';

/**
 * Style dependencies
 */
import './editor.scss';

// Style names are translated. Avoid introducing an i18n dependency elsewhere (view)
// by only including the labels here, the only place they're needed.
//
// Map style names to labels and merge them together.
const styleNames = {
	[ LAYOUT_DEFAULT ]: _x( 'Tiled mosaic', 'Tiled gallery layout' ),
	[ LAYOUT_CIRCLE ]: _x( 'Circles', 'Tiled gallery layout' ),
	[ LAYOUT_COLUMN ]: _x( 'Tiled columns', 'Tiled gallery layout' ),
	[ LAYOUT_SQUARE ]: _x( 'Square tiles', 'Tiled gallery layout' ),
};
const layoutStylesWithLabels = LAYOUT_STYLES.map( style => ( {
	...style,
	label: styleNames[ style.name ],
} ) );

const blockAttributes = {
	// Set default align
	align: {
		default: 'center',
		type: 'string',
	},
	// Set default className (used with block styles)
	className: {
		default: `is-style-${ LAYOUT_DEFAULT }`,
		type: 'string',
	},
	columns: {
		type: 'number',
	},
	ids: {
		default: [],
		type: 'array',
	},
	images: {
		type: 'array',
		default: [],
		source: 'query',
		selector: '.tiled-gallery__item',
		query: {
			alt: {
				attribute: 'alt',
				default: '',
				selector: 'img',
				source: 'attribute',
			},
			caption: {
				selector: 'figcaption',
				source: 'html',
				type: 'string',
			},
			height: {
				attribute: 'data-height',
				selector: 'img',
				source: 'attribute',
				type: 'number',
			},
			id: {
				attribute: 'data-id',
				selector: 'img',
				source: 'attribute',
			},
			link: {
				attribute: 'data-link',
				selector: 'img',
				source: 'attribute',
			},
			url: {
				attribute: 'data-url',
				selector: 'img',
				source: 'attribute',
			},
			width: {
				attribute: 'data-width',
				selector: 'img',
				source: 'attribute',
				type: 'number',
			},
		},
	},
	linkTo: {
		default: 'none',
		type: 'string',
	},
};

export const name = 'tiled-gallery';

export const icon = (
	<SVG viewBox="0 0 24 24" width={ 24 } height={ 24 }>
		<Path
			fill="currentColor"
			d="M19 5v2h-4V5h4M9 5v6H5V5h4m10 8v6h-4v-6h4M9 17v2H5v-2h4M21 3h-8v6h8V3zM11 3H3v10h8V3zm10 8h-8v10h8V11zm-10 4H3v6h8v-6z"
		/>
	</SVG>
);

export const settings = {
	attributes: blockAttributes,
	category: 'jetpack',
	description: __( 'Display multiple images in an elegantly organized tiled layout.' ),
	icon,
	keywords: [
		_x( 'images', 'block search term' ),
		_x( 'photos', 'block search term' ),
		_x( 'masonry', 'block search term' ),
	],
	styles: layoutStylesWithLabels,
	supports: {
		align: [ 'center', 'wide', 'full' ],
		customClassName: false,
		html: false,
	},
	title: __( 'Tiled Gallery' ),
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				transform: attributes => {
					const validImages = filter( attributes.images, ( { id, url } ) => id && url );
					if ( validImages.length > 0 ) {
						return createBlock( `jetpack/${ name }`, {
							images: validImages.map( ( { id, url, alt, caption } ) => ( {
								id,
								url,
								alt,
								caption,
							} ) ),
						} );
					}
					return createBlock( `jetpack/${ name }` );
				},
			},
			{
				type: 'shortcode',
				tag: 'gallery',
				attributes: {
					// @TODO: other params: https://en.support.wordpress.com/gallery/#gallery-shortcode
					images: {
						type: 'array',
						shortcode: ( { named: { ids } } ) => {
							if ( ! ids ) {
								return [];
							}

							return ids.split( ',' ).map( id => ( {
								id: parseInt( id, 10 ),
							} ) );
						},
					},
					columns: {
						type: 'number',
						shortcode: ( { named: { columns = 3 } } ) => {
							if ( ! columns ) {
								return;
							}

							const result = parseInt( columns, 10 );
							if ( result ) {
								return result;
							}
						},
					},
					linkTo: {
						type: 'string',
						shortcode: ( { named: { link = 'attachment' } } ) => {
							return link === 'file' ? 'media' : link;
						},
					},
					layout: {
						type: 'string',
						shortcode: ( { named: { type = LAYOUT_DEFAULT } } ) => {
							// @TODO: if `type=slideshow`, return a slideshow block
							return LAYOUT_STYLES.map( style => style.name ).includes( type )
								? type
								: LAYOUT_DEFAULT;
						},
					},
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/gallery' ],
				transform: ( { images, columns, linkTo } ) =>
					createBlock( 'core/gallery', { images, columns, imageCrop: true, linkTo } ),
			},
			{
				type: 'block',
				blocks: [ 'core/image' ],
				transform: ( { images } ) => {
					if ( images.length > 0 ) {
						return images.map( ( { id, url, alt, caption } ) =>
							createBlock( 'core/image', { id, url, alt, caption } )
						);
					}
					return createBlock( 'core/image' );
				},
			},
		],
	},
	edit,
	save,
};
