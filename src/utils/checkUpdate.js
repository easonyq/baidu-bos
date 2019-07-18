/**
 * @file 检测是否有更新版本
 * @author wangyisheng@baidu.com (wangyisheng)
 */
/* istanbul ignore file */

'use strict';

import path from 'path'
import semver from 'semver'
import axios from 'axios'
import fs from 'fs-extra'
import log from './log'
import {getHome} from './index'

const NPM_REGISTRY = 'https://registry.npm.taobao.org/baidu-bos';
const TIME_RANGE = 7 * 24 * 60 * 60 * 1000;

async function requestPackageInfo() {
  try {
    let packageInfo = await axios({
      url: NPM_REGISTRY,
      timeout: 1000
    });
    let lastVersion = packageInfo.data['dist-tags'].latest;
    let curVersion = require('../../package.json').version;

    if (semver.gt(lastVersion, curVersion)) {
      log.info(log.chalk.bold.yellow('baidu-bos 有新的版本更新，您可以通过 `npm update -g baidu-bos` 命令更新版本!'));
    }
  }
  catch (e) {}
}

/**
 * 检测是否需要更新版本
 */
export default async function () {
  let updateCheckerInfoPath = path.resolve(getHome(), '.updateChecker.txt');
  if (fs.existsSync(updateCheckerInfoPath)) {
    let updateCheckerInfo = fs.readFileSync(updateCheckerInfoPath, 'utf-8');
    if (Date.now() - (+updateCheckerInfo) >= TIME_RANGE) {
      await requestPackageInfo();
      fs.writeFileSync(updateCheckerInfoPath, Date.now() + '');
    }
  }
  else {
    let dirname = path.dirname(updateCheckerInfoPath);
    fs.existsSync(dirname) && fs.mkdirpSync(dirname);
    fs.writeFileSync(updateCheckerInfoPath, Date.now() + '');
    await requestPackageInfo();
  }
};
