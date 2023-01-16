import * as contentful from "contentful/dist/contentful.browser.min";
import {CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN} from '../../constants/CommonConstants';
const SPACE_ID = CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = CONTENTFUL_ACCESS_TOKEN;
const HOST = "cdn.contentful.com";
const CdnClient = contentful.createClient({
  //This is the space ID. A space is like a project folder in Contentful
  space: SPACE_ID,
  //This is the access token for this space
  accessToken: ACCESS_TOKEN,

  host: HOST
});

export default CdnClient;
