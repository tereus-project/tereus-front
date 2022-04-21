import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

const { appendIconComponentCache } = require('@elastic/eui/es/components/icon/icon');

const { icon: EuiIconLogoElastic } = require('@elastic/eui/es/components/icon/assets/logo_elastic');
const { icon: EuiIconImport } = require('@elastic/eui/es/components/icon/assets/import');
const { icon: EuiIconArrowDown } = require('@elastic/eui/es/components/icon/assets/arrow_down');
const { icon: EuiIconCompute } = require('@elastic/eui/es/components/icon/assets/compute');
const { icon: EuiIconCross } = require('@elastic/eui/es/components/icon/assets/cross');
const { icon: EuiIconLock } = require('@elastic/eui/es/components/icon/assets/lock');

appendIconComponentCache({
  logoElastic: EuiIconLogoElastic,
  importAction: EuiIconImport,
  arrowDown: EuiIconArrowDown,
  compute: EuiIconCompute,
  cross: EuiIconCross,
  lock: EuiIconLock,
});

hydrate(<RemixBrowser />, document);
