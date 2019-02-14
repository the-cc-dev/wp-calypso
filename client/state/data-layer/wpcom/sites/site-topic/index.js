/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_CONNECT_SAVE_SITE_TOPIC } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Save the site topic.
 *
 * @param   {object} action Save site topic action.
 * @returns {object}        The dispatched action.
 */
export const saveSiteTopic = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/site-topic`,
			body: {
				site_topic: action.siteTopic,
			},
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/sites/site-topic', {
	[ JETPACK_CONNECT_SAVE_SITE_TOPIC ]: [
		dispatchRequest( {
			fetch: saveSiteTopic,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
