import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";

const { appendIconComponentCache } = require('@elastic/eui/es/components/icon/icon');

const { icon: EuiIconLogoElastic } = require('@elastic/eui/es/components/icon/assets/logo_elastic');
const { icon: EuiIconImport } = require('@elastic/eui/es/components/icon/assets/import');
const { icon: EuiIconArrowDown } = require('@elastic/eui/es/components/icon/assets/arrow_down');
const { icon: EuiIconCompute } = require('@elastic/eui/es/components/icon/assets/compute');

appendIconComponentCache({
  logoElastic: EuiIconLogoElastic,
  importAction: EuiIconImport,
  arrowDown: EuiIconArrowDown,
  compute: EuiIconCompute,
});

hydrate(<RemixBrowser />, document);
