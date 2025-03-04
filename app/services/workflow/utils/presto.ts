import { config, logger } from '@bringg/service';
import { prestoClient } from '@bringg/service-data';
import { Timer } from '@bringg/service-utils';
import { Knex } from 'knex';
import moment from 'moment/moment';

import { knex } from '../../app/lib/db';

export const PRESTO_DATE_COLUMN_FORMAT = 'YYYYMMDD';

export async function init() {
	await prestoClient.init({ ...config.get('presto'), clientName: 'sync-way-point-service-areas' });
}

export async function runPrestoQuery<Result>(query: Knex.QueryBuilder, logMeta: Bringg.LogMeta): Promise<Result> {
	const timer = Timer.start();
	const queryWithPopulatedData = query.toQuery();

	const result = await prestoClient.execute(queryWithPopulatedData, logMeta);

	logger.info('presto query done', {
		...logMeta,
		query: queryWithPopulatedData,
		duration: timer.stop(),
		params: {
			...((logMeta?.params as object) || {}),
			result_count: result?.length
		}
	});

	return result;
}

/**
 * Get the last time presto updated a task, the table should have a column named `updated_at` and `date`
 * @param tableName
 * @param logMeta
 */
export async function getLastTimePrestoUpdatedTable(
	tableName: string,
	logMeta: Bringg.LogMeta
): Promise<Date | undefined> {
	const lastTimePrestoUpdatedTable = knex(tableName)
		// This will create `max(updated_at) as updated_at` in the query
		.max('updated_at as updated_at')

		// 2 days ago to limit the search in partitions and to make sure we tolerate any lag and downtime
		.where('date', '>', convertDateToPrestoDateFormat(moment().subtract(2, 'days').toDate()));

	const result = await (exports.runPrestoQuery as typeof runPrestoQuery)<[] | [{ updated_at: string }]>(
		lastTimePrestoUpdatedTable,
		logMeta
	);

	if (!result.length) {
		logger.warning(`getLastTimePrestoUpdatedTable presto not updated ${tableName} for more than 2 days`, logMeta);
		return;
	}

	return new Date(result[0].updated_at);
}

export function convertDateToPrestoDateFormat(date: Date): number {
	return parseInt(moment(date).format(PRESTO_DATE_COLUMN_FORMAT));
}