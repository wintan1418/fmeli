import siteSettings from "./documents/siteSettings";
import page from "./documents/page";
import sermon from "./documents/sermon";
import sermonSeries from "./documents/sermonSeries";
import event from "./documents/event";
import registration from "./documents/registration";
import pastor from "./documents/pastor";
import assembly from "./documents/assembly";
import meeting from "./documents/meeting";
import announcement from "./documents/announcement";
import post from "./documents/post";

import seo from "./objects/seo";
import link from "./objects/link";
import cta from "./objects/cta";

import heroBanner from "./sections/heroBanner";
import textBlock from "./sections/textBlock";
import imageWithText from "./sections/imageWithText";
import callToAction from "./sections/callToAction";
import quoteBlock from "./sections/quoteBlock";

export const schemaTypes = [
  // Documents
  siteSettings,
  page,
  post,
  sermon,
  sermonSeries,
  meeting,
  event,
  registration,
  assembly,
  pastor,
  announcement,
  // Objects
  seo,
  link,
  cta,
  // Sections (Page Builder blocks)
  heroBanner,
  textBlock,
  imageWithText,
  callToAction,
  quoteBlock,
];
