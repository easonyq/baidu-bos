/**
 * @file 日志相关
 * @author wangyisheng@baidu.com (wangyisheng)
 */
/* istanbul ignore file */

'use strict';

import util from 'util'
import chalk from 'chalk'

let log = {};

let logTypes = [
  {
    name: 'trace',
    color: chalk.grey,
    level: 0
  },
  {
    name: 'debug',
    color: chalk.grey,
    level: 1
  },
  {
    name: 'info',
    color: chalk.green,
    level: 2
  },
  {
    name: 'warn',
    color: chalk.yellow,
    level: 3
  },
  {
    name: 'error',
    color: chalk.red,
    level: 4
  },
  {
    name: 'fatal',
    color: chalk.red,
    level: 5
  }
];

let flag = {
  set() {
    global.BAIDU_BOS_LOG_FLAG = true;
  },
  has() {
    return global.BAIDU_BOS_LOG_FLAG === true;
  },
  clear() {
    global.BAIDU_BOS_LOG_FLAG = false;
  }
};


logTypes.forEach(function (item) {

  /**
   * 定义打印日志格式
   *
   * @param {string} format 要输出的内容.
   * @param {...*} varArgs 变长参数.
   */
  log[item.name] = function (format, varArgs) {

    let msg = util.format.apply(null, arguments);

    if (process.env.BAIDU_BOS_LOG_SLIENT) {
      return;
    }

    if (flag.has()) {
      console.log();
      flag.clear();
    }
    if (msg) {
      console.log((log.prefix || 'baidu-bos') + ' ' + item.color(item.name.toUpperCase()) + ' ' + msg);
    }
    else {
      console.log();
    }
  };
});


/**
 * 输出原始日志
 *
 * @param {string} format 要输出的内容.
 * @param {...*} varArgs 变长参数.
 */
log.raw = function (format, varArgs) {

  let msg = util.format.apply(null, arguments);

  if (process.env.BAIDU_BOS_LOG_SLIENT === '1') {
    return;
  }

  if (flag.has()) {
    console.log();
    flag.clear();
  }
  console.log(msg);
};

/**
 * 清除最后一行输出的内容.
 * 配合 log.write 来使用.
 */
log.clear = function () {
  if (typeof process.stdout.clearLine === 'function') {
    process.stdout.clearLine();
  }

  if (typeof process.stdout.cursorTo === 'function') {
    process.stdout.cursorTo(0);
  }

  flag.clear();
};

/**
 * 写入日志
 *
 * @param {string} format 要输出的内容.
 * @param {...*} varArgs 变长参数.
 */
log.write = function (format, varArgs) {

  let msg = util.format.apply(null, arguments);

  if (process.env.BAIDU_BOS_LOG_SLIENT) {
    return;
  }

  log.clear();
  if (msg) {
    process.stdout.write(msg);

    if (typeof process.stdout.clearLine !== 'function') {
      process.stdout.write('\n');
    }
    flag.set();
  }
};

log.chalk = chalk;

export default log
