import { BaseMessage } from '@langchain/core/messages';
import { ERRORS } from '../../app/common';

// Define sample messages and responses.
export const INITIAL_MSG = 'what is the driver with the biggest amount of completed orders according to the reports?';
export const ADDITIONAL_MSG = 'I also need you to check how many drivers do I have.';
export const IRRELEVANT_MSG = 'Who is the president of the United States?';

export const FIRST_RES = 'Yahav Levy';
export const SECOND_RES = 'You have 11,025 drivers';
export const IRRELEVANT_RES = ERRORS.BAD_INPUT;

export const MOCK_RES_REQ: Record<string, string> = {
	[INITIAL_MSG]: FIRST_RES,
	[ADDITIONAL_MSG]: SECOND_RES,
	[IRRELEVANT_MSG]: IRRELEVANT_RES
};
