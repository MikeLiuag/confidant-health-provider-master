//@flow

import {createAction} from "redux-actions";

export const EDUCATIONAL_BOOKMARK_CONTENT = 'educational/EDUCATIONAL_BOOKMARK_CONTENT';
export const EDUCATIONAL_BOOKMARK_CONTENT_FAILED = 'educational/BOOKMARK_CONTENT_FAILED';
export const EDUCATIONAL_CONTENT_BOOKMARKED = 'educational/CONTENT_BOOKMARKED';

export const educationalActionCreators = {
    bookmarkContent: createAction(EDUCATIONAL_BOOKMARK_CONTENT),
};