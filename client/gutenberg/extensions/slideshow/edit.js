/**
 * External dependencies
 */
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { Component, Fragment } from '@wordpress/element';
import {
	BlockControls,
	MediaUpload,
	MediaPlaceholder,
	InspectorControls,
	mediaUpload,
} from '@wordpress/editor';

import {
	DropZone,
	FormFileUpload,
	IconButton,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	Toolbar,
	withNotices,
} from '@wordpress/components';
import { filter, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Slideshow from './slideshow';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

const effectOptions = [
	{ label: _x( 'Slide', 'Slideshow transition effect' ), value: 'slide' },
	{ label: _x( 'Fade', 'Slideshow transition effect' ), value: 'fade' },
];

export const pickRelevantMediaFiles = image =>
	pick( image, [ 'alt', 'id', 'link', 'url', 'caption' ] );

class SlideshowEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			selectedImage: null,
		};
	}
	onSelectImages = images => {
		const { setAttributes } = this.props;
		const mapped = images.map( image => pickRelevantMediaFiles( image ) );
		setAttributes( {
			images: mapped,
		} );
	};
	onSelectImage = index => {
		return () => {
			if ( this.state.selectedImage !== index ) {
				this.setState( {
					selectedImage: index,
				} );
			}
		};
	};
	onRemoveImage = index => {
		return () => {
			const images = filter( this.props.attributes.images, ( img, i ) => index !== i );
			this.setState( { selectedImage: null } );
			this.props.setAttributes( { images } );
		};
	};
	addFiles = files => {
		const currentImages = this.props.attributes.images || [];
		const { noticeOperations, setAttributes } = this.props;
		mediaUpload( {
			allowedTypes: ALLOWED_MEDIA_TYPES,
			filesList: files,
			onFileChange: images => {
				const imagesNormalized = images.map( image => pickRelevantMediaFiles( image ) );
				setAttributes( {
					images: [ ...imagesNormalized, ...currentImages ],
				} );
			},
			onError: noticeOperations.createErrorNotice,
		} );
	};
	uploadFromFiles = event => this.addFiles( event.target.files );
	render() {
		const {
			attributes,
			className,
			isSelected,
			noticeOperations,
			noticeUI,
			setAttributes,
		} = this.props;
		const { align, autoplay, delay, effect, images } = attributes;
		const controls = (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Autoplay' ) }>
						<ToggleControl
							label={ __( 'Autoplay' ) }
							help={ __( 'Autoplay between slides' ) }
							checked={ autoplay }
							onChange={ value => {
								setAttributes( { autoplay: value } );
							} }
						/>
						{ autoplay && (
							<RangeControl
								label={ __( 'Delay between transitions' ) }
								value={ delay }
								onChange={ value => {
									setAttributes( { delay: value } );
								} }
								min={ 1 }
								max={ 5 }
							/>
						) }
					</PanelBody>
					<PanelBody title={ __( 'Effects' ) }>
						<SelectControl
							label={ __( 'Transition effect' ) }
							value={ effect }
							onChange={ value => {
								setAttributes( { effect: value } );
							} }
							options={ effectOptions }
						/>
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					{ !! images.length && (
						<Toolbar>
							<MediaUpload
								onSelect={ this.onSelectImages }
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								multiple
								gallery
								value={ images.map( img => img.id ) }
								render={ ( { open } ) => (
									<IconButton
										className="components-toolbar__control"
										label={ __( 'Edit Slideshow' ) }
										icon="edit"
										onClick={ open }
									/>
								) }
							/>
						</Toolbar>
					) }
				</BlockControls>
			</Fragment>
		);

		if ( images.length === 0 ) {
			return (
				<Fragment>
					{ controls }
					<MediaPlaceholder
						icon="format-gallery"
						className={ className }
						labels={ {
							title: __( 'Slideshow' ),
							instructions: __( 'Drag images, upload new ones or select files from your library.' ),
						} }
						onSelect={ this.onSelectImages }
						accept="image/*"
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						multiple
						notices={ noticeUI }
						onError={ noticeOperations.createErrorNotice }
					/>
				</Fragment>
			);
		}
		return (
			<Fragment>
				{ controls }
				{ noticeUI }
				<Slideshow
					align={ align }
					autoplay={ autoplay }
					className={ className }
					delay={ delay }
					effect={ effect }
					images={ images }
				/>
				<DropZone onFilesDrop={ this.addFiles } />
				{ isSelected && (
					<div className="wp-block-jetpack-slideshow__add-item">
						<FormFileUpload
							multiple
							isLarge
							className="wp-block-jetpack-slideshow__add-item-button"
							onChange={ this.uploadFromFiles }
							accept="image/*"
							icon="insert"
						>
							{ __( 'Upload an image' ) }
						</FormFileUpload>
					</div>
				) }
			</Fragment>
		);
	}
}

export default withNotices( SlideshowEdit );
